/**
 * Tests for Fathom Analytics provider
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { FathomProvider } from './fathom'
import type { AnalyticsConfig, AnalyticsEvent, CoreWebVitals } from '../types'

describe('analytics/providers/fathom', () => {
  let provider: FathomProvider
  let config: AnalyticsConfig

  const mockFathom = () => ({
    trackPageview: vi.fn(),
    trackGoal: vi.fn(),
    enableTrackingForMe: vi.fn(),
    blockTrackingForMe: vi.fn(),
  })

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

    delete window.fathom
    document.head.innerHTML = ''

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
    it('should inject script with default URL and data-site attribute', () => {
      provider.init(config)

      const script = document.querySelector('script[data-site]') as HTMLScriptElement
      expect(script).toBeTruthy()
      expect(script.src).toBe('https://cdn.usefathom.com/script.js')
      expect(script.getAttribute('data-site')).toBe('ABCDEFGH')
      expect(script.async).toBe(true)
      expect(script.defer).toBe(true)
    })

    it('should use a valid custom scriptUrl', () => {
      const customConfig = { ...config, scriptUrl: 'https://custom.cdn.com/fathom.js' }
      provider.init(customConfig)

      const script = document.querySelector('script[data-site]') as HTMLScriptElement
      expect(script.src).toBe('https://custom.cdn.com/fathom.js')
    })

    it('should fall back to default URL for invalid scriptUrl (non-HTTPS)', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const debugConfig = { ...config, debug: true, scriptUrl: 'http://insecure.com/script.js' }
      provider.init(debugConfig)

      const script = document.querySelector('script[data-site]') as HTMLScriptElement
      expect(script.src).toBe('https://cdn.usefathom.com/script.js')
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        '[Analytics] Invalid Fathom scriptUrl, falling back to default'
      )
      consoleWarnSpy.mockRestore()
    })

    it('should fall back to default URL for invalid scriptUrl (no .js extension)', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const debugConfig = { ...config, debug: true, scriptUrl: 'https://example.com/tracker' }
      provider.init(debugConfig)

      const script = document.querySelector('script[data-site]') as HTMLScriptElement
      expect(script.src).toBe('https://cdn.usefathom.com/script.js')
      expect(consoleWarnSpy).toHaveBeenCalled()
      consoleWarnSpy.mockRestore()
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
      Object.defineProperty(navigator, 'doNotTrack', { writable: true, value: '1' })
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      const debugConfig = { ...config, debug: true }

      provider.init(debugConfig)

      expect(consoleLogSpy).toHaveBeenCalledWith(
        '[Analytics] Do Not Track is enabled, analytics disabled'
      )
      expect(document.querySelector('script[data-site]')).toBeNull()
      consoleLogSpy.mockRestore()
    })

    it('should ignore DNT when respectDNT is false', () => {
      Object.defineProperty(navigator, 'doNotTrack', { writable: true, value: '1' })

      provider.init({ ...config, respectDNT: false })

      expect(document.querySelector('script[data-site]')).toBeTruthy()
    })

    it('should handle script load success', () => {
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      provider.init({ ...config, debug: true })

      const script = document.querySelector('script[data-site]') as HTMLScriptElement
      window.fathom = mockFathom()
      script.onload?.(new Event('load'))

      expect(consoleLogSpy).toHaveBeenCalledWith('[Analytics] Fathom script loaded successfully')
      expect(provider.isEnabled()).toBe(true)
      consoleLogSpy.mockRestore()
    })

    it('should handle script load error', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      provider.init({ ...config, debug: true })

      const script = document.querySelector('script[data-site]') as HTMLScriptElement
      script.onerror?.(new Event('error'))

      expect(consoleWarnSpy).toHaveBeenCalledWith('[Analytics] Failed to load Fathom script')
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
      expect(document.querySelector('script[data-site]')).toBeNull()
    })

    it('should detect navigator.doNotTrack = "yes"', () => {
      Object.defineProperty(navigator, 'doNotTrack', { writable: true, value: 'yes' })

      provider.init(config)
      expect(document.querySelector('script[data-site]')).toBeNull()
    })
  })

  describe('trackPageView', () => {
    beforeEach(() => {
      provider.init(config)
      window.fathom = mockFathom()

      const script = document.querySelector('script[data-site]') as HTMLScriptElement
      script.onload?.(new Event('load'))
    })

    it('should track page view with current pathname by default', () => {
      provider.trackPageView()

      expect(window.fathom!.trackPageview).toHaveBeenCalledWith({
        url: window.location.pathname,
      })
    })

    it('should track page view with custom URL', () => {
      provider.trackPageView('/custom-page')

      expect(window.fathom!.trackPageview).toHaveBeenCalledWith({ url: '/custom-page' })
    })

    it('should not track when provider is not enabled', () => {
      provider.disable()
      const fathomMock = mockFathom()
      window.fathom = fathomMock

      provider.trackPageView()

      expect(fathomMock.trackPageview).not.toHaveBeenCalled()
    })
  })

  describe('trackEvent', () => {
    beforeEach(() => {
      provider.init(config)
      window.fathom = mockFathom()

      const script = document.querySelector('script[data-site]') as HTMLScriptElement
      script.onload?.(new Event('load'))
    })

    it('should call trackGoal with event name and zero value', () => {
      const event: AnalyticsEvent = { name: 'ABCD1234' }
      provider.trackEvent(event)

      expect(window.fathom!.trackGoal).toHaveBeenCalledWith('ABCD1234', 0, undefined)
    })

    it('should pass sanitised properties to trackGoal', () => {
      const event: AnalyticsEvent = {
        name: 'ABCD1234',
        properties: { button: 'Join Waitlist', count: 1 },
      }
      provider.trackEvent(event)

      expect(window.fathom!.trackGoal).toHaveBeenCalledWith('ABCD1234', 0, {
        button: 'Join Waitlist',
        count: 1,
      })
    })

    it('should filter out null and undefined properties', () => {
      const event: AnalyticsEvent = {
        name: 'ABCD1234',
        properties: {
          valid: 'value',
          nullProp: null as unknown as string,
          undefinedProp: undefined,
        },
      }
      provider.trackEvent(event)

      expect(window.fathom!.trackGoal).toHaveBeenCalledWith('ABCD1234', 0, { valid: 'value' })
    })

    it('should block prototype pollution via __proto__', () => {
      const event: AnalyticsEvent = {
        name: 'ABCD1234',
        properties: { safe: 'ok', __proto__: { bad: true } } as Record<string, unknown>,
      }
      provider.trackEvent(event)

      expect(window.fathom!.trackGoal).toHaveBeenCalledWith('ABCD1234', 0, { safe: 'ok' })
    })

    it('should log debug message when debug is enabled', () => {
      document.head.innerHTML = ''
      const debugProvider = new FathomProvider()
      debugProvider.init({ ...config, debug: true })
      window.fathom = mockFathom()

      const script = document.querySelector('script[data-site]') as HTMLScriptElement
      script.onload?.(new Event('load'))

      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      debugProvider.trackEvent({ name: 'ABCD1234' })

      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Fathom trackGoal'))
      consoleLogSpy.mockRestore()
    })

    it('should not track when provider is not enabled', () => {
      provider.disable()
      const fathomMock = mockFathom()
      window.fathom = fathomMock

      provider.trackEvent({ name: 'ABCD1234' })

      expect(fathomMock.trackGoal).not.toHaveBeenCalled()
    })
  })

  describe('trackWebVitals', () => {
    beforeEach(() => {
      provider.init(config)
      window.fathom = mockFathom()

      const script = document.querySelector('script[data-site]') as HTMLScriptElement
      script.onload?.(new Event('load'))
    })

    it('should track each defined Core Web Vitals metric', () => {
      const vitals: CoreWebVitals = { LCP: 2500, CLS: 0.12345, FCP: 1800 }
      provider.trackWebVitals(vitals)

      expect(window.fathom!.trackGoal).toHaveBeenCalledTimes(3)
      expect(window.fathom!.trackGoal).toHaveBeenCalledWith('web_vitals', 0, {
        metric: 'LCP',
        value: 2500,
      })
      expect(window.fathom!.trackGoal).toHaveBeenCalledWith('web_vitals', 0, {
        metric: 'CLS',
        value: 0.123,
      })
    })

    it('should skip undefined metrics', () => {
      const vitals: CoreWebVitals = { LCP: 2500, FID: undefined }
      provider.trackWebVitals(vitals)

      expect(window.fathom!.trackGoal).toHaveBeenCalledTimes(1)
    })

    it('should not track when provider is not enabled', () => {
      provider.disable()
      const fathomMock = mockFathom()
      window.fathom = fathomMock

      provider.trackWebVitals({ LCP: 2500 })

      expect(fathomMock.trackGoal).not.toHaveBeenCalled()
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
      window.fathom = mockFathom()

      const script = document.querySelector('script[data-site]') as HTMLScriptElement
      script.onload?.(new Event('load'))

      expect(provider.isEnabled()).toBe(true)
    })

    it('should return false after disable', () => {
      provider.init(config)
      window.fathom = mockFathom()

      const script = document.querySelector('script[data-site]') as HTMLScriptElement
      script.onload?.(new Event('load'))

      provider.disable()

      expect(provider.isEnabled()).toBe(false)
    })
  })

  describe('disable', () => {
    it('should reset state and remove script', () => {
      provider.init(config)
      expect(document.querySelector('script[data-site]')).toBeTruthy()

      provider.disable()

      expect(document.querySelector('script[data-site]')).toBeNull()
      expect(provider.isEnabled()).toBe(false)
    })

    it('should delete window.fathom', () => {
      provider.init(config)
      window.fathom = mockFathom()

      const script = document.querySelector('script[data-site]') as HTMLScriptElement
      script.onload?.(new Event('load'))

      provider.disable()

      expect(window.fathom).toBeUndefined()
    })

    it('should log debug message when debug is enabled', () => {
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      const debugProvider = new FathomProvider()
      debugProvider.init({ ...config, debug: true })

      debugProvider.disable()

      expect(consoleLogSpy).toHaveBeenCalledWith('[Analytics] Fathom disabled')
      consoleLogSpy.mockRestore()
    })
  })
})
