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
 * Safely navigates to a URL by validating it first.
 * Allows relative URLs, HTTP/HTTPS URLs (including external), and blocks dangerous protocols
 * like javascript:, data:, vbscript:, etc.
 *
 * SECURITY NOTE: This function allows external HTTP/HTTPS URLs. For use cases requiring
 * same-origin navigation only (to prevent open redirects), implement additional domain
 * validation before calling this function or use a different approach.
 *
 * Safe usage: Only call with hardcoded URLs or URLs from trusted sources. Never pass
 * user-controlled query parameters directly to this function without domain validation.
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

  if (!isSafeUrl(url)) {
    if (import.meta.env.DEV) {
      console.warn(`Navigation blocked: URL "${url}" failed security validation`)
    }
    return false
  }

  window.location.href = url
  return true
}
