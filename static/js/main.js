$(document).ready(function () {
  // Events handlers
  $('#logout').click(function () {
    $.post('/logout', function () {
      window.location = '/'
    })
  })
})