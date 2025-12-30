/**
 * Analytics utility for tracking user interactions and conversions
 * Supports Google Analytics 4 (gtag.js)
 *
 * PRIVACY-FIRST DESIGN:
 * - Automatically strips PII (emails, passwords, tokens, etc.) from all events
 * - Never logs PII in development console
 * - Compliant with GDPR and privacy regulations
 *
 * Usage:
 * 1. Add Google Analytics script to index.html
 * 2. Initialize with your GA4 measurement ID
 * 3. Track events throughout your app (do NOT send PII)
 *
 * @example
 * ```tsx
 * import { trackEvent, trackPageView } from '@utils/analytics'
 *
 * // ✅ CORRECT - Track user actions without PII
 * trackEvent('Waitlist_Join', {
 *   button_location: 'hero',
 *   subscription_tier: 'free'
 * })
 *
 * // ❌ WRONG - Never send PII to analytics
 * // trackEvent('Signup', { user_email: 'user@example.com' }) // DON'T DO THIS
 *
 * // Track scroll depth
 * trackEvent('Scroll_Depth', {
 *   depth_percentage: 75
 * })
 * ```
 */

/**
 * Extend Window interface to include gtag for Google Analytics
 * Note: dataLayer is already declared in lib.dom.d.ts as Window['dataLayer']: unknown[]
 */
declare global {
  interface Window {
    gtag?: (
      command: 'config' | 'event' | 'js' | 'set',
      targetId: string | Date,
      config?: Record<string, unknown>
    ) => void
  }
}

/**
 * Event parameters for analytics tracking
 * Defines common event parameters with explicit types while allowing custom params via index signature
 */
export interface AnalyticsEventParams {
  // Button/CTA parameters
  button_text?: string
  button_location?: string

  // Link parameters
  link_url?: string
  link_text?: string
  destination?: string

  // Social/Platform parameters
  platform?: string

  // Scroll tracking
  depth_percentage?: number

  // Navigation parameters
  page_path?: string
  page_title?: string

  // Form parameters
  form_location?: string

  // Error tracking
  error_code?: string | number
  error_name?: string
  error_message?: string
  error_source?: string

  // Engagement parameters
  question_index?: number
  category?: string
  label?: string

  // Performance metrics
  metric?: string
  value?: number
  unit?: string

  // Other parameters
  subscription_tier?: string
  message?: string

  // Allow custom parameters while maintaining type safety
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
 * List of sensitive keys that should never be sent to analytics
 * These will be stripped from event parameters automatically
 */
const PII_KEYS = [
  'email',
  'user_email',
  'userEmail',
  'e_mail',
  'mail',
  'password',
  'pwd',
  'pass',
  'token',
  'auth',
  'authorization',
  'secret',
  'api_key',
  'apiKey',
  'ssn',
  'social_security',
  'credit_card',
  'creditCard',
  'card_number',
  'cvv',
  'phone',
  'phoneNumber',
  'address',
  'full_name',
  'fullName',
  'first_name',
  'last_name',
  'ip',
  'ip_address',
]

/**
 * Sanitize event parameters to remove PII
 * This ensures no sensitive data is accidentally sent to analytics
 *
 * @param params - Event parameters to sanitize
 * @returns Sanitized parameters with PII removed
 */
function sanitizeAnalyticsParams(params?: AnalyticsEventParams): AnalyticsEventParams | undefined {
  if (!params) return params

  const sanitized: AnalyticsEventParams = {}
  let piiFound = false

  for (const [key, value] of Object.entries(params)) {
    const lowerKey = key.toLowerCase()

    // Check if this key is a known PII field
    if (PII_KEYS.some((piiKey) => lowerKey.includes(piiKey.toLowerCase()))) {
      piiFound = true
      // Skip this field - don't include it in sanitized params
      continue
    }

    // Check if value looks like an email with stricter pattern matching to reduce false positives
    // Pattern: local-part@domain.tld where TLD is at least 2 letters
    // Example: user@example.com, name@domain.co.uk
    if (typeof value === 'string') {
      // Email pattern: non-space/non-@ chars + @ + domain with dot + 2+ letter TLD
      const emailPattern = /[^\s@]+@[^\s@]+\.[a-z]{2,}/i
      if (emailPattern.test(value)) {
        piiFound = true
        continue
      }
    }

    sanitized[key] = value
  }

  // Warn developers if PII was found and stripped
  if (piiFound && import.meta.env.DEV) {
    console.warn(
      '[Analytics] PII detected and removed from event parameters. Never send emails, passwords, or other sensitive data to analytics.'
    )
  }

  return sanitized
}

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
 * PRIVACY: Automatically strips PII from parameters before sending
 *
 * @param eventName - Name of the event to track
 * @param eventParams - Optional parameters to send with the event (PII will be removed)
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
  // Sanitize parameters to remove any PII
  const sanitizedParams = sanitizeAnalyticsParams(eventParams)

  if (!isAnalyticsAvailable()) {
    // In development, log to console instead of failing silently
    // Only log sanitized params (never log PII)
    if (import.meta.env.DEV) {
      console.log('[Analytics]', eventName, sanitizedParams)
    }
    return
  }

  try {
    window.gtag!('event', eventName, sanitizedParams)
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
