/**
 * Tests for Umami Analytics provider
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { UmamiProvider } from './umami'
import type { AnalyticsConfig, AnalyticsEvent, CoreWebVitals } from '../types'

describe('analytics/providers/umami', () => {
  let provider: UmamiProvider
  let config: AnalyticsConfig

  const SCRIPT_URL = 'https://analytics.example.com/umami.js'

  type UmamiMock = { track: ReturnType<typeof vi.fn>; identify: ReturnType<typeof vi.fn> }

  const mockUmami = (): UmamiMock => ({
    track: vi.fn(),
    identify: vi.fn(),
  })

  beforeEach(() => {
    provider = new UmamiProvider()

    config = {
      provider: 'umami',
      domain: 'my-website-id-uuid',
      scriptUrl: SCRIPT_URL,
      debug: false,
      trackPageviews: true,
      trackWebVitals: true,
      trackScrollDepth: true,
      respectDNT: true,
    }

    delete window.umami
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
    vi.unstubAllEnvs()
  })

  describe('init', () => {
    it('should inject script with data-website-id attribute', () => {
      provider.init(config)

      const script = document.querySelector('script[data-website-id]') as HTMLScriptElement
      expect(script).toBeTruthy()
      expect(script.src).toBe(SCRIPT_URL)
      expect(script.getAttribute('data-website-id')).toBe('my-website-id-uuid')
      expect(script.async).toBe(true)
    })

    it('should warn and not init when scriptUrl is missing', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      vi.stubEnv('DEV', true)

      provider.init({ ...config, scriptUrl: undefined })

      expect(document.querySelector('script[data-website-id]')).toBeNull()
      expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('requires a scriptUrl'))

      consoleWarnSpy.mockRestore()
      vi.unstubAllEnvs()
    })

    it('should warn and not init when scriptUrl is non-HTTPS', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      vi.stubEnv('DEV', true)

      provider.init({ ...config, scriptUrl: 'http://insecure.com/umami.js' })

      expect(document.querySelector('script[data-website-id]')).toBeNull()
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('must be HTTPS'),
        'http://insecure.com/umami.js'
      )

      consoleWarnSpy.mockRestore()
      vi.unstubAllEnvs()
    })

    it('should warn and not init when scriptUrl has no .js extension', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      vi.stubEnv('DEV', true)

      provider.init({ ...config, scriptUrl: 'https://example.com/tracker' })

      expect(document.querySelector('script[data-website-id]')).toBeNull()
      expect(consoleWarnSpy).toHaveBeenCalled()

      consoleWarnSpy.mockRestore()
      vi.unstubAllEnvs()
    })

    it('should not initialize twice', () => {
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      const debugConfig = { ...config, debug: true }

      provider.init(debugConfig)
      provider.init(debugConfig)

      expect(consoleLogSpy).toHaveBeenCalledWith('[Analytics] Umami already initialized')
      consoleLogSpy.mockRestore()
    })

    it('should not initialize when Do Not Track is enabled', () => {
      Object.defineProperty(navigator, 'doNotTrack', { writable: true, value: '1' })
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      provider.init({ ...config, debug: true })

      expect(consoleLogSpy).toHaveBeenCalledWith(
        '[Analytics] Do Not Track is enabled, analytics disabled'
      )
      expect(document.querySelector('script[data-website-id]')).toBeNull()
      consoleLogSpy.mockRestore()
    })

    it('should ignore DNT when respectDNT is false', () => {
      Object.defineProperty(navigator, 'doNotTrack', { writable: true, value: '1' })

      provider.init({ ...config, respectDNT: false })

      expect(document.querySelector('script[data-website-id]')).toBeTruthy()
    })

    it('should set data-auto-track="false" when trackPageviews is disabled', () => {
      provider.init({ ...config, trackPageviews: false })

      const script = document.querySelector('script[data-website-id]') as HTMLScriptElement
      expect(script.getAttribute('data-auto-track')).toBe('false')
    })

    it('should handle script load success', () => {
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      provider.init({ ...config, debug: true })

      const script = document.querySelector('script[data-website-id]') as HTMLScriptElement
      window.umami = mockUmami()
      script.onload?.(new Event('load'))

      expect(consoleLogSpy).toHaveBeenCalledWith('[Analytics] Umami script loaded successfully')
      expect(provider.isEnabled()).toBe(true)
      consoleLogSpy.mockRestore()
    })

    it('should handle script load error', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      provider.init({ ...config, debug: true })

      const script = document.querySelector('script[data-website-id]') as HTMLScriptElement
      script.onerror?.(new Event('error'))

      expect(consoleWarnSpy).toHaveBeenCalledWith('[Analytics] Failed to load Umami script')
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
      expect(document.querySelector('script[data-website-id]')).toBeNull()
    })

    it('should detect navigator.doNotTrack = "yes"', () => {
      Object.defineProperty(navigator, 'doNotTrack', { writable: true, value: 'yes' })

      provider.init(config)
      expect(document.querySelector('script[data-website-id]')).toBeNull()
    })

    it('should not inject a second script when loadScript is called while already loaded', () => {
      provider.init(config)
      window.umami = mockUmami()

      const script = document.querySelector('script[data-website-id]') as HTMLScriptElement
      script.onload?.(new Event('load'))

      // scriptLoaded is now true; manually trigger loadScript via the internal state path
      ;(provider as unknown as { loadScript: () => void }).loadScript()

      // Only one script should be in the DOM
      expect(document.querySelectorAll('script[data-website-id]').length).toBe(1)
    })
  })

  describe('trackPageView', () => {
    beforeEach(() => {
      provider.init(config)
      window.umami = mockUmami()

      const script = document.querySelector('script[data-website-id]') as HTMLScriptElement
      script.onload?.(new Event('load'))
    })

    it('should track page view with current pathname by default', () => {
      provider.trackPageView()

      expect(window.umami!.track).toHaveBeenCalledWith(expect.any(Function))
      const callback = vi.mocked(window.umami!.track).mock.calls[0][0] as (
        p: Record<string, unknown>
      ) => Record<string, unknown>
      expect(callback({ title: 'Home' })).toEqual({ title: 'Home', url: window.location.pathname })
    })

    it('should track page view with custom URL', () => {
      provider.trackPageView('/features')

      expect(window.umami!.track).toHaveBeenCalledWith(expect.any(Function))
      const callback = vi.mocked(window.umami!.track).mock.calls[0][0] as (
        p: Record<string, unknown>
      ) => Record<string, unknown>
      expect(callback({ title: 'Features' })).toEqual({ title: 'Features', url: '/features' })
    })

    it('should not track when provider is not enabled', () => {
      provider.disable()
      const umamiMock = mockUmami()
      window.umami = umamiMock

      provider.trackPageView()

      expect(umamiMock.track).not.toHaveBeenCalled()
    })
  })

  describe('trackEvent', () => {
    beforeEach(() => {
      provider.init(config)
      window.umami = mockUmami()

      const script = document.querySelector('script[data-website-id]') as HTMLScriptElement
      script.onload?.(new Event('load'))
    })

    it('should call umami.track with event name and no props', () => {
      const event: AnalyticsEvent = { name: 'cta_click' }
      provider.trackEvent(event)

      expect(window.umami!.track).toHaveBeenCalledWith('cta_click', undefined)
    })

    it('should call umami.track with event name and properties', () => {
      const event: AnalyticsEvent = {
        name: 'download_click',
        properties: { platform: 'mac', location: 'hero' },
      }
      provider.trackEvent(event)

      expect(window.umami!.track).toHaveBeenCalledWith('download_click', {
        platform: 'mac',
        location: 'hero',
      })
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

      expect(window.umami!.track).toHaveBeenCalledWith('test_event', { valid: 'value' })
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

      expect(window.umami!.track).toHaveBeenCalledWith('test_event', { safe: 'ok' })
    })

    it('should not track when provider is not enabled', () => {
      provider.disable()
      const umamiMock = mockUmami()
      window.umami = umamiMock

      provider.trackEvent({ name: 'test_event' })

      expect(umamiMock.track).not.toHaveBeenCalled()
    })
  })

  describe('trackWebVitals', () => {
    beforeEach(() => {
      provider.init(config)
      window.umami = mockUmami()

      const script = document.querySelector('script[data-website-id]') as HTMLScriptElement
      script.onload?.(new Event('load'))
    })

    it('should track each defined Core Web Vitals metric', () => {
      const vitals: CoreWebVitals = { LCP: 2500, CLS: 0.12345 }
      provider.trackWebVitals(vitals)

      expect(window.umami!.track).toHaveBeenCalledTimes(2)
      expect(window.umami!.track).toHaveBeenCalledWith('web_vitals', {
        metric: 'LCP',
        value: 2500,
      })
      expect(window.umami!.track).toHaveBeenCalledWith('web_vitals', {
        metric: 'CLS',
        value: 0.123,
      })
    })

    it('should skip undefined metrics', () => {
      const vitals: CoreWebVitals = { LCP: 2500, FID: undefined }
      provider.trackWebVitals(vitals)

      expect(window.umami!.track).toHaveBeenCalledTimes(1)
    })

    it('should not track when provider is not enabled', () => {
      provider.disable()
      const umamiMock = mockUmami()
      window.umami = umamiMock

      provider.trackWebVitals({ LCP: 2500 })

      expect(umamiMock.track).not.toHaveBeenCalled()
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
      window.umami = mockUmami()

      const script = document.querySelector('script[data-website-id]') as HTMLScriptElement
      script.onload?.(new Event('load'))

      expect(provider.isEnabled()).toBe(true)
    })

    it('should return false after disable', () => {
      provider.init(config)
      window.umami = mockUmami()

      const script = document.querySelector('script[data-website-id]') as HTMLScriptElement
      script.onload?.(new Event('load'))

      provider.disable()

      expect(provider.isEnabled()).toBe(false)
    })

    it('should return false when window.umami exists but track is not a function', () => {
      provider.init(config)
      window.umami = { track: 'not-a-function' } as unknown as typeof window.umami

      const script = document.querySelector('script[data-website-id]') as HTMLScriptElement
      script.onload?.(new Event('load'))

      expect(provider.isEnabled()).toBe(false)
    })
  })

  describe('disable', () => {
    it('should reset state and remove script', () => {
      provider.init(config)
      expect(document.querySelector('script[data-website-id]')).toBeTruthy()

      provider.disable()

      expect(document.querySelector('script[data-website-id]')).toBeNull()
      expect(provider.isEnabled()).toBe(false)
    })

    it('should delete window.umami', () => {
      provider.init(config)
      window.umami = mockUmami()

      const script = document.querySelector('script[data-website-id]') as HTMLScriptElement
      script.onload?.(new Event('load'))

      provider.disable()

      expect(window.umami).toBeUndefined()
    })

    it('should log debug message when debug is enabled', () => {
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      const debugProvider = new UmamiProvider()
      debugProvider.init({ ...config, debug: true })

      debugProvider.disable()

      expect(consoleLogSpy).toHaveBeenCalledWith('[Analytics] Umami disabled')
      consoleLogSpy.mockRestore()
    })
  })
})
