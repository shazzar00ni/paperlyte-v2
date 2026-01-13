import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  isAnalyticsAvailable,
  trackEvent,
  trackPageView,
  trackCTAClick,
  trackExternalLink,
  trackSocialClick,
  AnalyticsEvents,
} from './analytics'

describe('Analytics Utility - Core Functions', () => {
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
})
