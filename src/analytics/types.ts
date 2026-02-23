/**
 * Analytics types for privacy-first, cookie-less tracking
 *
 * Supports multiple analytics providers (Plausible, Fathom, Umami, Simple Analytics)
 * with a unified interface for event tracking and Core Web Vitals monitoring.
 */

/**
 * Core Web Vitals metrics as defined by Google
 * @see https://web.dev/vitals/
 */
export interface CoreWebVitals {
  /** Largest Contentful Paint - measures loading performance */
  LCP?: number
  /** First Input Delay - measures interactivity */
  FID?: number
  /** Cumulative Layout Shift - measures visual stability */
  CLS?: number
  /** Time to First Byte - measures server response time */
  TTFB?: number
  /** First Contentful Paint - measures when first content is painted */
  FCP?: number
  /** Interaction to Next Paint - measures responsiveness */
  INP?: number
}

/**
 * Standard event properties for analytics tracking
 */
export interface EventProperties {
  /** Custom properties specific to the event */
  [key: string]: string | number | boolean | undefined
}

/**
 * Scroll depth milestones for tracking user engagement
 */
export type ScrollDepth = 25 | 50 | 75 | 100

/**
 * Predefined event names for consistent tracking
 */
export type EventName =
  | 'page_view'
  | 'cta_click'
  | 'scroll_depth'
  | 'web_vitals'
  | 'download_click'
  | 'navigation_click'
  | 'feature_interaction'

/**
 * Event data structure for tracking user interactions
 */
export interface AnalyticsEvent {
  /** Event name/identifier */
  name: EventName | string
  /** Additional event properties */
  properties?: EventProperties
  /** Timestamp of the event (defaults to Date.now()) */
  timestamp?: number
}

/**
 * Configuration for analytics provider
 */
export interface AnalyticsConfig {
  /** Analytics provider (plausible, fathom, umami, simple) */
  provider: 'plausible' | 'fathom' | 'umami' | 'simple' | 'custom'
  /** Domain or site ID for the analytics service */
  domain: string
  /**
   * Script URL used to load the analytics provider script (optional)
   * - For Plausible: defaults to https://plausible.io/js/script.js
   * - For self-hosted: provide your custom script URL
   * - Example: https://your-domain.com/js/script.js
   */
  scriptUrl?: string
  /** Enable debug mode for development */
  debug?: boolean
  /** Track pageviews automatically (default: true) */
  trackPageviews?: boolean
  /** Track Core Web Vitals automatically (default: true) */
  trackWebVitals?: boolean
  /** Track scroll depth automatically (default: true) */
  trackScrollDepth?: boolean
  /** Respect Do Not Track browser setting (default: true) */
  respectDNT?: boolean
  /** Allow loading analytics scripts from non-whitelisted hosts (default: false) */
  allowCustomScriptUrl?: boolean
}

/**
 * Analytics provider interface
 * All analytics providers must implement this interface
 */
export interface AnalyticsProvider {
  /** Initialize the analytics provider */
  init(config: AnalyticsConfig): void

  /** Track a page view */
  trackPageView(url?: string): void

  /** Track a custom event */
  trackEvent(event: AnalyticsEvent): void

  /** Track Core Web Vitals */
  trackWebVitals(vitals: CoreWebVitals): void

  /** Check if analytics is enabled and initialized */
  isEnabled(): boolean

  /** Cleanup and disable tracking */
  disable(): void
}

/**
 * Performance entry from PerformanceObserver API
 */
export interface PerformanceMetric {
  name: string
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  delta?: number
  id?: string
  entries?: PerformanceEntry[]
}
