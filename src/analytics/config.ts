/**
 * Analytics configuration
 *
 * Loads analytics settings from environment variables and provides
 * a centralized configuration object for the analytics module.
 */

import type { AnalyticsConfig } from './types'

/** Resolve analytics enabled state from `VITE_ANALYTICS_ENABLED`; falls back to `PROD`. */
function resolveEnabled(enabledEnv: string | undefined): boolean {
  if (enabledEnv === 'true') return true
  if (enabledEnv === 'false') return false
  return Boolean(import.meta.env.PROD)
}

/**
 * Get analytics configuration from environment variables.
 *
 * Environment variables (defined in .env):
 * - VITE_ANALYTICS_ENABLED: Enable/disable analytics
 *   - Default: 'true' in production, 'false' in development
 *   - Explicitly set to 'true' to enable or 'false' to disable
 * - VITE_ANALYTICS_PROVIDER: Analytics provider (plausible, fathom, umami, simple)
 * - VITE_ANALYTICS_DOMAIN: Domain/site ID for analytics service
 * - VITE_ANALYTICS_SCRIPT_URL: Custom script URL (optional)
 * - VITE_ANALYTICS_DEBUG: Enable debug mode (default: false)
 */
export function getAnalyticsConfig(): AnalyticsConfig | null {
  const domain = import.meta.env.VITE_ANALYTICS_DOMAIN
  if (!domain) return null
  if (!resolveEnabled(import.meta.env.VITE_ANALYTICS_ENABLED)) return null

  const validProviders = ['plausible', 'fathom', 'umami', 'simple', 'custom'] as const
  const rawProvider = import.meta.env.VITE_ANALYTICS_PROVIDER || 'plausible'
  const provider: AnalyticsConfig['provider'] = validProviders.includes(
    rawProvider as (typeof validProviders)[number]
  )
    ? (rawProvider as AnalyticsConfig['provider'])
    : 'plausible'

  const scriptUrl = import.meta.env.VITE_ANALYTICS_SCRIPT_URL
  const debug =
    import.meta.env.VITE_ANALYTICS_DEBUG === 'true' ||
    (import.meta.env.DEV && import.meta.env.VITE_ANALYTICS_DEBUG !== 'false')

  return {
    provider,
    domain,
    scriptUrl,
    debug,
    trackPageviews: true,
    trackWebVitals: true,
    trackScrollDepth: true,
    respectDNT: true,
  }
}

/**
 * Check if analytics is enabled based on environment configuration
 */
export function isAnalyticsEnabled(): boolean {
  return getAnalyticsConfig() !== null
}
