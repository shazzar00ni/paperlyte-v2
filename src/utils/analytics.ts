/**
 * Privacy-First Analytics Utility
 *
 * Supports multiple analytics providers with a unified interface:
 * - Plausible Analytics (recommended - privacy-first, no cookies)
 * - Google Analytics 4 (with privacy settings)
 * - Custom/self-hosted solutions
 *
 * Configuration via environment variables:
 * - VITE_ANALYTICS_PROVIDER: 'plausible' | 'ga4' | 'none'
 * - VITE_ANALYTICS_ID: Your analytics site ID or measurement ID
 */

type AnalyticsProvider = 'plausible' | 'ga4' | 'none'

interface AnalyticsConfig {
  provider: AnalyticsProvider
  siteId?: string
  enabled: boolean
}

interface AnalyticsEvent {
  name: string
  properties?: Record<string, string | number | boolean>
}

class Analytics {
  private config: AnalyticsConfig
  private initialized = false

  constructor() {
    this.config = {
      provider: (import.meta.env.VITE_ANALYTICS_PROVIDER || 'none') as AnalyticsProvider,
      siteId: import.meta.env.VITE_ANALYTICS_ID,
      enabled: import.meta.env.PROD && import.meta.env.VITE_ANALYTICS_ID,
    }
  }

  /**
   * Initialize analytics - call this in App.tsx on mount
   */
  init(): void {
    if (!this.config.enabled || this.initialized) {
      return
    }

    switch (this.config.provider) {
      case 'plausible':
        this.initPlausible()
        break
      case 'ga4':
        this.initGA4()
        break
      default:
        console.log('Analytics: No provider configured')
    }

    this.initialized = true
  }

  /**
   * Track a custom event
   */
  trackEvent(event: AnalyticsEvent): void {
    if (!this.config.enabled) {
      if (import.meta.env.DEV) {
        console.log('[Analytics DEV]', event.name, event.properties)
      }
      return
    }

    switch (this.config.provider) {
      case 'plausible':
        this.trackPlausibleEvent(event)
        break
      case 'ga4':
        this.trackGA4Event(event)
        break
    }
  }

  /**
   * Track page view (called automatically on route changes)
   */
  trackPageView(url?: string): void {
    if (!this.config.enabled) {
      return
    }

    const pageUrl = url || window.location.pathname + window.location.search

    switch (this.config.provider) {
      case 'plausible':
        // Track page views with explicit URL for SPA navigation
        if (window.plausible) {
          window.plausible('pageview', { props: { page_path: pageUrl } })
        }
        break
      case 'ga4':
        if (window.gtag) {
          window.gtag('event', 'page_view', {
            page_path: pageUrl,
          })
        }
        break
    }
  }

  /**
   * Initialize Plausible Analytics (Privacy-first, recommended)
   */
  private initPlausible(): void {
    if (!this.config.siteId) {
      console.warn('Analytics: Plausible site ID not configured')
      return
    }

    // Load Plausible script
    const script = document.createElement('script')
    script.defer = true
    script.dataset.domain = this.config.siteId
    script.src = 'https://plausible.io/js/script.js'

    document.head.appendChild(script)

    console.log('Analytics: Plausible initialized')
  }

  /**
   * Initialize Google Analytics 4 (with privacy settings)
   */
  private initGA4(): void {
    if (!this.config.siteId) {
      console.warn('Analytics: GA4 measurement ID not configured')
      return
    }

    // Load gtag.js
    const script = document.createElement('script')
    script.async = true
    script.src = `https://www.googletagmanager.com/gtag/js?id=${this.config.siteId}`
    document.head.appendChild(script)

    // Initialize gtag with privacy settings
    window.dataLayer = window.dataLayer || []
    window.gtag = function gtag(...args: unknown[]) {
      window.dataLayer.push(args)
    }

    window.gtag('js', new Date())
    window.gtag('config', this.config.siteId, {
      anonymize_ip: true, // Anonymize IP addresses
      cookie_flags: 'SameSite=None;Secure', // Secure cookies
      allow_google_signals: false, // Disable Google signals
      allow_ad_personalization_signals: false, // Disable ad personalization
    })

    console.log('Analytics: GA4 initialized with privacy settings')
  }

  /**
   * Track event with Plausible
   */
  private trackPlausibleEvent(event: AnalyticsEvent): void {
    if (window.plausible) {
      window.plausible(event.name, {
        props: event.properties,
      })
    }
  }

  /**
   * Track event with GA4
   */
  private trackGA4Event(event: AnalyticsEvent): void {
    if (window.gtag) {
      window.gtag('event', event.name, event.properties)
    }
  }
}

// Export singleton instance
export const analytics = new Analytics()

// Event types for type safety
export const AnalyticsEvents = {
  CTA_CLICK: 'cta_click',
  EXTERNAL_LINK_CLICK: 'external_link',
  SOCIAL_LINK_CLICK: 'social_click',
  SCROLL_DEPTH: 'Scroll_Depth',
  WAITLIST_JOIN: 'Waitlist_Join',
  WAITLIST_SUBMIT: 'Waitlist_Submit',
  PAGE_VIEW: 'page_view',
} as const

// Convenience functions
export const isAnalyticsAvailable = (): boolean => {
  return typeof window !== 'undefined' && Boolean(window.gtag || window.plausible)
}

export const trackEvent = (
  name: string,
  properties?: Record<string, string | number | boolean>
): void => {
  if (typeof window !== 'undefined' && window.gtag) {
    try {
      window.gtag('event', name, properties)
    } catch (error) {
      console.error('Analytics error:', error)
    }
  } else if (typeof window !== 'undefined' && window.plausible) {
    try {
      window.plausible(name, { props: properties })
    } catch (error) {
      console.error('Analytics error:', error)
    }
  }
}

export const trackPageView = (path?: string, title?: string): void => {
  const properties: Record<string, string> = {}

  if (path) {
    properties.page_path = path
  } else if (typeof window !== 'undefined') {
    properties.page_path = window.location.pathname
  }

  if (title) {
    properties.page_title = title
  }

  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'page_view', properties)
  } else if (typeof window !== 'undefined' && window.plausible) {
    window.plausible('pageview', { props: properties })
  }
}

export const trackScrollDepth = (depth: number): void => {
  const milestones = [25, 50, 75, 100]

  // Find nearest milestone
  const nearest = milestones.reduce((prev, curr) =>
    Math.abs(curr - depth) < Math.abs(prev - depth) ? curr : prev
  )

  // Only track if depth is within reasonable range of nearest milestone (within 15%)
  if (Math.abs(nearest - depth) <= 15) {
    trackEvent(AnalyticsEvents.SCROLL_DEPTH, { depth_percentage: nearest })
  }
}

export const trackCTAClick = (buttonText: string, location?: string): void => {
  const properties: Record<string, string> = { button_text: buttonText }
  if (location !== undefined) {
    properties.button_location = location
  }
  trackEvent(AnalyticsEvents.CTA_CLICK, properties)
}

export const trackExternalLink = (url: string, linkText?: string): void => {
  const properties: Record<string, string> = { link_url: url }
  if (linkText !== undefined) {
    properties.link_text = linkText
  }
  trackEvent(AnalyticsEvents.EXTERNAL_LINK_CLICK, properties)
}

export const trackSocialClick = (platform: string): void => {
  trackEvent(AnalyticsEvents.SOCIAL_LINK_CLICK, { platform: platform.toLowerCase() })
}
