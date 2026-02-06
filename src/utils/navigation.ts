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

  try {
    // Empty or null URLs are not safe
    if (!url || url.trim() === '') {
      return false
    }

    const trimmedUrl = url.trim()

    // Reject URLs containing ASCII control characters (null bytes, etc.)
    // eslint-disable-next-line no-control-regex
    if (/[\x00-\x1F\x7F]/.test(trimmedUrl)) {
      return false
    }
    // Block protocol-relative URLs (//example.com)
    if (trimmedUrl.startsWith('//')) {
      return false
    }

    // Block javascript:, data:, vbscript:, and other dangerous protocols
    // Check both before and after removing whitespace to catch variations like 'javascript :alert(1)'
    const dangerousProtocolPattern = /^(javascript|data|vbscript|file|about):/i
    const urlWithoutWhitespace = trimmedUrl.replace(/\s/g, '')
    if (
      dangerousProtocolPattern.test(trimmedUrl) ||
      dangerousProtocolPattern.test(urlWithoutWhitespace)
    ) {
      return false
    }

    // Block URL-encoded variations of dangerous protocols
    // Check if the URL contains % encoding before a colon (could be trying to hide a dangerous protocol)
    // Match patterns like "java%73cript:" or "%6A%61%76%61script:"
    // Only check the protocol part (before the first colon)
    const colonIndex = trimmedUrl.indexOf(':')
    const hasEncodedProtocol =
      colonIndex > 0 && /%[0-9a-f]{2}/i.test(trimmedUrl.substring(0, colonIndex))
    if (hasEncodedProtocol) {
      // Try to decode and check if it's a dangerous protocol
      try {
        const decoded = decodeURIComponent(trimmedUrl)
        if (dangerousProtocolPattern.test(decoded)) {
          return false
        }
      } catch {
        // If decoding fails, reject it as suspicious
        return false
      }
    }

    // Allow single slash relative URLs (but check they don't contain ://)
    if (trimmedUrl.startsWith('/') && !trimmedUrl.startsWith('//')) {
      // Additional safety: ensure no protocol injection
      if (trimmedUrl.includes('://')) {
        return false
      }
      return true
    }

    // Allow ./ and ../ relative URLs
    if (trimmedUrl.startsWith('./') || trimmedUrl.startsWith('../')) {
      // Additional safety: ensure no protocol injection
      if (trimmedUrl.includes('://')) {
        return false
      }
      return true
    }

    // For absolute URLs, parse and validate the protocol
    const parsedUrl = new URL(trimmedUrl, window.location.origin)

    // Allow http: and https: protocols (safe for external links)
    // Allow same-origin URLs with any protocol
    if (parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:') {
      return true
    }

    // For other protocols, only allow if same-origin
    const currentOrigin = window.location.origin
    return parsedUrl.origin === currentOrigin
  } catch {
    // If URL parsing fails, it's not safe
    return false
  }
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
 * Checks if a URL is a safe relative URL (starts with / but not //).
 * For consistency with isSafeUrl(), rejects URLs containing "://" in the path.
 *
 * @param url - The trimmed URL to check
 * @returns true if it's a safe slash-relative URL
 */
function isSlashRelativeUrl(url: string): boolean {
  return url.startsWith('/') && !url.startsWith('//') && !url.includes('://')
}

/**
 * Checks if a URL is a safe dot-relative URL (./ or ../).
 * For consistency with isSafeUrl(), rejects URLs containing "://" in the path.
 *
 * @param url - The trimmed URL to check
 * @returns true if it's a safe dot-relative URL
 */
function isDotRelativeUrl(url: string): boolean {
  return (url.startsWith('./') || url.startsWith('../')) && !url.includes('://')
}

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
    const trimmedUrl = url.trim()

    // Disallow empty or whitespace-only URLs
    if (!trimmedUrl) {
      return false
    }

    // Check for safe relative URLs (slash-relative or dot-relative)
    if (isSlashRelativeUrl(trimmedUrl) || isDotRelativeUrl(trimmedUrl)) {
      return true
    }

    // For consistency with isSafeUrl(), reject any URL that looks like a relative path
    // but contains "://" - this catches attempts like "/path://injection"
    if (isRelativePathWithProtocolInjection(trimmedUrl)) {
      return false
    }

    // Parse the URL to check domain
    const parsedUrl = new URL(trimmedUrl, window.location.origin)
    const currentOrigin = window.location.origin

    // Same-origin URLs are always allowed
    if (parsedUrl.origin === currentOrigin) {
      return true
    }

    // For external URLs, check against the allowlist
    return isAllowedExternalUrl(parsedUrl)
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
    console.warn(`Navigation blocked: URL "${url}" failed security validation`)
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
