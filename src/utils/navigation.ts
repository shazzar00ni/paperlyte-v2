/**
 * Scrolls smoothly to a section identified by its ID.
 * If the section doesn't exist or running in SSR, the function does nothing.
 *
 * @param sectionId - The ID of the section to scroll to (without the # prefix)
 */
import { logError } from '@utils/monitoring'

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

export interface SafeUrlOptions {
  /**
   * When true, allows external HTTP/HTTPS URLs (e.g., https://example.com).
   * When false (default), only same-origin and relative URLs are permitted.
   * Use allowExternal: true only for rendering <a> tags, never for window.location assignments.
   */
  allowExternal?: boolean
}

// eslint-disable-next-line no-control-regex
const CONTROL_CHAR_PATTERN = /[\x00-\x1F\x7F]/

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

  if (!url || url.trim() === '') {
    return false
  }

  const trimmedUrl = url.trim()

  // Reject ASCII control characters (null bytes, etc.)
  if (CONTROL_CHAR_PATTERN.test(trimmedUrl)) {
    return false
  }

  // Block protocol-relative URLs and backslash variants (//example.com, \/example.com, \\example.com)
  if (/^[\\/]{2}/.test(trimmedUrl)) {
    return false
  }

  if (hasDangerousProtocol(trimmedUrl)) {
    return false
  }

  if (isRelativeUrl(trimmedUrl)) {
    return true
  }

  // Slash-prefixed paths that failed isRelativeUrl (e.g., contain ://)
  // Use URL constructor to check if they resolve safely as same-origin
  if (trimmedUrl.startsWith('/')) {
    try {
      const parsed = new URL(trimmedUrl, window.location.origin)
      return (parsed.protocol === 'http:' || parsed.protocol === 'https:') && parsed.origin === window.location.origin
    } catch {
      return false
    }
  }

  // Absolute or naked-path URLs
  if (allowExternal) {
    return isAllowedAbsoluteUrl(trimmedUrl)
  }

  // Default: same-origin only (prevents open redirects)
  try {
    const parsed = new URL(trimmedUrl, window.location.origin)
    return (parsed.protocol === 'http:' || parsed.protocol === 'https:') && parsed.origin === window.location.origin
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
    logError(
      new Error('Navigation blocked: URL failed security validation'),
      { severity: 'medium', errorInfo: { reason: 'unsafe_url', urlPresent: true } },
      'navigation'
    )
    return false
  }

  try {
    // SECURITY: URL has been validated as same-origin and safe via isSafeUrl()
    window.location.assign(url)
    return true
  } catch {
    return false
  }
}
