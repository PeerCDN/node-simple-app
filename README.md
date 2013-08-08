# node-simple-app

node-simple-app provides a solid and secure app template that follows best practices and
requires no additional installs. It adds authentication using LevelDB on top of
Express and provides handy Jade templates for the auth forms.

## Quick Start

1. Fork this repo
1. `make update-deps`
1. `make`
1. Search and replace the string '_app_'. Additionally, you'd have to modify package.json as you see fit.

## Features

* No database installation (uses LevelDB)
* No global package installs (dev deps are installed locally)
* Includes commonly used Express middleware
* User auth with simple Jade templates for login and register pages
* Passwords stored in LevelDB hashed with bcrypt
* Bower setup with jquery and underscore

## TODO

* Nicer styles
* Error: Forbidden should not print to screen
* Extending without modifying lib/SimpleApp.js
* Figure out where to log
* Make bower actually work
* Add some tests (use PhantomJS)
  * Add Travis
  * Add badge for Travis
