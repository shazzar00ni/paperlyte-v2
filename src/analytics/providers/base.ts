/**
 * BaseScriptProvider — abstract base class for script-injecting analytics providers
 *
 * Encapsulates the common logic shared by all providers that work by dynamically
 * injecting a third-party `<script>` tag:
 *
 *  - Double-init guard with optional debug logging
 *  - Do Not Track (DNT) detection across all known browser APIs
 *  - Script URL validation (HTTPS + .js extension)
 *  - Async script injection with onload/onerror callbacks
 *  - Unified disable() teardown (state reset + DOM removal + window global cleanup)
 */

import type { AnalyticsConfig, AnalyticsEvent, AnalyticsProvider, CoreWebVitals } from '../types'

export abstract class BaseScriptProvider implements AnalyticsProvider {
  protected config: AnalyticsConfig | null = null
  protected initialized = false
  protected scriptLoaded = false
  protected scriptElement: HTMLScriptElement | null = null

  /** Human-readable provider name used in log messages, e.g. "Fathom" or "Plausible" */
  protected abstract readonly providerName: string

  /** Default script URL used when config.scriptUrl is not provided */
  protected abstract readonly defaultScriptUrl: string

  // ─── AnalyticsProvider interface ────────────────────────────────────────────

  init(config: AnalyticsConfig): void {
    if (this.initialized) {
      if (config.debug) {
        console.log(`[Analytics] ${this.providerName} already initialized`)
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

    if (config.debug) {
      console.log(`[Analytics] ${this.providerName} initialized`, config)
    }
  }

  disable(): void {
    const debug = this.config?.debug

    this.initialized = false
    this.scriptLoaded = false
    this.config = null

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

  abstract trackPageView(url?: string): void
  abstract trackEvent(event: AnalyticsEvent): void
  abstract trackWebVitals(vitals: CoreWebVitals): void
  abstract isEnabled(): boolean

  // ─── Shared helpers ──────────────────────────────────────────────────────────

  /**
   * Check if the browser's Do Not Track signal is active.
   * Covers navigator.doNotTrack, window.doNotTrack, and the legacy msDoNotTrack.
   */
  protected isDNTEnabled(): boolean {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
      return false
    }

    const dnt =
      navigator.doNotTrack ??
      (window as Window & { doNotTrack?: string }).doNotTrack ??
      (navigator as Navigator & { msDoNotTrack?: string }).msDoNotTrack

    return dnt === '1' || dnt === 'yes'
  }

  /**
   * Validate that a script URL is safe to inject.
   * Requires HTTPS protocol and a pathname ending in ".js".
   */
  protected isValidScriptUrl(url: string): boolean {
    try {
      const parsedUrl = new URL(url)

      if (parsedUrl.protocol !== 'https:') {
        if (this.config?.debug) {
          console.warn('[Analytics] Script URL must use HTTPS protocol:', url)
        }
        return false
      }

      if (!parsedUrl.pathname.endsWith('.js')) {
        if (this.config?.debug) {
          console.warn('[Analytics] Script URL must point to a .js file:', url)
        }
        return false
      }

      return true
    } catch (error) {
      if (this.config?.debug) {
        console.warn('[Analytics] Invalid script URL format:', url, error)
      }
      return false
    }
  }

  /**
   * Inject the analytics script into <head> asynchronously.
   * Calls configureScript() so each subclass can set provider-specific attributes.
   */
  protected loadScript(): void {
    if (this.scriptLoaded || typeof document === 'undefined') {
      return
    }

    const scriptUrl = this.config?.scriptUrl ?? this.defaultScriptUrl

    if (!this.isValidScriptUrl(scriptUrl)) {
      if (Boolean(this.config?.debug) || import.meta.env.DEV) {
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

    this.configureScript(script)
    this.attachScriptCallbacks(script)

    this.scriptElement = script
    document.head.appendChild(script)
  }

  private attachScriptCallbacks(script: HTMLScriptElement): void {
    script.onerror = () => {
      if (this.config?.debug) {
        console.warn(`[Analytics] Failed to load ${this.providerName} script`)
      }
      this.scriptLoaded = false
    }

    script.onload = () => {
      this.scriptLoaded = true
      if (this.config?.debug) {
        console.log(`[Analytics] ${this.providerName} script loaded successfully`)
      }
    }
  }

  /**
   * Set provider-specific attributes on the script element before it is injected.
   * Called by loadScript() after the common attributes (async, src) are set.
   */
  protected abstract configureScript(script: HTMLScriptElement): void

  /**
   * Remove the provider's window global during disable().
   * Each subclass cleans up its own global (e.g. window.fathom, window.plausible).
   */
  protected abstract cleanupWindowGlobal(): void
}
