/**
 * Theme initialization script - loaded synchronously in <head> to prevent
 * a flash of unstyled content (FOUC) when the page first loads.
 *
 * This script runs before React hydrates and applies the correct theme
 * to <html> so the page renders in the right theme immediately.
 *
 * Mirrors the logic in src/hooks/useTheme.ts:
 * - Reads <meta name="allow-persistent-theme"> (set in index.html) to stay
 *   in sync with PERSISTENCE_CONFIG.ALLOW_PERSISTENT_THEME in config.ts.
 * - If persistence is allowed and the user has an explicit stored preference,
 *   that value is used.
 * - Otherwise falls back to the OS prefers-color-scheme media query.
 * - Defaults to 'light' only when both of the above are unavailable.
 */
;(function () {
  // Reads the <meta name="allow-persistent-theme"> tag set in index.html,
  // which mirrors PERSISTENCE_CONFIG.ALLOW_PERSISTENT_THEME in config.ts.
  // Returns false only when the tag is explicitly set to "false".
  function getAllowPersistent() {
    const meta = document.querySelector('meta[name="allow-persistent-theme"]')
    return !meta || meta.getAttribute('content') !== 'false'
  }

  // Returns the user's stored theme if persistence is valid, otherwise null.
  function getStoredTheme() {
    try {
      const stored = localStorage.getItem('theme')
      const hasUserPref = localStorage.getItem('theme-user-preference') === 'true'
      if (hasUserPref && (stored === 'light' || stored === 'dark')) {
        return stored
      }
    } catch {
      // localStorage is unavailable (e.g. private browsing, strict security
      // settings) — fall through to return null.
    }
    return null
  }

  const systemTheme = globalThis.matchMedia?.('(prefers-color-scheme: dark)')?.matches
    ? 'dark'
    : 'light'

  const storedTheme = getAllowPersistent() ? getStoredTheme() : null
  document.documentElement.dataset['theme'] = storedTheme ?? systemTheme
})()
