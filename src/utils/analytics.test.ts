import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  isAnalyticsAvailable,
  trackEvent,
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

    // Mock requestAnimationFrame
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.stubGlobal('requestAnimationFrame', (cb: any) => {
      cb()
      return 0
    })
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
      Object.defineProperty(document.documentElement, 'scrollHeight', {
        value: 1000,
        configurable: true,
      })
      Object.defineProperty(window, 'innerHeight', { value: 500, configurable: true })
      Object.defineProperty(window, 'scrollY', { value: 250, writable: true, configurable: true })

      const addSpy = vi.spyOn(window, 'addEventListener')
      initScrollDepthTracking()

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const scrollHandler = addSpy.mock.calls.find((call) => call[0] === 'scroll')?.[1] as any
      scrollHandler()

      // 75% depth -> milestones 25, 50, 75
      expect(mockGtag).toHaveBeenCalledWith('event', AnalyticsEvents.SCROLL_DEPTH, {
        depth_percentage: 25,
      })
      expect(mockGtag).toHaveBeenCalledWith('event', AnalyticsEvents.SCROLL_DEPTH, {
        depth_percentage: 50,
      })
      expect(mockGtag).toHaveBeenCalledWith('event', AnalyticsEvents.SCROLL_DEPTH, {
        depth_percentage: 75,
      })
    })
  })
})
