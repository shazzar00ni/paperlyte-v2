/**
 * Umami Analytics provider implementation
 *
 * Open-source, self-hostable, privacy-focused analytics.
 * Requires a self-hosted or cloud Umami instance and a custom scriptUrl.
 *
 * @see https://umami.is/docs
 */

import type { AnalyticsConfig, AnalyticsEvent, AnalyticsProvider, CoreWebVitals } from '../types'
import { isSafePropertyKey } from '../../utils/security'
import { isDNTEnabled, isValidScriptUrl } from './utils'

/**
 * Umami Analytics provider
 * Implements cookie-less analytics tracking via the Umami script API
 */
export class UmamiProvider implements AnalyticsProvider {
  private config: AnalyticsConfig | null = null
  private initialized = false
  private scriptLoaded = false
  private scriptElement: HTMLScriptElement | null = null

  init(config: AnalyticsConfig): void {
    if (this.initialized) {
      if (config.debug) console.log('[Analytics] Umami already initialized')
      return
    }
    if (config.respectDNT !== false && isDNTEnabled()) {
      if (config.debug) console.log('[Analytics] Do Not Track is enabled, analytics disabled')
      return
    }
    if (!this.resolveScriptUrl(config)) {
      return
    }
    this.config = config
    this.initialized = true
    this.loadScript()
  }

  private resolveScriptUrl(config: AnalyticsConfig): string | null {
    const url = config.scriptUrl
    if (!url) {
      if (config.debug || import.meta.env.DEV) {
        console.warn(
          '[Analytics] Umami requires a scriptUrl (your self-hosted or cloud instance script URL). ' +
            'Set VITE_ANALYTICS_SCRIPT_URL in your environment.'
        )
      }
      return null
    }
    if (!isValidScriptUrl(url)) {
      if (config.debug || import.meta.env.DEV) {
        console.warn('[Analytics] Umami scriptUrl must be HTTPS and point to a .js file:', url)
      }
      return null
    }
    return url
  }

  private loadScript(): void {
    if (this.scriptLoaded || typeof window === 'undefined' || typeof document === 'undefined') {
      return
    }

    const scriptUrl = this.config!.scriptUrl!

    const script = document.createElement('script')
    script.async = true
    script.src = scriptUrl
    // Umami uses data-website-id for the site identifier
    script.setAttribute('data-website-id', this.config?.domain || '')

    if (this.config?.trackPageviews === false) {
      // data-auto-track="false" disables ALL automatic tracking (pageviews and events),
      // not just pageviews. Manual umami.track(...) calls continue to work.
      script.setAttribute('data-auto-track', 'false')
    }

    script.onerror = () => {
      if (this.scriptElement !== script) return
      if (this.config?.debug) {
        console.warn('[Analytics] Failed to load Umami script')
      }
      this.scriptLoaded = false
    }

    script.onload = () => {
      if (this.scriptElement !== script) return
      this.scriptLoaded = true
      if (this.config?.debug) {
        console.log('[Analytics] Umami script loaded successfully')
      }
    }

    this.scriptElement = script
    document.head.appendChild(script)
  }

  trackPageView(url?: string): void {
    if (!this.isEnabled() || typeof window === 'undefined' || !window.umami) {
      return
    }

    const pageUrl = url || window.location.pathname
    window.umami.track((props: Record<string, unknown>) => ({ ...props, url: pageUrl }))
  }

  trackEvent(event: AnalyticsEvent): void {
    if (!this.isEnabled() || typeof window === 'undefined' || !window.umami) {
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

    window.umami.track(event.name, props)
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
      typeof window.umami !== 'undefined' &&
      typeof window.umami.track === 'function'
    )
  }

  disable(): void {
    if (this.config?.debug) {
      console.log('[Analytics] Umami disabled')
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

    if (typeof window !== 'undefined' && window.umami) {
      delete window.umami
    }
  }
}
