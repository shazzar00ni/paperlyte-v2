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

  /**
   * Fire a generic analytics event by name.
   * Wraps {@link trackEvent} with stable identity via `useCallback`.
   *
   * @param eventName - Event identifier (e.g. `'Waitlist_Join'`)
   * @param params - Optional key-value properties (PII is automatically stripped)
   */
  const track = useCallback((eventName: string, params?: AnalyticsEventParams) => {
    trackEvent(eventName, params)
  }, [])

  /**
   * Track a call-to-action button click.
   *
   * @param buttonText - Visible label of the button (e.g. `'Join Waitlist'`)
   * @param buttonLocation - Section or context where the button appears (e.g. `'hero'`)
   */
  const trackCTA = useCallback((buttonText: string, buttonLocation: string) => {
    trackCTAClick(buttonText, buttonLocation)
  }, [])

  /**
   * Track an outbound (external) link click.
   *
   * @param url - Destination URL of the link
   * @param linkText - Visible anchor text of the link
   */
  const trackExternal = useCallback((url: string, linkText: string) => {
    trackExternalLink(url, linkText)
  }, [])

  /**
   * Track a social-media link click.
   *
   * @param platform - Lowercase platform name (e.g. `'twitter'`, `'github'`)
   */
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

  /**
   * Track a failed waitlist form submission.
   * PRIVACY: Does not send email or PII. Only records the error code and the
   * form location so submission failures can be diagnosed in analytics.
   *
   * @param errorCode - Short identifier for the failure reason
   *   (e.g. `'network_error'`, `'validation_failed'`)
   * @param location - Identifier for the form that triggered the error
   *   (e.g. `'hero_section'`, `'email_capture'`)
   */
  const trackWaitlistError = useCallback(
    (errorCode: string, location: string) => {
      track(AnalyticsEvents.WAITLIST_ERROR, {
        error_code: errorCode,
        form_location: location,
      })
    },
    [track]
  )

  /**
   * Track a FAQ accordion item being expanded by the user.
   *
   * @param questionIndex - Zero-based index of the expanded question in the
   *   FAQ list, used to identify which questions attract the most interest.
   */
  const trackFAQExpand = useCallback(
    (questionIndex: number) => {
      track(AnalyticsEvents.FAQ_EXPAND, {
        question_index: questionIndex,
      })
    },
    [track]
  )

  /**
   * Track an in-page navigation click (e.g. header nav, footer links).
   *
   * @param destination - The section or page being navigated to
   *   (e.g. `'features'`, `'pricing'`)
   * @param linkText - Human-readable label of the link that was clicked
   */
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
