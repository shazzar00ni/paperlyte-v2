import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  isAnalyticsAvailable,
  trackEvent,
  trackPageView,
  trackCTAClick,
  trackExternalLink,
  trackSocialClick,
  initScrollDepthTracking,
  AnalyticsEvents,
  shouldRenderAnalytics,
} from './analytics'

describe('Analytics Utility', () => {
  beforeEach(() => {
    // Clear any existing gtag
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (window as any).gtag
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (window as any).dataLayer

    // Mock environment to production and a real domain by default
    vi.stubEnv('PROD', 'true')
    vi.stubGlobal('location', { hostname: 'paperlyte.app' })

    // Mock requestAnimationFrame to execute synchronously by default
    vi.stubGlobal('requestAnimationFrame', vi.fn((cb: FrameRequestCallback) => {
        cb(0)
        return 0
    }))
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  describe('shouldRenderAnalytics', () => {
    it('should return false when not in production', () => {
      expect(shouldRenderAnalytics(false, 'paperlyte.com')).toBe(false)
    })

    it('should return false when on localhost even in production', () => {
      expect(shouldRenderAnalytics(true, 'localhost')).toBe(false)
      expect(shouldRenderAnalytics(true, '127.0.0.1')).toBe(false)
    })

    it('should return true in production on a real domain', () => {
      expect(shouldRenderAnalytics(true, 'paperlyte.app')).toBe(true)
      expect(shouldRenderAnalytics(true, 'www.paperlyte.com')).toBe(true)
    })

    it('should use default parameters and return true in mocked prod env', () => {
        expect(shouldRenderAnalytics()).toBe(true)
    })

    it('should return false on localhost with default parameters', () => {
        vi.stubGlobal('location', { hostname: 'localhost' })
        expect(shouldRenderAnalytics()).toBe(false)
    })

    it('should handle undefined window gracefully', () => {
        const originalWindow = global.window
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        delete (global as any).window
        expect(shouldRenderAnalytics(true)).toBe(true)
        global.window = originalWindow
    })
  })

  describe('isAnalyticsAvailable', () => {
    it('should return false when gtag is not available', () => {
      expect(isAnalyticsAvailable()).toBe(false)
    })

    it('should return true when gtag is available', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(window as any).gtag = vi.fn()
      expect(isAnalyticsAvailable()).toBe(true)
    })
  })

  describe('trackEvent', () => {
    it('should call gtag with correct parameters when available and enabled', () => {
      const mockGtag = vi.fn()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(window as any).gtag = mockGtag

      trackEvent('test_event', { param1: 'value1', param2: 123 })

      expect(mockGtag).toHaveBeenCalledWith('event', 'test_event', {
        param1: 'value1',
        param2: 123,
      })
    })

    it('should NOT call gtag when on localhost', () => {
      const mockGtag = vi.fn()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(window as any).gtag = mockGtag
      vi.stubGlobal('location', { hostname: 'localhost' })

      trackEvent('test_event')

      expect(mockGtag).not.toHaveBeenCalled()
    })

    it('should handle errors gracefully', () => {
      const mockGtag = vi.fn(() => {
        throw new Error('Analytics error')
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(window as any).gtag = mockGtag

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      trackEvent('test_event')

      expect(consoleSpy).toHaveBeenCalled()
      consoleSpy.mockRestore()
    })

    it('should return early if gtag is missing but enabled', () => {
        const mockGtag = vi.fn()
        // Ensure shouldRenderAnalytics returns true but gtag is missing
        expect(isAnalyticsAvailable()).toBe(false)
        expect(shouldRenderAnalytics()).toBe(true)

        trackEvent('test_event')
        expect(mockGtag).not.toHaveBeenCalled()
    })

    it('should handle unsafe property keys and warn in DEV', () => {
        const mockGtag = vi.fn()
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(window as any).gtag = mockGtag

        vi.stubEnv('DEV', 'true')
        const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

        trackEvent('test', { constructor: 'pollute' })

        expect(mockGtag).toHaveBeenCalledWith('event', 'test', {})
        expect(consoleSpy).toHaveBeenCalledWith('[Analytics] Blocked potentially unsafe property key:', 'constructor')
        consoleSpy.mockRestore()
    })
  })

  describe('trackPageView', () => {
    it('should track page view when enabled', () => {
      const mockGtag = vi.fn()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(window as any).gtag = mockGtag

      trackPageView('/test', 'Test Page')

      expect(mockGtag).toHaveBeenCalledWith('event', 'page_view', {
        page_path: '/test',
        page_title: 'Test Page',
      })
    })

    it('should not track page view when disabled', () => {
      const mockGtag = vi.fn()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(window as any).gtag = mockGtag
      vi.stubGlobal('location', { hostname: 'localhost' })

      trackPageView('/test')

      expect(mockGtag).not.toHaveBeenCalled()
    })

    it('should log to console when enabled but gtag missing (simulated dev)', () => {
        // Force shouldRenderAnalytics to true but keep gtag missing
        vi.stubEnv('PROD', 'true')
        vi.stubEnv('DEV', 'true')
        const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

        trackPageView('/dev-test', 'Title')

        expect(consoleSpy).toHaveBeenCalledWith('[Analytics] Page View:', '/dev-test', 'Title')
        consoleSpy.mockRestore()
    })

    it('should handle errors in gtag gracefully', () => {
        const mockGtag = vi.fn(() => { throw new Error('fail') })
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(window as any).gtag = mockGtag
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

        trackPageView('/error-test')

        expect(consoleSpy).toHaveBeenCalled()
        consoleSpy.mockRestore()
    })
  })

  describe('CTA Tracking', () => {
    it('should track CTA clicks', () => {
      const mockGtag = vi.fn()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(window as any).gtag = mockGtag

      trackCTAClick('Get Started', 'hero')

      expect(mockGtag).toHaveBeenCalledWith('event', AnalyticsEvents.CTA_CLICK, {
        button_text: 'Get Started',
        button_location: 'hero',
      })
    })

    it('should track external link clicks', () => {
      const mockGtag = vi.fn()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(window as any).gtag = mockGtag

      trackExternalLink('https://twitter.com', 'Twitter')

      expect(mockGtag).toHaveBeenCalledWith('event', AnalyticsEvents.EXTERNAL_LINK_CLICK, {
        link_url: 'https://twitter.com',
        link_text: 'Twitter',
      })
    })

    it('should track social clicks', () => {
      const mockGtag = vi.fn()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(window as any).gtag = mockGtag

      trackSocialClick('GitHub')

      expect(mockGtag).toHaveBeenCalledWith('event', AnalyticsEvents.SOCIAL_LINK_CLICK, {
        platform: 'github',
      })
    })
  })

  describe('PII filtering', () => {
    it('should strip PII fields from event parameters', () => {
      const mockGtag = vi.fn()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(window as any).gtag = mockGtag

      const paramsWithPII = {
        safe_param: 'safe_value',
        email: 'user@example.com',
        user_email: 'user@test.com',
        button_location: 'hero',
      }

      trackEvent('test_event', paramsWithPII)

      expect(mockGtag).toHaveBeenCalledWith('event', 'test_event', {
        safe_param: 'safe_value',
        button_location: 'hero',
      })
    })

    it('should strip fields that look like email addresses', () => {
        const mockGtag = vi.fn()
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(window as any).gtag = mockGtag

        trackEvent('test', { some_field: 'test@example.com' })

        expect(mockGtag).toHaveBeenCalledWith('event', 'test', {})
    })
  })

  describe('initScrollDepthTracking', () => {
    it('should not add listener when on localhost', () => {
      vi.stubGlobal('location', { hostname: 'localhost' })
      const addSpy = vi.spyOn(window, 'addEventListener')

      initScrollDepthTracking()

      expect(addSpy).not.toHaveBeenCalledWith('scroll', expect.any(Function), expect.any(Object))
    })

    it('should track scroll milestones when scrolling in production', () => {
      const mockGtag = vi.fn()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(window as any).gtag = mockGtag

      // Mock document dimensions
      Object.defineProperty(document.documentElement, 'scrollHeight', { value: 1000, configurable: true })
      Object.defineProperty(window, 'innerHeight', { value: 500, configurable: true })
      Object.defineProperty(window, 'scrollY', { value: 250, writable: true, configurable: true })

      const addSpy = vi.spyOn(window, 'addEventListener')
      initScrollDepthTracking()

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const scrollHandler = addSpy.mock.calls.find(call => call[0] === 'scroll')?.[1] as EventListener
      scrollHandler(new Event('scroll'))

      // 75% depth -> milestones 25, 50, 75
      expect(mockGtag).toHaveBeenCalledWith('event', AnalyticsEvents.SCROLL_DEPTH, { depth_percentage: 25 })
      expect(mockGtag).toHaveBeenCalledWith('event', AnalyticsEvents.SCROLL_DEPTH, { depth_percentage: 50 })
      expect(mockGtag).toHaveBeenCalledWith('event', AnalyticsEvents.SCROLL_DEPTH, { depth_percentage: 75 })
    })

    it('should remove listener on cleanup', () => {
        const removeSpy = vi.spyOn(window, 'removeEventListener')
        const cleanup = initScrollDepthTracking()
        cleanup()
        expect(removeSpy).toHaveBeenCalledWith('scroll', expect.any(Function))
    })

    it('should handle zero document height', () => {
        Object.defineProperty(document.documentElement, 'scrollHeight', { value: 0, configurable: true })
        const addSpy = vi.spyOn(window, 'addEventListener')
        initScrollDepthTracking()
        const handler = addSpy.mock.calls.find(c => c[0] === 'scroll')![1] as EventListener
        expect(() => handler(new Event('scroll'))).not.toThrow()
    })

    it('should throttle scroll events', () => {
        const mockGtag = vi.fn()
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(window as any).gtag = mockGtag

        let frameCb: FrameRequestCallback | null = null
        vi.stubGlobal('requestAnimationFrame', vi.fn((cb: FrameRequestCallback) => {
            frameCb = cb
            return 1
        }))

        Object.defineProperty(document.documentElement, 'scrollHeight', { value: 1000, configurable: true })
        Object.defineProperty(window, 'innerHeight', { value: 500, configurable: true })
        Object.defineProperty(window, 'scrollY', { value: 500, writable: true, configurable: true })

        const addSpy = vi.spyOn(window, 'addEventListener')
        initScrollDepthTracking()
        const handler = addSpy.mock.calls.find(c => c[0] === 'scroll')![1] as EventListener

        // Call twice rapidly
        handler(new Event('scroll'))
        handler(new Event('scroll'))

        expect(vi.mocked(window.requestAnimationFrame)).toHaveBeenCalledTimes(1)
        expect(mockGtag).not.toHaveBeenCalled() // Still waiting for RAF

        if (frameCb) frameCb(0)

        expect(mockGtag).toHaveBeenCalled()

        // Now ticking is false again. Another call should trigger another RAF.
        handler(new Event('scroll'))
        expect(vi.mocked(window.requestAnimationFrame)).toHaveBeenCalledTimes(2)
    })
  })
})
