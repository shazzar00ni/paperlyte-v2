'use strict'
;(function () {
  var RETRY_SVG =
    '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>'

  function retry() {
    var btn = document.getElementById('retry-btn')
    btn.disabled = true
    btn.textContent = 'Checking…'

    var controller = new AbortController()
    var timeout = setTimeout(function () {
      controller.abort()
    }, 5000)

    fetch('/', { method: 'HEAD', cache: 'no-store', signal: controller.signal })
      .then(function (res) {
        clearTimeout(timeout)
        if (res.ok || res.status === 304) window.location.reload()
      })
      .catch(function () {
        clearTimeout(timeout)
      })
      .finally(function () {
        btn.disabled = false
        btn.innerHTML = RETRY_SVG + ' Try again'
      })
  }

  document.addEventListener('DOMContentLoaded', function () {
    var btn = document.getElementById('retry-btn')
    if (btn) btn.addEventListener('click', retry)
  })
})()
