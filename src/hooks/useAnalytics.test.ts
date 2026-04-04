import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAnalytics } from './useAnalytics'
import * as analytics from '@utils/analytics'

// Mock analytics module
vi.mock('@utils/analytics', () => ({
  trackEvent: vi.fn(),
  trackCTAClick: vi.fn(),
  trackExternalLink: vi.fn(),
  trackSocialClick: vi.fn(),
  initScrollDepthTracking: vi.fn(() => vi.fn()),
  AnalyticsEvents: {
    WAITLIST_JOIN: 'waitlist_join',
    WAITLIST_SUBMIT: 'waitlist_submit',
    WAITLIST_SUCCESS: 'waitlist_success',
    WAITLIST_ERROR: 'waitlist_error',
    FAQ_EXPAND: 'faq_expand',
    NAVIGATION_CLICK: 'navigation_click',
  },
}))

describe('useAnalytics', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('scroll depth tracking', () => {
    it('should initialize scroll depth tracking on mount', () => {
      renderHook(() => useAnalytics())
      expect(analytics.initScrollDepthTracking).toHaveBeenCalledTimes(1)
    })

    it('should not initialize scroll depth tracking when disabled', () => {
      renderHook(() => useAnalytics(false))
      expect(analytics.initScrollDepthTracking).not.toHaveBeenCalled()
    })

    it('should call cleanup on unmount', () => {
      const cleanupFn = vi.fn()
      vi.mocked(analytics.initScrollDepthTracking).mockReturnValue(cleanupFn)

      const { unmount } = renderHook(() => useAnalytics())
      unmount()

      expect(cleanupFn).toHaveBeenCalledTimes(1)
    })

    it('should not call cleanup on unmount when tracking is disabled', () => {
      const cleanupFn = vi.fn()
      vi.mocked(analytics.initScrollDepthTracking).mockReturnValue(cleanupFn)

      const { unmount } = renderHook(() => useAnalytics(false))
      unmount()

      expect(cleanupFn).not.toHaveBeenCalled()
    })
  })

  describe('trackEvent', () => {
    it('should call trackEvent with event name', () => {
      const { result } = renderHook(() => useAnalytics())

      act(() => {
        result.current.trackEvent('test_event')
      })

      expect(analytics.trackEvent).toHaveBeenCalledWith('test_event', undefined)
    })

    it('should call trackEvent with event name and params', () => {
      const { result } = renderHook(() => useAnalytics())

      act(() => {
        result.current.trackEvent('test_event', { key: 'value' })
      })

      expect(analytics.trackEvent).toHaveBeenCalledWith('test_event', { key: 'value' })
    })
  })

  describe('trackCTA', () => {
    it('should call trackCTAClick with button text and location', () => {
      const { result } = renderHook(() => useAnalytics())

      act(() => {
        result.current.trackCTA('Join Waitlist', 'hero')
      })

      expect(analytics.trackCTAClick).toHaveBeenCalledWith('Join Waitlist', 'hero')
    })
  })

  describe('trackExternal', () => {
    it('should call trackExternalLink with url and link text', () => {
      const { result } = renderHook(() => useAnalytics())

      act(() => {
        result.current.trackExternal('https://example.com', 'Example')
      })

      expect(analytics.trackExternalLink).toHaveBeenCalledWith('https://example.com', 'Example')
    })
  })

  describe('trackSocial', () => {
    it('should call trackSocialClick with platform', () => {
      const { result } = renderHook(() => useAnalytics())

      act(() => {
        result.current.trackSocial('twitter')
      })

      expect(analytics.trackSocialClick).toHaveBeenCalledWith('twitter')
    })
  })

  describe('trackWaitlistJoin', () => {
    it('should track waitlist join with location', () => {
      const { result } = renderHook(() => useAnalytics())

      act(() => {
        result.current.trackWaitlistJoin('hero_section')
      })

      expect(analytics.trackEvent).toHaveBeenCalledWith('waitlist_join', {
        button_location: 'hero_section',
      })
    })
  })

  describe('trackWaitlistSubmit', () => {
    it('should track waitlist submit with location', () => {
      const { result } = renderHook(() => useAnalytics())

      act(() => {
        result.current.trackWaitlistSubmit('footer')
      })

      expect(analytics.trackEvent).toHaveBeenCalledWith('waitlist_submit', {
        form_location: 'footer',
      })
    })
  })

  describe('trackWaitlistSuccess', () => {
    it('should track waitlist success without PII', () => {
      const { result } = renderHook(() => useAnalytics())

      act(() => {
        result.current.trackWaitlistSuccess()
      })

      expect(analytics.trackEvent).toHaveBeenCalledWith('waitlist_success', {})
    })
  })

  describe('trackWaitlistError', () => {
    it('should track waitlist error with error code and location', () => {
      const { result } = renderHook(() => useAnalytics())

      act(() => {
        result.current.trackWaitlistError('INVALID_EMAIL', 'hero')
      })

      expect(analytics.trackEvent).toHaveBeenCalledWith('waitlist_error', {
        error_code: 'INVALID_EMAIL',
        form_location: 'hero',
      })
    })
  })

  describe('trackFAQExpand', () => {
    it('should track FAQ expand with question index', () => {
      const { result } = renderHook(() => useAnalytics())

      act(() => {
        result.current.trackFAQExpand(3)
      })

      expect(analytics.trackEvent).toHaveBeenCalledWith('faq_expand', {
        question_index: 3,
      })
    })
  })

  describe('trackNavigation', () => {
    it('should track navigation with destination and link text', () => {
      const { result } = renderHook(() => useAnalytics())

      act(() => {
        result.current.trackNavigation('/features', 'Features')
      })

      expect(analytics.trackEvent).toHaveBeenCalledWith('navigation_click', {
        destination: '/features',
        link_text: 'Features',
      })
    })
  })

  describe('events constant', () => {
    it('should expose AnalyticsEvents as events property', () => {
      const { result } = renderHook(() => useAnalytics())

      expect(result.current.events).toBe(analytics.AnalyticsEvents)
    })
  })

  describe('memoization', () => {
    it('should return stable function references across re-renders', () => {
      const { result, rerender } = renderHook(() => useAnalytics())

      const firstRender = { ...result.current }
      rerender()
      const secondRender = { ...result.current }

      expect(firstRender.trackEvent).toBe(secondRender.trackEvent)
      expect(firstRender.trackCTA).toBe(secondRender.trackCTA)
      expect(firstRender.trackExternal).toBe(secondRender.trackExternal)
      expect(firstRender.trackSocial).toBe(secondRender.trackSocial)
      expect(firstRender.trackWaitlistJoin).toBe(secondRender.trackWaitlistJoin)
      expect(firstRender.trackWaitlistSubmit).toBe(secondRender.trackWaitlistSubmit)
      expect(firstRender.trackWaitlistSuccess).toBe(secondRender.trackWaitlistSuccess)
      expect(firstRender.trackWaitlistError).toBe(secondRender.trackWaitlistError)
      expect(firstRender.trackFAQExpand).toBe(secondRender.trackFAQExpand)
      expect(firstRender.trackNavigation).toBe(secondRender.trackNavigation)
    })
  })
})
