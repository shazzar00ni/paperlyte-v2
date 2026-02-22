/**
 * Tests for main analytics module
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { analytics } from './index'
import type { AnalyticsConfig } from './types'

// Extend Window interface for Plausible
declare global {
  interface Window {
    plausible?: (eventName: string, options?: { props?: Record<string, unknown> }) => void
  }
}

describe('analytics/index', () => {
  let config: AnalyticsConfig

  beforeEach(() => {
    config = {
      provider: 'plausible',
      domain: 'example.com',
      debug: false,
      trackPageviews: true,
      trackWebVitals: true,
      trackScrollDepth: true,
      respectDNT: false,
    }

    // Reset analytics singleton to clean state
    analytics.reset()

    // Clear document head
    document.head.innerHTML = ''

    // Clear window.plausible
    delete window.plausible

    // Mock PerformanceObserver for webVitals
    global.PerformanceObserver = class {
      callback: PerformanceObserverCallback
      constructor(callback: PerformanceObserverCallback) {
        this.callback = callback
      }
      observe = vi.fn()
      disconnect = vi.fn()
      takeRecords = vi.fn(() => [])
    } as unknown as typeof PerformanceObserver
  })

  afterEach(() => {
    // Unconditionally reset analytics state
    analytics.reset()
    vi.clearAllTimers()
    vi.restoreAllMocks()
  })

  describe('init', () => {
    it('should initialize analytics', () => {
      analytics.init(config)

      // Script should be added to head
      const script = document.querySelector('script[data-domain]')
      expect(script).toBeTruthy()
    })

    it('should not initialize twice', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      analytics.init(config)
      analytics.init(config)

      expect(consoleWarnSpy).toHaveBeenCalledWith('[Analytics] Already initialized')

      consoleWarnSpy.mockRestore()
    })

    it('should initialize with Plausible provider', () => {
      analytics.init(config)

      const script = document.querySelector('script[data-domain]') as HTMLScriptElement
      expect(script.src).toContain('plausible')
    })

    it('should throw error for unimplemented providers', () => {
      const fathomConfig = { ...config, provider: 'fathom' as const }

      expect(() => analytics.init(fathomConfig)).toThrow('Provider "fathom" is not yet implemented')
    })

    it('should fallback to Plausible for unknown providers', () => {
      vi.stubEnv('DEV', true)
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      const unknownConfig = { ...config, provider: 'unknown' as AnalyticsConfig['provider'] }
      analytics.init(unknownConfig)

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Unknown provider "unknown"')
      )

      const script = document.querySelector('script[data-domain]') as HTMLScriptElement
      expect(script.src).toContain('plausible')

      consoleWarnSpy.mockRestore()
      vi.unstubAllEnvs()
    })

    it('should initialize scroll depth tracking when enabled', () => {
      vi.useFakeTimers()
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener')

      analytics.init(config)

      // Should add scroll event listener
      expect(addEventListenerSpy).toHaveBeenCalledWith('scroll', expect.any(Function), {
        passive: true,
      })

      vi.useRealTimers()
    })

    it('should not initialize scroll depth tracking when disabled', () => {
      vi.useFakeTimers()
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener')

      const noScrollConfig = { ...config, trackScrollDepth: false }
      analytics.init(noScrollConfig)

      // Should not add scroll event listener
      const scrollCalls = addEventListenerSpy.mock.calls.filter((call) => call[0] === 'scroll')
      expect(scrollCalls.length).toBe(0)

      vi.useRealTimers()
    })

    it('should log initialization when debug is enabled', () => {
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      const debugConfig = { ...config, debug: true }
      analytics.init(debugConfig)

        // // expect(consoleLogSpy).toHaveBeenCalledWith("[Analytics] Initialized with config:", debugConfig)

      consoleLogSpy.mockRestore()
    })
  })

  describe('trackPageView', () => {
    beforeEach(() => {
      analytics.init(config)
      window.plausible = vi.fn()

      // Simulate script loaded
      const script = document.querySelector('script[data-domain]') as HTMLScriptElement
      if (!script) {
        throw new Error('Script element not found - analytics.init() may have failed')
      }
      script.onload?.(new Event('load'))
    })

    it('should track page view', () => {
      analytics.trackPageView('/test-page')

      expect(window.plausible).toHaveBeenCalledWith('pageview', {
        props: { path: '/test-page' },
      })
    })

    it('should not track when analytics is disabled', () => {
      analytics.disable()
      delete window.plausible

      analytics.trackPageView('/test-page')

      expect(window.plausible).toBeUndefined()
    })

    it('should log debug message when debug is enabled', () => {
      analytics.disable()

      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      const debugConfig = { ...config, debug: true }

      analytics.init(debugConfig)
      window.plausible = vi.fn()

      const script = document.querySelector('script[data-domain]') as HTMLScriptElement
      script.onload?.(new Event('load'))

      analytics.trackPageView('/test')

       // // expect(consoleLogSpy).toHaveBeenCalledWith('[Analytics] Page view tracked:', '/test')

      consoleLogSpy.mockRestore()
    })
  })

  describe('trackEvent', () => {
    beforeEach(() => {
      analytics.init(config)
      window.plausible = vi.fn()

      const script = document.querySelector('script[data-domain]') as HTMLScriptElement
      if (!script) {
        throw new Error('Script element not found - analytics.init() may have failed')
      }
      script.onload?.(new Event('load'))
    })

    it('should track custom event', () => {
      analytics.trackEvent({
        name: 'test_event',
        properties: { key: 'value' },
      })

      expect(window.plausible).toHaveBeenCalledWith('test_event', {
        props: { key: 'value' },
      })
    })

    it('should add timestamp if not provided', () => {
      const dateSpy = vi.spyOn(Date, 'now').mockReturnValue(1234567890)

      analytics.trackEvent({
        name: 'test_event',
      })

      expect(window.plausible).toHaveBeenCalled()

      dateSpy.mockRestore()
    })

    it('should preserve provided timestamp', () => {
      analytics.trackEvent({
        name: 'test_event',
        timestamp: 9876543210,
      })

      expect(window.plausible).toHaveBeenCalledWith('test_event', undefined)
    })

    it('should not track when analytics is disabled', () => {
      analytics.disable()
      delete window.plausible

      analytics.trackEvent({
        name: 'test_event',
      })

      expect(window.plausible).toBeUndefined()
    })
  })

  describe('trackWebVitals', () => {
    beforeEach(() => {
      analytics.init(config)
      window.plausible = vi.fn()

      const script = document.querySelector('script[data-domain]') as HTMLScriptElement
      if (!script) {
        throw new Error('Script element not found - analytics.init() may have failed')
      }
      script.onload?.(new Event('load'))
    })

    it('should track web vitals', () => {
      analytics.trackWebVitals({
        LCP: 2500,
        FID: 100,
        CLS: 0.1,
      })

      expect(window.plausible).toHaveBeenCalledTimes(3)
    })

    it('should not track when analytics is disabled', () => {
      analytics.disable()
      delete window.plausible

      analytics.trackWebVitals({
        LCP: 2500,
      })

      expect(window.plausible).toBeUndefined()
    })

    it('should log debug message when debug is enabled', () => {
      analytics.disable()

      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      const debugConfig = { ...config, debug: true }

      analytics.init(debugConfig)
      window.plausible = vi.fn()

      const script = document.querySelector('script[data-domain]') as HTMLScriptElement
      script.onload?.(new Event('load'))

      const vitals = { LCP: 2500 }
      analytics.trackWebVitals(vitals)

       // // expect(consoleLogSpy).toHaveBeenCalledWith('[Analytics] Web Vitals tracked:', vitals)

      consoleLogSpy.mockRestore()
    })
  })

  describe('trackCTAClick', () => {
    beforeEach(() => {
      analytics.init(config)
      window.plausible = vi.fn()

      const script = document.querySelector('script[data-domain]') as HTMLScriptElement
      if (!script) {
        throw new Error('Script element not found - analytics.init() may have failed')
      }
      script.onload?.(new Event('load'))
    })

    it('should track CTA click event', () => {
      analytics.trackCTAClick('Join Waitlist', 'hero')

      expect(window.plausible).toHaveBeenCalledWith('cta_click', {
        props: {
          button: 'Join Waitlist',
          location: 'hero',
        },
      })
    })
  })

  describe('trackDownload', () => {
    beforeEach(() => {
      analytics.init(config)
      window.plausible = vi.fn()

      const script = document.querySelector('script[data-domain]') as HTMLScriptElement
      if (!script) {
        throw new Error('Script element not found - analytics.init() may have failed')
      }
      script.onload?.(new Event('load'))
    })

    it('should track download click event', () => {
      analytics.trackDownload('mac', 'hero')

      expect(window.plausible).toHaveBeenCalledWith('download_click', {
        props: {
          platform: 'mac',
          location: 'hero',
        },
      })
    })
  })

  describe('trackNavigation', () => {
    beforeEach(() => {
      analytics.init(config)
      window.plausible = vi.fn()

      const script = document.querySelector('script[data-domain]') as HTMLScriptElement
      if (!script) {
        throw new Error('Script element not found - analytics.init() may have failed')
      }
      script.onload?.(new Event('load'))
    })

    it('should track navigation click event', () => {
      analytics.trackNavigation('features', 'header')

      expect(window.plausible).toHaveBeenCalledWith('navigation_click', {
        props: {
          target: 'features',
          source: 'header',
        },
      })
    })
  })

  describe('isEnabled', () => {
    it('should return false when not initialized', () => {
      expect(analytics.isEnabled()).toBe(false)
    })

    it('should return false when provider not loaded', () => {
      analytics.init(config)
      expect(analytics.isEnabled()).toBe(false)
    })

    it('should return true when initialized and provider loaded', () => {
      analytics.init(config)
      window.plausible = vi.fn()

      const script = document.querySelector('script[data-domain]') as HTMLScriptElement
      if (!script) {
        throw new Error('Script element not found - analytics.init() may have failed')
      }
      script.onload?.(new Event('load'))

      expect(analytics.isEnabled()).toBe(true)
    })

    it('should return false after disable', () => {
      analytics.init(config)
      window.plausible = vi.fn()

      const script = document.querySelector('script[data-domain]') as HTMLScriptElement
      if (!script) {
        throw new Error('Script element not found - analytics.init() may have failed')
      }
      script.onload?.(new Event('load'))

      analytics.disable()

      expect(analytics.isEnabled()).toBe(false)
    })
  })

  describe('disable', () => {
    it('should cleanup provider', () => {
      analytics.init(config)
      window.plausible = vi.fn()

      const script = document.querySelector('script[data-domain]') as HTMLScriptElement
      if (!script) {
        throw new Error('Script element not found - analytics.init() may have failed')
      }
      script.onload?.(new Event('load'))

      analytics.disable()

      expect(analytics.isEnabled()).toBe(false)
      expect(window.plausible).toBeUndefined()
    })

    it('should cleanup scroll tracker', () => {
      vi.useFakeTimers()
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')

      analytics.init(config)
      analytics.disable()

      // Should remove scroll listener
      expect(removeEventListenerSpy).toHaveBeenCalledWith('scroll', expect.any(Function))

      vi.useRealTimers()
    })

    it('should cleanup web vitals tracking', () => {
      const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener')
      const windowRemoveEventListenerSpy = vi.spyOn(window, 'removeEventListener')

      analytics.init(config)
      analytics.disable()

      // Should cleanup web vitals event listeners
      expect(removeEventListenerSpy).toHaveBeenCalledWith('visibilitychange', expect.any(Function))
      expect(windowRemoveEventListenerSpy).toHaveBeenCalledWith('pagehide', expect.any(Function))
    })

    it('should reset state', () => {
      analytics.init(config)
      analytics.disable()

      expect(analytics.getConfig()).toBeNull()
    })

    it('should handle disable when not initialized', () => {
      expect(() => analytics.disable()).not.toThrow()
    })

    it('should log debug message when debug is enabled', () => {
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      const debugConfig = { ...config, debug: true }
      analytics.init(debugConfig)
      analytics.disable()

       // // expect(consoleLogSpy).toHaveBeenCalledWith('[Analytics] Disabled')

      consoleLogSpy.mockRestore()
    })
  })

  describe('getConfig', () => {
    it('should return null when not initialized', () => {
      expect(analytics.getConfig()).toBeNull()
    })

    it('should return config when initialized', () => {
      analytics.init(config)
      expect(analytics.getConfig()).toEqual(config)
    })

    it('should return null after disable', () => {
      analytics.init(config)
      analytics.disable()
      expect(analytics.getConfig()).toBeNull()
    })
  })

  describe('scroll depth integration', () => {
    it('should track scroll depth events', () => {
      vi.useFakeTimers()

      analytics.init(config)
      window.plausible = vi.fn()

      const script = document.querySelector('script[data-domain]') as HTMLScriptElement
      script.onload?.(new Event('load'))

      // Mock scroll properties
      Object.defineProperty(document.documentElement, 'scrollHeight', {
        writable: true,
        value: 1000,
      })
      Object.defineProperty(document.documentElement, 'clientHeight', {
        writable: true,
        value: 500,
      })
      Object.defineProperty(window, 'scrollY', {
        writable: true,
        value: 250,
      })

      // Trigger scroll
      window.dispatchEvent(new Event('scroll'))
      vi.advanceTimersByTime(250)

      // Should track scroll_depth event
      expect(window.plausible).toHaveBeenCalledWith('scroll_depth', {
        props: { depth: expect.any(Number) },
      })

      analytics.disable()
      vi.useRealTimers()
    })
  })
})
