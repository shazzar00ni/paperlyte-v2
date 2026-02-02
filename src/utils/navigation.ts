/**
 * Scrolls smoothly to a section identified by its ID.
 * If the section doesn't exist or running in SSR, the function does nothing.
 *
 * @param sectionId - The ID of the section to scroll to (without the # prefix)
 */
export function scrollToSection(sectionId: string): void {
  // SSR guard - document is not available during server-side rendering
  if (typeof document === 'undefined') {
    return;
  }

  const element = document.getElementById(sectionId);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' });
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
    return false;
  }

  try {
    // Empty or null URLs are not safe
    if (!url || url.trim() === '') {
      return false;
    }

    const trimmedUrl = url.trim();

    // Reject URLs containing ASCII control characters (null bytes, etc.)
    // eslint-disable-next-line no-control-regex
    if (/[\x00-\x1F\x7F]/.test(trimmedUrl)) {
      return false;
    }
    // Block protocol-relative URLs (//example.com)
    if (trimmedUrl.startsWith('//')) {
      return false;
    }

    // Block javascript:, data:, vbscript:, and other dangerous protocols
    // Check both before and after removing whitespace to catch variations like 'javascript :alert(1)'
    const dangerousProtocolPattern = /^(javascript|data|vbscript|file|about):/i;
    const urlWithoutWhitespace = trimmedUrl.replace(/\s/g, '');
    if (
      dangerousProtocolPattern.test(trimmedUrl) ||
      dangerousProtocolPattern.test(urlWithoutWhitespace)
    ) {
      return false;
    }

    // Block URL-encoded variations of dangerous protocols
    // Check if the URL contains % encoding before a colon (could be trying to hide a dangerous protocol)
    // Match patterns like "java%73cript:" or "%6A%61%76%61script:"
    // Only check the protocol part (before the first colon)
    const colonIndex = trimmedUrl.indexOf(':');
    const hasEncodedProtocol =
      colonIndex > 0 && /%[0-9a-f]{2}/i.test(trimmedUrl.substring(0, colonIndex));
    if (hasEncodedProtocol) {
      // Try to decode and check if it's a dangerous protocol
      try {
        const decoded = decodeURIComponent(trimmedUrl);
        if (dangerousProtocolPattern.test(decoded)) {
          return false;
        }
      } catch {
        // If decoding fails, reject it as suspicious
        return false;
      }
    }

    // Allow single slash relative URLs (but check they don't contain ://)
    if (trimmedUrl.startsWith('/') && !trimmedUrl.startsWith('//')) {
      // Additional safety: ensure no protocol injection
      if (trimmedUrl.includes('://')) {
        return false;
      }
      return true;
    }

    // Allow ./ and ../ relative URLs
    if (trimmedUrl.startsWith('./') || trimmedUrl.startsWith('../')) {
      // Additional safety: ensure no protocol injection
      if (trimmedUrl.includes('://')) {
        return false;
      }
      return true;
    }

    // For absolute URLs, parse and validate the protocol
    const parsedUrl = new URL(trimmedUrl, window.location.origin);

    // Allow http: and https: protocols (safe for external links)
    // Allow same-origin URLs with any protocol
    if (parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:') {
      return true;
    }

    // For other protocols, only allow if same-origin
    const currentOrigin = window.location.origin;
    return parsedUrl.origin === currentOrigin;
  } catch {
    // If URL parsing fails, it's not safe
    return false;
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
    return false;
  }

  if (!isSafeUrl(url)) {
    console.warn(`Navigation blocked: URL "${url}" failed security validation`);
    return false;
  }

  window.location.href = url;
  return true;
}
