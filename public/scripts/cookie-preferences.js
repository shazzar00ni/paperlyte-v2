const cookieBtn = document.getElementById('cookie-preferences-btn')
if (cookieBtn) {
  cookieBtn.addEventListener('click', () => {
    if (globalThis.cookieConsent && typeof globalThis.cookieConsent.open === 'function') {
      globalThis.cookieConsent.open()
    }
  })
}
