/**
 * Tests for Plausible Analytics provider
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { PlausibleProvider } from './plausible'
import type { AnalyticsConfig, AnalyticsEvent, CoreWebVitals } from '../types'

// Extend Window interface for Plausible
declare global {
  interface Window {
    plausible?: (eventName: string, options?: { props?: Record<string, unknown> }) => void
  }
}

describe('analytics/providers/plausible', () => {
  let provider: PlausibleProvider
  let config: AnalyticsConfig

  beforeEach(() => {
    provider = new PlausibleProvider()

    config = {
      provider: 'plausible',
      domain: 'example.com',
      debug: false,
      trackPageviews: true,
      trackWebVitals: true,
      trackScrollDepth: true,
      respectDNT: true,
    }

    // Clear any existing Plausible script
    delete window.plausible

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

      expect(consoleLogSpy).toHaveBeenCalledWith('[Analytics] Plausible already initialized')
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
      const script = document.querySelector('script[data-domain]')
      expect(script).toBeTruthy()
    })

    it('should load Plausible script with default URL', () => {
      provider.init(config)

      const script = document.querySelector('script[data-domain]') as HTMLScriptElement
      expect(script).toBeTruthy()
      expect(script.src).toBe('https://plausible.io/js/script.js')
      expect(script.getAttribute('data-domain')).toBe('example.com')
      expect(script.async).toBe(true)
    })

    it('should load Plausible script with custom URL', () => {
      const customConfig = {
        ...config,
        scriptUrl: 'https://custom.analytics.com/script.js',
      }

      provider.init(customConfig)

      const script = document.querySelector('script[data-domain]') as HTMLScriptElement
      expect(script).toBeTruthy()
      expect(script.src).toBe('https://custom.analytics.com/script.js')
    })

    it('should reject non-HTTPS script URLs', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const insecureConfig = {
        ...config,
        debug: true,
        scriptUrl: 'http://insecure.com/script.js',
      }

      provider.init(insecureConfig)

      const script = document.querySelector('script[data-domain]')
      expect(script).toBeNull()
      expect(consoleErrorSpy).toHaveBeenCalled()

      consoleErrorSpy.mockRestore()
    })

    it('should reject script URLs without .js extension', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      vi.stubEnv('DEV', true)

      const invalidConfig = {
        ...config,
        scriptUrl: 'https://example.com/not-a-script',
      }

      provider.init(invalidConfig)

      const script = document.querySelector('script[data-domain]')
      expect(script).toBeNull()

      consoleErrorSpy.mockRestore()
      vi.unstubAllEnvs()
    })

    it('should set data-auto-pageviews to false when trackPageviews is disabled', () => {
      const noPageviewsConfig = {
        ...config,
        trackPageviews: false,
      }

      provider.init(noPageviewsConfig)

      const script = document.querySelector('script[data-domain]') as HTMLScriptElement
      expect(script.getAttribute('data-auto-pageviews')).toBe('false')
    })

    it('should handle script load success', () => {
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      const debugConfig = { ...config, debug: true }

      provider.init(debugConfig)

      const script = document.querySelector('script[data-domain]') as HTMLScriptElement

      // Mock window.plausible
      window.plausible = vi.fn()

      // Trigger onload
      script.onload?.(new Event('load'))

      expect(consoleLogSpy).toHaveBeenCalledWith('[Analytics] Plausible script loaded successfully')
      expect(provider.isEnabled()).toBe(true)

      consoleLogSpy.mockRestore()
    })

    it('should handle script load error', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const debugConfig = { ...config, debug: true }

      provider.init(debugConfig)

      const script = document.querySelector('script[data-domain]') as HTMLScriptElement

      // Trigger onerror
      script.onerror?.(new Event('error'))

      expect(consoleWarnSpy).toHaveBeenCalledWith('[Analytics] Failed to load Plausible script')
      expect(provider.isEnabled()).toBe(false)

      consoleWarnSpy.mockRestore()
    })
  })

  describe('trackPageView', () => {
    beforeEach(() => {
      provider.init(config)
      window.plausible = vi.fn()

      // Simulate script loaded
      const script = document.querySelector('script[data-domain]') as HTMLScriptElement
      script.onload?.(new Event('load'))
    })

    it('should track page view with default URL', () => {
      provider.trackPageView()

      expect(window.plausible).toHaveBeenCalledWith('pageview', {
        props: { path: window.location.pathname },
      })
    })

    it('should track page view with custom URL', () => {
      provider.trackPageView('/custom-page')

      expect(window.plausible).toHaveBeenCalledWith('pageview', {
        props: { path: '/custom-page' },
      })
    })

    it('should not track when provider is not enabled', () => {
      provider.disable()
      delete window.plausible

      provider.trackPageView()

      expect(window.plausible).toBeUndefined()
    })

    it('should track page view with debug enabled', () => {
      // Clear scripts from beforeEach
      document.head.innerHTML = ''

      const debugProvider = new PlausibleProvider()
      const debugConfig = { ...config, debug: true }
      debugProvider.init(debugConfig)
      window.plausible = vi.fn()

      const script = document.querySelector('script[data-domain]') as HTMLScriptElement
      script.onload?.(new Event('load'))

      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      debugProvider.trackPageView('/test')

      expect(window.plausible).toHaveBeenCalledWith('pageview', {
        props: { path: '/test' },
      })

      consoleLogSpy.mockRestore()
    })
  })

  describe('trackEvent', () => {
    beforeEach(() => {
      provider.init(config)
      window.plausible = vi.fn()

      const script = document.querySelector('script[data-domain]') as HTMLScriptElement
      script.onload?.(new Event('load'))
    })

    it('should track event without properties', () => {
      const event: AnalyticsEvent = {
        name: 'cta_click',
      }

      provider.trackEvent(event)

      expect(window.plausible).toHaveBeenCalledWith('cta_click', undefined)
    })

    it('should track event with properties', () => {
      const event: AnalyticsEvent = {
        name: 'cta_click',
        properties: {
          button: 'Join Waitlist',
          location: 'hero',
        },
      }

      provider.trackEvent(event)

      expect(window.plausible).toHaveBeenCalledWith('cta_click', {
        props: {
          button: 'Join Waitlist',
          location: 'hero',
        },
      })
    })

    it('should filter out undefined and null properties', () => {
      const event: AnalyticsEvent = {
        name: 'test_event',
        properties: {
          valid: 'value',
          nullValue: null as unknown as string,
          undefinedValue: undefined,
        },
      }

      provider.trackEvent(event)

      expect(window.plausible).toHaveBeenCalledWith('test_event', {
        props: {
          valid: 'value',
        },
      })
    })

    it('should not track when provider is not enabled', () => {
      provider.disable()
      delete window.plausible

      const event: AnalyticsEvent = {
        name: 'test_event',
      }

      provider.trackEvent(event)

      expect(window.plausible).toBeUndefined()
    })

    it('should block prototype pollution via __proto__ property', () => {
      const event: AnalyticsEvent = {
        name: 'test_event',
        properties: {
          safe_param: 'safe_value',
          __proto__: { polluted: 'bad' },
        } as Record<string, unknown>,
      }

      provider.trackEvent(event)

      // Should only include safe_param, not __proto__
      expect(window.plausible).toHaveBeenCalledWith('test_event', {
        props: {
          safe_param: 'safe_value',
        },
      })
    })

    it('should block prototype pollution via constructor property', () => {
      const event: AnalyticsEvent = {
        name: 'test_event',
        properties: {
          safe_param: 'safe_value',
          constructor: { polluted: 'bad' },
        } as Record<string, unknown>,
      }

      provider.trackEvent(event)

      // Should only include safe_param, not constructor
      expect(window.plausible).toHaveBeenCalledWith('test_event', {
        props: {
          safe_param: 'safe_value',
        },
      })
    })

    it('should block prototype pollution via prototype property', () => {
      const event: AnalyticsEvent = {
        name: 'test_event',
        properties: {
          safe_param: 'safe_value',
          prototype: { polluted: 'bad' },
        } as Record<string, unknown>,
      }

      provider.trackEvent(event)

      // Should only include safe_param, not prototype
      expect(window.plausible).toHaveBeenCalledWith('test_event', {
        props: {
          safe_param: 'safe_value',
        },
      })
    })
  })

  describe('trackWebVitals', () => {
    beforeEach(() => {
      provider.init(config)
      window.plausible = vi.fn()

      const script = document.querySelector('script[data-domain]') as HTMLScriptElement
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

      expect(window.plausible).toHaveBeenCalledTimes(6)

      expect(window.plausible).toHaveBeenCalledWith('web_vitals', {
        props: { metric: 'LCP', value: 2500 },
      })
      expect(window.plausible).toHaveBeenCalledWith('web_vitals', {
        props: { metric: 'FID', value: 100 },
      })
      expect(window.plausible).toHaveBeenCalledWith('web_vitals', {
        props: { metric: 'CLS', value: 0.1 },
      })
      expect(window.plausible).toHaveBeenCalledWith('web_vitals', {
        props: { metric: 'TTFB', value: 800 },
      })
      expect(window.plausible).toHaveBeenCalledWith('web_vitals', {
        props: { metric: 'FCP', value: 1800 },
      })
      expect(window.plausible).toHaveBeenCalledWith('web_vitals', {
        props: { metric: 'INP', value: 200 },
      })
    })

    it('should round time-based metrics to milliseconds', () => {
      const vitals: CoreWebVitals = {
        LCP: 2500.7,
        FCP: 1800.3,
      }

      provider.trackWebVitals(vitals)

      expect(window.plausible).toHaveBeenCalledWith('web_vitals', {
        props: { metric: 'LCP', value: 2501 },
      })
      expect(window.plausible).toHaveBeenCalledWith('web_vitals', {
        props: { metric: 'FCP', value: 1800 },
      })
    })

    it('should preserve precision for CLS metric', () => {
      const vitals: CoreWebVitals = {
        CLS: 0.12345,
      }

      provider.trackWebVitals(vitals)

      expect(window.plausible).toHaveBeenCalledWith('web_vitals', {
        props: { metric: 'CLS', value: 0.123 },
      })
    })

    it('should skip undefined metrics', () => {
      const vitals: CoreWebVitals = {
        LCP: 2500,
        FID: undefined,
        CLS: 0.1,
      }

      provider.trackWebVitals(vitals)

      expect(window.plausible).toHaveBeenCalledTimes(2)
      expect(window.plausible).toHaveBeenCalledWith('web_vitals', {
        props: { metric: 'LCP', value: 2500 },
      })
      expect(window.plausible).toHaveBeenCalledWith('web_vitals', {
        props: { metric: 'CLS', value: 0.1 },
      })
    })

    it('should not track when provider is not enabled', () => {
      provider.disable()
      delete window.plausible

      const vitals: CoreWebVitals = {
        LCP: 2500,
      }

      provider.trackWebVitals(vitals)

      expect(window.plausible).toBeUndefined()
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
      window.plausible = vi.fn()

      const script = document.querySelector('script[data-domain]') as HTMLScriptElement
      script.onload?.(new Event('load'))

      expect(provider.isEnabled()).toBe(true)
    })

    it('should return false after disable', () => {
      provider.init(config)
      window.plausible = vi.fn()

      const script = document.querySelector('script[data-domain]') as HTMLScriptElement
      script.onload?.(new Event('load'))

      provider.disable()

      expect(provider.isEnabled()).toBe(false)
    })
  })

  describe('disable', () => {
    it('should reset state', () => {
      provider.init(config)
      window.plausible = vi.fn()

      const script = document.querySelector('script[data-domain]') as HTMLScriptElement
      script.onload?.(new Event('load'))

      provider.disable()

      expect(provider.isEnabled()).toBe(false)
      expect(window.plausible).toBeUndefined()
    })

    it('should remove script element', () => {
      provider.init(config)

      const script = document.querySelector('script[data-domain]')
      expect(script).toBeTruthy()

      provider.disable()

      const scriptAfter = document.querySelector('script[data-domain]')
      expect(scriptAfter).toBeNull()
    })

    it('should cleanup window.plausible', () => {
      provider.init(config)
      window.plausible = vi.fn()

      const script = document.querySelector('script[data-domain]') as HTMLScriptElement
      script.onload?.(new Event('load'))

      provider.disable()

      expect(window.plausible).toBeUndefined()
    })

    it('should log debug message when debug is enabled', () => {
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      const debugProvider = new PlausibleProvider()
      const debugConfig = { ...config, debug: true }
      debugProvider.init(debugConfig)

      debugProvider.disable()

      expect(consoleLogSpy).toHaveBeenCalledWith('[Analytics] Plausible disabled')

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
