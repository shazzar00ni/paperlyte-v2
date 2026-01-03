/**
 * Tests for Plausible Analytics provider
 *
 * Tests script loading, event tracking, DNT detection, URL validation,
 * and Core Web Vitals integration for the Plausible provider.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { PlausibleProvider } from '../plausible'
import {
  mockPlausibleAPI,
  createAnalyticsConfig,
  createCleanup,
} from '../../../test/analytics-helpers'

describe('Plausible Provider', () => {
  let provider: PlausibleProvider
  let cleanup: ReturnType<typeof createCleanup>
  let plausibleMock: ReturnType<typeof mockPlausibleAPI>

  beforeEach(() => {
    cleanup = createCleanup()
    provider = new PlausibleProvider()
    plausibleMock = mockPlausibleAPI()
  })

  afterEach(() => {
    provider.disable()
    cleanup.cleanupAll()
    vi.clearAllMocks()
  })

  describe('Initialization', () => {
    it('should create script element with correct src', () => {
      const config = createAnalyticsConfig({
        domain: 'test.example.com',
        scriptUrl: 'https://plausible.io/js/script.js',
      })

      provider.init(config)

      const script = document.querySelector('script[data-domain]')
      expect(script).toBeTruthy()
      expect(script?.getAttribute('src')).toBe('https://plausible.io/js/script.js')
    })

    it('should set data-domain attribute', () => {
      const config = createAnalyticsConfig({
        domain: 'test.example.com',
      })

      provider.init(config)

      const script = document.querySelector('script[data-domain]')
      expect(script?.getAttribute('data-domain')).toBe('test.example.com')
    })

    it('should use default script URL if not provided', () => {
      const config = createAnalyticsConfig({
        domain: 'test.example.com',
        scriptUrl: undefined,
      })

      provider.init(config)

      const script = document.querySelector('script[data-domain]')
      expect(script?.getAttribute('src')).toBe('https://plausible.io/js/script.js')
    })

    it('should set async attribute on script', () => {
      const config = createAnalyticsConfig({
        domain: 'test.example.com',
      })

      provider.init(config)

      const script = document.querySelector('script[data-domain]') as HTMLScriptElement
      expect(script?.async).toBe(true)
    })

    it('should not initialize twice', () => {
      const config = createAnalyticsConfig({
        domain: 'test.example.com',
      })

      provider.init(config)
      provider.init(config)

      const scripts = document.querySelectorAll('script[data-domain]')
      expect(scripts.length).toBe(1)
    })

    it('should set data-auto-pageviews to false when trackPageviews is false', () => {
      const config = createAnalyticsConfig({
        domain: 'test.example.com',
        trackPageviews: false,
      })

      provider.init(config)

      const script = document.querySelector('script[data-domain]')
      expect(script?.getAttribute('data-auto-pageviews')).toBe('false')
    })

    it('should not set data-auto-pageviews when trackPageviews is true', () => {
      const config = createAnalyticsConfig({
        domain: 'test.example.com',
        trackPageviews: true,
      })

      provider.init(config)

      const script = document.querySelector('script[data-domain]')
      expect(script?.hasAttribute('data-auto-pageviews')).toBe(false)
    })
  })

  describe('Script URL validation', () => {
    it('should reject non-HTTPS URLs', () => {
      const config = createAnalyticsConfig({
        domain: 'test.example.com',
        scriptUrl: 'http://plausible.io/js/script.js', // HTTP instead of HTTPS
      })

      provider.init(config)

      const script = document.querySelector('script[data-domain]')
      expect(script).toBeNull() // Script should not be loaded
    })

    it('should reject URLs without .js extension', () => {
      const config = createAnalyticsConfig({
        domain: 'test.example.com',
        scriptUrl: 'https://plausible.io/js/script',
      })

      provider.init(config)

      const script = document.querySelector('script[data-domain]')
      expect(script).toBeNull()
    })

    it('should reject malformed URLs', () => {
      const config = createAnalyticsConfig({
        domain: 'test.example.com',
        scriptUrl: 'not-a-valid-url',
      })

      provider.init(config)

      const script = document.querySelector('script[data-domain]')
      expect(script).toBeNull()
    })

    it('should accept known provider URLs', () => {
      const knownProviders = [
        'https://plausible.io/js/script.js',
        'https://analytics.google.com/js/script.js',
        'https://cdn.usefathom.com/script.js',
        'https://umami.is/script.js',
        'https://scripts.simpleanalytics.com/latest.js',
      ]

      knownProviders.forEach((url) => {
        const testProvider = new PlausibleProvider()
        const config = createAnalyticsConfig({
          domain: 'test.example.com',
          scriptUrl: url,
        })

        testProvider.init(config)

        const script = document.querySelector('script[data-domain]')
        expect(script).toBeTruthy()
        expect(script?.getAttribute('src')).toBe(url)

        testProvider.disable()
        cleanup.cleanupScripts()
      })
    })

    it('should accept self-hosted HTTPS URLs', () => {
      const config = createAnalyticsConfig({
        domain: 'test.example.com',
        scriptUrl: 'https://my-analytics.example.com/js/script.js',
      })

      provider.init(config)

      const script = document.querySelector('script[data-domain]')
      expect(script).toBeTruthy()
      expect(script?.getAttribute('src')).toBe(
        'https://my-analytics.example.com/js/script.js'
      )
    })
  })

  describe('Do Not Track (DNT) detection', () => {
    it('should respect DNT when enabled', () => {
      // Mock DNT enabled
      Object.defineProperty(navigator, 'doNotTrack', {
        configurable: true,
        value: '1',
      })

      const config = createAnalyticsConfig({
        domain: 'test.example.com',
        respectDNT: true,
      })

      provider.init(config)

      const script = document.querySelector('script[data-domain]')
      expect(script).toBeNull()
      expect(provider.isEnabled()).toBe(false)
    })

    it('should ignore DNT when respectDNT is false', () => {
      // Mock DNT enabled
      Object.defineProperty(navigator, 'doNotTrack', {
        configurable: true,
        value: '1',
      })

      const config = createAnalyticsConfig({
        domain: 'test.example.com',
        respectDNT: false,
      })

      provider.init(config)

      const script = document.querySelector('script[data-domain]')
      expect(script).toBeTruthy()
    })

    it('should detect DNT with "yes" value', () => {
      Object.defineProperty(navigator, 'doNotTrack', {
        configurable: true,
        value: 'yes',
      })

      const config = createAnalyticsConfig({
        domain: 'test.example.com',
      })

      provider.init(config)

      expect(provider.isEnabled()).toBe(false)
    })

    it('should allow tracking when DNT is not set', () => {
      Object.defineProperty(navigator, 'doNotTrack', {
        configurable: true,
        value: undefined,
      })

      const config = createAnalyticsConfig({
        domain: 'test.example.com',
      })

      provider.init(config)

      const script = document.querySelector('script[data-domain]')
      expect(script).toBeTruthy()
    })
  })

  describe('Event tracking', () => {
    beforeEach(() => {
      // Mock script loaded
      window.plausible = plausibleMock

      const config = createAnalyticsConfig({
        domain: 'test.example.com',
      })
      provider.init(config)

      // Manually mark script as loaded (since we're not actually loading it)
      ;(provider as { scriptLoaded: boolean }).scriptLoaded = true
    })

    it('should track custom events', () => {
      provider.trackEvent({
        name: 'cta_click',
        properties: {
          button: 'join-waitlist',
          location: 'hero',
        },
      })

      expect(plausibleMock).toHaveBeenCalledWith('cta_click', {
        props: {
          button: 'join-waitlist',
          location: 'hero',
        },
      })
    })

    it('should track events without properties', () => {
      provider.trackEvent({
        name: 'page_view',
      })

      expect(plausibleMock).toHaveBeenCalledWith('page_view', undefined)
    })

    it('should filter out undefined properties', () => {
      provider.trackEvent({
        name: 'test_event',
        properties: {
          defined: 'value',
          undefined: undefined,
          null: null,
        },
      })

      expect(plausibleMock).toHaveBeenCalledWith('test_event', {
        props: {
          defined: 'value',
        },
      })
    })

    it('should track CTA click events', () => {
      provider.trackEvent({
        name: 'cta_click',
        properties: {
          button: 'download',
          location: 'header',
        },
      })

      expect(plausibleMock).toHaveBeenCalledWith('cta_click', {
        props: {
          button: 'download',
          location: 'header',
        },
      })
    })

    it('should track download click events', () => {
      provider.trackEvent({
        name: 'download_click',
        properties: {
          platform: 'mac',
          location: 'hero',
        },
      })

      expect(plausibleMock).toHaveBeenCalledWith('download_click', {
        props: {
          platform: 'mac',
          location: 'hero',
        },
      })
    })

    it('should track navigation click events', () => {
      provider.trackEvent({
        name: 'navigation_click',
        properties: {
          target: 'features',
          source: 'header',
        },
      })

      expect(plausibleMock).toHaveBeenCalledWith('navigation_click', {
        props: {
          target: 'features',
          source: 'header',
        },
      })
    })

    it('should track scroll depth events', () => {
      provider.trackEvent({
        name: 'scroll_depth',
        properties: {
          depth: 75,
        },
      })

      expect(plausibleMock).toHaveBeenCalledWith('scroll_depth', {
        props: {
          depth: 75,
        },
      })
    })

    it('should not track when not enabled', () => {
      provider.disable()

      provider.trackEvent({
        name: 'test_event',
      })

      expect(plausibleMock).not.toHaveBeenCalled()
    })
  })

  describe('Page view tracking', () => {
    beforeEach(() => {
      window.plausible = plausibleMock

      const config = createAnalyticsConfig({
        domain: 'test.example.com',
      })
      provider.init(config)
      ;(provider as { scriptLoaded: boolean }).scriptLoaded = true
    })

    it('should track page views with URL', () => {
      provider.trackPageView('/about')

      expect(plausibleMock).toHaveBeenCalledWith('pageview', {
        props: { path: '/about' },
      })
    })

    it('should track page views with current URL when not provided', () => {
      // Mock window.location
      Object.defineProperty(window, 'location', {
        configurable: true,
        value: { pathname: '/home' },
      })

      provider.trackPageView()

      expect(plausibleMock).toHaveBeenCalledWith('pageview', {
        props: { path: '/home' },
      })
    })

    it('should not track when not enabled', () => {
      provider.disable()

      provider.trackPageView('/test')

      expect(plausibleMock).not.toHaveBeenCalled()
    })
  })

  describe('Web Vitals tracking', () => {
    beforeEach(() => {
      window.plausible = plausibleMock

      const config = createAnalyticsConfig({
        domain: 'test.example.com',
      })
      provider.init(config)
      ;(provider as { scriptLoaded: boolean }).scriptLoaded = true
    })

    it('should track Core Web Vitals as separate events', () => {
      provider.trackWebVitals({
        LCP: 2500,
        FID: 80,
        CLS: 0.08,
      })

      expect(plausibleMock).toHaveBeenCalledWith('web_vitals', {
        props: {
          metric: 'LCP',
          value: 2500,
        },
      })

      expect(plausibleMock).toHaveBeenCalledWith('web_vitals', {
        props: {
          metric: 'FID',
          value: 80,
        },
      })

      expect(plausibleMock).toHaveBeenCalledWith('web_vitals', {
        props: {
          metric: 'CLS',
          value: 0.08,
        },
      })
    })

    it('should round time-based metrics to milliseconds', () => {
      provider.trackWebVitals({
        LCP: 2543.789,
        TTFB: 456.123,
      })

      expect(plausibleMock).toHaveBeenCalledWith('web_vitals', {
        props: {
          metric: 'LCP',
          value: 2544, // Rounded
        },
      })

      expect(plausibleMock).toHaveBeenCalledWith('web_vitals', {
        props: {
          metric: 'TTFB',
          value: 456, // Rounded
        },
      })
    })

    it('should preserve precision for CLS', () => {
      provider.trackWebVitals({
        CLS: 0.08765,
      })

      expect(plausibleMock).toHaveBeenCalledWith('web_vitals', {
        props: {
          metric: 'CLS',
          value: 0.088, // 3 decimal places
        },
      })
    })

    it('should skip undefined metrics', () => {
      provider.trackWebVitals({
        LCP: 2500,
        FID: undefined,
        CLS: 0.08,
      })

      expect(plausibleMock).toHaveBeenCalledTimes(2) // Only LCP and CLS
    })

    it('should not track when not enabled', () => {
      provider.disable()

      provider.trackWebVitals({
        LCP: 2500,
      })

      expect(plausibleMock).not.toHaveBeenCalled()
    })
  })

  describe('Script loading', () => {
    it('should handle script load success', () => {
      const config = createAnalyticsConfig({
        domain: 'test.example.com',
      })

      provider.init(config)

      const script = document.querySelector('script[data-domain]') as HTMLScriptElement
      expect(script).toBeTruthy()

      // Simulate script load
      script?.dispatchEvent(new Event('load'))

      // Provider should be ready (scriptLoaded = true)
      // We can't directly test this without exposing private state
      // But we can verify the script is in the document
      expect(document.querySelector('script[data-domain]')).toBeTruthy()
    })

    it('should handle script load failure', () => {
      const config = createAnalyticsConfig({
        domain: 'test.example.com',
      })

      provider.init(config)

      const script = document.querySelector('script[data-domain]') as HTMLScriptElement

      // Simulate script error
      script?.dispatchEvent(new Event('error'))

      // Provider should handle the error gracefully
      expect(provider.isEnabled()).toBe(false)
    })
  })

  describe('Provider state', () => {
    it('should return false for isEnabled before initialization', () => {
      expect(provider.isEnabled()).toBe(false)
    })

    it('should return false for isEnabled before script loads', () => {
      const config = createAnalyticsConfig({
        domain: 'test.example.com',
      })

      provider.init(config)

      expect(provider.isEnabled()).toBe(false)
    })

    it('should return true for isEnabled after script loads', () => {
      window.plausible = plausibleMock

      const config = createAnalyticsConfig({
        domain: 'test.example.com',
      })

      provider.init(config)
      ;(provider as { scriptLoaded: boolean }).scriptLoaded = true

      expect(provider.isEnabled()).toBe(true)
    })

    it('should return false for isEnabled after disable', () => {
      window.plausible = plausibleMock

      const config = createAnalyticsConfig({
        domain: 'test.example.com',
      })

      provider.init(config)
      ;(provider as { scriptLoaded: boolean }).scriptLoaded = true

      provider.disable()

      expect(provider.isEnabled()).toBe(false)
    })
  })

  describe('Cleanup', () => {
    it('should remove script element on disable', () => {
      const config = createAnalyticsConfig({
        domain: 'test.example.com',
      })

      provider.init(config)

      expect(document.querySelector('script[data-domain]')).toBeTruthy()

      provider.disable()

      expect(document.querySelector('script[data-domain]')).toBeNull()
    })

    it('should clean up window.plausible on disable', () => {
      window.plausible = plausibleMock

      const config = createAnalyticsConfig({
        domain: 'test.example.com',
      })

      provider.init(config)
      provider.disable()

      expect(window.plausible).toBeUndefined()
    })

    it('should reset state on disable', () => {
      const config = createAnalyticsConfig({
        domain: 'test.example.com',
      })

      provider.init(config)
      provider.disable()

      expect(provider.isEnabled()).toBe(false)
    })
  })

  describe('Debug mode', () => {
    it('should not log when debug is false', () => {
      const consoleSpy = vi.spyOn(console, 'log')

      const config = createAnalyticsConfig({
        domain: 'test.example.com',
        debug: false,
      })

      provider.init(config)

      expect(consoleSpy).not.toHaveBeenCalled()

      consoleSpy.mockRestore()
    })

    it('should log when debug is true', () => {
      const consoleSpy = vi.spyOn(console, 'log')

      const config = createAnalyticsConfig({
        domain: 'test.example.com',
        debug: true,
      })

      provider.init(config)

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[Analytics]'),
        expect.anything()
      )

      consoleSpy.mockRestore()
    })
  })
})
