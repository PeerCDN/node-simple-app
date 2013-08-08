module.exports = SimpleApp

var config = require('../config')
var bcrypt = require('bcrypt')
var debug = require('debug')('simple-app')
var express = require('express')
var expressValidator = require('express-validator')
var flash = require('connect-flash')
var fs = require('fs')
var http = require('http')
var jade = require('jade')
var levelup = require('level')
var path = require('path')
var passport = require('passport')
var passport_local = require('passport-local')
var util = require('./util')

function SimpleApp (opts, cb) {

  var self = this

  /**
   * @type {string}
   */
  self.name = (opts && opts.name) || 'SimpleApp'

  /**
   * @type {number}
   */
  self.port = opts && opts.port

  /**
   * @type {string}
   */
  self.dbPath = (opts && opts.dbPath)

  if (!self.dbPath) {
    throw new Error('dbPath option required.')
  }

  /**
   * @type {string}
   */
  self.cookieSecret = (opts && opts.cookieSecret) || 'notsecret'

  /**
   * @type {Object}
   */
  self.userDb = levelup(self.dbPath, { valueEncoding: 'json' })

  self.start(cb)
}

SimpleApp.prototype.start = function (cb) {
  var self = this

  // Set up the HTTP server.
  var app = express()
  self.app = app
  self.server = http.createServer(app)

  app.disable('x-powered-by') // disable advertising
  app.use(util.expressLogger(debug)) // readable logs
  app.use(express.compress()) // gzip
  app.use(expressValidator()) // validate user input
  app.use(express.bodyParser()) // parse POST parameters
  app.use(express.cookieParser(self.cookieSecret)) // parse cookies
  app.use(express.session({secret: self.cookieSecret})) // manage session cookies
  app.use(express.csrf()) // protect against CSRF
  app.use(passport.initialize()) // use passport for user auth
  app.use(passport.session()) // have passport use cookies for user auth
  app.use(flash()) // errors during login are propogated by passport using `req.flash`

  // Use jade for templating
  app.set('views', path.join(config.rootPath, '/static/views'))
  app.set('view engine', 'jade')

  // CSRF helper
  app.use(function (req, res, next) {
    res.locals.token = req.session._csrf
    next()
  })

  // Setup passport
  passport.serializeUser(function (user, done) {
    done(null, user.username)
  })

  passport.deserializeUser(function (username, done) {
    self.userDb.get(username, function (err, user) {
      if (err) {
        done(err)
      } else {
        done(null, user)
      }
    })
  })

  passport.use(new passport_local.Strategy(
    function (username, password, done) {
      self.userDb.get(username, function (err, user) {
        if (err && err.name === 'NotFoundError') {
          done(null, false, {message: 'Username not found' })
        } else if (err) {
          done(err)
        } else {
          bcrypt.compare(password, user.password, function (err, res) {
            if (res) {
              done(null, user)
            } else {
              done(null, false, { message: 'Wrong password' })
            }
          })
        }
      })
    }
  ))

  function auth (req, res, next) {
    if (req.isAuthenticated()) {
      return next()
    }
    res.redirect('/login')
  }

  // Always set the `user` variable in the context of the templates
  // If no user is logged in, then it's `null`.
  app.use(function (req, res, next) {
    res.locals.user = req.user
    next()
  })

  // Routes

  app.get('/login', function (req, res) {
    if (req.user) {
      res.redirect('/')
    } else {
      res.render('login', {messages: req.flash('error')})
    }
  })

  app.post('/login', passport.authenticate('local', {
    failureRedirect: '/login',
    successRedirect: '/',
    failureFlash: true
  }))

  app.post('/logout', function (req, res) {
    req.logout()
    res.redirect('/')
  })

  app.get('/register', function (req, res) {
    if (req.user) {
      res.redirect('/')
    } else {
      res.render('register', {messages: req.flash('error')})
    }
  })

  app.post('/register', function (req, res, next) {

    req.assert('username', 'Not a valid email address').isEmail()
    req.assert('password', 'Password must be greater than 4 characters').len(4).notEmpty()

    var errors = req.validationErrors()
    if (errors) {
      errors.forEach(function (error) {
        req.flash('error', error.msg)
      })
      res.redirect('/register')
      return
    }

    var key = req.body.username
    var value = req.body

    self.userDb.get(key, function (err) {
      if (err && err.name === 'NotFoundError') {
        // Hash the password and store it
        bcrypt.hash(value.password, 8, function (err, hash) {
          value.password = hash
          self.userDb.put(key, value, function (err) {
            if (err) {
              req.flash('error', err.name + ': ' + err.message)
              res.redirect('/register')
            } else {
              // Automatically login the user upon registration
              req.login(req.body, function (err) {
                if (err) { return next(err) }
                return res.redirect('/')
              })
            }
          })
        })
      } else if (err) {
        req.flash('error', err.name + ': ' + err.message)
        res.redirect('/register')
      } else {
        req.flash('error', 'Username is already registered.')
        res.redirect('/register')
      }
    })

  })

  app.get('/', function (req, res) {
    res.render('index')
  })

  // Static files
  app.use(express.static(path.join(config.rootPath, 'static')))
  app.use('/components', express.static(path.join(config.rootPath, 'components')))

  // Call the callback so the subclass can implement its own routes
  // and add middleware or static files
  cb && cb()

  app.use(express.errorHandler())

  self.server.listen(self.port, function (err) {
    if (!err) {
      debug(self.name + ' started on port ' + self.port)
    } else {
      throw new Error(err)
    }
  })
}


SimpleApp.prototype.close = function (done) {
  var self = this

  self.server.close(function (err) {
    if (!err) debug(self.name + ' closed on port ' + self.port)
    done && done(err)
  })
}