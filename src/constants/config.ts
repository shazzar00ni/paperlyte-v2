/**
 * Application-wide configuration constants
 */

/**
 * Contact and support information
 */
export const CONTACT = {
  supportEmail: 'support@paperlyte.com',
  salesEmail: 'hello@paperlyte.com',
} as const

/**
 * Social media links
 */
export const SOCIAL_LINKS = {
  twitter: 'https://twitter.com/paperlyte',
  github: 'https://github.com/paperlyte',
  discord: 'https://discord.gg/paperlyte',
} as const

/**
 * Application metadata
 */
export const APP_CONFIG = {
  name: 'Paperlyte',
  tagline: 'Your thoughts, unchained from complexity',
  description: 'A lightning-fast, distraction-free note-taking application',
} as const

/**
 * Persistence configuration
 *
 * Controls what non-sensitive user preferences can be persisted to localStorage.
 * This is an explicit exception to the general privacy-first approach.
 *
 * IMPORTANT: Only non-sensitive, non-PII data should ever be persisted.
 * Theme preference is allowed because:
 * - It contains no personally identifiable information
 * - It significantly improves user experience across visits
 * - It respects system preference as fallback when disabled
 * - Users can clear it by clearing browser storage
 */
export const PERSISTENCE_CONFIG = {
  /**
   * Allow theme preference to be persisted to localStorage.
   * When true: User's explicit theme choice is saved and restored on next visit.
   * When false: Theme falls back to system preference on each visit (in-memory only).
   */
  ALLOW_PERSISTENT_THEME: true,
} as const
