/**
 * Fathom Analytics provider implementation
 *
 * Privacy-focused, GDPR-compliant analytics with beautiful dashboards.
 * Lightweight script with async loading for minimal performance impact.
 *
 * @see https://usefathom.com/docs
 */

import type { AnalyticsConfig, AnalyticsEvent, AnalyticsProvider, CoreWebVitals } from '../types'
import { isSafePropertyKey } from '@utils/security'

/**
 * Fathom Analytics global interface
 * Fathom exposes a `fathom` global with tracking methods
 */
declare global {
  interface Window {
    fathom?: {
      trackPageview: (opts?: { url?: string; referrer?: string }) => void
      trackEvent: (name: string, opts?: { _value?: number }) => void
    }
  }
}

/**
 * Fathom Analytics provider
 * Implements privacy-focused, GDPR-compliant analytics tracking
 */
export class FathomProvider implements AnalyticsProvider {
  private config: AnalyticsConfig | null = null
  private initialized = false
  private scriptLoaded = false
  private scriptElement: HTMLScriptElement | null = null

  /**
   * Initialize Fathom Analytics
   * Loads the Fathom script asynchronously and sets up configuration
   */
  init(config: AnalyticsConfig): void {
    if (this.initialized) {
      if (config.debug) {
        console.log('[Analytics] Fathom already initialized')
      }
      return
    }

    // Check if user has Do Not Track enabled
    if (config.respectDNT !== false && this.isDNTEnabled()) {
      if (config.debug) {
        console.log('[Analytics] Do Not Track is enabled, analytics disabled')
      }
      return
    }

    this.config = config
    this.initialized = true

    // Load Fathom script asynchronously
    this.loadScript()

    if (config.debug) {
      console.log('[Analytics] Fathom initialized', config)
    }
  }

  /**
   * Validate script URL to prevent script injection attacks
   * Only allows HTTPS URLs from known analytics providers or valid domains
   */
  private isValidScriptUrl(url: string): boolean {
    try {
      const parsedUrl = new URL(url)

      // Only allow HTTPS for security
      if (parsedUrl.protocol !== 'https:') {
        if (this.config?.debug) {
          console.warn('[Analytics] Script URL must use HTTPS protocol:', url)
        }
        return false
      }

      // Whitelist known analytics providers or allow any HTTPS domain
      // This prevents obviously malicious URLs while allowing self-hosted instances
      const knownProviders = [
        'usefathom.com',
        'cdn.usefathom.com',
        'plausible.io',
        'analytics.google.com',
        'umami.is',
        'simpleanalytics.com',
      ]

       // Enforce whitelist and valid extension
       return isKnownProvider && hasValidPath;
    } catch (error) {
      if (this.config?.debug) {
        console.warn('[Analytics] Invalid script URL format:', url, error)
      }
      return false
    }
  }

  /**
   * Create and configure the script element for Fathom
   */
  private createScriptElement(scriptUrl: string): HTMLScriptElement {
    const script = document.createElement('script')

    script.async = true
    script.src = scriptUrl
    script.setAttribute('data-site', this.config?.domain || '')

    if (this.config?.trackPageviews === false) {
      script.setAttribute('data-auto', 'false')
    }

    script.onerror = () => {
      this.scriptLoaded = false
      if (this.config?.debug) {
        console.warn('[Analytics] Failed to load Fathom script')
      }
    }

    script.onload = () => {
      this.scriptLoaded = true
      if (this.config?.debug) {
        console.log('[Analytics] Fathom script loaded successfully')
      }
    }

    return script
  }

  /**
   * Load Fathom analytics script
   * Uses async loading to prevent blocking page render
   */
  private loadScript(): void {
    // Guard against SSR/Node.js environments
    if (this.scriptLoaded || typeof window === 'undefined' || typeof document === 'undefined') {
      return
    }

    const scriptUrl = this.config?.scriptUrl || 'https://cdn.usefathom.com/script.js'

    // Validate script URL to prevent injection attacks
    if (!this.isValidScriptUrl(scriptUrl)) {
      if (this.config?.debug || import.meta.env.DEV) {
        console.error(
          '[Analytics] Invalid or unsafe script URL. Must be HTTPS and point to a .js file:',
          scriptUrl
        )
      }
      return
    }

    this.scriptElement = this.createScriptElement(scriptUrl)
    document.head.appendChild(this.scriptElement)
  }

  /**
   * Track a page view
   * Fathom automatically tracks pageviews, but this can be used for SPAs
   */
  trackPageView(url?: string): void {
    // Guard against SSR/Node.js environments
    if (!this.isEnabled() || typeof window === 'undefined' || !window.fathom) {
      return
    }

    const pageUrl = url ?? window.location.pathname

    window.fathom.trackPageview({ url: pageUrl })

    if (this.config?.debug) {
      console.log('[Analytics] Page view tracked:', pageUrl)
    }
  }

  /**
   * Track a custom event
   * Fathom events support a name and an optional monetary _value (in cents)
   */
  trackEvent(event: AnalyticsEvent): void {
    // Guard against SSR/Node.js environments
    if (!this.isEnabled() || typeof window === 'undefined' || !window.fathom) {
      return
    }

    // Extract a numeric value from properties if available
    // Fathom events only support a name + optional _value (number in cents)
    let value: number | undefined
    if (event.properties) {
      for (const [key, v] of Object.entries(event.properties)) {
        if (!isSafePropertyKey(key)) {
          if (this.config?.debug || import.meta.env.DEV) {
            console.warn('[Analytics] Blocked potentially unsafe property key:', key)
          }
          continue
        }
        if (key === 'value' && typeof v === 'number') {
          value = v
        }
      }
    }

    window.fathom.trackEvent(event.name, value !== undefined ? { _value: value } : undefined)

    if (this.config?.debug) {
      console.log('[Analytics] Event tracked:', event.name, value !== undefined ? { _value: value } : undefined)
    }
  }

  /**
   * Track Core Web Vitals
   * Sends performance metrics as custom events
   */
  trackWebVitals(vitals: CoreWebVitals): void {
    if (!this.isEnabled()) {
      return
    }

    // Track each metric as a separate Fathom event with the value
    Object.entries(vitals).forEach(([metric, value]) => {
      if (value !== undefined) {
        // Preserve sub-integer precision for CLS (typically < 1)
        // Round to milliseconds for time-based metrics
        // Fathom _value is in cents, so we multiply CLS by 1000 to preserve precision
        const formattedValue = metric === 'CLS'
          ? Math.round(value * 1000)
          : Math.round(value)

        this.trackEvent({
          name: `web_vitals_${metric}`,
          properties: { value: formattedValue },
        })
      }
    })

    if (this.config?.debug) {
      console.log('[Analytics] Core Web Vitals tracked:', vitals)
    }
  }

  /**
   * Check if analytics is enabled
   */
  isEnabled(): boolean {
    return (
      this.initialized &&
      this.scriptLoaded &&
      typeof window !== 'undefined' &&
      typeof window.fathom === 'object' &&
      window.fathom !== null
    )
  }

  /**
   * Disable analytics tracking
   * Removes the Fathom script and resets state
   */
  disable(): void {
    const debug = this.config?.debug

    this.initialized = false
    this.scriptLoaded = false
    this.config = null

    // Guard against SSR/Node.js environments and remove only the script we created
    if (typeof document !== 'undefined' && this.scriptElement) {
      if (this.scriptElement.parentNode) {
        this.scriptElement.parentNode.removeChild(this.scriptElement)
      }
      this.scriptElement = null
    }

    // Clean up window global
    if (typeof window !== 'undefined' && window.fathom) {
      delete window.fathom
    }

    if (debug) {
      console.log('[Analytics] Fathom disabled')
    }
  }

  /**
   * Check if Do Not Track is enabled in browser
   */
  private isDNTEnabled(): boolean {
    // Guard against SSR/Node.js environments
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
      return false
    }

    const dnt =
      navigator.doNotTrack ??
      (window as Window & { doNotTrack?: string }).doNotTrack ??
      (navigator as Navigator & { msDoNotTrack?: string }).msDoNotTrack

    return dnt === '1' || dnt === 'yes'
  }
}
