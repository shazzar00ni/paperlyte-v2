import { renderHook } from '@testing-library/react'
import { vi, beforeEach, afterEach, describe, it, expect } from 'vitest'
import { useAnalytics } from '@hooks/useAnalytics'

// Mock the analytics utilities so we can assert on calls
vi.mock('@utils/analytics', () => ({
  trackEvent: vi.fn(),
  trackCTAClick: vi.fn(),
  trackExternalLink: vi.fn(),
  trackSocialClick: vi.fn(),
  initScrollDepthTracking: vi.fn(() => vi.fn()), // returns a cleanup function
  AnalyticsEvents: {
    WAITLIST_JOIN: 'Waitlist_Join',
    WAITLIST_SUBMIT: 'Waitlist_Submit',
    WAITLIST_SUCCESS: 'Waitlist_Success',
    WAITLIST_ERROR: 'Waitlist_Error',
    CTA_CLICK: 'CTA_Click',
    SCROLL_DEPTH: 'Scroll_Depth',
    VIDEO_PLAY: 'Video_Play',
    VIDEO_PAUSE: 'Video_Pause',
    VIDEO_COMPLETE: 'Video_Complete',
    NAVIGATION_CLICK: 'Navigation_Click',
    EXTERNAL_LINK_CLICK: 'External_Link_Click',
    SOCIAL_LINK_CLICK: 'Social_Link_Click',
    FAQ_EXPAND: 'FAQ_Expand',
    TESTIMONIAL_VIEW: 'Testimonial_View',
    COMPARISON_VIEW: 'Comparison_View',
    FORM_START: 'Form_Start',
    FORM_FIELD_BLUR: 'Form_Field_Blur',
    FORM_ERROR: 'Form_Error',
  },
}))

import {
  trackEvent,
  trackCTAClick,
  trackExternalLink,
  trackSocialClick,
  initScrollDepthTracking,
} from '@utils/analytics'

describe('useAnalytics', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Scroll depth tracking initialization', () => {
    it('should call initScrollDepthTracking on mount when enabled', () => {
      renderHook(() => useAnalytics())
      expect(initScrollDepthTracking).toHaveBeenCalledTimes(1)
    })

    it('should NOT call initScrollDepthTracking when disabled', () => {
      renderHook(() => useAnalytics(false))
      expect(initScrollDepthTracking).not.toHaveBeenCalled()
    })

    it('should call the cleanup function returned by initScrollDepthTracking on unmount', () => {
      const cleanupFn = vi.fn()
      vi.mocked(initScrollDepthTracking).mockReturnValueOnce(cleanupFn)

      const { unmount } = renderHook(() => useAnalytics())
      unmount()

      expect(cleanupFn).toHaveBeenCalledTimes(1)
    })

    it('should re-initialize scroll tracking when enableScrollTracking changes', () => {
      const { rerender } = renderHook(({ enabled }: { enabled: boolean }) => useAnalytics(enabled), {
        initialProps: { enabled: false },
      })

      expect(initScrollDepthTracking).not.toHaveBeenCalled()

      rerender({ enabled: true })
      expect(initScrollDepthTracking).toHaveBeenCalledTimes(1)
    })
  })

  describe('Return value shape', () => {
    it('should return an object with all expected tracking functions', () => {
      const { result } = renderHook(() => useAnalytics())

      expect(result.current).toHaveProperty('trackEvent')
      expect(result.current).toHaveProperty('trackCTA')
      expect(result.current).toHaveProperty('trackExternal')
      expect(result.current).toHaveProperty('trackSocial')
      expect(result.current).toHaveProperty('trackNavigation')
      expect(result.current).toHaveProperty('trackWaitlistJoin')
      expect(result.current).toHaveProperty('trackWaitlistSubmit')
      expect(result.current).toHaveProperty('trackWaitlistSuccess')
      expect(result.current).toHaveProperty('trackWaitlistError')
      expect(result.current).toHaveProperty('trackFAQExpand')
      expect(result.current).toHaveProperty('events')
    })

    it('should return functions for all tracking methods', () => {
      const { result } = renderHook(() => useAnalytics())

      expect(typeof result.current.trackEvent).toBe('function')
      expect(typeof result.current.trackCTA).toBe('function')
      expect(typeof result.current.trackExternal).toBe('function')
      expect(typeof result.current.trackSocial).toBe('function')
      expect(typeof result.current.trackNavigation).toBe('function')
      expect(typeof result.current.trackWaitlistJoin).toBe('function')
      expect(typeof result.current.trackWaitlistSubmit).toBe('function')
      expect(typeof result.current.trackWaitlistSuccess).toBe('function')
      expect(typeof result.current.trackWaitlistError).toBe('function')
      expect(typeof result.current.trackFAQExpand).toBe('function')
    })

    it('should expose AnalyticsEvents constants', () => {
      const { result } = renderHook(() => useAnalytics())

      expect(result.current.events).toBeDefined()
      expect(result.current.events.WAITLIST_JOIN).toBe('Waitlist_Join')
      expect(result.current.events.FAQ_EXPAND).toBe('FAQ_Expand')
    })
  })

  describe('trackEvent', () => {
    it('should delegate to the underlying trackEvent utility', () => {
      const { result } = renderHook(() => useAnalytics())

      result.current.trackEvent('Custom_Event', { label: 'test' })

      expect(trackEvent).toHaveBeenCalledWith('Custom_Event', { label: 'test' })
    })

    it('should work without params', () => {
      const { result } = renderHook(() => useAnalytics())

      result.current.trackEvent('Simple_Event')

      expect(trackEvent).toHaveBeenCalledWith('Simple_Event', undefined)
    })
  })

  describe('trackCTA', () => {
    it('should call trackCTAClick with button text and location', () => {
      const { result } = renderHook(() => useAnalytics())

      result.current.trackCTA('Join Waitlist', 'hero')

      expect(trackCTAClick).toHaveBeenCalledWith('Join Waitlist', 'hero')
    })
  })

  describe('trackExternal', () => {
    it('should call trackExternalLink with url and link text', () => {
      const { result } = renderHook(() => useAnalytics())

      result.current.trackExternal('https://example.com', 'Example')

      expect(trackExternalLink).toHaveBeenCalledWith('https://example.com', 'Example')
    })
  })

  describe('trackSocial', () => {
    it('should call trackSocialClick with the platform name', () => {
      const { result } = renderHook(() => useAnalytics())

      result.current.trackSocial('twitter')

      expect(trackSocialClick).toHaveBeenCalledWith('twitter')
    })
  })

  describe('trackNavigation', () => {
    it('should call trackEvent with NAVIGATION_CLICK event', () => {
      const { result } = renderHook(() => useAnalytics())

      result.current.trackNavigation('/about', 'About')

      expect(trackEvent).toHaveBeenCalledWith('Navigation_Click', {
        destination: '/about',
        link_text: 'About',
      })
    })
  })

  describe('trackWaitlistJoin', () => {
    it('should call trackEvent with WAITLIST_JOIN event and location', () => {
      const { result } = renderHook(() => useAnalytics())

      result.current.trackWaitlistJoin('hero_section')

      expect(trackEvent).toHaveBeenCalledWith('Waitlist_Join', {
        button_location: 'hero_section',
      })
    })
  })

  describe('trackWaitlistSubmit', () => {
    it('should call trackEvent with WAITLIST_SUBMIT event and location', () => {
      const { result } = renderHook(() => useAnalytics())

      result.current.trackWaitlistSubmit('email_capture_section')

      expect(trackEvent).toHaveBeenCalledWith('Waitlist_Submit', {
        form_location: 'email_capture_section',
      })
    })
  })

  describe('trackWaitlistSuccess', () => {
    it('should call trackEvent with WAITLIST_SUCCESS event', () => {
      const { result } = renderHook(() => useAnalytics())

      result.current.trackWaitlistSuccess()

      expect(trackEvent).toHaveBeenCalledWith('Waitlist_Success', {})
    })
  })

  describe('trackWaitlistError', () => {
    it('should call trackEvent with WAITLIST_ERROR event including error code and location', () => {
      const { result } = renderHook(() => useAnalytics())

      result.current.trackWaitlistError('validation_failed', 'hero')

      expect(trackEvent).toHaveBeenCalledWith('Waitlist_Error', {
        error_code: 'validation_failed',
        form_location: 'hero',
      })
    })
  })

  describe('trackFAQExpand', () => {
    it('should call trackEvent with FAQ_EXPAND event and question index', () => {
      const { result } = renderHook(() => useAnalytics())

      result.current.trackFAQExpand(3)

      expect(trackEvent).toHaveBeenCalledWith('FAQ_Expand', {
        question_index: 3,
      })
    })

    it('should handle question index 0', () => {
      const { result } = renderHook(() => useAnalytics())

      result.current.trackFAQExpand(0)

      expect(trackEvent).toHaveBeenCalledWith('FAQ_Expand', {
        question_index: 0,
      })
    })
  })

  describe('Memoization', () => {
    it('should return stable function references across re-renders', () => {
      const { result, rerender } = renderHook(() => useAnalytics())

      const firstRenderFns = {
        trackEvent: result.current.trackEvent,
        trackCTA: result.current.trackCTA,
        trackExternal: result.current.trackExternal,
        trackSocial: result.current.trackSocial,
        trackNavigation: result.current.trackNavigation,
        trackWaitlistJoin: result.current.trackWaitlistJoin,
        trackWaitlistSubmit: result.current.trackWaitlistSubmit,
        trackWaitlistSuccess: result.current.trackWaitlistSuccess,
        trackWaitlistError: result.current.trackWaitlistError,
        trackFAQExpand: result.current.trackFAQExpand,
      }

      rerender()

      // All callbacks should be memoized with useCallback
      expect(result.current.trackEvent).toBe(firstRenderFns.trackEvent)
      expect(result.current.trackCTA).toBe(firstRenderFns.trackCTA)
      expect(result.current.trackExternal).toBe(firstRenderFns.trackExternal)
      expect(result.current.trackSocial).toBe(firstRenderFns.trackSocial)
      expect(result.current.trackNavigation).toBe(firstRenderFns.trackNavigation)
      expect(result.current.trackWaitlistJoin).toBe(firstRenderFns.trackWaitlistJoin)
      expect(result.current.trackWaitlistSubmit).toBe(firstRenderFns.trackWaitlistSubmit)
      expect(result.current.trackWaitlistSuccess).toBe(firstRenderFns.trackWaitlistSuccess)
      expect(result.current.trackWaitlistError).toBe(firstRenderFns.trackWaitlistError)
      expect(result.current.trackFAQExpand).toBe(firstRenderFns.trackFAQExpand)
    })
  })
})
