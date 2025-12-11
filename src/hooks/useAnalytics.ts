/**
 * useAnalytics hook
 *
 * React hook for easy analytics integration in components.
 * Provides convenient methods for tracking events, page views, and user interactions.
 *
 * Note: Methods are not memoized since they're thin wrappers around stable singleton methods.
 * The analytics singleton is stable throughout the application lifecycle, so memoization
 * provides no performance benefit.
 */

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
  return {
    trackEvent: (event: AnalyticsEvent) => analytics.trackEvent(event),
    trackPageView: (url?: string) => analytics.trackPageView(url),
    trackCTAClick: (buttonName: string, location: string) =>
      analytics.trackCTAClick(buttonName, location),
    trackDownload: (platform: string, location: string) => analytics.trackDownload(platform, location),
    trackNavigation: (target: string, source: string) => analytics.trackNavigation(target, source),
    isEnabled: () => analytics.isEnabled(),
  }
}
