/**
 * useAnalytics hook
 *
 * React hook for easy analytics integration in components.
 * Provides convenient methods for tracking events, page views, and user interactions.
 */

import { useCallback } from 'react'
import { analytics } from '@/analytics'
import type { AnalyticsEvent } from '@/analytics/types'

/**
 * Analytics hook interface
 */
interface UseAnalyticsReturn {
  /** Track a custom event */
  trackEvent: (event: AnalyticsEvent) => void
  /** Track a page view */
  trackPageView: (url?: string) => void
  /** Track CTA button click */
  trackCTAClick: (buttonName: string, location: string) => void
  /** Track download button click */
  trackDownload: (platform: string, location: string) => void
  /** Track navigation click */
  trackNavigation: (target: string, source: string) => void
  /** Check if analytics is enabled */
  isEnabled: () => boolean
}

/**
 * Hook for analytics tracking
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { trackCTAClick } = useAnalytics()
 *
 *   return (
 *     <button onClick={() => trackCTAClick('Get Started', 'hero')}>
 *       Get Started
 *     </button>
 *   )
 * }
 * ```
 */
export function useAnalytics(): UseAnalyticsReturn {
  const trackEvent = useCallback((event: AnalyticsEvent) => {
    analytics.trackEvent(event)
  }, [])

  const trackPageView = useCallback((url?: string) => {
    analytics.trackPageView(url)
  }, [])

  const trackCTAClick = useCallback((buttonName: string, location: string) => {
    analytics.trackCTAClick(buttonName, location)
  }, [])

  const trackDownload = useCallback((platform: string, location: string) => {
    analytics.trackDownload(platform, location)
  }, [])

  const trackNavigation = useCallback((target: string, source: string) => {
    analytics.trackNavigation(target, source)
  }, [])

  const isEnabled = useCallback(() => {
    return analytics.isEnabled()
  }, [])

  return {
    trackEvent,
    trackPageView,
    trackCTAClick,
    trackDownload,
    trackNavigation,
    isEnabled,
  }
}
