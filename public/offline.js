'use strict'
;(function () {
  // Keep in sync with the static <svg> inside #retry-btn in offline.html
  // Keep in sync with the static <svg> inside #retry-btn in offline.html
  function createRetryIcon() {
    var svgNS = 'http://www.w3.org/2000/svg'
    var svg = document.createElementNS(svgNS, 'svg')
    svg.setAttribute('width', '15')
    svg.setAttribute('height', '15')
    svg.setAttribute('viewBox', '0 0 24 24')
    svg.setAttribute('fill', 'none')
    svg.setAttribute('stroke', 'currentColor')
    svg.setAttribute('stroke-width', '2.5')
    svg.setAttribute('stroke-linecap', 'round')
    svg.setAttribute('aria-hidden', 'true')

    var path1 = document.createElementNS(svgNS, 'path')
    path1.setAttribute('d', 'M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8')
    svg.appendChild(path1)

    var path2 = document.createElementNS(svgNS, 'path')
    path2.setAttribute('d', 'M3 3v5h5')
    svg.appendChild(path2)

    return svg
  }

  function setRetryButtonContent(btn) {
    btn.replaceChildren(createRetryIcon(), document.createTextNode(' Try again'))
  }

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
        setRetryButtonContent(btn)
      })
  }

  document.addEventListener('DOMContentLoaded', function () {
    var btn = document.getElementById('retry-btn')
    if (btn) btn.addEventListener('click', retry)
  })
})()
