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

const DANGEROUS_PROTOCOL_PATTERN = /^(javascript|data|vbscript|file|about):/i

// eslint-disable-next-line no-control-regex
const CONTROL_CHAR_PATTERN = /[\x00-\x1F\x7F]/

const ENCODED_CHAR_PATTERN = /%[0-9a-f]{2}/i

/** Returns true if the URL uses a dangerous protocol (javascript:, data:, etc.) */
function hasDangerousProtocol(trimmedUrl: string): boolean {
  const urlWithoutWhitespace = trimmedUrl.replace(/\s/g, '')
  return (
    DANGEROUS_PROTOCOL_PATTERN.test(trimmedUrl) ||
    DANGEROUS_PROTOCOL_PATTERN.test(urlWithoutWhitespace)
  )
}

/** Returns true if the URL hides a dangerous protocol behind percent-encoding */
function hasEncodedDangerousProtocol(trimmedUrl: string): boolean {
  const colonIndex = trimmedUrl.indexOf(':')
  const hasEncoding =
    colonIndex > 0 && ENCODED_CHAR_PATTERN.test(trimmedUrl.substring(0, colonIndex))
  if (!hasEncoding) {
    return false
  }
  try {
    return DANGEROUS_PROTOCOL_PATTERN.test(decodeURIComponent(trimmedUrl))
  } catch {
    // If decoding fails, treat as suspicious
    return true
  }
}

/** Returns true if the URL looks like a relative path (/, ./, ../) */
function isRelativePath(trimmedUrl: string): boolean {
  const isSlashRelative = trimmedUrl.startsWith('/') && !trimmedUrl.startsWith('//')
  const isDotRelative = trimmedUrl.startsWith('./') || trimmedUrl.startsWith('../')
  return isSlashRelative || isDotRelative
}

/** Validates an absolute URL's protocol and origin against the current page */
function isAllowedAbsoluteUrl(trimmedUrl: string, allowExternal: boolean): boolean {
  const parsedUrl = new URL(trimmedUrl, window.location.origin)
  const isSameOrigin = parsedUrl.origin === window.location.origin
  const isHttpProtocol = parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:'
  if (isHttpProtocol) {
    return allowExternal || isSameOrigin
  }
  return isSameOrigin
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

  if (typeof window === 'undefined') {
    return false
  }

  try {
    if (!url || url.trim() === '') {
      return false
    }

    const trimmedUrl = url.trim()

    if (CONTROL_CHAR_PATTERN.test(trimmedUrl) || trimmedUrl.startsWith('//')) {
      return false
    }

    if (hasDangerousProtocol(trimmedUrl) || hasEncodedDangerousProtocol(trimmedUrl)) {
      return false
    }

    if (isRelativePath(trimmedUrl)) {
      // Reject relative paths containing :// (protocol injection attempt)
      return !trimmedUrl.includes('://')
    }

    return isAllowedAbsoluteUrl(trimmedUrl, allowExternal)
  } catch {
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
