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

import { isSafePropertyKey } from './security'

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
 * Email pattern for detecting email-like strings
 * Pattern: local-part@domain.tld where TLD is at least 2 letters
 */
const EMAIL_PATTERN = /[^\s@]+@[^\s@]+\.[a-z]{2,}/i

/**
 * Check if a key is a PII field
 * @param key - The key to check
 * @returns True if the key is a PII field
 */
function isPIIKey(key: string): boolean {
  const lowerKey = key.toLowerCase()
  return PII_KEYS.some((piiKey) => lowerKey.includes(piiKey.toLowerCase()))
}

/**
 * Check if a value looks like an email address
 * @param value - The value to check
 * @returns True if the value looks like an email
 */
function looksLikeEmail(value: unknown): boolean {
  return typeof value === 'string' && EMAIL_PATTERN.test(value)
}

/**
 * Check if a parameter should be filtered out (is PII or unsafe)
 * @param key - The parameter key
 * @param value - The parameter value
 * @returns Object with shouldFilter flag and isPII flag
 */
function shouldFilterParameter(
  key: string,
  value: unknown
): { shouldFilter: boolean; isPII: boolean } {
  // Check for unsafe keys first
  if (!isSafePropertyKey(key)) {
    if (import.meta.env.DEV) {
      console.warn('[Analytics] Blocked potentially unsafe property key:', key)
    }
    return { shouldFilter: true, isPII: false }
  }

  // Check if key is PII
  if (isPIIKey(key)) {
    return { shouldFilter: true, isPII: true }
  }

  // Check if value looks like an email
  if (looksLikeEmail(value)) {
    return { shouldFilter: true, isPII: true }
  }

  return { shouldFilter: false, isPII: false }
}

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
    const { shouldFilter, isPII } = shouldFilterParameter(key, value)

    if (shouldFilter) {
      if (isPII) {
        piiFound = true
      }
      continue
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
    return
  }

  try {
    window.gtag?.('event', eventName, sanitizedParams)
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
    window.gtag?.('event', 'page_view', {
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
 * Calculate current scroll percentage
 * @returns Scroll percentage rounded to nearest integer
 */
function calculateScrollPercent(): number {
  const windowHeight = window.innerHeight
  const documentHeight = document.documentElement.scrollHeight
  const scrollTop = window.scrollY

  if (documentHeight <= 0) return 0

  const scrollPercent = ((scrollTop + windowHeight) / documentHeight) * 100
  return Math.round(scrollPercent)
}

/**
 * Track scroll milestones that haven't been tracked yet
 * @param currentPercent - Current scroll percentage
 * @param trackedMilestones - Set of already tracked milestones
 */
function trackScrollMilestones(currentPercent: number, trackedMilestones: Set<number>): void {
  const milestones = [25, 50, 75, 100]

  milestones.forEach((milestone) => {
    if (currentPercent >= milestone && !trackedMilestones.has(milestone)) {
      trackedMilestones.add(milestone)
      trackEvent(AnalyticsEvents.SCROLL_DEPTH, {
        depth_percentage: milestone,
      })
    }
  })
}

/**
 * Create a throttled scroll handler using requestAnimationFrame
 * @param callback - Function to call on scroll
 * @returns Throttled scroll handler
 */
function createThrottledScrollHandler(callback: () => void): () => void {
  let ticking = false

  return () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        callback()
        ticking = false
      })
      ticking = true
    }
  }
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
    const scrollPercent = calculateScrollPercent()
    trackScrollMilestones(scrollPercent, trackedMilestones)
  }

  const throttledScroll = createThrottledScrollHandler(handleScroll)
  window.addEventListener('scroll', throttledScroll, { passive: true })

  return () => {
    window.removeEventListener('scroll', throttledScroll)
  }
}
