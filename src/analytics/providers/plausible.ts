/**
 * Plausible Analytics provider implementation
 *
 * Privacy-first, cookie-less analytics that's GDPR compliant out of the box.
 * Lightweight script (<1KB) with async loading for minimal performance impact.
 *
 * @see https://plausible.io/docs
 */

import type { AnalyticsEvent, CoreWebVitals } from '../types'
import { isSafePropertyKey } from '../../utils/security'
import { BaseScriptProvider } from './base'

/**
 * Plausible Analytics provider
 * Implements privacy-first, cookie-less analytics tracking
 */
export class PlausibleProvider extends BaseScriptProvider {
  protected readonly providerName = 'Plausible'
  protected readonly defaultScriptUrl = 'https://plausible.io/js/script.js'

  protected configureScript(script: HTMLScriptElement): void {
    script.setAttribute('data-domain', this.config?.domain ?? '')

    if (this.config?.trackPageviews === false) {
      script.setAttribute('data-auto-pageviews', 'false')
    }
  }

  protected cleanupWindowGlobal(): void {
    if (window.plausible) {
      delete window.plausible
    }
  }

  /**
   * Track a page view
   * Plausible automatically tracks pageviews, but this can be used for SPAs
   */
  trackPageView(url?: string): void {
    if (!this.isEnabled() || !window.plausible) {
      return
    }

    const pageUrl = url ?? window.location.pathname

    window.plausible('pageview', {
      props: { path: pageUrl },
    })
  }

  /**
   * Track a custom event
   * Sends event with optional properties to Plausible
   */
  trackEvent(event: AnalyticsEvent): void {
    if (!this.isEnabled() || !window.plausible) {
      return
    }

    // Convert properties to Plausible format (only string, number, boolean)
    const props = event.properties
      ? Object.entries(event.properties).reduce(
          (acc, [key, value]) => {
            // Validate key is safe before using it for property assignment
            if (!isSafePropertyKey(key)) {
              if (Boolean(this.config?.debug) || import.meta.env.DEV) {
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
}
