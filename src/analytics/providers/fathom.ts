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

import type { AnalyticsEvent, CoreWebVitals } from '../types'
import { BaseScriptProvider } from './base'

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
export class FathomProvider extends BaseScriptProvider {
  protected readonly providerName = 'Fathom'
  protected readonly defaultScriptUrl = 'https://cdn.usefathom.com/script.js'

  protected configureScript(script: HTMLScriptElement): void {
    // Fathom uses data-site for the site ID (unlike Plausible's data-domain)
    script.setAttribute('data-site', this.config?.domain ?? '')
    // Honour browser-level DNT signal at the script level as well
    script.setAttribute('data-honor-dnt', 'true')
  }

  protected cleanupWindowGlobal(): void {
    if (window.fathom) {
      delete window.fathom
    }
  }

  /**
   * Track a page view
   * Useful for SPA navigation where the URL changes without a full page reload
   */
  trackPageView(url?: string): void {
    if (!this.isEnabled() || !window.fathom) {
      return
    }

    const pageUrl = url ?? window.location.pathname

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
    if (!this.isEnabled() || !window.fathom) {
      return
    }

    // Fathom goals use a numeric value in cents; default to 0
    const value =
      typeof event.properties?.value === 'number'
        ? Math.round(Number((event.properties.value * 100).toPrecision(12)))
        : 0

    // Resolve a Fathom goal code:
    // 1) Explicit override via event.properties.goalCode
    // 2) Mapping from config (goalMappings/goalCodes) by event.name
    // 3) Treat event.name as a goal code only if it matches a goal-like format
    const config: any = this.config || {}
    const goalMappings =
      (config.goalMappings || config.goalCodes || {}) as Record<string, string>

    let goalCode: string | undefined

    if (typeof event.properties?.goalCode === 'string') {
      goalCode = event.properties.goalCode
    } else if (event.name && goalMappings[event.name]) {
      goalCode = goalMappings[event.name]
    } else if (typeof event.name === 'string' && /^[A-Z0-9]{4,10}$/.test(event.name)) {
      // Fallback: allow a goal-code-like event.name (e.g. "ABC123")
      goalCode = event.name
    }

    if (!goalCode) {
      if (this.config?.debug) {
        console.warn(
          '[Analytics] Fathom goal not tracked: missing/invalid goal code for event',
          event.name
        )
      }
      return
    }

    window.fathom.trackGoal(goalCode, value)

    if (this.config?.debug) {
      console.log('[Analytics] Event tracked:', event.name, { goalCode, value })
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

    Object.entries(vitals).forEach(([metric, value]) => {
      if (value !== undefined) {
        // Preserve sub-integer precision for CLS (typically < 1)
        // Round to milliseconds for time-based metrics
        const formattedValue = metric === 'CLS' ? Number(value.toFixed(3)) : Math.round(value)

        this.trackEvent({
          name: `web_vitals_${metric}`,
          properties: {
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
      typeof window.fathom === 'object'
    )
  }
}
