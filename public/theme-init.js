/**
 * Theme initialization script - loaded synchronously in <head> to prevent
 * a flash of unstyled content (FOUC) when the page first loads.
 *
 * This script runs before React hydrates and applies the correct theme
 * to <html> so the page renders in the right theme immediately.
 *
 * It follows the same overall precedence as src/hooks/useTheme.ts
 * (explicit user preference first, otherwise system preference), but this
 * bootstrap version is intentionally more defensive because it runs before
 * the app has hydrated:
 * - Reads <meta name="allow-persistent-theme"> (set in index.html) to stay
 *   in sync with PERSISTENCE_CONFIG.ALLOW_PERSISTENT_THEME in config.ts.
 * - If persistence is allowed and the user has an explicit stored preference,
 *   that value is used.
 * - localStorage access is wrapped defensively so startup still succeeds when
 *   storage is unavailable.
 * - Otherwise falls back to the OS prefers-color-scheme media query.
 * - Defaults to 'light' only when matchMedia is unavailable or does not
 *   report a dark preference.
 */
;(function () {
  // Reads the <meta name="allow-persistent-theme"> tag set in index.html,
  // which mirrors PERSISTENCE_CONFIG.ALLOW_PERSISTENT_THEME in config.ts.
  // Returns false when the tag content is "false" (case-insensitive, trimmed).
  // Missing tag → allow (defaults to opt-in); any non-"false" value → allow.
  function getAllowPersistent() {
    const meta = document.querySelector('meta[name="allow-persistent-theme"]')
    const content = meta?.getAttribute('content')?.trim().toLowerCase()
    return content !== 'false'
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
