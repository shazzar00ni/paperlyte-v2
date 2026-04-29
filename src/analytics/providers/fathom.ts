/**
 * Fathom Analytics provider implementation
 *
 * Privacy-focused, cookie-less analytics that's GDPR compliant.
 * Lightweight script with async loading for minimal performance impact.
 *
 * @see https://usefathom.com/docs
 */

import type { AnalyticsConfig, AnalyticsEvent, AnalyticsProvider, CoreWebVitals } from '../types'
import { isSafePropertyKey } from '../../utils/security'
import { isDNTEnabled, isValidScriptUrl } from './utils'

/**
 * Fathom Analytics provider
 * Implements privacy-first, cookie-less analytics tracking
 */
export class FathomProvider implements AnalyticsProvider {
  private config: AnalyticsConfig | null = null
  private initialized = false
  private scriptLoaded = false
  private scriptElement: HTMLScriptElement | null = null

  init(config: AnalyticsConfig): void {
    if (this.initialized) {
      if (config.debug) {
        console.log('[Analytics] Fathom already initialized')
      }
      return
    }

    if (config.respectDNT !== false && isDNTEnabled()) {
      if (config.debug) {
        console.log('[Analytics] Do Not Track is enabled, analytics disabled')
      }
      return
    }

    this.config = config
    this.initialized = true
    this.loadScript()
  }

  private loadScript(): void {
    if (this.scriptLoaded || typeof window === 'undefined' || typeof document === 'undefined') {
      return
    }

    const defaultUrl = 'https://cdn.usefathom.com/script.js'
    const configured = this.config?.scriptUrl
    const scriptUrl = configured && isValidScriptUrl(configured) ? configured : defaultUrl

    if (configured && scriptUrl !== configured && (this.config?.debug || import.meta.env.DEV)) {
      console.warn('[Analytics] Invalid Fathom scriptUrl, falling back to default')
    }

    // Fathom has no script attribute to suppress the initial automatic pageview.
    // Warn in debug/dev so callers know trackPageviews: false cannot be fully honored.
    if (this.config?.trackPageviews === false && (this.config?.debug || import.meta.env.DEV)) {
      console.warn(
        '[Analytics] Fathom does not support disabling automatic pageview tracking via script ' +
          'attribute. The initial pageview will still be recorded by the Fathom script.'
      )
    }

    const script = document.createElement('script')
    script.async = true
    script.src = scriptUrl
    script.setAttribute('data-site', this.config?.domain || '')

    script.onerror = () => {
      if (this.scriptElement !== script) return
      if (this.config?.debug) {
        console.warn('[Analytics] Failed to load Fathom script')
      }
      this.scriptLoaded = false
    }

    script.onload = () => {
      if (this.scriptElement !== script) return
      this.scriptLoaded = true
      if (this.config?.debug) {
        console.log('[Analytics] Fathom script loaded successfully')
      }
    }

    this.scriptElement = script
    document.head.appendChild(script)
  }

  trackPageView(url?: string): void {
    // isEnabled() already verifies window and window.fathom.trackPageview;
    // re-check the optional chain so TypeScript narrows window.fathom for the call below.
    if (!this.isEnabled() || !window.fathom?.trackPageview) {
      return
    }

    const pageUrl = url || window.location.pathname
    window.fathom.trackPageview({ url: pageUrl })
  }

  trackEvent(event: AnalyticsEvent): void {
    if (!this.isEnabled() || !window.fathom?.trackGoal) {
      return
    }

    // Fathom uses provider-assigned goal codes (e.g. "ABCD1234"), not arbitrary strings.
    // Look up the event name in the configured goalCodes map. If no mapping is found,
    // skip the event and warn rather than sending an invalid code that Fathom would
    // silently drop.
    const goalCode = this.config?.goalCodes?.[event.name]
    if (!goalCode) {
      if (this.config?.debug) {
        console.warn(
          `[Analytics] Fathom: no goal code mapped for event "${event.name}". ` +
            `Add an entry to config.goalCodes (e.g. { "${event.name}": "ABCD1234" }) ` +
            `to enable tracking for this event.`
        )
      }
      return
    }

    if (this.config?.debug) {
      console.log(
        `[Analytics] Fathom trackGoal called with code "${goalCode}" for event "${event.name}".`
      )
    }

    const props = event.properties
      ? Object.entries(event.properties).reduce(
          (acc, [key, value]) => {
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

    window.fathom.trackGoal(goalCode, 0, props)
  }

  trackWebVitals(vitals: CoreWebVitals): void {
    // Fathom goal tracking requires provider-assigned goal codes; arbitrary names like
    // 'web_vitals' will be silently dropped. Skip rather than send phantom events.
    // Guard with isEnabled() for consistency with other providers — avoids work and
    // log noise when the provider is uninitialised or disabled.
    if (!this.isEnabled()) {
      return
    }

    if (this.config?.debug) {
      const available = Object.entries(vitals)
        .filter(([, v]) => v !== undefined)
        .map(([metric]) => metric)
      if (available.length > 0) {
        console.warn(
          `[Analytics] Fathom does not track Web Vitals without explicit goal-code mapping. ` +
            `Skipped metrics: ${available.join(', ')}.`
        )
      }
    }
  }

  isEnabled(): boolean {
    return (
      this.initialized &&
      this.scriptLoaded &&
      typeof window !== 'undefined' &&
      typeof window.fathom !== 'undefined' &&
      typeof window.fathom.trackPageview === 'function' &&
      typeof window.fathom.trackGoal === 'function'
    )
  }

  disable(): void {
    if (this.config?.debug) {
      console.log('[Analytics] Fathom disabled')
    }

    this.initialized = false
    this.scriptLoaded = false
    this.config = null

    if (typeof document !== 'undefined' && this.scriptElement) {
      if (this.scriptElement.parentNode) {
        this.scriptElement.parentNode.removeChild(this.scriptElement)
      }
      this.scriptElement = null
    }

    if (typeof window !== 'undefined' && window.fathom) {
      delete window.fathom
    }
  }
}
