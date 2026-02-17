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

interface SafeUrlOptions {
  /**
   * When true, allows external HTTP/HTTPS URLs (e.g., https://example.com).
   * When false (default), only same-origin and relative URLs are permitted.
   * Use allowExternal: true only for rendering <a> tags, never for window.location assignments.
   */
  allowExternal?: boolean
}

/**
 * Validates if a URL is safe for navigation (prevents XSS and injection attacks).
 * By default, only allows relative URLs and same-origin URLs to prevent open redirects.
 * Pass { allowExternal: true } to also allow external HTTP/HTTPS URLs (for <a> tags).
 * Always blocks dangerous protocols like javascript:, data:, vbscript:, etc.
 *
 * @param url - The URL to validate
 * @param options - Validation options
 * @returns true if the URL is safe for navigation, false otherwise
 */
export function isSafeUrl(url: string, options: SafeUrlOptions = {}): boolean {
  const { allowExternal = false } = options
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

    const currentOrigin = window.location.origin
    const isSameOrigin = parsedUrl.origin === currentOrigin

    // Allow http: and https: protocols
    if (parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:') {
      // When allowExternal is false, only permit same-origin URLs to prevent open redirects
      return allowExternal || isSameOrigin
    }

    // For other protocols, only allow if same-origin
    return isSameOrigin
  } catch {
    // If URL parsing fails, it's not safe
    return false
  }
}

/**
 * Safely navigates to a URL by validating it first.
 * Only allows relative URLs and same-origin HTTP/HTTPS URLs to prevent open redirects.
 * Blocks dangerous protocols like javascript:, data:, vbscript:, etc.
 *
 * SECURITY: This function restricts navigation to same-origin URLs only. External URLs
 * are rejected to prevent open redirect attacks via user-controlled input.
 *
 * @param url - The URL to navigate to (must be relative or same-origin)
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
