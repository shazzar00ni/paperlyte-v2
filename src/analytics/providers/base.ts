/**
 * Base analytics provider with shared initialization, DNT, and lifecycle logic.
 *
 * Concrete providers (Fathom, Plausible, etc.) extend this class and implement
 * the provider-specific tracking methods and script loading.
 */

import type { AnalyticsConfig, AnalyticsEvent, AnalyticsProvider, CoreWebVitals } from '../types'

export abstract class BaseAnalyticsProvider implements AnalyticsProvider {
  protected config: AnalyticsConfig | null = null
  protected initialized = false
  protected scriptLoaded = false
  protected scriptElement: HTMLScriptElement | null = null

  /** Display name used in debug log messages */
  protected abstract readonly providerName: string

  /** Load the provider-specific analytics script */
  protected abstract loadScript(): void

  /** Remove the provider-specific window global (e.g. window.fathom) */
  protected abstract cleanupWindowGlobal(): void

  abstract trackPageView(_url?: string): void
  abstract trackEvent(_event: AnalyticsEvent): void
  abstract trackWebVitals(_vitals: CoreWebVitals): void
  abstract isEnabled(): boolean

  init(config: AnalyticsConfig): void {
    if (this.initialized) {
      if (config.debug) {
        console.log(`[Analytics] ${this.providerName} already initialized`)
      }
      return
    }

    this.config = config
    this.initialized = true

    // Config and initialized are persisted so getters remain functional,
    // but the tracking script is not loaded to respect the user's preference.
    if (config.respectDNT !== false && this.isDNTEnabled()) {
      if (config.debug) {
        console.log('[Analytics] Do Not Track is enabled, analytics disabled')
      }
      return
    }

    this.loadScript()

    if (config.debug) {
      console.log(`[Analytics] ${this.providerName} initialized`, config)
    }
  }

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

    this.cleanupWindowGlobal()

    if (debug) {
      console.log(`[Analytics] ${this.providerName} disabled`)
    }
  }

  protected isDNTEnabled(): boolean {
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
