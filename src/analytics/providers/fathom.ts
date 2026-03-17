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

import type { AnalyticsConfig, AnalyticsEvent, CoreWebVitals } from '../types'
import { BaseScriptProvider } from './base'

// Extend Window with Fathom's global API
// Type declarations only — no runtime dependency on any npm package
declare global {
  interface Window {
    fathom?: {
      trackPageview: (_opts?: { url?: string; referrer?: string }) => void
      trackGoal: (_code: string, _cents: number) => void
    }
  }
}

/** AnalyticsConfig extended with Fathom-specific goal-code mappings */
type FathomConfig = AnalyticsConfig & {
  goalMappings?: Record<string, string>
  goalCodes?: Record<string, string>
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
    // Honour browser-level DNT signal at the script level as well, unless explicitly disabled
    if (this.config?.respectDNT !== false) {
      script.setAttribute('data-honor-dnt', 'true')
    }
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
   * Resolve a Fathom goal code from an event.
   * Priority: explicit goalCode property → config mapping → goal-code-shaped event name
   */
  private resolveGoalCode(event: AnalyticsEvent): string | undefined {
    const cfg = this.config as FathomConfig | null
    const mappings: Record<string, string> = cfg?.goalMappings ?? cfg?.goalCodes ?? {}

    if (typeof event.properties?.goalCode === 'string') {
      return event.properties.goalCode
    }
    if (event.name && mappings[event.name]) {
      return mappings[event.name]
    }
    if (typeof event.name === 'string' && /^[A-Z0-9]{4,10}$/.test(event.name)) {
      // Fallback: allow a goal-code-like event.name (e.g. "ABC123")
      return event.name
    }
    return undefined
  }

  /**
   * Convert a decimal currency value to integer cents for Fathom.
   */
  private convertToCents(value: unknown): number {
    if (typeof value !== 'number') return 0
    return Math.round(Number((value * 100).toPrecision(12)))
  }

  /**
   * Track a custom event as a Fathom goal
   * Fathom maps events to goals using a short code and optional value in cents
   */
  trackEvent(event: AnalyticsEvent): void {
    if (!this.isEnabled() || !window.fathom) {
      return
    }

    const goalCode = this.resolveGoalCode(event)
    if (!goalCode) {
      if (this.config?.debug) {
        console.warn(
          '[Analytics] Fathom goal not tracked: missing/invalid goal code for event',
          event.name
        )
      }
      return
    }

    const value = this.convertToCents(event.properties?.value)
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

        // Use a distinct goal code per metric so Fathom can segment them
        const goalName = `web_vitals_${metric.toLowerCase()}`
        this.trackEvent({
          name: 'web_vitals',
          properties: {
            goalCode: goalName,
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
