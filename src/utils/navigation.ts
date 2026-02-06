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
 * Allows relative URLs and same-origin URLs only (prevents open redirect attacks).
 * Blocks dangerous protocols like javascript:, data:, vbscript:, etc.
 * Blocks external domains to prevent open redirect vulnerabilities.
 *
 * @param url - The URL to validate
 * @param allowExternal - If true, allows external HTTP/HTTPS URLs (default: false)
 * @returns true if the URL is safe for navigation, false otherwise
 */
export function isSafeUrl(url: string, allowExternal: boolean = false): boolean {
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

    // Always allow same-origin URLs
    if (parsedUrl.origin === currentOrigin) {
      return true
    }

    // Only allow external HTTP/HTTPS URLs if explicitly permitted
    if (allowExternal && (parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:')) {
      return true
    }

    // Reject everything else (external URLs when not allowed, or non-HTTP(S) protocols)
    return false
  } catch {
    // If URL parsing fails, it's not safe
    return false
  }
}

/**
 * Safely navigates to a same-origin URL by validating it first.
 * Allows relative URLs and same-origin URLs only (prevents open redirect attacks).
 * Blocks dangerous protocols like javascript:, data:, vbscript:, etc.
 * Blocks external domains to prevent open redirect vulnerabilities.
 *
 * SECURITY NOTE: This function ONLY allows same-origin navigation to prevent open redirects.
 * For external navigation, use safeNavigateExternal() instead.
 *
 * Safe usage: Call with URLs from your application. Never pass unvalidated user-controlled
 * query parameters directly to this function.
 *
 * @param url - The URL to navigate to (must be same-origin)
 * @returns true if navigation was performed, false if URL was rejected or navigation not needed (SSR)
 */
export function safeNavigate(url: string): boolean {
  // SSR guard - return false as navigation is not applicable in server-side context
  // This indicates 'navigation not performed' rather than 'navigation failed'
  if (typeof window === 'undefined') {
    return false
  }

  if (!isSafeUrl(url, false)) {
    console.warn(`Navigation blocked: URL "${url}" failed security validation (same-origin only)`)
    return false
  }

  window.location.href = url
  return true
}

/**
 * Safely navigates to an external URL by validating it first.
 * Allows HTTP/HTTPS URLs to external domains for intentional external navigation.
 * Still blocks dangerous protocols like javascript:, data:, vbscript:, etc.
 *
 * SECURITY NOTE: This function allows external navigation. Only use for links where
 * external navigation is intentional (e.g., social media links, documentation links).
 * Never pass unvalidated user-controlled URLs to this function.
 *
 * @param url - The URL to navigate to (can be external)
 * @returns true if navigation was performed, false if URL was rejected or navigation not needed (SSR)
 */
export function safeNavigateExternal(url: string): boolean {
  // SSR guard - return false as navigation is not applicable in server-side context
  if (typeof window === 'undefined') {
    return false
  }

  if (!isSafeUrl(url, true)) {
    console.warn(`External navigation blocked: URL "${url}" failed security validation`)
    return false
  }

  window.location.href = url
  return true
}
