/**
 * Fathom Analytics provider implementation
 *
 * Privacy-first, cookie-free analytics that's GDPR, CCPA and ePrivacy compliant.
 * Lightweight script with async loading for minimal performance impact.
 *
 * Implementation uses dynamic script injection — no npm package required,
 * keeping the production bundle free of analytics library overhead.
 *
 * @see https://usefathom.com/docs
 */

import type { AnalyticsConfig, AnalyticsEvent, AnalyticsProvider, CoreWebVitals } from '../types'

// Extend Window with Fathom's global API
// Type declarations only — no runtime dependency on any npm package
declare global {
  interface Window {
    fathom?: {
      trackPageview: (opts?: { url?: string; referrer?: string }) => void
      trackGoal: (code: string, cents: number) => void
    }
  }
}

/**
 * Fathom Analytics provider
 * Implements privacy-first, cookie-free analytics tracking
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
   * Only allows HTTPS URLs pointing to JavaScript files
   *
   * @param url - The URL to validate
   * @returns true if URL is valid and safe, false otherwise
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

      // Script must point to a JavaScript file
      if (!parsedUrl.pathname.endsWith('.js')) {
        if (this.config?.debug) {
          console.warn('[Analytics] Script URL must point to a .js file:', url)
        }
        return false
      }

      // Protocol is HTTPS and path ends with .js — URL is valid
      return true
    } catch (error) {
      // Invalid URL format
      if (this.config?.debug) {
        console.warn('[Analytics] Invalid script URL format:', url, error)
      }
      return false
    }
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

    const script = document.createElement('script')

    script.async = true
    script.src = scriptUrl
    // Fathom uses data-site for the site ID (unlike Plausible's data-domain)
    script.setAttribute('data-site', this.config?.domain || '')
    // Honour browser-level DNT signal at the script level as well
    script.setAttribute('data-honor-dnt', 'true')

    script.onerror = () => {
      if (this.config?.debug) {
        console.warn('[Analytics] Failed to load Fathom script')
      }
      this.scriptLoaded = false
    }

    script.onload = () => {
      this.scriptLoaded = true
      if (this.config?.debug) {
        console.log('[Analytics] Fathom script loaded successfully')
      }
    }

    // Store reference to the script element for cleanup
    this.scriptElement = script
    document.head.appendChild(script)
  }

  /**
   * Track a page view
   * Useful for SPA navigation where the URL changes without a full page reload
   */
  trackPageView(url?: string): void {
    // Guard against SSR/Node.js environments
    if (!this.isEnabled() || typeof window === 'undefined' || !window.fathom) {
      return
    }

    const pageUrl = url || window.location.pathname

    window.fathom.trackPageview({ url: pageUrl })

    if (this.config?.debug) {
      console.log('[Analytics] Page view tracked:', pageUrl)
    }
  }

  /**
   * Track a custom event as a Fathom goal
   * Fathom maps events to goals using a short code and optional value in cents
   */
  trackEvent(event: AnalyticsEvent): void {
    // Guard against SSR/Node.js environments
    if (!this.isEnabled() || typeof window === 'undefined' || !window.fathom) {
      return
    }

    // Fathom goals use a numeric value in cents; default to 0
    const value =
      typeof event.properties?.value === 'number'
        ? Math.round(event.properties.value * 100)
        : 0

    window.fathom.trackGoal(event.name, value)

    if (this.config?.debug) {
      console.log('[Analytics] Event tracked:', event.name, { value })
    }
  }

  /**
   * Track Core Web Vitals as Fathom goals
   * Sends each metric as a separate goal with its value
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
      navigator.doNotTrack ||
      (window as Window & { doNotTrack?: string }).doNotTrack ||
      (navigator as Navigator & { msDoNotTrack?: string }).msDoNotTrack

    return dnt === '1' || dnt === 'yes'
  }
}
