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
      domain: 'ABCDEF',
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

    // Mock navigator.doNotTrack
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
    it('should initialize provider', () => {
      provider.init(config)
      expect(provider.isEnabled()).toBe(false) // Not enabled until script loads
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

    it('should respect DNT setting when respectDNT is true', () => {
      Object.defineProperty(navigator, 'doNotTrack', {
        writable: true,
        value: '1',
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

      // Should still initialize (though script not loaded yet)
      const script = document.querySelector('script[data-site]')
      expect(script).toBeTruthy()
    })

    it('should load Fathom script with default URL', () => {
      provider.init(config)

      const script = document.querySelector('script[data-site]') as HTMLScriptElement
      expect(script).toBeTruthy()
      expect(script.src).toBe('https://cdn.usefathom.com/script.js')
      expect(script.getAttribute('data-site')).toBe('ABCDEF')
      expect(script.async).toBe(true)
    })

    it('should load Fathom script with custom URL', () => {
      const customConfig = {
        ...config,
        scriptUrl: 'https://custom.fathom.com/script.js',
      }

      provider.init(customConfig)

      const script = document.querySelector('script[data-site]') as HTMLScriptElement
      expect(script).toBeTruthy()
      expect(script.src).toBe('https://custom.fathom.com/script.js')
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
        scriptUrl: 'https://example.com/not-a-script',
      }

      provider.init(invalidConfig)

      const script = document.querySelector('script[data-site]')
      expect(script).toBeNull()

      consoleErrorSpy.mockRestore()
      vi.unstubAllEnvs()
    })

    it('should set data-auto to false when trackPageviews is disabled', () => {
      const noPageviewsConfig = {
        ...config,
        trackPageviews: false,
      }

      provider.init(noPageviewsConfig)

      const script = document.querySelector('script[data-site]') as HTMLScriptElement
      expect(script.getAttribute('data-auto')).toBe('false')
    })

    it('should handle script load success', () => {
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      const debugConfig = { ...config, debug: true }

      provider.init(debugConfig)

      const script = document.querySelector('script[data-site]') as HTMLScriptElement

      // Mock window.fathom
      window.fathom = {
        trackPageview: vi.fn(),
        trackEvent: vi.fn(),
      }

      // Trigger onload
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

      // Trigger onerror
      script.onerror?.(new Event('error'))

      expect(consoleWarnSpy).toHaveBeenCalledWith('[Analytics] Failed to load Fathom script')
      expect(provider.isEnabled()).toBe(false)

      consoleWarnSpy.mockRestore()
    })
  })

  describe('trackPageView', () => {
    beforeEach(() => {
      provider.init(config)
      window.fathom = {
        trackPageview: vi.fn(),
        trackEvent: vi.fn(),
      }

      // Simulate script loaded
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
      provider.trackPageView('/custom-page')

      expect(window.fathom!.trackPageview).toHaveBeenCalledWith({
        url: '/custom-page',
      })
    })

    it('should not track when provider is not enabled', () => {
      provider.disable()
      delete window.fathom

      provider.trackPageView()

      expect(window.fathom).toBeUndefined()
    })
  })

  describe('trackEvent', () => {
    beforeEach(() => {
      provider.init(config)
      window.fathom = {
        trackPageview: vi.fn(),
        trackEvent: vi.fn(),
      }

      const script = document.querySelector('script[data-site]') as HTMLScriptElement
      script.onload?.(new Event('load'))
    })

    it('should track event without properties', () => {
      const event: AnalyticsEvent = {
        name: 'cta_click',
      }

      provider.trackEvent(event)

      expect(window.fathom!.trackEvent).toHaveBeenCalledWith('cta_click', undefined)
    })

    it('should track event with numeric value property', () => {
      const event: AnalyticsEvent = {
        name: 'purchase',
        properties: {
          value: 2999,
        },
      }

      provider.trackEvent(event)

      expect(window.fathom!.trackEvent).toHaveBeenCalledWith('purchase', { _value: 2999 })
    })

    it('should track event without _value when no numeric value property', () => {
      const event: AnalyticsEvent = {
        name: 'cta_click',
        properties: {
          button: 'Join Waitlist',
          location: 'hero',
        },
      }

      provider.trackEvent(event)

      expect(window.fathom!.trackEvent).toHaveBeenCalledWith('cta_click', undefined)
    })

    it('should not track when provider is not enabled', () => {
      provider.disable()
      delete window.fathom

      const event: AnalyticsEvent = {
        name: 'test_event',
      }

      provider.trackEvent(event)

      expect(window.fathom).toBeUndefined()
    })

    it('should block prototype pollution via __proto__ property', () => {
      const event: AnalyticsEvent = {
        name: 'test_event',
        properties: {
          value: 100,
          __proto__: { polluted: 'bad' },
        } as Record<string, unknown>,
      }

      provider.trackEvent(event)

      // Should still track the event with the safe value
      expect(window.fathom!.trackEvent).toHaveBeenCalledWith('test_event', { _value: 100 })
    })

    it('should block prototype pollution via constructor property', () => {
      const event: AnalyticsEvent = {
        name: 'test_event',
        properties: {
          value: 50,
          constructor: { polluted: 'bad' },
        } as Record<string, unknown>,
      }

      provider.trackEvent(event)

      expect(window.fathom!.trackEvent).toHaveBeenCalledWith('test_event', { _value: 50 })
    })
  })

  describe('trackWebVitals', () => {
    beforeEach(() => {
      provider.init(config)
      window.fathom = {
        trackPageview: vi.fn(),
        trackEvent: vi.fn(),
      }

      const script = document.querySelector('script[data-site]') as HTMLScriptElement
      script.onload?.(new Event('load'))
    })

    it('should track all Core Web Vitals metrics', () => {
      const vitals: CoreWebVitals = {
        LCP: 2500,
        FID: 100,
        CLS: 0.1,
        TTFB: 800,
        FCP: 1800,
        INP: 200,
      }

      provider.trackWebVitals(vitals)

      expect(window.fathom!.trackEvent).toHaveBeenCalledTimes(6)

      expect(window.fathom!.trackEvent).toHaveBeenCalledWith('web_vitals_LCP', { _value: 2500 })
      expect(window.fathom!.trackEvent).toHaveBeenCalledWith('web_vitals_FID', { _value: 100 })
      expect(window.fathom!.trackEvent).toHaveBeenCalledWith('web_vitals_CLS', { _value: 100 }) // 0.1 * 1000
      expect(window.fathom!.trackEvent).toHaveBeenCalledWith('web_vitals_TTFB', { _value: 800 })
      expect(window.fathom!.trackEvent).toHaveBeenCalledWith('web_vitals_FCP', { _value: 1800 })
      expect(window.fathom!.trackEvent).toHaveBeenCalledWith('web_vitals_INP', { _value: 200 })
    })

    it('should round time-based metrics to milliseconds', () => {
      const vitals: CoreWebVitals = {
        LCP: 2500.7,
        FCP: 1800.3,
      }

      provider.trackWebVitals(vitals)

      expect(window.fathom!.trackEvent).toHaveBeenCalledWith('web_vitals_LCP', { _value: 2501 })
      expect(window.fathom!.trackEvent).toHaveBeenCalledWith('web_vitals_FCP', { _value: 1800 })
    })

    it('should multiply CLS by 1000 to preserve precision', () => {
      const vitals: CoreWebVitals = {
        CLS: 0.12345,
      }

      provider.trackWebVitals(vitals)

      expect(window.fathom!.trackEvent).toHaveBeenCalledWith('web_vitals_CLS', { _value: 123 })
    })

    it('should skip undefined metrics', () => {
      const vitals: CoreWebVitals = {
        LCP: 2500,
        FID: undefined,
        CLS: 0.1,
      }

      provider.trackWebVitals(vitals)

      expect(window.fathom!.trackEvent).toHaveBeenCalledTimes(2)
      expect(window.fathom!.trackEvent).toHaveBeenCalledWith('web_vitals_LCP', { _value: 2500 })
      expect(window.fathom!.trackEvent).toHaveBeenCalledWith('web_vitals_CLS', { _value: 100 })
    })

    it('should not track when provider is not enabled', () => {
      provider.disable()
      delete window.fathom

      const vitals: CoreWebVitals = {
        LCP: 2500,
      }

      provider.trackWebVitals(vitals)

      expect(window.fathom).toBeUndefined()
    })
  })

  describe('isEnabled', () => {
    it('should return false when not initialized', () => {
      expect(provider.isEnabled()).toBe(false)
    })

    it('should return false when script not loaded', () => {
      provider.init(config)
      expect(provider.isEnabled()).toBe(false)
    })

    it('should return true when initialized and script loaded', () => {
      provider.init(config)
      window.fathom = {
        trackPageview: vi.fn(),
        trackEvent: vi.fn(),
      }

      const script = document.querySelector('script[data-site]') as HTMLScriptElement
      script.onload?.(new Event('load'))

      expect(provider.isEnabled()).toBe(true)
    })

    it('should return false after disable', () => {
      provider.init(config)
      window.fathom = {
        trackPageview: vi.fn(),
        trackEvent: vi.fn(),
      }

      const script = document.querySelector('script[data-site]') as HTMLScriptElement
      script.onload?.(new Event('load'))

      provider.disable()

      expect(provider.isEnabled()).toBe(false)
    })
  })

  describe('disable', () => {
    it('should reset state', () => {
      provider.init(config)
      window.fathom = {
        trackPageview: vi.fn(),
        trackEvent: vi.fn(),
      }

      const script = document.querySelector('script[data-site]') as HTMLScriptElement
      script.onload?.(new Event('load'))

      provider.disable()

      expect(provider.isEnabled()).toBe(false)
      expect(window.fathom).toBeUndefined()
    })

    it('should remove script element', () => {
      provider.init(config)

      const script = document.querySelector('script[data-site]')
      expect(script).toBeTruthy()

      provider.disable()

      const scriptAfter = document.querySelector('script[data-site]')
      expect(scriptAfter).toBeNull()
    })

    it('should cleanup window.fathom', () => {
      provider.init(config)
      window.fathom = {
        trackPageview: vi.fn(),
        trackEvent: vi.fn(),
      }

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
  })
})
