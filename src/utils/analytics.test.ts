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
} from './analytics'

describe('Analytics Utility', () => {
  beforeEach(() => {
    // Clear any existing gtag
    delete (window as Window & { gtag?: unknown }).gtag
    delete (window as Window & { dataLayer?: unknown }).dataLayer
  })

  describe('isAnalyticsAvailable', () => {
    it('should return false when gtag is not available', () => {
      expect(isAnalyticsAvailable()).toBe(false)
    })

    it('should return true when gtag is available', () => {
      ;(window as Window & { gtag?: () => void }).gtag = vi.fn()
      expect(isAnalyticsAvailable()).toBe(true)
    })
  })

  describe('trackEvent', () => {
    it('should call gtag with correct parameters when available', () => {
      const mockGtag = vi.fn()
      ;(window as Window & { gtag?: typeof mockGtag }).gtag = mockGtag

      trackEvent('test_event', { param1: 'value1', param2: 123 })

      expect(mockGtag).toHaveBeenCalledWith('event', 'test_event', {
        param1: 'value1',
        param2: 123,
      })
    })

    it('should not throw error when gtag is not available', () => {
      expect(() => {
        trackEvent('test_event')
      }).not.toThrow()
    })

    it('should handle errors gracefully', () => {
      const mockGtag = vi.fn(() => {
        throw new Error('Analytics error')
      })
      ;(window as Window & { gtag?: typeof mockGtag }).gtag = mockGtag

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      trackEvent('test_event')

      expect(consoleSpy).toHaveBeenCalled()
      consoleSpy.mockRestore()
    })

    it('should track event without parameters', () => {
      const mockGtag = vi.fn()
      ;(window as Window & { gtag?: typeof mockGtag }).gtag = mockGtag

      trackEvent('simple_event')

      expect(mockGtag).toHaveBeenCalledWith('event', 'simple_event', undefined)
    })

    it('should block prototype pollution via __proto__ property', () => {
      const mockGtag = vi.fn()
      ;(window as Window & { gtag?: typeof mockGtag }).gtag = mockGtag

      const maliciousParams = {
        safe_param: 'safe_value',
        __proto__: { polluted: 'bad' },
      } as Record<string, unknown>

      trackEvent('test_event', maliciousParams)

      // Should only include safe_param, not __proto__
      expect(mockGtag).toHaveBeenCalledWith('event', 'test_event', {
        safe_param: 'safe_value',
      })
    })

    it('should block prototype pollution via constructor property', () => {
      const mockGtag = vi.fn()
      ;(window as Window & { gtag?: typeof mockGtag }).gtag = mockGtag

      const maliciousParams = {
        safe_param: 'safe_value',
        constructor: { polluted: 'bad' },
      } as Record<string, unknown>

      trackEvent('test_event', maliciousParams)

      // Should only include safe_param, not constructor
      expect(mockGtag).toHaveBeenCalledWith('event', 'test_event', {
        safe_param: 'safe_value',
      })
    })

    it('should block prototype pollution via prototype property', () => {
      const mockGtag = vi.fn()
      ;(window as Window & { gtag?: typeof mockGtag }).gtag = mockGtag

      const maliciousParams = {
        safe_param: 'safe_value',
        prototype: { polluted: 'bad' },
      } as Record<string, unknown>

      trackEvent('test_event', maliciousParams)

      // Should only include safe_param, not prototype
      expect(mockGtag).toHaveBeenCalledWith('event', 'test_event', {
        safe_param: 'safe_value',
      })
    })
  })

  describe('trackPageView', () => {
    it('should track page view with path and title', () => {
      const mockGtag = vi.fn()
      ;(window as Window & { gtag?: typeof mockGtag }).gtag = mockGtag

      trackPageView('/privacy', 'Privacy Policy')

      expect(mockGtag).toHaveBeenCalledWith('event', 'page_view', {
        page_path: '/privacy',
        page_title: 'Privacy Policy',
      })
    })

    it('should track page view with only path', () => {
      const mockGtag = vi.fn()
      ;(window as Window & { gtag?: typeof mockGtag }).gtag = mockGtag

      trackPageView('/about')

      expect(mockGtag).toHaveBeenCalledWith('event', 'page_view', {
        page_path: '/about',
        page_title: undefined,
      })
    })
  })

  describe('trackCTAClick', () => {
    it('should track CTA click with button text and location', () => {
      const mockGtag = vi.fn()
      ;(window as Window & { gtag?: typeof mockGtag }).gtag = mockGtag

      trackCTAClick('Join Waitlist', 'hero')

      expect(mockGtag).toHaveBeenCalledWith('event', AnalyticsEvents.CTA_CLICK, {
        button_text: 'Join Waitlist',
        button_location: 'hero',
      })
    })

    it('should track multiple CTA clicks with different parameters', () => {
      const mockGtag = vi.fn()
      ;(window as Window & { gtag?: typeof mockGtag }).gtag = mockGtag

      trackCTAClick('Sign Up', 'header')
      trackCTAClick('Learn More', 'features')

      expect(mockGtag).toHaveBeenCalledTimes(2)
    })
  })

  describe('trackExternalLink', () => {
    it('should track external link click', () => {
      const mockGtag = vi.fn()
      ;(window as Window & { gtag?: typeof mockGtag }).gtag = mockGtag

      trackExternalLink('https://example.com', 'Example Link')

      expect(mockGtag).toHaveBeenCalledWith('event', AnalyticsEvents.EXTERNAL_LINK_CLICK, {
        link_url: 'https://example.com',
        link_text: 'Example Link',
      })
    })
  })

  describe('trackSocialClick', () => {
    it('should track social media click with lowercase platform', () => {
      const mockGtag = vi.fn()
      ;(window as Window & { gtag?: typeof mockGtag }).gtag = mockGtag

      trackSocialClick('Twitter')

      expect(mockGtag).toHaveBeenCalledWith('event', AnalyticsEvents.SOCIAL_LINK_CLICK, {
        platform: 'twitter',
      })
    })

    it('should normalize platform name to lowercase', () => {
      const mockGtag = vi.fn()
      ;(window as Window & { gtag?: typeof mockGtag }).gtag = mockGtag

      trackSocialClick('GITHUB')

      expect(mockGtag).toHaveBeenCalledWith('event', AnalyticsEvents.SOCIAL_LINK_CLICK, {
        platform: 'github',
      })
    })
  })

  describe('AnalyticsEvents', () => {
    it('should have all required event names', () => {
      expect(AnalyticsEvents.WAITLIST_JOIN).toBe('Waitlist_Join')
      expect(AnalyticsEvents.WAITLIST_SUBMIT).toBe('Waitlist_Submit')
      expect(AnalyticsEvents.WAITLIST_SUCCESS).toBe('Waitlist_Success')
      expect(AnalyticsEvents.WAITLIST_ERROR).toBe('Waitlist_Error')
      expect(AnalyticsEvents.CTA_CLICK).toBe('CTA_Click')
      expect(AnalyticsEvents.SCROLL_DEPTH).toBe('Scroll_Depth')
      expect(AnalyticsEvents.VIDEO_PLAY).toBe('Video_Play')
      expect(AnalyticsEvents.NAVIGATION_CLICK).toBe('Navigation_Click')
      expect(AnalyticsEvents.EXTERNAL_LINK_CLICK).toBe('External_Link_Click')
      expect(AnalyticsEvents.SOCIAL_LINK_CLICK).toBe('Social_Link_Click')
      expect(AnalyticsEvents.FAQ_EXPAND).toBe('FAQ_Expand')
    })
  })

  describe('PII filtering', () => {
    it('should strip PII fields from event parameters', () => {
      const mockGtag = vi.fn()
      ;(window as Window & { gtag?: typeof mockGtag }).gtag = mockGtag

      // These parameters contain PII that should be stripped
      const paramsWithPII = {
        safe_param: 'safe_value',
        email: 'user@example.com',
        user_email: 'user@test.com',
        button_location: 'hero',
      }

      trackEvent('test_event', paramsWithPII)

      // Should only include safe params, not PII keys
      expect(mockGtag).toHaveBeenCalledWith('event', 'test_event', {
        safe_param: 'safe_value',
        button_location: 'hero',
      })
    })

    it('should strip values that look like email addresses', () => {
      const mockGtag = vi.fn()
      ;(window as Window & { gtag?: typeof mockGtag }).gtag = mockGtag

      // A non-PII key but with a value that looks like an email
      const paramsWithEmailValue = {
        safe_param: 'safe_value',
        some_field: 'user@example.com',
      }

      trackEvent('test_event', paramsWithEmailValue)

      // Should strip the field with email-like value
      expect(mockGtag).toHaveBeenCalledWith('event', 'test_event', {
        safe_param: 'safe_value',
      })
    })

    it('should warn in DEV mode when PII is found and stripped', () => {
      const mockGtag = vi.fn()
      ;(window as Window & { gtag?: typeof mockGtag }).gtag = mockGtag

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      // Send params with PII
      trackEvent('test_event', {
        safe_param: 'value',
        email: 'test@example.com',
      })

      // In DEV mode, should warn about PII
      expect(consoleSpy).toHaveBeenCalledWith(
        '[Analytics] PII detected and removed from event parameters. Never send emails, passwords, or other sensitive data to analytics.'
      )

      consoleSpy.mockRestore()
    })

    it('should strip password and token fields', () => {
      const mockGtag = vi.fn()
      ;(window as Window & { gtag?: typeof mockGtag }).gtag = mockGtag

      const paramsWithSensitive = {
        safe_param: 'safe_value',
        password: 'secret123',
        auth_token: 'abc123',
        api_key: 'key123',
      }

      trackEvent('test_event', paramsWithSensitive)

      expect(mockGtag).toHaveBeenCalledWith('event', 'test_event', {
        safe_param: 'safe_value',
      })
    })
  })

  describe('trackPageView error handling', () => {
    it('should handle errors gracefully', () => {
      const mockGtag = vi.fn(() => {
        throw new Error('Analytics error')
      })
      ;(window as Window & { gtag?: typeof mockGtag }).gtag = mockGtag

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      trackPageView('/test', 'Test Page')

      expect(consoleSpy).toHaveBeenCalledWith(
        '[Analytics] Error tracking page view:',
        expect.any(Error)
      )
      consoleSpy.mockRestore()
    })

    it('should log page view in DEV mode when gtag is not available', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      trackPageView('/about', 'About Page')

      expect(consoleSpy).toHaveBeenCalledWith(
        '[Analytics] Page View:',
        '/about',
        'About Page'
      )
      consoleSpy.mockRestore()
    })
  })

  describe('initScrollDepthTracking', () => {
    let mockGtag: ReturnType<typeof vi.fn>
    let addEventListenerSpy: ReturnType<typeof vi.spyOn>
    let removeEventListenerSpy: ReturnType<typeof vi.spyOn>
    let rafSpy: ReturnType<typeof vi.spyOn>

    beforeEach(() => {
      mockGtag = vi.fn()
      ;(window as Window & { gtag?: typeof mockGtag }).gtag = mockGtag

      addEventListenerSpy = vi.spyOn(window, 'addEventListener')
      removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')
      rafSpy = vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
        cb(0)
        return 0
      })
    })

    afterEach(() => {
      addEventListenerSpy.mockRestore()
      removeEventListenerSpy.mockRestore()
      rafSpy.mockRestore()
    })

    it('should set up scroll event listener', () => {
      const cleanup = initScrollDepthTracking()

      expect(addEventListenerSpy).toHaveBeenCalledWith(
        'scroll',
        expect.any(Function),
        { passive: true }
      )

      cleanup()
    })

    it('should remove scroll event listener on cleanup', () => {
      const cleanup = initScrollDepthTracking()
      cleanup()

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'scroll',
        expect.any(Function)
      )
    })

    it('should track scroll milestones when scrolling', () => {
      // Mock document scroll dimensions
      Object.defineProperty(document.documentElement, 'scrollHeight', {
        value: 1000,
        configurable: true,
      })
      Object.defineProperty(window, 'innerHeight', {
        value: 500,
        configurable: true,
      })
      Object.defineProperty(window, 'scrollY', {
        value: 250,
        writable: true,
        configurable: true,
      })

      const cleanup = initScrollDepthTracking()

      // Get the scroll handler and call it
      const scrollHandler = addEventListenerSpy.mock.calls.find(
        (call) => call[0] === 'scroll'
      )?.[1] as EventListener

      // Simulate scroll to 75% (scrollY + innerHeight) / scrollHeight = (250 + 500) / 1000 = 75%
      scrollHandler(new Event('scroll'))

      // Should track all milestones up to 75%
      expect(mockGtag).toHaveBeenCalledWith('event', AnalyticsEvents.SCROLL_DEPTH, {
        depth_percentage: 25,
      })
      expect(mockGtag).toHaveBeenCalledWith('event', AnalyticsEvents.SCROLL_DEPTH, {
        depth_percentage: 50,
      })
      expect(mockGtag).toHaveBeenCalledWith('event', AnalyticsEvents.SCROLL_DEPTH, {
        depth_percentage: 75,
      })

      cleanup()
    })

    it('should not track same milestone twice', () => {
      // Mock document scroll dimensions
      Object.defineProperty(document.documentElement, 'scrollHeight', {
        value: 1000,
        configurable: true,
      })
      Object.defineProperty(window, 'innerHeight', {
        value: 500,
        configurable: true,
      })
      Object.defineProperty(window, 'scrollY', {
        value: 0,
        writable: true,
        configurable: true,
      })

      const cleanup = initScrollDepthTracking()

      const scrollHandler = addEventListenerSpy.mock.calls.find(
        (call) => call[0] === 'scroll'
      )?.[1] as EventListener

      // Scroll to 50% ((0 + 500) / 1000 = 50%)
      scrollHandler(new Event('scroll'))

      const callCount = mockGtag.mock.calls.filter(
        (call) => call[1] === AnalyticsEvents.SCROLL_DEPTH && call[2]?.depth_percentage === 25
      ).length

      // Scroll again to same position
      scrollHandler(new Event('scroll'))

      const newCallCount = mockGtag.mock.calls.filter(
        (call) => call[1] === AnalyticsEvents.SCROLL_DEPTH && call[2]?.depth_percentage === 25
      ).length

      // Should only track 25% milestone once
      expect(newCallCount).toBe(callCount)

      cleanup()
    })

    it('should handle zero document height gracefully', () => {
      Object.defineProperty(document.documentElement, 'scrollHeight', {
        value: 0,
        configurable: true,
      })
      Object.defineProperty(window, 'innerHeight', {
        value: 500,
        configurable: true,
      })
      Object.defineProperty(window, 'scrollY', {
        value: 0,
        writable: true,
        configurable: true,
      })

      const cleanup = initScrollDepthTracking()

      const scrollHandler = addEventListenerSpy.mock.calls.find(
        (call) => call[0] === 'scroll'
      )?.[1] as EventListener

      // Should not throw
      expect(() => scrollHandler(new Event('scroll'))).not.toThrow()

      // Should not track any milestones when document height is 0
      expect(mockGtag).not.toHaveBeenCalledWith(
        'event',
        AnalyticsEvents.SCROLL_DEPTH,
        expect.any(Object)
      )

      cleanup()
    })

    it('should throttle scroll events using requestAnimationFrame', () => {
      let frameCallback: FrameRequestCallback | null = null
      rafSpy.mockImplementation((cb) => {
        frameCallback = cb
        return 1
      })

      Object.defineProperty(document.documentElement, 'scrollHeight', {
        value: 1000,
        configurable: true,
      })
      Object.defineProperty(window, 'innerHeight', {
        value: 500,
        configurable: true,
      })
      Object.defineProperty(window, 'scrollY', {
        value: 500,
        writable: true,
        configurable: true,
      })

      const cleanup = initScrollDepthTracking()

      const scrollHandler = addEventListenerSpy.mock.calls.find(
        (call) => call[0] === 'scroll'
      )?.[1] as EventListener

      // Trigger multiple scroll events rapidly
      scrollHandler(new Event('scroll'))
      scrollHandler(new Event('scroll'))
      scrollHandler(new Event('scroll'))

      // requestAnimationFrame should only be called once until the frame callback executes
      expect(rafSpy).toHaveBeenCalledTimes(1)

      // Execute the frame callback
      if (frameCallback) {
        frameCallback(0)
      }

      // Now another scroll should trigger a new raf call
      scrollHandler(new Event('scroll'))
      expect(rafSpy).toHaveBeenCalledTimes(2)

      cleanup()
    })
  })
})
