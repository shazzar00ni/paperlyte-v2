/**
 * Analytics configuration
 *
 * Loads analytics settings from environment variables and provides
 * a centralized configuration object for the analytics module.
 */

import type { AnalyticsConfig } from './types'

/**
 * Build an {@link AnalyticsConfig} from Vite environment variables.
 *
 * Returns `null` in two cases:
 * - `VITE_ANALYTICS_DOMAIN` is not set (analytics cannot function without a
 *   domain/site ID).
 * - Analytics is explicitly disabled via `VITE_ANALYTICS_ENABLED=false`, or
 *   defaults to disabled because the app is running in development mode.
 *
 * **Recognised environment variables** (set in `.env` / `.env.production`):
 *
 * | Variable | Description | Default |
 * |---|---|---|
 * | `VITE_ANALYTICS_DOMAIN` | Domain or site ID for the provider | _(required)_ |
 * | `VITE_ANALYTICS_ENABLED` | `'true'` / `'false'` override | `'true'` in prod, `'false'` in dev |
 * | `VITE_ANALYTICS_PROVIDER` | `plausible` \| `fathom` \| `umami` \| `simple` \| `custom` | `'plausible'` |
 * | `VITE_ANALYTICS_SCRIPT_URL` | Custom script URL for self-hosted providers | _(provider default)_ |
 * | `VITE_ANALYTICS_DEBUG` | `'true'` enables verbose logging | `'false'` in prod, `'true'` in dev |
 *
 * Invalid `VITE_ANALYTICS_PROVIDER` values fall back silently to `'plausible'`.
 *
 * @returns A fully-populated {@link AnalyticsConfig} ready to pass to
 *   `analytics.init()`, or `null` when analytics should not be initialised.
 */
export function getAnalyticsConfig(): AnalyticsConfig | null {
  const domain = import.meta.env.VITE_ANALYTICS_DOMAIN

  // If no domain is provided, analytics cannot be enabled
  if (!domain) {
    return null
  }

  // Determine if analytics is enabled based on environment
  // Default behavior: enabled in production, disabled in development
  let enabled: boolean
  const enabledEnv = import.meta.env.VITE_ANALYTICS_ENABLED

  if (enabledEnv === 'true') {
    // Explicitly enabled
    enabled = true
  } else if (enabledEnv === 'false') {
    // Explicitly disabled
    enabled = false
  } else {
    // Not set - use default based on environment
    // Enable in production, disable in development
    enabled = import.meta.env.PROD
  }

  // Analytics is disabled if not enabled
  if (!enabled) {
    return null
  }

  // Validate and set analytics provider
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
 * Convenience predicate that reports whether analytics is enabled for the
 * current environment.
 *
 * Delegates to {@link getAnalyticsConfig} and returns `true` only when that
 * function returns a non-null configuration object. Useful as a lightweight
 * guard before building analytics-specific UI or importing heavy provider code.
 *
 * @returns `true` if analytics is configured and enabled, `false` otherwise.
 */
export function isAnalyticsEnabled(): boolean {
  return getAnalyticsConfig() !== null
}
