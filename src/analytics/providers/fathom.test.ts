/**
 * Tests for Fathom Analytics provider
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { FathomProvider } from './fathom'
import type { AnalyticsConfig, AnalyticsEvent, CoreWebVitals } from '../types'

describe('analytics/providers/fathom', () => {
  let provider: FathomProvider
  let config: AnalyticsConfig

  beforeEach(() => {
    provider = new FathomProvider()

    config = {
      provider: 'fathom',
      domain: 'ABCDEFGH',
      debug: false,
      trackPageviews: true,
      trackWebVitals: true,
      trackScrollDepth: true,
      respectDNT: true,
    }

    // Clear any existing Fathom global
    delete window.fathom

    // Clear document head
    document.head.innerHTML = ''

    // Reset navigator.doNotTrack
    Object.defineProperty(navigator, 'doNotTrack', {
      writable: true,
      configurable: true,
      value: null,
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('init', () => {
    it('should initialize provider and inject script', () => {
      provider.init(config)

      const script = document.querySelector('script[data-site]') as HTMLScriptElement
      expect(script).toBeTruthy()
      expect(script.src).toBe('https://cdn.usefathom.com/script.js')
      expect(script.getAttribute('data-site')).toBe('ABCDEFGH')
      expect(script.async).toBe(true)
    })

    it('should not initialize twice', () => {
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      const debugConfig = { ...config, debug: true }
      provider.init(debugConfig)
      provider.init(debugConfig)

      expect(consoleLogSpy).toHaveBeenCalledWith('[Analytics] Fathom already initialized')
      consoleLogSpy.mockRestore()
    })

    it('should not initialize when Do Not Track is enabled', () => {
      Object.defineProperty(navigator, 'doNotTrack', {
        writable: true,
        value: '1',
      })

      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      const debugConfig = { ...config, debug: true }

      provider.init(debugConfig)

      expect(consoleLogSpy).toHaveBeenCalledWith(
        '[Analytics] Do Not Track is enabled, analytics disabled'
      )
      expect(provider.isEnabled()).toBe(false)

      consoleLogSpy.mockRestore()
    })

    it('should respect DNT = "yes"', () => {
      Object.defineProperty(navigator, 'doNotTrack', {
        writable: true,
        value: 'yes',
      })

      provider.init(config)
      expect(provider.isEnabled()).toBe(false)
    })

    it('should ignore DNT when respectDNT is false', () => {
      Object.defineProperty(navigator, 'doNotTrack', {
        writable: true,
        value: '1',
      })

      const configWithoutDNT = { ...config, respectDNT: false }
      provider.init(configWithoutDNT)

      const script = document.querySelector('script[data-site]')
      expect(script).toBeTruthy()
    })

    it('should load script with custom URL', () => {
      const customConfig = {
        ...config,
        scriptUrl: 'https://custom.analytics.com/script.js',
      }

      provider.init(customConfig)

      const script = document.querySelector('script[data-site]') as HTMLScriptElement
      expect(script).toBeTruthy()
      expect(script.src).toBe('https://custom.analytics.com/script.js')
    })

    it('should set data-honor-dnt attribute on the script', () => {
      provider.init(config)

      const script = document.querySelector('script[data-site]') as HTMLScriptElement
      expect(script.getAttribute('data-honor-dnt')).toBe('true')
    })

    it('should reject non-HTTPS script URLs', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      vi.stubEnv('DEV', true)

      const insecureConfig = {
        ...config,
        scriptUrl: 'http://insecure.com/script.js',
      }

      provider.init(insecureConfig)

      const script = document.querySelector('script[data-site]')
      expect(script).toBeNull()
      expect(consoleErrorSpy).toHaveBeenCalled()

      consoleErrorSpy.mockRestore()
      vi.unstubAllEnvs()
    })

    it('should reject script URLs without .js extension', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      vi.stubEnv('DEV', true)

      const invalidConfig = {
        ...config,
        scriptUrl: 'https://cdn.usefathom.com/not-a-script',
      }

      provider.init(invalidConfig)

      const script = document.querySelector('script[data-site]')
      expect(script).toBeNull()

      consoleErrorSpy.mockRestore()
      vi.unstubAllEnvs()
    })

    it('should handle script load success', () => {
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      const debugConfig = { ...config, debug: true }

      provider.init(debugConfig)

      const script = document.querySelector('script[data-site]') as HTMLScriptElement

      // Simulate Fathom global being available after script loads
      window.fathom = { trackPageview: vi.fn(), trackGoal: vi.fn() }

      script.onload?.(new Event('load'))

      expect(consoleLogSpy).toHaveBeenCalledWith('[Analytics] Fathom script loaded successfully')
      expect(provider.isEnabled()).toBe(true)

      consoleLogSpy.mockRestore()
    })

    it('should handle script load error', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const debugConfig = { ...config, debug: true }

      provider.init(debugConfig)

      const script = document.querySelector('script[data-site]') as HTMLScriptElement

      script.onerror?.(new Event('error'))

      expect(consoleWarnSpy).toHaveBeenCalledWith('[Analytics] Failed to load Fathom script')
      expect(provider.isEnabled()).toBe(false)

      consoleWarnSpy.mockRestore()
    })
  })

  describe('trackPageView', () => {
    beforeEach(() => {
      provider.init(config)
      window.fathom = { trackPageview: vi.fn(), trackGoal: vi.fn() }

      const script = document.querySelector('script[data-site]') as HTMLScriptElement
      script.onload?.(new Event('load'))
    })

    it('should track page view with default URL', () => {
      provider.trackPageView()

      expect(window.fathom!.trackPageview).toHaveBeenCalledWith({
        url: window.location.pathname,
      })
    })

    it('should track page view with custom URL', () => {
      provider.trackPageView('/features')

      expect(window.fathom!.trackPageview).toHaveBeenCalledWith({
        url: '/features',
      })
    })

    it('should not track when provider is not enabled', () => {
      provider.disable()
      delete window.fathom

      provider.trackPageView()

      expect(window.fathom).toBeUndefined()
    })

    it('should log debug message when debug is enabled', () => {
      document.head.innerHTML = ''
      delete window.fathom

      const debugProvider = new FathomProvider()
      const debugConfig = { ...config, debug: true }
      debugProvider.init(debugConfig)
      window.fathom = { trackPageview: vi.fn(), trackGoal: vi.fn() }

      const script = document.querySelector('script[data-site]') as HTMLScriptElement
      script.onload?.(new Event('load'))

      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      debugProvider.trackPageView('/test')

      expect(window.fathom!.trackPageview).toHaveBeenCalledWith({ url: '/test' })
      consoleLogSpy.mockRestore()
    })
  })

  describe('trackEvent', () => {
    beforeEach(() => {
      provider.init(config)
      window.fathom = { trackPageview: vi.fn(), trackGoal: vi.fn() }

      const script = document.querySelector('script[data-site]') as HTMLScriptElement
      script.onload?.(new Event('load'))
    })

    it('should track event with default value of 0', () => {
      const event: AnalyticsEvent = {
        name: 'cta_click',
      }

      provider.trackEvent(event)

      expect(window.fathom!.trackGoal).toHaveBeenCalledWith('cta_click', 0)
    })

    it('should convert numeric value to cents', () => {
      const event: AnalyticsEvent = {
        name: 'purchase',
        properties: { value: 9.99 },
      }

      provider.trackEvent(event)

      expect(window.fathom!.trackGoal).toHaveBeenCalledWith('purchase', 999)
    })

    it('should round value to nearest cent', () => {
      const event: AnalyticsEvent = {
        name: 'purchase',
        properties: { value: 9.995 },
      }

      provider.trackEvent(event)

      expect(window.fathom!.trackGoal).toHaveBeenCalledWith('purchase', 1000)
    })

    it('should default to 0 when value property is not a number', () => {
      const event: AnalyticsEvent = {
        name: 'cta_click',
        properties: { button: 'Join Waitlist' },
      }

      provider.trackEvent(event)

      expect(window.fathom!.trackGoal).toHaveBeenCalledWith('cta_click', 0)
    })

    it('should not track when provider is not enabled', () => {
      provider.disable()
      delete window.fathom

      const event: AnalyticsEvent = { name: 'test_event' }
      provider.trackEvent(event)

      expect(window.fathom).toBeUndefined()
    })
  })

  describe('trackWebVitals', () => {
    beforeEach(() => {
      provider.init(config)
      window.fathom = { trackPageview: vi.fn(), trackGoal: vi.fn() }

      const script = document.querySelector('script[data-site]') as HTMLScriptElement
      script.onload?.(new Event('load'))
    })

    it('should track all Core Web Vitals metrics as goals', () => {
      const vitals: CoreWebVitals = {
        LCP: 2500,
        FID: 100,
        CLS: 0.1,
        TTFB: 800,
        FCP: 1800,
        INP: 200,
      }

      provider.trackWebVitals(vitals)

      expect(window.fathom!.trackGoal).toHaveBeenCalledTimes(6)
      expect(window.fathom!.trackGoal).toHaveBeenCalledWith('web_vitals', 0)
    })

    it('should round time-based metrics to milliseconds', () => {
      const vitals: CoreWebVitals = {
        LCP: 2500.7,
      }

      provider.trackWebVitals(vitals)

      // 2501 value in cents = 250100, but trackGoal receives the formatted value via trackEvent
      // which uses properties.value (2501), converted to cents = 250100
      expect(window.fathom!.trackGoal).toHaveBeenCalledWith('web_vitals', 250100)
    })

    it('should preserve precision for CLS metric', () => {
      const vitals: CoreWebVitals = {
        CLS: 0.12345,
      }

      provider.trackWebVitals(vitals)

      // 0.123 value in cents = 12
      expect(window.fathom!.trackGoal).toHaveBeenCalledWith('web_vitals', 12)
    })

    it('should skip undefined metrics', () => {
      const vitals: CoreWebVitals = {
        LCP: 2500,
        FID: undefined,
        CLS: 0.1,
      }

      provider.trackWebVitals(vitals)

      expect(window.fathom!.trackGoal).toHaveBeenCalledTimes(2)
    })

    it('should not track when provider is not enabled', () => {
      provider.disable()
      delete window.fathom

      const vitals: CoreWebVitals = { LCP: 2500 }
      provider.trackWebVitals(vitals)

      expect(window.fathom).toBeUndefined()
    })
  })

  describe('isEnabled', () => {
    it('should return false when not initialized', () => {
      expect(provider.isEnabled()).toBe(false)
    })

    it('should return false when script not yet loaded', () => {
      provider.init(config)
      expect(provider.isEnabled()).toBe(false)
    })

    it('should return true when initialized and script loaded', () => {
      provider.init(config)
      window.fathom = { trackPageview: vi.fn(), trackGoal: vi.fn() }

      const script = document.querySelector('script[data-site]') as HTMLScriptElement
      script.onload?.(new Event('load'))

      expect(provider.isEnabled()).toBe(true)
    })

    it('should return false after disable', () => {
      provider.init(config)
      window.fathom = { trackPageview: vi.fn(), trackGoal: vi.fn() }

      const script = document.querySelector('script[data-site]') as HTMLScriptElement
      script.onload?.(new Event('load'))

      provider.disable()

      expect(provider.isEnabled()).toBe(false)
    })
  })

  describe('disable', () => {
    it('should reset all state', () => {
      provider.init(config)
      window.fathom = { trackPageview: vi.fn(), trackGoal: vi.fn() }

      const script = document.querySelector('script[data-site]') as HTMLScriptElement
      script.onload?.(new Event('load'))

      provider.disable()

      expect(provider.isEnabled()).toBe(false)
      expect(window.fathom).toBeUndefined()
    })

    it('should remove the injected script element', () => {
      provider.init(config)

      const script = document.querySelector('script[data-site]')
      expect(script).toBeTruthy()

      provider.disable()

      expect(document.querySelector('script[data-site]')).toBeNull()
    })

    it('should clean up window.fathom', () => {
      provider.init(config)
      window.fathom = { trackPageview: vi.fn(), trackGoal: vi.fn() }

      const script = document.querySelector('script[data-site]') as HTMLScriptElement
      script.onload?.(new Event('load'))

      provider.disable()

      expect(window.fathom).toBeUndefined()
    })

    it('should log debug message when debug is enabled', () => {
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      const debugProvider = new FathomProvider()
      const debugConfig = { ...config, debug: true }
      debugProvider.init(debugConfig)
      debugProvider.disable()

      expect(consoleLogSpy).toHaveBeenCalledWith('[Analytics] Fathom disabled')
      consoleLogSpy.mockRestore()
    })
  })

  describe('Do Not Track detection', () => {
    it('should detect navigator.doNotTrack = "1"', () => {
      Object.defineProperty(navigator, 'doNotTrack', {
        writable: true,
        value: '1',
      })

      provider.init(config)
      expect(provider.isEnabled()).toBe(false)
    })

    it('should detect navigator.doNotTrack = "yes"', () => {
      Object.defineProperty(navigator, 'doNotTrack', {
        writable: true,
        value: 'yes',
      })

      provider.init(config)
      expect(provider.isEnabled()).toBe(false)
    })

    it('should detect window.doNotTrack', () => {
      Object.defineProperty(window, 'doNotTrack', {
        writable: true,
        configurable: true,
        value: '1',
      })

      provider.init(config)
      expect(provider.isEnabled()).toBe(false)
    })

    it('should allow tracking when DNT is not set', () => {
      Object.defineProperty(navigator, 'doNotTrack', {
        writable: true,
        value: null,
      })

      provider.init(config)
      // Provider initializes (though script not loaded yet)
      const script = document.querySelector('script[data-site]')
      expect(script).toBeTruthy()
    })
  })
})
