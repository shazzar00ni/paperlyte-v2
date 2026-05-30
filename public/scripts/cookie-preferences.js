const cookieBtn = document.getElementById('cookie-preferences-btn')
if (cookieBtn) {
  if (globalThis.cookieConsent && typeof globalThis.cookieConsent.open === 'function') {
    cookieBtn.addEventListener('click', () => {
      globalThis.cookieConsent.open()
    })
  } else {
    cookieBtn.hidden = true
  }
}
