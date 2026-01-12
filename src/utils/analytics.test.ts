import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
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

// Mock the global gtag function
const gtagMock = vi.fn()

describe('Analytics Utilities', () => {
  beforeEach(() => {
    // Assign the mock to the window object before each test
    window.gtag = gtagMock
  })

  afterEach(() => {
    // Reset mock history AND implementation after each test
    gtagMock.mockReset()
    // Remove the mock from the window object
    delete window.gtag
    // Restore all mocks and environment variables
    vi.restoreAllMocks()
    vi.unstubAllEnvs()
  })

  // Test isAnalyticsAvailable
  describe('isAnalyticsAvailable', () => {
    it('should return true when gtag is available on window', () => {
      expect(isAnalyticsAvailable()).toBe(true)
    })

    it('should return false when gtag is not available', () => {
      delete window.gtag
      expect(isAnalyticsAvailable()).toBe(false)
    })
  })

  // Test trackEvent
  describe('trackEvent', () => {
    it('should call gtag with the correct event name and parameters', () => {
      trackEvent('TestEvent', { param1: 'value1' })
      expect(gtagMock).toHaveBeenCalledWith('event', 'TestEvent', { param1: 'value1' })
    })

    it('should not call gtag if it is not available', () => {
      delete window.gtag
      trackEvent('TestEvent')
      expect(gtagMock).not.toHaveBeenCalled()
    })

    it('should handle errors thrown by gtag gracefully', () => {
      gtagMock.mockImplementation(() => {
        throw new Error('gtag failed')
      })
      // The test will pass if this does not throw an error
      expect(() => trackEvent('TestEvent')).not.toThrow()
    })

    it('should call gtag with undefined parameters when none are provided', () => {
      trackEvent('TestEvent')
      expect(gtagMock).toHaveBeenCalledWith('event', 'TestEvent', undefined)
    })
  })

  // Test trackPageView
  describe('trackPageView', () => {
    it('should track page views with the correct path and title', () => {
      trackPageView('/home', 'Home Page')
      expect(gtagMock).toHaveBeenCalledWith('event', 'page_view', {
        page_path: '/home',
        page_title: 'Home Page',
      })
    })

    it('should track page views with only a path', () => {
      trackPageView('/home')
      expect(gtagMock).toHaveBeenCalledWith('event', 'page_view', {
        page_path: '/home',
        page_title: undefined,
      })
    })
  })

  // Test trackCTAClick
  describe('trackCTAClick', () => {
    it('should track CTA clicks with the correct parameters', () => {
      trackCTAClick('Join Now', 'Header')
      expect(gtagMock).toHaveBeenCalledWith('event', AnalyticsEvents.CTA_CLICK, {
        button_text: 'Join Now',
        button_location: 'Header',
      })
    })
  })

  // Test trackExternalLink
  describe('trackExternalLink', () => {
    it('should track external link clicks with the correct URL and text', () => {
      trackExternalLink('https://example.com', 'Example Site')
      expect(gtagMock).toHaveBeenCalledWith('event', AnalyticsEvents.EXTERNAL_LINK_CLICK, {
        link_url: 'https://example.com',
        link_text: 'Example Site',
      })
    })
  })

  // Test trackSocialClick
  describe('trackSocialClick', () => {
    it('should track social media clicks with the correct platform', () => {
      trackSocialClick('Twitter')
      expect(gtagMock).toHaveBeenCalledWith('event', AnalyticsEvents.SOCIAL_LINK_CLICK, {
        platform: 'twitter',
      })
    })
  })

  // Test initScrollDepthTracking
  describe('initScrollDepthTracking', () => {
    let requestAnimationFrameMock: vi.SpyInstance

    beforeEach(() => {
      requestAnimationFrameMock = vi
        .spyOn(window, 'requestAnimationFrame')
        .mockImplementation((cb) => {
          cb(0)
          return 0
        })

      // Set default DOM dimensions for testing
      // windowHeight = 1000, documentHeight = 4000
      // Formula: scrollPercent = ((scrollTop + 1000) / 4000) * 100
      // 25% -> scrollTop = 0
      // 50% -> scrollTop = 1000
      // 75% -> scrollTop = 2000
      // 100% -> scrollTop = 3000
      Object.defineProperty(window, 'innerHeight', { value: 1000, configurable: true })
      Object.defineProperty(document.documentElement, 'scrollHeight', {
        value: 4000,
        configurable: true,
      })
    })

    // Helper to simulate scroll events
    const simulateScroll = (scrollY: number) => {
      Object.defineProperty(window, 'scrollY', { value: scrollY, configurable: true })
      window.dispatchEvent(new Event('scroll'))
    }

    it('should track 25% scroll depth milestone', () => {
      initScrollDepthTracking()
      simulateScroll(0) // Scroll to exactly 25%
      expect(gtagMock).toHaveBeenCalledTimes(1)
      expect(gtagMock).toHaveBeenCalledWith('event', AnalyticsEvents.SCROLL_DEPTH, {
        depth_percentage: 25,
      })
    })

    it('should track 50% scroll depth milestone', () => {
      initScrollDepthTracking()
      simulateScroll(999) // Scroll just before 50%
      simulateScroll(1000) // Scroll to exactly 50%
      // Should have tracked 25% and 50%
      expect(gtagMock).toHaveBeenCalledTimes(2)
      expect(gtagMock).toHaveBeenCalledWith('event', AnalyticsEvents.SCROLL_DEPTH, {
        depth_percentage: 50,
      })
    })

    it('should track 75% scroll depth milestone', () => {
      initScrollDepthTracking()
      simulateScroll(1999) // Scroll just before 75%
      simulateScroll(2000) // Scroll to exactly 75%
      // Should have tracked 25%, 50%, and 75%
      expect(gtagMock).toHaveBeenCalledTimes(3)
      expect(gtagMock).toHaveBeenCalledWith('event', AnalyticsEvents.SCROLL_DEPTH, {
        depth_percentage: 75,
      })
    })

    it('should track 100% scroll depth milestone', () => {
      initScrollDepthTracking()
      simulateScroll(2999) // Scroll just before 100%
      simulateScroll(3000) // Scroll to exactly 100%
      // Should have tracked 25%, 50%, 75%, and 100%
      expect(gtagMock).toHaveBeenCalledTimes(4)
      expect(gtagMock).toHaveBeenCalledWith('event', AnalyticsEvents.SCROLL_DEPTH, {
        depth_percentage: 100,
      })
    })

    it('should only track each milestone once', () => {
      initScrollDepthTracking()
      simulateScroll(0) // 25%
      expect(gtagMock).toHaveBeenCalledTimes(1) // Fired once for 25%

      // Scroll a little more, but not enough to hit next milestone
      simulateScroll(10) // scrollY 10 -> 25.25% -> rounded 25
      simulateScroll(20) // scrollY 20 -> 25.5% -> rounded 26
      expect(gtagMock).toHaveBeenCalledTimes(1) // Should not fire again

      // Final check
      expect(gtagMock).toHaveBeenCalledWith('event', AnalyticsEvents.SCROLL_DEPTH, {
        depth_percentage: 25,
      })
    })

    it('should track multiple milestones in a single scroll', () => {
      initScrollDepthTracking()
      simulateScroll(3000) // Scroll to 100%
      expect(gtagMock).toHaveBeenCalledTimes(4)
      expect(gtagMock).toHaveBeenCalledWith('event', AnalyticsEvents.SCROLL_DEPTH, {
        depth_percentage: 25,
      })
      expect(gtagMock).toHaveBeenCalledWith('event', AnalyticsEvents.SCROLL_DEPTH, {
        depth_percentage: 50,
      })
      expect(gtagMock).toHaveBeenCalledWith('event', AnalyticsEvents.SCROLL_DEPTH, {
        depth_percentage: 75,
      })
      expect(gtagMock).toHaveBeenCalledWith('event', AnalyticsEvents.SCROLL_DEPTH, {
        depth_percentage: 100,
      })
    })

    it('should throttle scroll events with requestAnimationFrame', () => {
      initScrollDepthTracking()
      // Simulate multiple scroll events in the same frame
      window.dispatchEvent(new Event('scroll'))
      window.dispatchEvent(new Event('scroll'))
      window.dispatchEvent(new Event('scroll'))
      // Should only call rAF once for the batch of scroll events
      expect(requestAnimationFrameMock).toHaveBeenCalledTimes(1)
    })

    it('should return a cleanup function that removes the scroll event listener', () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')
      const cleanup = initScrollDepthTracking()
      cleanup()
      expect(removeEventListenerSpy).toHaveBeenCalledWith('scroll', expect.any(Function))
    })
  })

  // Test AnalyticsEvents
  describe('AnalyticsEvents', () => {
    it('should contain all expected event names', () => {
      const expectedEvents = [
        'WAITLIST_JOIN',
        'WAITLIST_SUBMIT',
        'WAITLIST_SUCCESS',
        'WAITLIST_ERROR',
        'CTA_CLICK',
        'SCROLL_DEPTH',
        'VIDEO_PLAY',
        'VIDEO_PAUSE',
        'VIDEO_COMPLETE',
        'NAVIGATION_CLICK',
        'EXTERNAL_LINK_CLICK',
        'SOCIAL_LINK_CLICK',
        'FAQ_EXPAND',
        'TESTIMONIAL_VIEW',
        'COMPARISON_VIEW',
        'FORM_START',
        'FORM_FIELD_BLUR',
        'FORM_ERROR',
      ]
      expect(Object.keys(AnalyticsEvents)).toEqual(expect.arrayContaining(expectedEvents))
    })
  })

  // Test PII Sanitization
  describe('PII Sanitization', () => {
    let consoleWarnSpy: vi.SpyInstance

    beforeEach(() => {
      consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    })

    it('should strip email from parameters', () => {
      trackEvent('TestEvent', { user_email: 'test@example.com', other_param: 'value' })
      expect(gtagMock).toHaveBeenCalledWith('event', 'TestEvent', { other_param: 'value' })
    })

    it('should strip password from parameters', () => {
      trackEvent('TestEvent', { password: 'my-secret-password', other_param: 'value' })
      expect(gtagMock).toHaveBeenCalledWith('event', 'TestEvent', { other_param: 'value' })
    })

    it('should strip token from parameters', () => {
      trackEvent('TestEvent', { authToken: 'my-secret-token', other_param: 'value' })
      expect(gtagMock).toHaveBeenCalledWith('event', 'TestEvent', { other_param: 'value' })
    })

    it('should strip any parameter value that looks like an email', () => {
      trackEvent('TestEvent', { user_id: 'test@example.com', other_param: 'value' })
      expect(gtagMock).toHaveBeenCalledWith('event', 'TestEvent', { other_param: 'value' })
    })

    it('should not strip non-PII parameters', () => {
      const nonPiiParams = {
        button_location: 'hero',
        page_path: '/home',
        depth_percentage: 50,
        email_preference: 'daily',
      }
      trackEvent('TestEvent', nonPiiParams)
      expect(gtagMock).toHaveBeenCalledWith('event', 'TestEvent', nonPiiParams)
    })

    it('should show a console warning in development when PII is detected', () => {
      vi.stubEnv('DEV', true)
      trackEvent('TestEvent', { email: 'test@example.com' })
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        '[Analytics] PII detected and removed from event parameters. Never send emails, passwords, or other sensitive data to analytics.'
      )
    })

    it('should not show a console warning in production when PII is detected', () => {
      vi.stubEnv('DEV', false)
      trackEvent('TestEvent', { email: 'test@example.com' })
      expect(consoleWarnSpy).not.toHaveBeenCalled()
    })
  })
})
