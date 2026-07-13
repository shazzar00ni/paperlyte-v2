/**
 * Make document meta tags environment-aware for development.
 *
 * In development, sets `meta[name="robots"]` to `"noindex, nofollow"`, removes
 * `meta[name="keywords"]`, prefixes the `<title>` with `[DEV]` if not present,
 * and rewrites Open Graph and Twitter `url`/`image` meta values to use the current
 * origin. In production, no changes are made. The canonical URL is intentionally
 * left unchanged and continues to point to production.
 */

/**
 * Sets `attr` to `value` on the first element matching `selector`.
 * A no-op when no matching element exists.
 *
 * @param selector - CSS selector for the target `<meta>` or `<link>` element
 * @param attr - Attribute name to update (e.g. `'content'`, `'href'`)
 * @param value - New attribute value
 */
function updateMetaAttr(selector: string, attr: string, value: string): void {
  const el = document.querySelector(selector)
  if (el) el.setAttribute(attr, value)
}

/**
 * Configures `<head>` meta tags for the development environment.
 *
 * In production this function is a no-op. In development it:
 * - Sets `meta[name="robots"]` to `"noindex, nofollow"` so search engines ignore dev builds
 * - Removes `meta[name="keywords"]` (irrelevant in dev)
 * - Prefixes `<title>` with `[DEV]` if not already present
 * - Rewrites Open Graph and Twitter Card `url`/`image` properties to use the current origin
 *
 * Call once during app initialization (e.g. in `main.tsx`).
 */
export function initializeMetaTags(): void {
  if (import.meta.env.PROD) return

  const currentUrl = window.location.origin

  if (import.meta.env.DEV) {
    // DEV-only diagnostic output, stripped from production builds; not routed
    // through `monitoring.logEvent` since this is informational setup logging,
    // not an application event.
    /* eslint-disable no-console */
    console.log('[Meta Tags] Initialized for development environment')
    console.log('  - Robots: noindex, nofollow')
    console.log('  - Keywords: removed')
    console.log('  - Canonical URL: unchanged (points to production)')
    console.log(`  - Open Graph URLs: updated to ${currentUrl}`)
    console.log(`  - Twitter Card URLs: updated to ${currentUrl}`)
    /* eslint-enable no-console */
  }

  updateMetaAttr('meta[name="robots"]', 'content', 'noindex, nofollow')

  const keywordsMeta = document.querySelector('meta[name="keywords"]')
  if (keywordsMeta) keywordsMeta.remove()

  const titleElement = document.querySelector('title')
  if (titleElement && !titleElement.textContent?.includes('[DEV]')) {
    titleElement.textContent = `[DEV] ${titleElement.textContent}`
  }

  updateMetaAttr('meta[property="og:url"]', 'content', currentUrl + '/')
  updateMetaAttr('meta[property="og:image"]', 'content', currentUrl + '/og-image.png')
  updateMetaAttr('meta[name="twitter:url"]', 'content', currentUrl + '/')
  updateMetaAttr('meta[name="twitter:image"]', 'content', currentUrl + '/og-image.png')
}
