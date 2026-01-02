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
    // Clear mock history and reset implementation after each test
    gtagMock.mockClear()
    // Remove the mock from the window object
    delete window.gtag
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
    it('should return a cleanup function that removes the scroll event listener', () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')
      const cleanup = initScrollDepthTracking()
      cleanup()
      expect(removeEventListenerSpy).toHaveBeenCalledWith('scroll', expect.any(Function))
    })
  })
})
