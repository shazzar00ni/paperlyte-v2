/**
 * Scrolls smoothly to a section identified by its ID.
 * If the section doesn't exist or running in SSR, the function does nothing.
 *
 * @param sectionId - The ID of the section to scroll to (without the # prefix)
 */
export function scrollToSection(sectionId: string): void {
  // SSR guard - document is not available during server-side rendering
  if (typeof document === 'undefined') {
    return
  }

  const element = document.getElementById(sectionId)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' })
  }
}

/**
 * Pattern matching dangerous protocols (javascript:, data:, vbscript:, file:, about:).
 */
const DANGEROUS_PROTOCOL_PATTERN = /^(javascript|data|vbscript|file|about):/i

/**
 * Checks whether a URL string contains a dangerous protocol, accounting for
 * whitespace obfuscation and percent-encoding.
 */
export function hasDangerousProtocol(url: string): boolean {
  // Direct check
  if (DANGEROUS_PROTOCOL_PATTERN.test(url)) {
    return true
  }

  // Check after stripping whitespace (catches "javascript :alert(1)")
  if (DANGEROUS_PROTOCOL_PATTERN.test(url.replace(/\s/g, ''))) {
    return true
  }

  // Check for percent-encoded protocol before the first colon
  const colonIndex = url.indexOf(':')
  if (colonIndex > 0 && /%[0-9a-f]{2}/i.test(url.substring(0, colonIndex))) {
    try {
      if (DANGEROUS_PROTOCOL_PATTERN.test(decodeURIComponent(url))) {
        return true
      }
    } catch {
      // Malformed encoding is suspicious — treat as dangerous
      return true
    }
  }

  return false
}

/**
 * Checks whether a URL is a safe relative path (/, ./, or ../ prefixed)
 * without embedded protocol injection.
 */
export function isRelativeUrl(url: string): boolean {
  const isSlashRelative = url.startsWith('/') && !url.startsWith('//')
  const isDotRelative = url.startsWith('./') || url.startsWith('../')

  if (!isSlashRelative && !isDotRelative) {
    return false
  }

  // Block protocol injection hidden inside relative paths
  return !url.includes('://')
}

/**
 * Checks whether a parsed absolute URL uses an allowed protocol or is same-origin.
 */
export function isAllowedAbsoluteUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url, window.location.origin)

    if (parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:') {
      return true
    }

    return parsedUrl.origin === window.location.origin
  } catch {
    return false
  }
}

/**
 * Validates if a URL is safe for navigation (prevents XSS and injection attacks).
 * Allows relative URLs, same-origin URLs, and legitimate external HTTPS/HTTP URLs.
 * Blocks dangerous protocols like javascript:, data:, vbscript:, etc.
 *
 * @param url - The URL to validate
 * @returns true if the URL is safe for navigation, false otherwise
 */
export function isSafeUrl(url: string): boolean {
  // SSR guard
  if (typeof window === 'undefined') {
    return false
  }

  if (!url || url.trim() === '') {
    return false
  }

  const trimmedUrl = url.trim()

  // Reject ASCII control characters (null bytes, etc.)
  // eslint-disable-next-line no-control-regex
  if (/[\x00-\x1F\x7F]/.test(trimmedUrl)) {
    return false
  }

  // Block protocol-relative URLs (//example.com)
  if (trimmedUrl.startsWith('//')) {
    return false
  }

  if (hasDangerousProtocol(trimmedUrl)) {
    return false
  }

  if (isRelativeUrl(trimmedUrl)) {
    return true
  }

  // Reject slash-prefixed paths that failed isRelativeUrl due to :// injection
  if (trimmedUrl.startsWith('/')) {
    return false
  }

  return isAllowedAbsoluteUrl(trimmedUrl)
}

/**
 * List of allowed external domains for navigation.
 * Only domains in this allowlist can be navigated to when using safeNavigate.
 * This prevents open redirect attacks by blocking navigation to arbitrary external sites.
 *
 * CONFIGURATION: Add trusted external domains here when the application needs to
 * navigate to specific external sites. This list is intentionally empty by default
 * to enforce a "deny by default" security posture.
 *
 * @example
 * const ALLOWED_EXTERNAL_DOMAINS: ReadonlySet<string> = new Set([
 *   'github.com',
 *   'twitter.com',
 *   'support.paperlyte.app',
 * ])
 */
const ALLOWED_EXTERNAL_DOMAINS: ReadonlySet<string> = new Set([
  // Add trusted external domains here as needed
])

/**
 * Checks if an external URL's hostname is in the allowed domains list.
 * Only allows http/https protocols for external URLs.
 *
 * @param parsedUrl - The parsed URL object
 * @returns true if the external URL is allowed
 */
function isAllowedExternalUrl(parsedUrl: URL): boolean {
  // Only allow http/https protocols for external URLs
  if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
    return false
  }
  // Check if the hostname is in the allowlist
  return ALLOWED_EXTERNAL_DOMAINS.has(parsedUrl.hostname)
}

/**
 * Checks if a URL looks like a relative path but contains "://" which could
 * indicate a protocol injection attempt (e.g., "/path://injection").
 * For consistency with isSafeUrl(), such URLs should be rejected.
 *
 * @param url - The trimmed URL to check
 * @returns true if the URL is a relative path with protocol injection attempt
 */
function isRelativePathWithProtocolInjection(url: string): boolean {
  return (
    (url.startsWith('/') || url.startsWith('./') || url.startsWith('../')) && url.includes('://')
  )
}

/**
 * Checks if a parsed URL is same-origin or an allowed external URL.
 *
 * @param parsedUrl - The parsed URL object
 * @param currentOrigin - The current window origin
 * @returns true if same-origin or allowed external, false otherwise
 */
function isSameOriginOrAllowedExternal(parsedUrl: URL, currentOrigin: string): boolean {
  // Same-origin URLs are always allowed
  if (parsedUrl.origin === currentOrigin) {
    return true
  }
  // For external URLs, check against the allowlist
  return isAllowedExternalUrl(parsedUrl)
}

/**
 * Validates and checks a trimmed URL for allowed destination.
 * This helper handles the core validation logic without SSR guards or try-catch.
 *
 * @param trimmedUrl - The trimmed URL string
 * @returns true if the URL is allowed, false otherwise
 */
function validateUrlDestination(trimmedUrl: string): boolean {
  // Disallow empty or whitespace-only URLs
  if (!trimmedUrl) {
    return false
  }

  // Check for safe relative URLs using the existing helper
  if (isRelativeUrl(trimmedUrl)) {
    return true
  }

  // For consistency with isSafeUrl(), reject any URL that looks like a relative path
  // but contains "://" - this catches attempts like "/path://injection"
  if (isRelativePathWithProtocolInjection(trimmedUrl)) {
    return false
  }

  // Parse the URL to check domain
  const parsedUrl = new URL(trimmedUrl, window.location.origin)
  return isSameOriginOrAllowedExternal(parsedUrl, window.location.origin)
}

/**
 * Checks if a URL is same-origin or on the allowed external domains list.
 * This provides protection against open redirect attacks.
 *
 * @param url - The URL to validate
 * @returns true if the URL is same-origin or on the allowlist, false otherwise
 */
export function isAllowedDestination(url: string): boolean {
  // SSR guard
  if (typeof window === 'undefined') {
    return false
  }

  try {
    return validateUrlDestination(url.trim())
  } catch {
    // If URL parsing fails, don't allow it
    return false
  }
}

/**
 * Safely navigates to a URL by validating it first.
 * Only allows relative URLs and same-origin URLs to prevent open redirect attacks.
 * External URLs are blocked unless they are on the ALLOWED_EXTERNAL_DOMAINS allowlist.
 *
 * SECURITY: This function is designed to prevent open redirect vulnerabilities.
 * It blocks navigation to external domains that are not explicitly allowlisted.
 * Use this function when the URL might contain user-controlled input.
 *
 * @param url - The URL to navigate to
 * @returns true if navigation was performed, false if URL was rejected or navigation not needed (SSR)
 */
export function safeNavigate(url: string): boolean {
  // SSR guard - return false as navigation is not applicable in server-side context
  // This indicates 'navigation not performed' rather than 'navigation failed'
  if (typeof window === 'undefined') {
    return false
  }

  // First, check basic URL safety (blocks javascript:, data:, etc.)
  if (!isSafeUrl(url)) {
    if (import.meta.env.DEV) {
      console.warn(`Navigation blocked: URL "${url}" failed security validation`)
    }
    return false
  }

  // Then, check if destination is allowed (same-origin or allowlisted)
  if (!isAllowedDestination(url)) {
    console.warn(`Navigation blocked: URL "${url}" is not an allowed destination`)
    return false
  }

  window.location.href = url
  return true
}
