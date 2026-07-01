/**
 * Environment configuration utilities
 *
 * Provides type-safe access to environment variables with fallbacks
 */

interface EnvConfig {
  /** Canonical base URL of the site (from `VITE_BASE_URL`, falls back to `window.location.origin`) */
  baseUrl: string
  /** Comma-separated SEO keyword string for the `<meta name="keywords">` tag */
  seoKeywords: string
  /** Absolute URL of the Open Graph image used for social sharing previews */
  ogImage: string
  /** `true` when running in the Vite development server (`import.meta.env.DEV`) */
  isDevelopment: boolean
  /** `true` when running a production build (`import.meta.env.PROD`) */
  isProduction: boolean
}

/**
 * Get the base URL for the application
 * Falls back to window.location.origin if not set
 */
export const getBaseUrl = (): string => {
  return import.meta.env.VITE_BASE_URL || window.location.origin
}

/**
 * Get SEO keywords for meta tags
 */
export const getSeoKeywords = (): string => {
  return (
    import.meta.env.VITE_SEO_KEYWORDS ||
    'note-taking app, simple notes, fast notes, offline notes, tag-based organization, distraction-free writing, minimalist notes'
  )
}

/**
 * Get Open Graph image URL
 * Returns absolute URL for production, relative for development
 */
export const getOgImage = (): string => {
  const ogImage = import.meta.env.VITE_OG_IMAGE || '/og-image.png'
  const baseUrl = getBaseUrl()

  // If image is already absolute URL, return as-is
  if (ogImage.startsWith('http://') || ogImage.startsWith('https://')) {
    return ogImage
  }

  // Otherwise, prepend base URL for absolute path
  return `${baseUrl}${ogImage}`
}

/**
 * Complete environment configuration
 */
export const env: EnvConfig = {
  baseUrl: getBaseUrl(),
  seoKeywords: getSeoKeywords(),
  ogImage: getOgImage(),
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
}

/**
 * Applies environment-derived values to several `<head>` meta tags at runtime.
 *
 * Updates the canonical link, `<meta name="keywords">`, `<meta property="og:url">`,
 * and `<meta property="og:image">` elements to reflect `env.baseUrl` and `env.ogImage`.
 * In development mode, logs the resolved values to the console.
 * Call once during app initialization (e.g. in `main.tsx`).
 */
export const updateMetaTags = (): void => {
  if (import.meta.env.DEV) {
    console.log('🌍 Environment:', {
      baseUrl: env.baseUrl,
      ogImage: env.ogImage,
      mode: 'development',
    })
  }

  // Update canonical URL
  const canonical = document.querySelector('link[rel="canonical"]')
  if (canonical) {
    canonical.setAttribute('href', env.baseUrl + '/')
  }

  // Update keywords
  const keywords = document.querySelector('meta[name="keywords"]')
  if (keywords) {
    keywords.setAttribute('content', env.seoKeywords)
  }

  // Update Open Graph URL
  const ogUrl = document.querySelector('meta[property="og:url"]')
  if (ogUrl) {
    ogUrl.setAttribute('content', env.baseUrl + '/')
  }

  // Update Open Graph image
  const ogImage = document.querySelector('meta[property="og:image"]')
  if (ogImage) {
    ogImage.setAttribute('content', env.ogImage)
  }
}
