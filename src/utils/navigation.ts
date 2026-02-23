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

 const DANGEROUS_PROTOCOLS = new Set(['javascript', 'data', 'vbscript', 'file', 'about', 'blob'])

// eslint-disable-next-line no-control-regex
const CONTROL_CHAR_PATTERN = /[\x00-\x1F\x7F]/

const ENCODED_CHAR_PATTERN = /%[0-9a-f]{2}/i

const VALID_SCHEME_PATTERN = /^[a-z][a-z0-9+\-.]*:\/\//i

/** Extracts the protocol name (lowercase) before the first colon, or empty string */
function extractProtocol(url: string): string {
  const colonIndex = url.indexOf(':')
  return colonIndex > 0 ? url.substring(0, colonIndex).toLowerCase() : ''
}

/** Returns true if the URL uses a dangerous protocol (javascript:, data:, etc.) */
function hasDangerousProtocol(trimmedUrl: string): boolean {
  const normalized = trimmedUrl.replace(/\s/g, '')
  return DANGEROUS_PROTOCOLS.has(extractProtocol(normalized))
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
    return DANGEROUS_PROTOCOLS.has(extractProtocol(decodeURIComponent(trimmedUrl)))
  } catch {
    // If decoding fails, treat as suspicious
    return true
  }
}

/** Returns true if any form of dangerous protocol is detected (plain or encoded) */
function isAnyDangerousProtocol(trimmedUrl: string): boolean {
  return hasDangerousProtocol(trimmedUrl) || hasEncodedDangerousProtocol(trimmedUrl)
}

/**
 * Performs basic validation: rejects empty, control-char, and protocol-relative URLs.
 * Returns the trimmed URL if valid, or null if the URL should be rejected.
 */
function validateBasicUrl(url: string): string | null {
  if (!url || url.trim() === '') {
    return null
  }
  const trimmedUrl = url.trim()
  if (CONTROL_CHAR_PATTERN.test(trimmedUrl) || /^[\\/][\\/]/.test(trimmedUrl)) {
    return null
  }
  return trimmedUrl
}

/** Validates an absolute URL's protocol and origin against the current page */
function isAllowedAbsoluteUrl(trimmedUrl: string, allowExternal: boolean): boolean {
  const parsedUrl = new URL(trimmedUrl, window.location.origin)
  const isHttpProtocol = parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:'
  if (!isHttpProtocol) {
    return false
  }
  const isSameOrigin = parsedUrl.origin === window.location.origin
  return allowExternal || isSameOrigin
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
    const trimmedUrl = validateBasicUrl(url)
    if (!trimmedUrl) {
      return false
    }

    if (isAnyDangerousProtocol(trimmedUrl)) {
      return false
    }

    // Absolute URL with a recognized scheme (e.g., http://, https://)
    if (VALID_SCHEME_PATTERN.test(trimmedUrl)) {
      return isAllowedAbsoluteUrl(trimmedUrl, allowExternal)
    }

    // No recognized scheme — treat as a relative path (/, ./, ../, or naked).
    // Use the URL constructor with the current origin as base to resolve it,
    // then verify it stays same-origin with an allowed protocol.
    const parsed = new URL(trimmedUrl, window.location.origin)
    const isHttpProtocol = parsed.protocol === 'http:' || parsed.protocol === 'https:'
    return isHttpProtocol && parsed.origin === window.location.origin
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
