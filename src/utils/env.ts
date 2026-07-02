/**
 * Environment configuration utilities
 *
 * Provides type-safe access to environment variables with fallbacks
 */

interface EnvConfig {
  baseUrl: string
  seoKeywords: string
  ogImage: string
  isDevelopment: boolean
  isProduction: boolean
}

/**
 * Get the base URL for the application.
 * Falls back to `window.location.origin` when `VITE_BASE_URL` is not set,
 * so local dev builds always resolve links against the dev server.
 *
 * @returns Absolute base URL (e.g. `"https://paperlyte.com"` or `"http://localhost:3000"`)
 */
export const getBaseUrl = (): string => {
  return import.meta.env.VITE_BASE_URL || window.location.origin
}

/**
 * Get the comma-separated SEO keyword string for the `<meta name="keywords">` tag.
 * Falls back to a sensible default set when `VITE_SEO_KEYWORDS` is not defined.
 *
 * @returns Keyword string suitable for a meta `content` attribute
 */
export const getSeoKeywords = (): string => {
  return (
    import.meta.env.VITE_SEO_KEYWORDS ||
    'note-taking app, simple notes, fast notes, offline notes, tag-based organization, distraction-free writing, minimalist notes'
  )
}

/**
 * Get the absolute Open Graph image URL.
 * If `VITE_OG_IMAGE` is already an absolute URL it is returned unchanged;
 * otherwise the value is prefixed with `getBaseUrl()` so OG crawlers receive
 * a fully-qualified URL regardless of the deployment environment.
 *
 * @returns Absolute URL to the OG image (e.g. `"https://paperlyte.com/og-image.png"`)
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
 * Rewrite environment-specific meta tags in the live document.
 *
 * Updates canonical URL, Open Graph URL, Open Graph image, and keyword meta
 * to values derived from the current environment. Intended to be called once
 * from `main.tsx` after the DOM is ready. No-ops in SSR (no `document`).
 *
 * @example
 * ```ts
 * // main.tsx
 * import { updateMetaTags } from '@utils/env'
 * updateMetaTags()
 * ```
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
