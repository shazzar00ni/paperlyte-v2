/**
 * Privacy-first analytics module
 *
 * Main entry point for analytics functionality.
 * Provides a unified interface for tracking events, page views, and performance metrics
 * while maintaining privacy and GDPR compliance.
 *
 * Features:
 * - Cookie-less tracking (no personal data stored)
 * - GDPR compliant by default
 * - Respects Do Not Track browser setting
 * - Async script loading (<5KB overhead)
 * - Core Web Vitals monitoring
 * - Scroll depth tracking
 * - Custom event tracking
 *
 * Supported providers:
 * - Plausible Analytics (recommended)
 * - Fathom Analytics
 * - Umami
 * - Simple Analytics
 */

import type { AnalyticsConfig, AnalyticsEvent, AnalyticsProvider } from './types'
import { PlausibleProvider } from './providers/plausible'
import { initWebVitals } from './webVitals'
import { createScrollTracker } from './scrollDepth'

/**
 * Analytics singleton instance
 */
class Analytics {
  private provider: AnalyticsProvider | null = null
  private config: AnalyticsConfig | null = null
  private initialized = false
  private scrollTracker: { disable: () => void } | null = null

  /**
   * Initialize analytics with configuration
   *
   * @param config - Analytics configuration
   */
  init(config: AnalyticsConfig): void {
    if (this.initialized) {
      console.warn('[Analytics] Already initialized')
      return
    }

    this.config = config

    // Create provider based on configuration
    this.provider = this.createProvider(config.provider)

    // Initialize provider
    this.provider.init(config)

    // Initialize Core Web Vitals tracking if enabled
    if (config.trackWebVitals !== false) {
      initWebVitals((vitals) => {
        this.trackWebVitals(vitals)
      })
    }

    // Initialize scroll depth tracking if enabled
    if (config.trackScrollDepth !== false) {
      this.scrollTracker = createScrollTracker((depth) => {
        this.trackEvent({
          name: 'scroll_depth',
          properties: { depth },
        })
      })
    }

    this.initialized = true

    if (config.debug) {
      console.log('[Analytics] Initialized with config:', config)
    }
  }

  /**
   * Create analytics provider instance
   * @throws {Error} If the requested provider is not implemented
   */
  private createProvider(provider: AnalyticsConfig['provider']): AnalyticsProvider {
    switch (provider) {
      case 'plausible':
        return new PlausibleProvider()
      case 'fathom':
      case 'umami':
      case 'simple':
      case 'custom':
        // Throw error for unimplemented providers to prevent silent failures
        throw new Error(
          `[Analytics] Provider "${provider}" is not yet implemented. ` +
            `Please use "plausible" for now. ` +
            `See src/analytics/README.md for supported providers.`
        )
      default:
        // Fallback to Plausible for any other value (with warning in dev)
        if (import.meta.env.DEV) {
          console.warn(
            `[Analytics] Unknown provider "${provider}", falling back to Plausible. ` +
              `Supported providers: plausible`
          )
        }
        return new PlausibleProvider()
    }
  }

  /**
   * Track a page view
   *
   * @param url - Optional URL to track (defaults to current page)
   */
  trackPageView(url?: string): void {
    if (!this.isEnabled()) {
      return
    }

    this.provider?.trackPageView(url)

    if (this.config?.debug) {
      console.log(
        '[Analytics] Page view tracked:',
        url || (typeof window !== 'undefined' ? window.location.pathname : '/')
      )
    }
  }

  /**
   * Track a custom event
   *
   * @param event - Event data to track
   */
  trackEvent(event: AnalyticsEvent): void {
    if (!this.isEnabled()) {
      return
    }

    this.provider?.trackEvent(event)

    if (this.config?.debug) {
      console.log('[Analytics] Event tracked:', event)
    }
  }

  /**
   * Track Core Web Vitals performance metrics
   *
   * @param vitals - Core Web Vitals data
   */
  trackWebVitals(vitals: Parameters<AnalyticsProvider['trackWebVitals']>[0]): void {
    if (!this.isEnabled()) {
      return
    }

    this.provider?.trackWebVitals(vitals)

    if (this.config?.debug) {
      console.log('[Analytics] Web Vitals tracked:', vitals)
    }
  }

  /**
   * Track CTA button click
   *
   * @param buttonName - Name/label of the button clicked
   * @param location - Where the button is located (e.g., 'hero', 'cta-section')
   */
  trackCTAClick(buttonName: string, location: string): void {
    this.trackEvent({
      name: 'cta_click',
      properties: {
        button: buttonName,
        location,
      },
    })
  }

  /**
   * Track download button click
   *
   * @param platform - Platform being downloaded (e.g., 'mac', 'windows', 'ios')
   * @param location - Where the download button is located
   */
  trackDownload(platform: string, location: string): void {
    this.trackEvent({
      name: 'download_click',
      properties: {
        platform,
        location,
      },
    })
  }

  /**
   * Track navigation click
   *
   * @param target - Navigation target (e.g., 'features', 'pricing')
   * @param source - Source of navigation (e.g., 'header', 'footer')
   */
  trackNavigation(target: string, source: string): void {
    this.trackEvent({
      name: 'navigation_click',
      properties: {
        target,
        source,
      },
    })
  }

  /**
   * Check if analytics is enabled
   */
  isEnabled(): boolean {
    return this.initialized && this.provider !== null && this.provider.isEnabled()
  }

  /**
   * Disable analytics
   */
  disable(): void {
    if (!this.initialized) {
      return
    }

    const debug = this.config?.debug

    // Disable provider
    this.provider?.disable()

    // Disable scroll tracker
    if (this.scrollTracker) {
      this.scrollTracker.disable()
      this.scrollTracker = null
    }

    // Reset state
    this.initialized = false
    this.config = null
    this.provider = null

    if (debug) {
      console.log('[Analytics] Disabled')
    }
  }

  /**
   * Get current configuration
   */
  getConfig(): AnalyticsConfig | null {
    return this.config
  }
}

/**
 * Export singleton instance
 */
export const analytics = new Analytics()

/**
 * Export types for external use
 */
export type { AnalyticsConfig, AnalyticsEvent, AnalyticsProvider } from './types'
