/**
 * Environment configuration utilities
 *
 * Provides type-safe access to environment variables with fallbacks
 */

interface EnvConfig {
  baseUrl: string;
  seoKeywords: string;
  ogImage: string;
  isDevelopment: boolean;
  isProduction: boolean;
}

/**
 * Get the base URL for the application
 * Falls back to window.location.origin if not set
 */
export const getBaseUrl = (): string => {
  return import.meta.env.VITE_BASE_URL || window.location.origin;
};

/**
 * Get SEO keywords for meta tags
 */
export const getSeoKeywords = (): string => {
  return (
    import.meta.env.VITE_SEO_KEYWORDS ||
    "note-taking app, simple notes, fast notes, offline notes, tag-based organization, distraction-free writing, minimalist notes"
  );
};

/**
 * Get Open Graph image URL
 * Returns absolute URL for production, relative for development
 */
export const getOgImage = (): string => {
  const ogImage = import.meta.env.VITE_OG_IMAGE || "/og-image.png";
  const baseUrl = getBaseUrl();

  // If image is already absolute URL, return as-is
  if (ogImage.startsWith("http://") || ogImage.startsWith("https://")) {
    return ogImage;
  }

  // Otherwise, prepend base URL for absolute path
  return `${baseUrl}${ogImage}`;
};

/**
 * Complete environment configuration
 */
export const env: EnvConfig = {
  baseUrl: getBaseUrl(),
  seoKeywords: getSeoKeywords(),
  ogImage: getOgImage(),
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
};

/**
 * Update meta tags dynamically based on environment
 * Call this in your main.tsx or App.tsx
 */
const normalizeUrl = (base: string, path: string = '/'): string => {
  const normalizedBase = base.endsWith('/') ? base.slice(0, -1) : base;
  return `${normalizedBase}${path}`;
};

export const updateMetaTags = (): void => {
  // Update canonical URL
  const canonical = document.querySelector('link[rel="canonical"]');
  if (canonical) {
    canonical.setAttribute("href", normalizeUrl(env.baseUrl, '/'));
  }

  // Update keywords
  const keywords = document.querySelector('meta[name="keywords"]');
  if (keywords) {
    keywords.setAttribute("content", env.seoKeywords);
  }

  // Update Open Graph URL
  const ogUrl = document.querySelector('meta[property="og:url"]');
  if (ogUrl) {
    ogUrl.setAttribute("content", normalizeUrl(env.baseUrl, '/'));
  }

  // Update Open Graph image
  const ogImage = document.querySelector('meta[property="og:image"]');
  if (ogImage) {
    ogImage.setAttribute("content", env.ogImage);
  }

  // Log environment info in development
  if (env.isDevelopment) {
    console.log("🌍 Environment:", {
      baseUrl: env.baseUrl,
      ogImage: env.ogImage,
      mode: import.meta.env.MODE,
    });
  }
};
