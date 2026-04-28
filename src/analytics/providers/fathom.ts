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

    if (config.respectDNT !== false && this.isDNTEnabled()) {
      if (config.debug) {
        console.log('[Analytics] Do Not Track is enabled, analytics disabled')
      }
      return
    }

    this.config = config
    this.initialized = true
    this.loadScript()
  }

  private isValidScriptUrl(url: string): boolean {
    try {
      const parsed = new URL(url)
      return parsed.protocol === 'https:' && parsed.pathname.endsWith('.js')
    } catch {
      return false
    }
  }

  private loadScript(): void {
    if (this.scriptLoaded || typeof window === 'undefined' || typeof document === 'undefined') {
      return
    }

    const defaultUrl = 'https://cdn.usefathom.com/script.js'
    const configured = this.config?.scriptUrl
    const scriptUrl = configured && this.isValidScriptUrl(configured) ? configured : defaultUrl

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
    if (!this.isEnabled() || typeof window === 'undefined' || !window.fathom) {
      return
    }

    const pageUrl = url || window.location.pathname
    window.fathom.trackPageview({ url: pageUrl })
  }

  trackEvent(event: AnalyticsEvent): void {
    if (!this.isEnabled() || typeof window === 'undefined' || !window.fathom) {
      return
    }

    // Fathom uses provider-assigned goal codes (e.g. "ABCD1234"), not arbitrary strings.
    // Using event.name as the code will silently drop events unless it matches a real goal ID.
    // Create matching goals in the Fathom dashboard and pass their codes as event names.
    if (this.config?.debug) {
      console.log(
        `[Analytics] Fathom trackGoal called with code "${event.name}". ` +
          `Ensure this matches a goal code defined in your Fathom dashboard.`
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

    window.fathom.trackGoal(event.name, 0, props)
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

  private isDNTEnabled(): boolean {
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
