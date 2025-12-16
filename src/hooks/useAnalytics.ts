import { useEffect, useCallback } from 'react'
import {
  trackEvent,
  trackCTAClick,
  trackExternalLink,
  trackSocialClick,
  initScrollDepthTracking,
  AnalyticsEvents,
  type AnalyticsEventParams,
} from '@utils/analytics'

/**
 * React hook for analytics tracking with automatic scroll depth tracking
 *
 * @param enableScrollTracking - Whether to enable automatic scroll depth tracking (default: true)
 * @returns Object with analytics tracking functions
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { trackCTA, trackEvent: track } = useAnalytics()
 *
 *   return (
 *     <button onClick={() => trackCTA('Join Waitlist', 'hero')}>
 *       Join Waitlist
 *     </button>
 *   )
 * }
 * ```
 */
export function useAnalytics(enableScrollTracking = true) {
  // Initialize scroll depth tracking on mount
  useEffect(() => {
    if (!enableScrollTracking) return

    const cleanup = initScrollDepthTracking()
    return cleanup
  }, [enableScrollTracking])

  // Memoized tracking functions to prevent unnecessary re-renders
  const track = useCallback((eventName: string, params?: AnalyticsEventParams) => {
    trackEvent(eventName, params)
  }, [])

  const trackCTA = useCallback((buttonText: string, buttonLocation: string) => {
    trackCTAClick(buttonText, buttonLocation)
  }, [])

  const trackExternal = useCallback((url: string, linkText: string) => {
    trackExternalLink(url, linkText)
  }, [])

  const trackSocial = useCallback((platform: string) => {
    trackSocialClick(platform)
  }, [])

  /**
   * Track waitlist join button clicks
   * PRIVACY: Does not send PII. Only tracks button location for UX analysis.
   */
  const trackWaitlistJoin = useCallback(
    (location: string) => {
      track(AnalyticsEvents.WAITLIST_JOIN, {
        button_location: location,
      })
    },
    [track]
  )

  /**
   * Track waitlist form submission
   * PRIVACY: Does not send email or PII. Only tracks form location for conversion analysis.
   */
  const trackWaitlistSubmit = useCallback(
    (location: string) => {
      track(AnalyticsEvents.WAITLIST_SUBMIT, {
        form_location: location,
      })
    },
    [track]
  )

  /**
   * Track successful waitlist signup
   * PRIVACY: Does not send email or PII. Only tracks conversion success.
   */
  const trackWaitlistSuccess = useCallback(() => {
    track(AnalyticsEvents.WAITLIST_SUCCESS, {
      // No PII - only track that signup was successful
    })
  }, [track])

  const trackWaitlistError = useCallback(
    (errorMessage: string, location: string) => {
      track(AnalyticsEvents.WAITLIST_ERROR, {
        error_message: errorMessage,
        form_location: location,
      })
    },
    [track]
  )

  const trackFAQExpand = useCallback(
    (questionText: string, questionIndex: number) => {
      track(AnalyticsEvents.FAQ_EXPAND, {
        question_text: questionText,
        question_index: questionIndex,
      })
    },
    [track]
  )

  const trackNavigation = useCallback(
    (destination: string, linkText: string) => {
      track(AnalyticsEvents.NAVIGATION_CLICK, {
        destination,
        link_text: linkText,
      })
    },
    [track]
  )

  return {
    // Generic event tracking
    trackEvent: track,

    // CTA tracking
    trackCTA,

    // Link tracking
    trackExternal,
    trackSocial,
    trackNavigation,

    // Waitlist tracking
    trackWaitlistJoin,
    trackWaitlistSubmit,
    trackWaitlistSuccess,
    trackWaitlistError,

    // Content interaction tracking
    trackFAQExpand,

    // Event constants
    events: AnalyticsEvents,
  }
}
