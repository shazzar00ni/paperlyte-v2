/**
 * Plausible Analytics provider implementation
 *
 * Privacy-first, cookie-less analytics that's GDPR compliant out of the box.
 * Lightweight script (<1KB) with async loading for minimal performance impact.
 *
 * @see https://plausible.io/docs
 */

import type { AnalyticsConfig, AnalyticsEvent, AnalyticsProvider, CoreWebVitals } from '../types'
import { isSafePropertyKey } from '../../utils/security'
import { isDNTEnabled, isValidScriptUrl } from './utils'

/**
 * Plausible Analytics provider
 * Implements privacy-first, cookie-less analytics tracking
 */
export class PlausibleProvider implements AnalyticsProvider {
  private config: AnalyticsConfig | null = null
  private initialized = false
  private scriptLoaded = false
  private scriptElement: HTMLScriptElement | null = null

  /**
   * Initialize Plausible Analytics
   * Loads the Plausible script asynchronously and sets up configuration
   */
  init(config: AnalyticsConfig): void {
    if (this.initialized) {
      if (config.debug) {
        console.log('[Analytics] Plausible already initialized')
      }
      return
    }

    // Check if user has Do Not Track enabled
    if (config.respectDNT !== false && isDNTEnabled()) {
      if (config.debug) {
        console.log('[Analytics] Do Not Track is enabled, analytics disabled')
      }
      return
    }

    this.config = config
    this.initialized = true

    // Load Plausible script asynchronously
    this.loadScript()
  }

  /**
   * Load Plausible analytics script
   * Uses async loading to prevent blocking page render
   */
  private loadScript(): void {
    // Guard against SSR/Node.js environments
    if (this.scriptLoaded || typeof window === 'undefined' || typeof document === 'undefined') {
      return
    }

    const scriptUrl = this.config?.scriptUrl || 'https://plausible.io/js/script.js'

    // Validate script URL to prevent injection attacks. Requires HTTPS protocol and .js extension.
    if (!isValidScriptUrl(scriptUrl)) {
      if (this.config?.debug || import.meta.env.DEV) {
        console.error(
          '[Analytics] Invalid or unsafe script URL. Must be HTTPS and point to a .js file:',
          scriptUrl
        )
      }
      return
    }

    const script = document.createElement('script')

    script.async = true
    script.src = scriptUrl
    script.setAttribute('data-domain', this.config?.domain || '')

    // Add optional tracking features
    if (this.config?.trackPageviews === false) {
      script.setAttribute('data-auto-pageviews', 'false')
    }

    script.onerror = () => {
      if (this.scriptElement !== script) return
      if (this.config?.debug) {
        console.warn('[Analytics] Failed to load Plausible script')
      }
      this.scriptLoaded = false
    }

    script.onload = () => {
      if (this.scriptElement !== script) return
      this.scriptLoaded = true
      if (this.config?.debug) {
        console.log('[Analytics] Plausible script loaded successfully')
      }
    }

    // Store reference to the script element for cleanup
    this.scriptElement = script
    document.head.appendChild(script)
  }

  /**
   * Track a page view
   * Plausible automatically tracks pageviews, but this can be used for SPAs
   */
  trackPageView(url?: string): void {
    // Guard against SSR/Node.js environments
    if (!this.isEnabled() || typeof window === 'undefined' || !window.plausible) {
      return
    }

    const pageUrl = url || window.location.pathname

    window.plausible('pageview', {
      props: { path: pageUrl },
    })
  }

  /**
   * Track a custom event
   * Sends event with optional properties to Plausible
   */
  trackEvent(event: AnalyticsEvent): void {
    // Guard against SSR/Node.js environments
    if (!this.isEnabled() || typeof window === 'undefined' || !window.plausible) {
      return
    }

    // Convert properties to Plausible format (only string, number, boolean)
    const props = event.properties
      ? Object.entries(event.properties).reduce(
          (acc, [key, value]) => {
            // Validate key is safe before using it for property assignment
            if (!isSafePropertyKey(key)) {
              if (this.config?.debug || import.meta.env.DEV) {
                console.warn('[Analytics] Blocked potentially unsafe property key:', key)
              }
              return acc
            }

            if (value !== undefined && value !== null) {
              acc[key] = value
            }
            return acc
          },
          {} as Record<string, string | number | boolean>
        )
      : undefined

    window.plausible(event.name, props ? { props } : undefined)
  }

  /**
   * Track Core Web Vitals
   * Sends performance metrics as custom events
   */
  trackWebVitals(vitals: CoreWebVitals): void {
    if (!this.isEnabled()) {
      return
    }

    // Track each metric separately for better analysis
    Object.entries(vitals).forEach(([metric, value]) => {
      if (value !== undefined) {
        // Preserve sub-integer precision for CLS (typically < 1)
        // Round to milliseconds for time-based metrics
        const formattedValue = metric === 'CLS' ? Number(value.toFixed(3)) : Math.round(value)

        this.trackEvent({
          name: 'web_vitals',
          properties: {
            metric,
            value: formattedValue,
          },
        })
      }
    })
  }

  /**
   * Check if analytics is enabled
   */
  isEnabled(): boolean {
    return (
      this.initialized &&
      this.scriptLoaded &&
      typeof window !== 'undefined' &&
      typeof window.plausible === 'function'
    )
  }

  /**
   * Disable analytics tracking
   * Removes the Plausible script and resets state
   */
  disable(): void {
    if (this.config?.debug) {
      console.log('[Analytics] Plausible disabled')
    }

    this.initialized = false
    this.scriptLoaded = false
    this.config = null

    // Guard against SSR/Node.js environments and remove only the script we created
    if (typeof document !== 'undefined' && this.scriptElement) {
      // Remove the exact script element we created (not a broad selector)
      if (this.scriptElement.parentNode) {
        this.scriptElement.parentNode.removeChild(this.scriptElement)
      }
      this.scriptElement = null
    }

    // Clean up window global
    if (typeof window !== 'undefined' && window.plausible) {
      delete window.plausible
    }
  }
}
