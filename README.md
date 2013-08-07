node-simple-app is a template that provides with authentication pages on top
of Express. It follows security best practices.

## Quick Start

* Fork this repo
* `make update-deps`
* `make`
* Search and replace the string "_app_"
* Additionally, you'd have to modify package.json as you see fit.

## Features

* POST /logout
* Includes commonly used Express middleware
* User authentication with simple Jade templates for login and register pages
* Passwords stored in LevelDB hashed with bcrypt
* Cookies are signed with secret
* Bower setup with jquery and underscore

## TODO

* Better forms
* XSRF
* Extending without modifying lib/SimpleApp.js
* Nicer styles
* Figure out where to log
* Make bower actually work
* Add some tests (use PhantomJS)
  * Add Travis
  * Add badge for Travis