var path = require('path')
var SimpleApp = require('./lib/SimpleApp')

function App () {
  var self = this

  SimpleApp.call(self, {
    name: 'Simple App',
    port: 9000,
    dbPath: path.join(__dirname, './app-db'),
    cookieSecret: 'secret'
  })
}
App.prototype = Object.create(SimpleApp.prototype)

/* Start the app */
new App()