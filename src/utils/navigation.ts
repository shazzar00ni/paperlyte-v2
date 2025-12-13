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
 * Validates if a URL is safe for navigation (prevents open redirect vulnerabilities).
 * Only allows relative URLs and same-origin absolute URLs.
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
    if (/[\x00-\x1F\x7F]/.test(trimmedUrl)) {
      return false
    }
    // Block protocol-relative URLs (//example.com)
    if (trimmedUrl.startsWith('//')) {
      return false
    }

    // Block javascript:, data:, vbscript:, and other dangerous protocols
    const dangerousProtocolPattern = /^(javascript|data|vbscript|file|about):/i
    if (dangerousProtocolPattern.test(trimmedUrl)) {
      return false
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

    // For absolute URLs or anything else, try to parse and validate
    const parsedUrl = new URL(trimmedUrl, window.location.origin)
    const currentOrigin = window.location.origin

    // Only allow same-origin URLs
    return parsedUrl.origin === currentOrigin
  } catch {
    // If URL parsing fails, it's not safe
    return false
  }
}

/**
 * Safely navigates to a URL by validating it first.
 * Only allows relative URLs and same-origin absolute URLs to prevent open redirect attacks.
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
