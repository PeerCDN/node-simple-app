exports.expressLogger = function (debug) {
  return function(req, res, next) {
    var status = res.statusCode
    var len = parseInt(res.getHeader('Content-Length'), 10)
    var color = 32

    if (status >= 500) color = 31
    else if (status >= 400) color = 33
    else if (status >= 300) color = 36

    len = isNaN(len)
      ? ''
      : len = ' - ' + bytes(len)

    var str = '\033[90m' + req.method
      + ' ' + req.originalUrl + ' '
      + '\033[' + color + 'm' + res.statusCode
      + ' \033[90m'
      + len
      + '\033[0m'

    debug(str)
    next()
  }
}