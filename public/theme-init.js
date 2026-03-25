/**
 * Theme initialization script - loaded synchronously in <head> to prevent
 * a flash of unstyled content (FOUC) when the page first loads.
 *
 * This script runs before React hydrates and applies the correct theme class
 * to <html> so the page renders in the right theme immediately.
 *
 * Mirror of the logic in src/hooks/useTheme.ts:
 * - If the user has explicitly set a theme (stored in localStorage), use that.
 * - Otherwise, respect the OS/system preference via prefers-color-scheme.
 * - Fall back to light theme.
 */
;(function () {
  try {
    var stored = localStorage.getItem('theme')
    var hasUserPref = localStorage.getItem('theme-user-preference') === 'true'
    var theme

    if (hasUserPref && (stored === 'light' || stored === 'dark')) {
      theme = stored
    } else if (
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches
    ) {
      theme = 'dark'
    } else {
      theme = 'light'
    }

    document.documentElement.setAttribute('data-theme', theme)
  } catch (_e) {
    // localStorage may be unavailable (private browsing, security restrictions).
    // Fall back to light theme silently.
    document.documentElement.setAttribute('data-theme', 'light')
  }
})()
