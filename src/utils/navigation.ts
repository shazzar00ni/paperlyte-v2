/** Maximum time (ms) to wait for a lazy-loaded section to appear in the DOM. */
const SCROLL_RETRY_TIMEOUT_MS = 3000

/** Active MutationObservers waiting for a deferred section. Exposed for test cleanup. */
const pendingScrollObservers: MutationObserver[] = []
const pendingObserverTimeouts = new Map<MutationObserver, ReturnType<typeof setTimeout>>()

/**
 * Disconnects and removes all pending scroll observers created by {@link scrollToSection}.
 *
 * @internal Exported **for test use only**. Call this in `afterEach` hooks to prevent
 * MutationObserver leakage across test suites. Do not call from production code.
 */
export function _clearPendingScrollObservers(): void {
  for (const observer of pendingScrollObservers) {
    observer.disconnect()
    const timeoutId = pendingObserverTimeouts.get(observer)
    if (timeoutId) {
      clearTimeout(timeoutId)
      pendingObserverTimeouts.delete(observer)
    }
  }
  pendingScrollObservers.length = 0
}

/** Disconnects a single observer and removes it from the pending list. */
function removeObserver(observer: MutationObserver): void {
  observer.disconnect()
  const timeoutId = pendingObserverTimeouts.get(observer)
  if (timeoutId) {
    clearTimeout(timeoutId)
    pendingObserverTimeouts.delete(observer)
  }
  const idx = pendingScrollObservers.indexOf(observer)
  if (idx !== -1) pendingScrollObservers.splice(idx, 1)
}

/**
 * Scrolls smoothly to a section identified by its ID.
 *
 * If the section is not yet in the DOM (e.g. it lives inside a React `Suspense`
 * boundary and its lazy chunk hasn't resolved yet), a `MutationObserver` watches
 * for the element to appear and then scrolls once it is found — or gives up after
 * {@link SCROLL_RETRY_TIMEOUT_MS} milliseconds.
 *
 * Does nothing when running in an SSR context (no `document`).
 *
 * @param sectionId - The `id` of the section to scroll to (without the `#` prefix)
 */
export function scrollToSection(sectionId: string): void {
  // SSR guard - document is not available during server-side rendering
  if (typeof document === 'undefined') {
    return
  }

  const element = document.getElementById(sectionId)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' })
    return
  }

  // Element not yet in the DOM (e.g. inside a lazy-loaded Suspense boundary).
  // Watch for it to be inserted and then scroll once it appears.
  const startTime = Date.now()

  const observer = new MutationObserver(() => {
    const el = document.getElementById(sectionId)
    if (el) {
      removeObserver(observer)
      el.scrollIntoView({ behavior: 'smooth' })
    } else if (Date.now() - startTime > SCROLL_RETRY_TIMEOUT_MS) {
      removeObserver(observer)
    }
  })

  observer.observe(document.body, { childList: true, subtree: true })
  pendingScrollObservers.push(observer)
  const timeoutId = setTimeout(() => {
    removeObserver(observer)
  }, SCROLL_RETRY_TIMEOUT_MS)
  pendingObserverTimeouts.set(observer, timeoutId)
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
