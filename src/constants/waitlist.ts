/**
 * Waitlist configuration constants
 */
export const WAITLIST_COUNT = '500+'
export const LAUNCH_QUARTER = 'Q2 2026'

/**
 * Endpoint for the waitlist subscription serverless function.
 * Uses an environment variable when available, falling back to the
 * Netlify function path used in production and preview deployments.
 */
export const WAITLIST_API_ENDPOINT =
  (import.meta.env.VITE_WAITLIST_API_ENDPOINT as string | undefined) ??
  '/.netlify/functions/subscribe'
