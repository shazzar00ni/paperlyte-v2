/**
 * Set the meta description for the current page.
 *
 * Creates a `<meta name="description">` element if it doesn't exist,
 * then sets its content attribute to the provided description.
 * This ensures consistent SEO metadata across all pages.
 *
 * @param content - The description content to set
 */
export function setMetaDescription(content: string): void {
  let metaDescription = document.querySelector('meta[name="description"]')
  if (!metaDescription) {
    metaDescription = document.createElement('meta')
    metaDescription.setAttribute('name', 'description')
    document.head.appendChild(metaDescription)
  }
  metaDescription.setAttribute('content', content)
}

/**
 * Make document meta tags environment-aware for development.
 *
 * In development, sets `meta[name="robots"]` to `"noindex, nofollow"`, removes
 * `meta[name="keywords"]`, prefixes the `<title>` with `[DEV]` if not present,
 * and rewrites Open Graph and Twitter `url`/`image` meta values to use the current
 * origin. In production, no changes are made. The canonical URL is intentionally
 * left unchanged and continues to point to production.
 */
export function initializeMetaTags(): void {
  const isProd = import.meta.env.PROD
  const currentUrl = window.location.origin

  // In development, prevent search engine indexing and update social sharing URLs
  if (!isProd) {
    // Prevent indexing in development
    const robotsMeta = document.querySelector('meta[name="robots"]')
    if (robotsMeta) {
      robotsMeta.setAttribute('content', 'noindex, nofollow')
    }

    // Remove keywords meta tag in development (shouldn't be indexed anyway)
    const keywordsMeta = document.querySelector('meta[name="keywords"]')
    if (keywordsMeta) {
      keywordsMeta.remove()
    }

    // Add development indicator to title
    const titleElement = document.querySelector('title')
    if (titleElement && !titleElement.textContent?.includes('[DEV]')) {
      titleElement.textContent = `[DEV] ${titleElement.textContent}`
    }

    // Update Open Graph URLs for testing social sharing
    const ogUrl = document.querySelector('meta[property="og:url"]')
    if (ogUrl) {
      ogUrl.setAttribute('content', currentUrl + '/')
    }

    const ogImage = document.querySelector('meta[property="og:image"]')
    if (ogImage) {
      ogImage.setAttribute('content', currentUrl + '/og-image.png')
    }

    // Update Twitter Card URLs for testing
    const twitterUrl = document.querySelector('meta[name="twitter:url"]')
    if (twitterUrl) {
      twitterUrl.setAttribute('content', currentUrl + '/')
    }

    const twitterImage = document.querySelector('meta[name="twitter:image"]')
    if (twitterImage) {
      twitterImage.setAttribute('content', currentUrl + '/og-image.png')
    }

    // Log for debugging
    console.log('[Meta Tags] Initialized for development environment')
    console.log('  - Robots: noindex, nofollow')
    console.log('  - Keywords: removed')
    console.log('  - Canonical URL: unchanged (points to production)')
    console.log(`  - Open Graph URLs: updated to ${currentUrl}`)
    console.log(`  - Twitter Card URLs: updated to ${currentUrl}`)
  }
}
