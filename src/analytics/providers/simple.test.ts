/**
 * Tests for Simple Analytics provider
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { SimpleAnalyticsProvider } from './simple'
import type { AnalyticsConfig, AnalyticsEvent, CoreWebVitals } from '../types'

describe('analytics/providers/simple', () => {
  let provider: SimpleAnalyticsProvider
  let config: AnalyticsConfig

  beforeEach(() => {
    provider = new SimpleAnalyticsProvider()

    config = {
      provider: 'simple',
      domain: 'example.com',
      debug: false,
      trackPageviews: true,
      trackWebVitals: true,
      trackScrollDepth: true,
      respectDNT: true,
    }

    delete window.sa_event
    delete window.sa_pageview
    document.head.replaceChildren()

    Object.defineProperty(navigator, 'doNotTrack', {
      writable: true,
      configurable: true,
      value: null,
    })

    Object.defineProperty(window, 'doNotTrack', {
      writable: true,
      configurable: true,
      value: null,
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('init', () => {
    it('should inject script with default URL', () => {
      provider.init(config)

      const script = document.querySelector('script') as HTMLScriptElement
      expect(script).toBeTruthy()
      expect(script.src).toBe('https://scripts.simpleanalyticscdn.com/latest.js')
      expect(script.async).toBe(true)
    })

    it('should use a valid custom scriptUrl', () => {
      const customConfig = {
        ...config,
        scriptUrl: 'https://cdn.example.com/sa-latest.js',
      }
      provider.init(customConfig)

      const script = document.querySelector('script') as HTMLScriptElement
      expect(script.src).toBe('https://cdn.example.com/sa-latest.js')
    })

    it('should fall back to default URL for non-HTTPS scriptUrl', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      provider.init({ ...config, debug: true, scriptUrl: 'http://insecure.com/sa.js' })

      const script = document.querySelector('script') as HTMLScriptElement
      expect(script.src).toBe('https://scripts.simpleanalyticscdn.com/latest.js')
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        '[Analytics] Invalid Simple Analytics scriptUrl, falling back to default'
      )
      consoleWarnSpy.mockRestore()
    })

    it('should fall back to default URL when scriptUrl has no .js extension', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      provider.init({ ...config, debug: true, scriptUrl: 'https://example.com/tracker' })

      const script = document.querySelector('script') as HTMLScriptElement
      expect(script.src).toBe('https://scripts.simpleanalyticscdn.com/latest.js')
      expect(consoleWarnSpy).toHaveBeenCalled()
      consoleWarnSpy.mockRestore()
    })

    it('should not initialize twice', () => {
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      const debugConfig = { ...config, debug: true }

      provider.init(debugConfig)
      provider.init(debugConfig)

      expect(consoleLogSpy).toHaveBeenCalledWith('[Analytics] Simple Analytics already initialized')
      consoleLogSpy.mockRestore()
    })

    it('should not initialize when Do Not Track is enabled', () => {
      Object.defineProperty(navigator, 'doNotTrack', { writable: true, value: '1' })
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      provider.init({ ...config, debug: true })

      expect(consoleLogSpy).toHaveBeenCalledWith(
        '[Analytics] Do Not Track is enabled, analytics disabled'
      )
      expect(document.querySelector('script')).toBeNull()
      consoleLogSpy.mockRestore()
    })

    it('should ignore DNT when respectDNT is false', () => {
      Object.defineProperty(navigator, 'doNotTrack', { writable: true, value: '1' })

      provider.init({ ...config, respectDNT: false })

      expect(document.querySelector('script')).toBeTruthy()
    })

    it('should set data-auto-collect="false" when trackPageviews is disabled', () => {
      provider.init({ ...config, trackPageviews: false })

      const script = document.querySelector('script') as HTMLScriptElement
      expect(script.getAttribute('data-auto-collect')).toBe('false')
    })

    it('should handle script load success', () => {
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      provider.init({ ...config, debug: true })

      const script = document.querySelector('script') as HTMLScriptElement
      window.sa_event = vi.fn()
      script.onload?.(new Event('load'))

      expect(consoleLogSpy).toHaveBeenCalledWith(
        '[Analytics] Simple Analytics script loaded successfully'
      )
      expect(provider.isEnabled()).toBe(true)
      consoleLogSpy.mockRestore()
    })

    it('should handle script load error', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      provider.init({ ...config, debug: true })

      const script = document.querySelector('script') as HTMLScriptElement
      script.onerror?.(new Event('error'))

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        '[Analytics] Failed to load Simple Analytics script'
      )
      expect(provider.isEnabled()).toBe(false)
      consoleWarnSpy.mockRestore()
    })

    it('should detect window.doNotTrack', () => {
      Object.defineProperty(window, 'doNotTrack', {
        writable: true,
        configurable: true,
        value: '1',
      })

      provider.init(config)
      expect(document.querySelector('script')).toBeNull()
    })

    it('should detect navigator.doNotTrack = "yes"', () => {
      Object.defineProperty(navigator, 'doNotTrack', { writable: true, value: 'yes' })

      provider.init(config)
      expect(document.querySelector('script')).toBeNull()
    })

    it('should not inject a second script when loadScript is called while already loaded', () => {
      provider.init(config)
      window.sa_event = vi.fn()
      window.sa_pageview = vi.fn()

      const script = document.querySelector('script') as HTMLScriptElement
      script.onload?.(new Event('load'))

      // scriptLoaded is now true; manually trigger loadScript via the internal state path
      ;(provider as unknown as { loadScript: () => void }).loadScript()

      // Only one script should be in the DOM
      expect(document.querySelectorAll('script').length).toBe(1)
    })
  })

  describe('trackPageView', () => {
    beforeEach(() => {
      provider.init(config)
      window.sa_event = vi.fn()
      window.sa_pageview = vi.fn()

      const script = document.querySelector('script') as HTMLScriptElement
      script.onload?.(new Event('load'))
    })

    it('should track page view with current pathname by default', () => {
      provider.trackPageView()

      expect(window.sa_pageview).toHaveBeenCalledWith(window.location.pathname)
    })

    it('should track page view with custom URL', () => {
      provider.trackPageView('/pricing')

      expect(window.sa_pageview).toHaveBeenCalledWith('/pricing')
    })

    it('should not track when provider is not enabled', () => {
      provider.disable()
      const saPageviewMock = vi.fn()
      window.sa_pageview = saPageviewMock

      provider.trackPageView()

      expect(saPageviewMock).not.toHaveBeenCalled()
    })

    it('should not track when sa_pageview is not available', () => {
      delete window.sa_pageview
      // sa_event still present (needed for isEnabled), but sa_pageview missing

      expect(() => provider.trackPageView('/test')).not.toThrow()
    })
  })

  describe('trackEvent', () => {
    beforeEach(() => {
      provider.init(config)
      window.sa_event = vi.fn()
      window.sa_pageview = vi.fn()

      const script = document.querySelector('script') as HTMLScriptElement
      script.onload?.(new Event('load'))
    })

    it('should call sa_event with event name and no props', () => {
      const event: AnalyticsEvent = { name: 'cta_click' }
      provider.trackEvent(event)

      expect(window.sa_event).toHaveBeenCalledWith('cta_click', undefined)
    })

    it('should call sa_event with properties', () => {
      const event: AnalyticsEvent = {
        name: 'download_click',
        properties: { platform: 'mac', location: 'hero' },
      }
      provider.trackEvent(event)

      expect(window.sa_event).toHaveBeenCalledWith('download_click', {
        platform: 'mac',
        location: 'hero',
      })
    })

    it('should replace spaces with underscores in event name', () => {
      provider.trackEvent({ name: 'my event name' })

      expect(window.sa_event).toHaveBeenCalledWith('my_event_name', undefined)
    })

    it('should fully normalise event name to snake_case', () => {
      provider.trackEvent({ name: 'My-Event Name!  Test' })

      expect(window.sa_event).toHaveBeenCalledWith('my_event_name_test', undefined)
    })

    it('should skip and warn when event name normalises to an empty string (debug mode)', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      document.head.replaceChildren()
      const debugProvider = new SimpleAnalyticsProvider()
      debugProvider.init({ ...config, debug: true })
      window.sa_event = vi.fn()

      const script = document.querySelector('script') as HTMLScriptElement
      script.onload?.(new Event('load'))

      // '---' normalises to '' after all replacements, triggering the empty-name guard
      debugProvider.trackEvent({ name: '---' })

      expect(window.sa_event).not.toHaveBeenCalled()
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('normalises to an empty string')
      )
      consoleWarnSpy.mockRestore()
    })

    it('should filter out null and undefined properties', () => {
      const event: AnalyticsEvent = {
        name: 'test_event',
        properties: {
          valid: 'value',
          nullProp: null as unknown as string,
          undefinedProp: undefined,
        },
      }
      provider.trackEvent(event)

      expect(window.sa_event).toHaveBeenCalledWith('test_event', { valid: 'value' })
    })

    it('should block prototype pollution via __proto__', () => {
      const properties: Record<string, unknown> = { safe: 'ok' }
      Object.defineProperty(properties, '__proto__', {
        value: { bad: true },
        enumerable: true,
        configurable: true,
        writable: true,
      })
      const event: AnalyticsEvent = { name: 'test_event', properties }
      provider.trackEvent(event)

      expect(window.sa_event).toHaveBeenCalledWith('test_event', { safe: 'ok' })
    })

    it('should not track when provider is not enabled', () => {
      provider.disable()
      const saEventMock = vi.fn()
      window.sa_event = saEventMock

      provider.trackEvent({ name: 'test_event' })

      expect(saEventMock).not.toHaveBeenCalled()
    })
  })

  describe('trackWebVitals', () => {
    beforeEach(() => {
      provider.init(config)
      window.sa_event = vi.fn()
      window.sa_pageview = vi.fn()

      const script = document.querySelector('script') as HTMLScriptElement
      script.onload?.(new Event('load'))
    })

    it('should track each defined Core Web Vitals metric', () => {
      const vitals: CoreWebVitals = { LCP: 2500, CLS: 0.12345 }
      provider.trackWebVitals(vitals)

      expect(window.sa_event).toHaveBeenCalledTimes(2)
      expect(window.sa_event).toHaveBeenCalledWith('web_vitals', { metric: 'LCP', value: 2500 })
      expect(window.sa_event).toHaveBeenCalledWith('web_vitals', { metric: 'CLS', value: 0.123 })
    })

    it('should skip undefined metrics', () => {
      const vitals: CoreWebVitals = { LCP: 2500, FID: undefined }
      provider.trackWebVitals(vitals)

      expect(window.sa_event).toHaveBeenCalledTimes(1)
    })

    it('should not track when provider is not enabled', () => {
      provider.disable()
      const saEventMock = vi.fn()
      window.sa_event = saEventMock

      provider.trackWebVitals({ LCP: 2500 })

      expect(saEventMock).not.toHaveBeenCalled()
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
      window.sa_event = vi.fn()

      const script = document.querySelector('script') as HTMLScriptElement
      script.onload?.(new Event('load'))

      expect(provider.isEnabled()).toBe(true)
    })

    it('should return false after disable', () => {
      provider.init(config)
      window.sa_event = vi.fn()

      const script = document.querySelector('script') as HTMLScriptElement
      script.onload?.(new Event('load'))

      provider.disable()

      expect(provider.isEnabled()).toBe(false)
    })
  })

  describe('disable', () => {
    it('should reset state and remove script', () => {
      provider.init(config)
      expect(document.querySelector('script')).toBeTruthy()

      provider.disable()

      expect(document.querySelector('script')).toBeNull()
      expect(provider.isEnabled()).toBe(false)
    })

    it('should delete window.sa_event and window.sa_pageview', () => {
      provider.init(config)
      window.sa_event = vi.fn()
      window.sa_pageview = vi.fn()

      const script = document.querySelector('script') as HTMLScriptElement
      script.onload?.(new Event('load'))

      provider.disable()

      expect(window.sa_event).toBeUndefined()
      expect(window.sa_pageview).toBeUndefined()
    })

    it('should log debug message when debug is enabled', () => {
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      const debugProvider = new SimpleAnalyticsProvider()
      debugProvider.init({ ...config, debug: true })

      debugProvider.disable()

      expect(consoleLogSpy).toHaveBeenCalledWith('[Analytics] Simple Analytics disabled')
      consoleLogSpy.mockRestore()
    })
  })
})
