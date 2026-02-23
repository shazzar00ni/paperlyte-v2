/**
 * Fathom Analytics provider implementation
 *
 * Privacy-focused, GDPR-compliant analytics with beautiful dashboards.
 * Lightweight script with async loading for minimal performance impact.
 *
 * @see https://usefathom.com/docs
 */

import type { AnalyticsEvent, CoreWebVitals } from '../types'
import { BaseAnalyticsProvider } from './base'

/**
 * Fathom Analytics global interface
 * Fathom exposes a `fathom` global with tracking methods
 */
declare global {
  interface Window {
    fathom?: {
      trackPageview: (_opts?: { url?: string; referrer?: string }) => void
      trackEvent: (_name: string, _opts?: { _value?: number }) => void
    }
  }
}

/**
 * Fathom Analytics provider
 * Implements privacy-focused, GDPR-compliant analytics tracking
 */
export class FathomProvider extends BaseAnalyticsProvider {
  protected readonly providerName = 'Fathom'

  /**
   * Validate script URL to prevent script injection attacks
   * Only allows HTTPS URLs from known analytics providers with valid extensions
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

      const hasValidPath =
        typeof parsedUrl.pathname === 'string' &&
        (parsedUrl.pathname.endsWith('.js') || parsedUrl.pathname.endsWith('.mjs'))

      if (!hasValidPath) {
        if (this.config?.debug) {
          console.warn('[Analytics] Script URL must point to a .js or .mjs file:', url)
        }
        return false
      }

      const knownProviders = [
        'usefathom.com',
        'cdn.usefathom.com',
        'plausible.io',
        'analytics.google.com',
        'umami.is',
        'simpleanalytics.com',
      ]

      const isKnownProvider = knownProviders.includes(parsedUrl.hostname)

      if (isKnownProvider) {
        return true
      }

      // Allow non-whitelisted hosts only when explicitly opted in via config
      if (this.config?.allowCustomScriptUrl === true) {
        return true
      }

      if (this.config?.debug) {
        console.warn(
          '[Analytics] Script host is not in the knownProviders whitelist:',
          parsedUrl.hostname,
          '— set allowCustomScriptUrl: true in config to allow self-hosted scripts'
        )
      }
      return false
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
    script.setAttribute('data-site', this.config?.domain ?? '')

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
   * Resolve and validate the analytics script URL.
   * Returns the URL string if valid, or undefined if validation fails.
   */
  private getValidatedScriptUrl(): string | undefined {
    const scriptUrl = this.config?.scriptUrl ?? 'https://cdn.usefathom.com/script.js'

    if (this.isValidScriptUrl(scriptUrl)) {
      return scriptUrl
    }

    if (this.config?.debug || import.meta.env.DEV) {
      console.error(
        '[Analytics] Invalid or unsafe script URL. Must be HTTPS and point to a .js file:',
        scriptUrl
      )
    }
    return undefined
  }

  /**
   * Load Fathom analytics script
   * Uses async loading to prevent blocking page render
   */
  protected loadScript(): void {
    // Guard against SSR/Node.js environments
    if (this.scriptLoaded || typeof window === 'undefined' || typeof document === 'undefined') {
      return
    }

    const scriptUrl = this.getValidatedScriptUrl()
    if (!scriptUrl) {
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

    // Fathom events only support a name + optional _value (number in cents)
    const value = event.properties?.value
    const opts = typeof value === 'number' ? { _value: value } : undefined

    window.fathom.trackEvent(event.name, opts)

    if (this.config?.debug) {
      console.log('[Analytics] Event tracked:', event.name, opts)
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
      Boolean(window.fathom)
    )
  }

  protected cleanupWindowGlobal(): void {
    if (typeof window !== 'undefined' && window.fathom) {
      delete window.fathom
    }
  }
}
