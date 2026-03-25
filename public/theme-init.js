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
  const stored = localStorage.getItem('theme')
  const hasUserPref = localStorage.getItem('theme-user-preference') === 'true'

  let theme
  if (hasUserPref && (stored === 'light' || stored === 'dark')) {
    theme = stored
  } else if (
    globalThis.matchMedia &&
    globalThis.matchMedia('(prefers-color-scheme: dark)').matches
  ) {
    theme = 'dark'
  } else {
    theme = 'light'
  }

  document.documentElement.dataset['theme'] = theme
})()
