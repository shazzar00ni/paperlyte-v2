const SCROLL_RETRY_TIMEOUT_MS = 5000

// Tracks in-flight observers keyed by sectionId — ensures rapid repeat calls to
// the same target cancel the previous observer instead of accumulating observers.
const pendingScrollObservers = new Map<
  string,
  { observer: MutationObserver; timeoutId: ReturnType<typeof setTimeout> }
>()

function cancelPendingScroll(sectionId: string): void {
  const pending = pendingScrollObservers.get(sectionId)
  if (pending) {
    pending.observer.disconnect()
    clearTimeout(pending.timeoutId)
    pendingScrollObservers.delete(sectionId)
  }
}

/**
 * Scrolls smoothly to a section identified by its ID.
 * If the section is not yet in the DOM (e.g. still loading as a lazy chunk),
 * waits up to 5 s for it to appear before scrolling. Rapid repeat calls for
 * the same target cancel the previous pending scroll to avoid stacking observers.
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
    cancelPendingScroll(sectionId)
    element.scrollIntoView({ behavior: 'smooth' })
    return
  }

  // Cancel any previous pending observer for this target before creating a new one
  cancelPendingScroll(sectionId)

  // Section not yet mounted — observe DOM until it appears (handles lazy chunks).
  // Scope to #main to avoid firing on unrelated mutations (header, overlays, etc.).
  const root = document.getElementById('main') ?? document.body
  const observer = new MutationObserver(() => {
    const el = document.getElementById(sectionId)
    if (el) {
      cancelPendingScroll(sectionId)
      el.scrollIntoView({ behavior: 'smooth' })
    }
  })

  const timeoutId = setTimeout(() => cancelPendingScroll(sectionId), SCROLL_RETRY_TIMEOUT_MS)
  // unref() prevents the timer from keeping the Node.js/JSDOM event loop alive in tests
  ;(timeoutId as unknown as { unref?: () => void }).unref?.()
  pendingScrollObservers.set(sectionId, { observer, timeoutId })
  observer.observe(root, { childList: true, subtree: true })
}

/** @internal For use in tests only — cancels all in-flight scroll observers. */
export function _clearPendingScrollObservers(): void {
  for (const sectionId of [...pendingScrollObservers.keys()]) {
    cancelPendingScroll(sectionId)
  }
}

/**
 * Checks if a URL contains dangerous protocols that could lead to XSS attacks.
 * @param url - The URL to check
 * @returns true if the URL contains a dangerous protocol, false otherwise
 */
function hasDangerousProtocol(url: string): boolean {
  // NOSONAR: This regex pattern is used to DETECT and BLOCK dangerous protocols like javascript:
  // It is NOT executing any code - it's a security validation function that prevents XSS attacks
  const dangerousProtocolPattern = /^(javascript|data|vbscript|file|about):/i
  const urlWithoutWhitespace = url.replace(/\s/g, '')
  
  if (dangerousProtocolPattern.test(url) || dangerousProtocolPattern.test(urlWithoutWhitespace)) {
    return true
  }

  // Check for URL-encoded variations of dangerous protocols
  const colonIndex = url.indexOf(':')
  const hasEncodedProtocol = colonIndex > 0 && /%[0-9a-f]{2}/i.test(url.substring(0, colonIndex))
  
  if (hasEncodedProtocol) {
    try {
      const decoded = decodeURIComponent(url)
      return dangerousProtocolPattern.test(decoded)
    } catch {
      return true // If decoding fails, reject it as suspicious
    }
  }

  return false
}

/**
 * Validates basic URL requirements (non-empty, no control chars, no protocol-relative).
 * @param url - The URL to validate
 * @returns true if basic validation passes, false otherwise
 */
function passesBasicValidation(url: string): boolean {
  if (!url || url.trim() === '') {
    return false
  }

  const trimmedUrl = url.trim()

  // Reject URLs containing ASCII control characters (null bytes, etc.)
  // eslint-disable-next-line no-control-regex
  if (/[\x00-\x1F\x7F]/.test(trimmedUrl)) {
    return false
  }

  // Block protocol-relative URLs (//example.com) and backslash bypasses (\\example.com, /\example.com)
  // Some browsers treat backslashes as forward slashes, which can bypass validation
  if (trimmedUrl.startsWith('//') || trimmedUrl.startsWith('\\\\') || trimmedUrl.startsWith('/\\')) {
    return false
  }

  // Block encoded backslash bypasses (e.g., /%5C%5Cexample.com or /%5Cexample.com)
  // Decode and check if it starts with protocol-relative or backslash patterns
  if (trimmedUrl.includes('%5C') || trimmedUrl.includes('%5c')) {
    try {
      const decoded = decodeURIComponent(trimmedUrl)
      if (decoded.startsWith('//') || decoded.startsWith('\\\\') || decoded.startsWith('/\\')) {
        return false
      }
    } catch {
      // If decoding fails, reject as suspicious
      return false
    }
  }

  return true
}

/**
 * Checks if an absolute URL is allowed based on origin and external permission.
 * @param parsedUrl - The parsed URL object
 * @param currentOrigin - The current window origin
 * @param allowExternal - Whether external URLs are permitted
 * @returns true if the URL is allowed, false otherwise
 */
function isAllowedAbsoluteUrl(parsedUrl: URL, currentOrigin: string, allowExternal: boolean): boolean {
  // Always allow same-origin URLs
  if (parsedUrl.origin === currentOrigin) {
    return true
  }

  // Only allow external HTTP/HTTPS URLs if explicitly permitted
  return allowExternal && (parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:')
}

/**
 * Checks if a URL is a safe relative URL.
 * @param url - The URL to check
 * @returns 'safe' if valid, 'unsafe' if invalid, 'not-relative' if not a relative URL
 */
function isSafeRelativeUrl(url: string): 'safe' | 'unsafe' | 'not-relative' {
  // Check single slash relative URLs (but not protocol-relative //)
  if (url.startsWith('/') && !url.startsWith('//')) {
    // Reject if it contains protocol injection (://)
    return url.includes('://') ? 'unsafe' : 'safe'
  }

  // Check ./ and ../ relative URLs
  if (url.startsWith('./') || url.startsWith('../')) {
    // Reject if it contains protocol injection (://)
    return url.includes('://') ? 'unsafe' : 'safe'
  }

  return 'not-relative'
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
    // Perform basic validation checks
    if (!passesBasicValidation(url)) {
      return false
    }

    const trimmedUrl = url.trim()

    // Block dangerous protocols
    if (hasDangerousProtocol(trimmedUrl)) {
      return false
    }

    // Check if it's a relative URL (safe, unsafe, or not-relative)
    const relativeCheck = isSafeRelativeUrl(trimmedUrl)
    if (relativeCheck === 'safe') {
      return true
    }
    if (relativeCheck === 'unsafe') {
      return false
    }

    // For absolute URLs, parse and validate the protocol and origin
    const parsedUrl = new URL(trimmedUrl, window.location.origin)
    return isAllowedAbsoluteUrl(parsedUrl, window.location.origin, allowExternal)
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

  if (!isSafeUrl(url)) {
    if (import.meta.env.DEV) {
      console.warn(`Navigation blocked: URL "${url}" failed security validation`)
    }
    return false
  }

  window.location.href = url
  return true
}

/**
 * Safely navigates to an external URL (allows HTTP/HTTPS to external domains).
 * Still blocks dangerous protocols (javascript:, data:, etc.) for security.
 * 
 * ⚠️ **Security Warning**: This function allows navigation to external domains.
 * Only use this when you explicitly need to navigate to external URLs.
 * For same-origin navigation, use safeNavigate() instead.
 * 
 * @param url - The URL to navigate to
 * @returns true if navigation was performed, false if URL was rejected or navigation not needed (SSR)
 */
export function safeNavigateExternal(url: string): boolean {
  // SSR guard - return false as navigation is not applicable in server-side context
  if (typeof window === 'undefined') {
    return false
  }

  // Use isSafeUrl with allowExternal=true to permit external HTTP/HTTPS URLs
  if (!isSafeUrl(url, true)) {
    if (import.meta.env.DEV) {
      console.warn(`External navigation blocked: URL "${url}" failed security validation`)
    }
    return false
  }

  window.location.href = url
  return true
}
