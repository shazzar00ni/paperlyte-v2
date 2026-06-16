/**
 * Make document meta tags environment-aware for development.
 *
 * In development, sets `meta[name="robots"]` to `"noindex, nofollow"`, removes
 * `meta[name="keywords"]`, prefixes the `<title>` with `[DEV]` if not present,
 * and rewrites Open Graph and Twitter `url`/`image` meta values to use the current
 * origin. In production, no changes are made. The canonical URL is intentionally
 * left unchanged and continues to point to production.
 */

function updateMetaAttr(selector: string, attr: string, value: string): void {
  const el = document.querySelector(selector)
  if (el) el.setAttribute(attr, value)
}

export function initializeMetaTags(): void {
  if (import.meta.env.PROD) return

  const currentUrl = window.location.origin

  console.log('[Meta Tags] Initialized for development environment')
  console.log('  - Robots: noindex, nofollow')
  console.log('  - Keywords: removed')
  console.log('  - Canonical URL: unchanged (points to production)')
  console.log(`  - Open Graph URLs: updated to ${currentUrl}`)
  console.log(`  - Twitter Card URLs: updated to ${currentUrl}`)

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
