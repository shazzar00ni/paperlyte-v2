/**
 * Tests for Fathom Analytics provider
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { FathomProvider } from './fathom'
import type { AnalyticsConfig, AnalyticsEvent, CoreWebVitals } from '../types'

const removeFathomScripts = (): void => {
  document.querySelectorAll('script[data-site]').forEach((el) => el.remove())
}

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
    removeFathomScripts()

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
    it('should inject script with default URL and data-site attribute', () => {
      provider.init(config)

      const script = document.querySelector('script[data-site]') as HTMLScriptElement
      expect(script).toBeTruthy()
      expect(script.src).toBe('https://cdn.usefathom.com/script.js')
      expect(script.getAttribute('data-site')).toBe('ABCDEFGH')
      expect(script.async).toBe(true)
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

    it('should warn when trackPageviews is false because Fathom cannot suppress the initial pageview', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      provider.init({ ...config, debug: true, trackPageviews: false })

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Fathom does not support disabling automatic pageview tracking')
      )
      // Script is still injected — the limitation is documented, not a hard block
      expect(document.querySelector('script[data-site]')).toBeTruthy()
      consoleWarnSpy.mockRestore()
    })

    it('should not warn about trackPageviews when trackPageviews is true', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      provider.init({ ...config, debug: true, trackPageviews: true })

      expect(consoleWarnSpy).not.toHaveBeenCalledWith(
        expect.stringContaining('Fathom does not support disabling automatic pageview tracking')
      )
      consoleWarnSpy.mockRestore()
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

    it('should not inject a second script when loadScript is called while already loaded', () => {
      provider.init(config)
      window.fathom = mockFathom()

      const script = document.querySelector('script[data-site]') as HTMLScriptElement
      script.onload?.(new Event('load'))

      // scriptLoaded is now true; manually trigger loadScript via the internal state path
      ;(provider as unknown as { loadScript: () => void }).loadScript()

      // Only one script should be in the DOM
      expect(document.querySelectorAll('script[data-site]').length).toBe(1)
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
      provider.init({ ...config, goalCodes: { example_event: 'ABCD1234', cta_click: 'WXYZ9876' } })
      window.fathom = mockFathom()

      const script = document.querySelector('script[data-site]') as HTMLScriptElement
      script.onload?.(new Event('load'))
    })

    it('should call trackGoal with the mapped goal code and zero value', () => {
      const event: AnalyticsEvent = { name: 'example_event' }
      provider.trackEvent(event)

      expect(window.fathom!.trackGoal).toHaveBeenCalledWith('ABCD1234', 0, undefined)
    })

    it('should resolve the goal code from the event name mapping', () => {
      provider.trackEvent({ name: 'cta_click' })

      expect(window.fathom!.trackGoal).toHaveBeenCalledWith('WXYZ9876', 0, undefined)
    })

    it('should skip and warn when event name has no goal code mapping (debug mode)', () => {
      removeFathomScripts()
      const warnProvider = new FathomProvider()
      warnProvider.init({ ...config, debug: true, goalCodes: {} })
      window.fathom = mockFathom()

      const script = document.querySelector('script[data-site]') as HTMLScriptElement
      script.onload?.(new Event('load'))

      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      warnProvider.trackEvent({ name: 'scroll_depth' })

      expect(window.fathom!.trackGoal).not.toHaveBeenCalled()
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('no goal code mapped for event "scroll_depth"')
      )
      consoleWarnSpy.mockRestore()
    })

    it('should skip silently when event name has no goal code mapping (non-debug mode)', () => {
      removeFathomScripts()
      const silentProvider = new FathomProvider()
      silentProvider.init({ ...config, debug: false, goalCodes: {} })
      window.fathom = mockFathom()

      const script = document.querySelector('script[data-site]') as HTMLScriptElement
      script.onload?.(new Event('load'))

      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      silentProvider.trackEvent({ name: 'scroll_depth' })

      expect(window.fathom!.trackGoal).not.toHaveBeenCalled()
      expect(consoleWarnSpy).not.toHaveBeenCalled()
      consoleWarnSpy.mockRestore()
    })

    it('should skip when no goalCodes config is provided at all', () => {
      removeFathomScripts()
      const noMapProvider = new FathomProvider()
      noMapProvider.init(config) // no goalCodes
      window.fathom = mockFathom()

      const script = document.querySelector('script[data-site]') as HTMLScriptElement
      script.onload?.(new Event('load'))

      noMapProvider.trackEvent({ name: 'ABCD1234' })

      expect(window.fathom!.trackGoal).not.toHaveBeenCalled()
    })

    it('should pass sanitised properties to trackGoal', () => {
      const event: AnalyticsEvent = {
        name: 'example_event',
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
        name: 'example_event',
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
      const properties: Record<string, unknown> = { safe: 'ok' }
      Object.defineProperty(properties, '__proto__', {
        value: { bad: true },
        enumerable: true,
        configurable: true,
        writable: true,
      })
      const event: AnalyticsEvent = { name: 'example_event', properties }
      provider.trackEvent(event)

      expect(window.fathom!.trackGoal).toHaveBeenCalledWith('ABCD1234', 0, { safe: 'ok' })
    })

    it('should log debug message with goal code when debug is enabled', () => {
      removeFathomScripts()
      const debugProvider = new FathomProvider()
      debugProvider.init({ ...config, debug: true, goalCodes: { cta_click: 'GOAL1234' } })
      window.fathom = mockFathom()

      const script = document.querySelector('script[data-site]') as HTMLScriptElement
      script.onload?.(new Event('load'))

      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      debugProvider.trackEvent({ name: 'cta_click' })

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

    it('should not call trackGoal (Fathom requires explicit goal codes for web vitals)', () => {
      const vitals: CoreWebVitals = { LCP: 2500, CLS: 0.12345, FCP: 1800 }
      provider.trackWebVitals(vitals)

      expect(window.fathom!.trackGoal).not.toHaveBeenCalled()
    })

    it('should return early when provider is not enabled', () => {
      provider.disable()
      const fathomMock = mockFathom()
      window.fathom = fathomMock

      // No throw and no trackGoal call – covers the isEnabled() early-return branch
      provider.trackWebVitals({ LCP: 2500, CLS: 0.1 })

      expect(fathomMock.trackGoal).not.toHaveBeenCalled()
    })

    it('should log a debug warning when metrics are present and debug is enabled', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      removeFathomScripts()
      Object.defineProperty(window, 'doNotTrack', {
        writable: true,
        configurable: true,
        value: null,
      })
      const debugProvider = new FathomProvider()
      debugProvider.init({ ...config, debug: true })
      window.fathom = mockFathom()

      const script = document.querySelector('script[data-site]') as HTMLScriptElement
      script.onload?.(new Event('load'))

      debugProvider.trackWebVitals({ LCP: 2500, CLS: 0.12345 })

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Fathom does not track Web Vitals')
      )
      consoleWarnSpy.mockRestore()
    })

    it('should not log a warning when no metrics are defined (debug enabled)', () => {
      // Use debug: true so the "skipped metrics" branch is actually entered;
      // the assertion then meaningfully verifies that an empty vitals object produces no warning.
      removeFathomScripts()
      const debugProvider = new FathomProvider()
      debugProvider.init({ ...config, debug: true })
      window.fathom = mockFathom()

      const script = document.querySelector('script[data-site]') as HTMLScriptElement
      script.onload?.(new Event('load'))

      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      debugProvider.trackWebVitals({ LCP: undefined, FID: undefined })
      expect(consoleWarnSpy).not.toHaveBeenCalled()
      consoleWarnSpy.mockRestore()
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

    it('should return false when window.fathom exists but methods are not functions', () => {
      provider.init(config)
      window.fathom = {
        trackPageview: 'not-a-function',
        trackGoal: 'not-a-function',
      } as unknown as typeof window.fathom

      const script = document.querySelector('script[data-site]') as HTMLScriptElement
      script.onload?.(new Event('load'))

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
