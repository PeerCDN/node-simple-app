$(document).ready(function () {
  // Events handlers
  $('#logout').click(function () {
    $.post('/logout', {_csrf: _csrf}, function () {
      window.location = '/'
    })
  })
})