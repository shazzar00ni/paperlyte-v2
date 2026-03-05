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
 * Internal helper to check for dangerous protocols in a URL string.
 * @private
 */
function isDangerousProtocol(url: string): boolean {
  const dangerousProtocolPattern = /^(javascript|data|vbscript|file|about):/i
  const urlWithoutWhitespace = url.replace(/\s/g, '')

  if (dangerousProtocolPattern.test(url) || dangerousProtocolPattern.test(urlWithoutWhitespace)) {
    return true
  }

  // Check for URL-encoded variations of dangerous protocols
  const colonIndex = url.indexOf(':')
  const hasEncodedProtocol =
    colonIndex > 0 && /%[0-9a-f]{2}/i.test(url.substring(0, colonIndex))

  if (hasEncodedProtocol) {
    try {
      const decoded = decodeURIComponent(url)
      if (dangerousProtocolPattern.test(decoded)) {
        return true
      }
    } catch {
      return true // Reject if decoding fails
    }
  }

  return false
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
  if (typeof window === 'undefined' || !url || url.trim() === '') {
    return false
  }

  const trimmedUrl = url.trim()

  // Reject URLs containing ASCII control characters
  // eslint-disable-next-line no-control-regex
  if (/[\x00-\x1F\x7F]/.test(trimmedUrl) || trimmedUrl.startsWith('//')) {
    return false
  }

  if (isDangerousProtocol(trimmedUrl)) {
    return false
  }

  // Handle relative URLs
  const isRelative =
    (trimmedUrl.startsWith('/') && !trimmedUrl.startsWith('//')) ||
    trimmedUrl.startsWith('./') ||
    trimmedUrl.startsWith('../')

  if (isRelative) {
    return !trimmedUrl.includes('://')
  }

  try {
    const parsedUrl = new URL(trimmedUrl, window.location.origin)
    const isStandardProtocol = parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:'

    if (isStandardProtocol) {
      return true
    }

    return parsedUrl.origin === window.location.origin
  } catch {
    return false
  }
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
    console.warn(`Navigation blocked: URL "${url}" failed security validation`)
    return false
  }

  window.location.href = url
  return true
}
