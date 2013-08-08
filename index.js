var debug = require('debug')('test-app')
var path = require('path')
var SimpleApp = require('./lib/SimpleApp')

function App () {
  var self = this

  var opts = {
    name: 'Simple App',
    port: 9000,
    dbPath: path.join(__dirname, './app-db'),
    cookieSecret: 'secret'
  }

  // Call the parent constructor
  SimpleApp.call(self, opts, self.init.bind(self))
}
App.prototype = Object.create(SimpleApp.prototype)

/* Setup app-specific routes and middleware */
App.prototype.init = function () {
  var self = this
  var app = self.app

  app.get('/hello', function (req, res) {
    res.end('Hello.')
  })
}

/* Start the app */
new App()