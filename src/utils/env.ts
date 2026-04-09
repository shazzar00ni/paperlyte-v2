/**
 * Environment configuration utilities
 *
 * Provides type-safe, fallback-safe access to Vite environment variables
 * (`VITE_*`) and derives runtime values (base URL, OG image path) that are
 * needed by SEO helpers and meta-tag initialisation.
 *
 * All functions are safe to call at module-load time as long as `window` is
 * defined (i.e. in a browser context). The pre-built {@link env} singleton is
 * evaluated once on import and is the recommended way to consume these values.
 *
 * @example
 * ```ts
 * import { env } from '@utils/env'
 *
 * console.log(env.baseUrl)       // e.g. 'https://paperlyte.com'
 * console.log(env.isDevelopment) // true when running `npm run dev`
 * ```
 */

interface EnvConfig {
  baseUrl: string
  seoKeywords: string
  ogImage: string
  isDevelopment: boolean
  isProduction: boolean
}

/**
 * Return the canonical base URL for the application.
 *
 * Prefers the `VITE_BASE_URL` environment variable so the value can be pinned
 * at build time for production deployments. Falls back to
 * `window.location.origin` at runtime so local development and preview builds
 * work without any additional configuration.
 *
 * @returns The base URL string without a trailing slash
 *   (e.g. `'https://paperlyte.com'`).
 */
export const getBaseUrl = (): string => {
  return import.meta.env.VITE_BASE_URL || window.location.origin
}

/**
 * Return the comma-separated SEO keyword string for the `<meta name="keywords">` tag.
 *
 * Reads from `VITE_SEO_KEYWORDS`; when the variable is absent a sensible
 * default covering the product's core value propositions is returned so pages
 * are never published with an empty keywords tag.
 *
 * @returns A non-empty keyword string.
 */
export const getSeoKeywords = (): string => {
  return (
    import.meta.env.VITE_SEO_KEYWORDS ||
    'note-taking app, simple notes, fast notes, offline notes, tag-based organization, distraction-free writing, minimalist notes'
  )
}

/**
 * Return the absolute URL for the Open Graph image.
 *
 * When `VITE_OG_IMAGE` is already an absolute URL (starts with `http://` or
 * `https://`) it is returned unchanged. Otherwise it is treated as a
 * root-relative path and prepended with the result of {@link getBaseUrl} so
 * that social-sharing scrapers always receive a fully-qualified URL.
 *
 * @returns An absolute URL string pointing to the OG image asset.
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
 * Pre-built, read-only snapshot of all environment configuration values.
 *
 * Evaluated once when the module is first imported. Components and utilities
 * should import this object rather than calling the individual `get*` helpers
 * directly, to avoid redundant `window` accesses on hot paths.
 *
 * @example
 * ```ts
 * import { env } from '@utils/env'
 *
 * if (env.isDevelopment) {
 *   console.debug('Running in dev mode. Base URL:', env.baseUrl)
 * }
 * ```
 */
export const env: EnvConfig = {
  baseUrl: getBaseUrl(),
  seoKeywords: getSeoKeywords(),
  ogImage: getOgImage(),
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
}

/**
 * Apply runtime environment values to `<meta>` and `<link>` elements in the
 * document `<head>`.
 *
 * Should be called once, early in the application lifecycle (e.g. from
 * `main.tsx`), after the DOM is available. In development it logs the active
 * configuration to the console. The following tags are updated when present:
 *
 * - `<link rel="canonical">` — set to `baseUrl + '/'`
 * - `<meta name="keywords">` — set to {@link getSeoKeywords}
 * - `<meta property="og:url">` — set to `baseUrl + '/'`
 * - `<meta property="og:image">` — set to the resolved {@link getOgImage} URL
 * - `<meta name="robots">` — set to `'noindex, nofollow'` in development and
 *   `'index, follow'` in production, so development/preview builds are never
 *   accidentally indexed by search engines
 *
 * Missing tags are silently skipped; the function never throws.
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

  // Make robots directive environment-aware: prevent indexing outside production
  const robots = document.querySelector('meta[name="robots"]')
  if (robots) {
    robots.setAttribute('content', env.isDevelopment ? 'noindex, nofollow' : 'index, follow')
  }
}
