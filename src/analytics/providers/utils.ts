/**
 * Shared utilities for analytics providers.
 *
 * Centralizes Do Not Track detection and script URL validation so all providers
 * behave consistently and updates only need to be made in one place.
 */

/**
 * Detect whether the browser's Do Not Track signal is active.
 * Checks navigator.doNotTrack, window.doNotTrack, and the legacy msDoNotTrack.
 * Always returns false in SSR / Node.js environments.
 */
export function isDNTEnabled(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return false
  }

  const dnt =
    navigator.doNotTrack ||
    (window as Window & { doNotTrack?: string }).doNotTrack ||
    (navigator as Navigator & { msDoNotTrack?: string }).msDoNotTrack

  return dnt === '1' || dnt === 'yes'
}

/**
 * Validate a script URL before injecting it as a `<script src>`.
 * Requires HTTPS protocol and a `.js` file path to guard against script-injection attacks.
 *
 * @param url - The URL to validate
 * @returns true if the URL is safe to inject, false otherwise
 */
export function isValidScriptUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'https:' && parsed.pathname.endsWith('.js')
  } catch {
    return false
  }
}
