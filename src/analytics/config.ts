/**
 * Analytics configuration
 *
 * Loads analytics settings from environment variables and provides
 * a centralized configuration object for the analytics module.
 */

import type { AnalyticsConfig } from './types'

/**
 * Get analytics configuration from environment variables
 *
 * Environment variables (defined in .env):
 * - VITE_ANALYTICS_ENABLED: Enable/disable analytics (default: true in production)
 * - VITE_ANALYTICS_PROVIDER: Analytics provider (plausible, fathom, umami, simple)
 * - VITE_ANALYTICS_DOMAIN: Domain/site ID for analytics service
 * - VITE_ANALYTICS_API_URL: Custom API endpoint (optional)
 * - VITE_ANALYTICS_DEBUG: Enable debug mode (default: false)
 */
export function getAnalyticsConfig(): AnalyticsConfig | null {
  // Check if analytics is enabled
  const enabled = import.meta.env.VITE_ANALYTICS_ENABLED !== 'false'
  const domain = import.meta.env.VITE_ANALYTICS_DOMAIN

  // Analytics is disabled if not enabled or no domain is provided
  if (!enabled || !domain) {
    return null
  }

  const provider = (import.meta.env.VITE_ANALYTICS_PROVIDER || 'plausible') as AnalyticsConfig['provider']
  const apiUrl = import.meta.env.VITE_ANALYTICS_API_URL
  const debug = import.meta.env.VITE_ANALYTICS_DEBUG === 'true' || import.meta.env.DEV

  return {
    provider,
    domain,
    apiUrl,
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
