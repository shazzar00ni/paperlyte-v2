/**
 * Simple Analytics provider implementation
 *
 * Privacy-friendly, no-cookie analytics with a clean dashboard.
 * The script tracks the initial page load automatically.
 * For SPA navigations, call `sa_pageview` manually via `trackPageView()`.
 *
 * @see https://docs.simpleanalytics.com
 */

import type { AnalyticsConfig, AnalyticsEvent, AnalyticsProvider, CoreWebVitals } from '../types'
import { isSafePropertyKey } from '../../utils/security'
import { isDNTEnabled, isValidScriptUrl } from './utils'

/**
 * Simple Analytics provider
 * Implements cookie-less analytics tracking via the Simple Analytics script API
 */
export class SimpleAnalyticsProvider implements AnalyticsProvider {
  private config: AnalyticsConfig | null = null
  private initialized = false
  private scriptLoaded = false
  private scriptElement: HTMLScriptElement | null = null

  init(config: AnalyticsConfig): void {
    if (this.initialized) {
      if (config.debug) {
        console.log('[Analytics] Simple Analytics already initialized')
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

    const defaultUrl = 'https://scripts.simpleanalyticscdn.com/latest.js'
    const configured = this.config?.scriptUrl
    const scriptUrl = configured && isValidScriptUrl(configured) ? configured : defaultUrl

    if (configured && scriptUrl !== configured && (this.config?.debug || import.meta.env.DEV)) {
      console.warn('[Analytics] Invalid Simple Analytics scriptUrl, falling back to default')
    }

    const script = document.createElement('script')
    script.async = true
    script.src = scriptUrl

    // Simple Analytics detects the domain automatically; no data attribute needed.
    if (this.config?.trackPageviews === false) {
      script.setAttribute('data-auto-collect', 'false')
    }

    script.onerror = () => {
      if (this.scriptElement !== script) return
      if (this.config?.debug) {
        console.warn('[Analytics] Failed to load Simple Analytics script')
      }
      this.scriptLoaded = false
    }

    script.onload = () => {
      if (this.scriptElement !== script) return
      this.scriptLoaded = true
      if (this.config?.debug) {
        console.log('[Analytics] Simple Analytics script loaded successfully')
      }
    }

    this.scriptElement = script
    document.head.appendChild(script)
  }

  trackPageView(url?: string): void {
    if (!this.isEnabled() || typeof window === 'undefined' || !window.sa_pageview) {
      return
    }

    const pageUrl = url || window.location.pathname
    window.sa_pageview(pageUrl)
  }

  trackEvent(event: AnalyticsEvent): void {
    if (!this.isEnabled() || typeof window === 'undefined' || !window.sa_event) {
      return
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

    // Normalise to snake_case: lowercase, replace non-alphanumeric with underscores, collapse/trim
    const safeName = this.normalizeEventName(event.name)
    if (!safeName) {
      if (this.config?.debug || import.meta.env.DEV) {
        console.warn(
          `[Analytics] Simple Analytics: event name "${event.name}" normalises to an empty string; skipping.`
        )
      }
      return
    }
    window.sa_event(safeName, props)
  }

  private normalizeEventName(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_+|_+$/g, '')
  }

  trackWebVitals(vitals: CoreWebVitals): void {
    if (!this.isEnabled()) {
      return
    }

    Object.entries(vitals).forEach(([metric, value]) => {
      if (value !== undefined) {
        const formattedValue = metric === 'CLS' ? Number(value.toFixed(3)) : Math.round(value)
        this.trackEvent({
          name: 'web_vitals',
          properties: { metric, value: formattedValue },
        })
      }
    })
  }

  isEnabled(): boolean {
    return (
      this.initialized &&
      this.scriptLoaded &&
      typeof window !== 'undefined' &&
      typeof window.sa_event === 'function'
    )
  }

  disable(): void {
    if (this.config?.debug) {
      console.log('[Analytics] Simple Analytics disabled')
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

    if (typeof window !== 'undefined') {
      if (window.sa_event) delete window.sa_event
      if (window.sa_pageview) delete window.sa_pageview
    }
  }
}
