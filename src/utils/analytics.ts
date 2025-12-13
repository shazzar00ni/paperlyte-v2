/**
 * Analytics utility for tracking user interactions and conversions
 * Supports Google Analytics 4 (gtag.js)
 *
 * Usage:
 * 1. Add Google Analytics script to index.html
 * 2. Initialize with your GA4 measurement ID
 * 3. Track events throughout your app
 *
 * @example
 * ```tsx
 * import { trackEvent, trackPageView } from '@utils/analytics'
 *
 * // Track a button click
 * trackEvent('Waitlist_Join', {
 *   button_location: 'hero',
 *   user_email: 'user@example.com'
 * })
 *
 * // Track scroll depth
 * trackEvent('Scroll_Depth', {
 *   depth_percentage: 75
 * })
 * ```
 */

/**
 * Extend Window interface to include gtag for Google Analytics
 */
declare global {
  interface Window {
    gtag?: (
      command: 'config' | 'event' | 'js' | 'set',
      targetId: string | Date,
      config?: Record<string, unknown>
    ) => void
    dataLayer?: unknown[]
  }
}

/**
 * Event parameters for analytics tracking
 */
export interface AnalyticsEventParams {
  [key: string]: string | number | boolean | undefined
}

/**
 * Standard event names for Paperlyte landing page
 */
export const AnalyticsEvents = {
  // Waitlist & Conversion Events
  WAITLIST_JOIN: 'Waitlist_Join',
  WAITLIST_SUBMIT: 'Waitlist_Submit',
  WAITLIST_SUCCESS: 'Waitlist_Success',
  WAITLIST_ERROR: 'Waitlist_Error',

  // User Engagement Events
  CTA_CLICK: 'CTA_Click',
  SCROLL_DEPTH: 'Scroll_Depth',
  VIDEO_PLAY: 'Video_Play',
  VIDEO_PAUSE: 'Video_Pause',
  VIDEO_COMPLETE: 'Video_Complete',

  // Navigation Events
  NAVIGATION_CLICK: 'Navigation_Click',
  EXTERNAL_LINK_CLICK: 'External_Link_Click',
  SOCIAL_LINK_CLICK: 'Social_Link_Click',

  // Content Interaction Events
  FAQ_EXPAND: 'FAQ_Expand',
  TESTIMONIAL_VIEW: 'Testimonial_View',
  COMPARISON_VIEW: 'Comparison_View',

  // Form Events
  FORM_START: 'Form_Start',
  FORM_FIELD_BLUR: 'Form_Field_Blur',
  FORM_ERROR: 'Form_Error',
} as const

/**
 * Check if Google Analytics is loaded and available
 *
 * @returns True if gtag is available, false otherwise
 */
export function isAnalyticsAvailable(): boolean {
  return typeof window !== 'undefined' && typeof window.gtag === 'function'
}

/**
 * Track a custom event in Google Analytics
 *
 * @param eventName - Name of the event to track
 * @param eventParams - Optional parameters to send with the event
 *
 * @example
 * ```tsx
 * trackEvent('Waitlist_Join', {
 *   button_location: 'hero',
 *   subscription_tier: 'free'
 * })
 * ```
 */
export function trackEvent(eventName: string, eventParams?: AnalyticsEventParams): void {
  if (!isAnalyticsAvailable()) {
    // In development, log to console instead of failing silently
    if (import.meta.env.DEV) {
      console.log('[Analytics]', eventName, eventParams)
    }
    return
  }

  try {
    window.gtag!('event', eventName, eventParams)
  } catch (error) {
    console.error('[Analytics] Error tracking event:', error)
  }
}

/**
 * Track a page view in Google Analytics
 *
 * @param pagePath - Path of the page being viewed
 * @param pageTitle - Optional title of the page
 *
 * @example
 * ```tsx
 * trackPageView('/privacy', 'Privacy Policy')
 * ```
 */
export function trackPageView(pagePath: string, pageTitle?: string): void {
  if (!isAnalyticsAvailable()) {
    if (import.meta.env.DEV) {
      console.log('[Analytics] Page View:', pagePath, pageTitle)
    }
    return
  }

  try {
    window.gtag!('event', 'page_view', {
      page_path: pagePath,
      page_title: pageTitle,
    })
  } catch (error) {
    console.error('[Analytics] Error tracking page view:', error)
  }
}

/**
 * Track scroll depth milestones (25%, 50%, 75%, 100%)
 * Call this function with a scroll position tracker
 *
 * @param depthPercentage - Percentage of page scrolled (0-100)
 *
 * @example
 * ```tsx
 * const handleScroll = () => {
 *   const scrollPercent = (window.scrollY / document.body.scrollHeight) * 100
 *   trackScrollDepth(Math.round(scrollPercent))
 * }
 * ```
 */
// Keep track of which scroll depth milestones have been tracked
const trackedScrollMilestones = new Set<number>();

export function trackScrollDepth(depthPercentage: number): void {
  // Only track milestone percentages
  const milestones = [25, 50, 75, 100];
  for (const milestone of milestones) {
    if (depthPercentage >= milestone && !trackedScrollMilestones.has(milestone)) {
      trackEvent(AnalyticsEvents.SCROLL_DEPTH, {
        depth_percentage: milestone,
      });
      trackedScrollMilestones.add(milestone);
    }
  }
}

/**
 * Track CTA button clicks with location context
 *
 * @param buttonText - Text content of the button
 * @param buttonLocation - Where the button appears on the page
 *
 * @example
 * ```tsx
 * <Button onClick={() => trackCTAClick('Join Waitlist', 'hero')}>
 *   Join Waitlist
 * </Button>
 * ```
 */
export function trackCTAClick(buttonText: string, buttonLocation: string): void {
  trackEvent(AnalyticsEvents.CTA_CLICK, {
    button_text: buttonText,
    button_location: buttonLocation,
  })
}

/**
 * Track external link clicks
 *
 * @param url - URL being clicked
 * @param linkText - Text of the link
 *
 * @example
 * ```tsx
 * <a
 *   href="https://twitter.com/paperlyte"
 *   onClick={() => trackExternalLink('https://twitter.com/paperlyte', 'Twitter')}
 * >
 *   Twitter
 * </a>
 * ```
 */
export function trackExternalLink(url: string, linkText: string): void {
  trackEvent(AnalyticsEvents.EXTERNAL_LINK_CLICK, {
    link_url: url,
    link_text: linkText,
  })
}

/**
 * Track social media link clicks
 *
 * @param platform - Social media platform (e.g., 'twitter', 'github')
 *
 * @example
 * ```tsx
 * <a onClick={() => trackSocialClick('twitter')}>Follow on Twitter</a>
 * ```
 */
export function trackSocialClick(platform: string): void {
  trackEvent(AnalyticsEvents.SOCIAL_LINK_CLICK, {
    platform: platform.toLowerCase(),
  })
}

/**
 * Initialize scroll depth tracking
 * Sets up a scroll listener that tracks depth milestones
 *
 * @returns Cleanup function to remove the scroll listener
 *
 * @example
 * ```tsx
 * useEffect(() => {
 *   const cleanup = initScrollDepthTracking()
 *   return cleanup
 * }, [])
 * ```
 */
export function initScrollDepthTracking(): () => void {
  const trackedMilestones = new Set<number>()

  const handleScroll = () => {
    const windowHeight = window.innerHeight
    const documentHeight = document.documentElement.scrollHeight
    const scrollTop = window.scrollY
    if (documentHeight <= 0) return

    const scrollPercent = ((scrollTop + windowHeight) / documentHeight) * 100
    const roundedPercent = Math.round(scrollPercent)

    // Track milestones only once
    const milestones = [25, 50, 75, 100]
    milestones.forEach((milestone) => {
      if (roundedPercent >= milestone && !trackedMilestones.has(milestone)) {
        trackedMilestones.add(milestone)
        trackEvent(AnalyticsEvents.SCROLL_DEPTH, {
          depth_percentage: milestone,
        })
      }
    })
  }

  // Use throttle to avoid excessive event tracking
  let ticking = false
  const throttledScroll = () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        handleScroll()
        ticking = false
      })
      ticking = true
    }
  }

  window.addEventListener('scroll', throttledScroll, { passive: true })

  // Return cleanup function
  return () => {
    window.removeEventListener('scroll', throttledScroll)
  }
}
