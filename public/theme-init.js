/**
 * Theme initialization script - loaded synchronously in <head> to prevent
 * a flash of unstyled content (FOUC) when the page first loads.
 *
 * This script runs before React hydrates and applies the correct theme
 * to <html> so the page renders in the right theme immediately.
 *
 * Mirrors the logic in src/hooks/useTheme.ts:
 * - Reads ALLOW_PERSISTENT_THEME from a window global or
 *   <meta name="allow-persistent-theme"> to stay in sync with
 *   PERSISTENCE_CONFIG.ALLOW_PERSISTENT_THEME.
 * - If persistence is allowed and the user has an explicit stored preference,
 *   that value is used.
 * - Otherwise falls back to the OS prefers-color-scheme media query.
 * - Defaults to 'light' only when both of the above are unavailable.
 */
;(function () {
  // Resolve whether theme persistence is enabled, mirroring
  // PERSISTENCE_CONFIG.ALLOW_PERSISTENT_THEME in src/constants/config.ts.
  // Check a window global first; fall back to a <meta> tag; default to true.
  let allowPersistent = true

  if ('ALLOW_PERSISTENT_THEME' in globalThis) {
    allowPersistent = !!globalThis.ALLOW_PERSISTENT_THEME
  } else {
    const meta = document.querySelector('meta[name="allow-persistent-theme"]')
    if (meta) {
      const content = meta.getAttribute('content')
      allowPersistent = (content ?? 'true') !== 'false'
    }
  }

  // Compute the system preference first so it is available as a fallback in
  // both the normal flow and error recovery below.
  const systemTheme = globalThis.matchMedia?.('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'

  let theme = systemTheme

  if (allowPersistent) {
    try {
      const stored = localStorage.getItem('theme')
      const hasUserPref = localStorage.getItem('theme-user-preference') === 'true'

      if (hasUserPref && (stored === 'light' || stored === 'dark')) {
        theme = stored
      }
    } catch {
      // localStorage is unavailable (e.g. private browsing, strict security
      // settings).  systemTheme was already assigned above, so no further
      // action is needed here.
    }
  }

  document.documentElement.dataset['theme'] = theme
})()
