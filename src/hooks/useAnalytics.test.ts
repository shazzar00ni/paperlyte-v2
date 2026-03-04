import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAnalytics } from './useAnalytics'

// Mock the analytics utility module
vi.mock('@utils/analytics', () => ({
  trackEvent: vi.fn(),
  trackCTAClick: vi.fn(),
  trackExternalLink: vi.fn(),
  trackSocialClick: vi.fn(),
  initScrollDepthTracking: vi.fn(() => vi.fn()),
  AnalyticsEvents: {
    WAITLIST_JOIN: 'Waitlist_Join',
    WAITLIST_SUBMIT: 'Waitlist_Submit',
    WAITLIST_SUCCESS: 'Waitlist_Success',
    WAITLIST_ERROR: 'Waitlist_Error',
    CTA_CLICK: 'CTA_Click',
    SCROLL_DEPTH: 'Scroll_Depth',
    NAVIGATION_CLICK: 'Navigation_Click',
    EXTERNAL_LINK_CLICK: 'External_Link_Click',
    SOCIAL_LINK_CLICK: 'Social_Link_Click',
    FAQ_EXPAND: 'FAQ_Expand',
  },
}))

import {
  trackEvent,
  trackCTAClick,
  trackExternalLink,
  trackSocialClick,
  initScrollDepthTracking,
} from '@utils/analytics'

describe('useAnalytics hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('scroll depth tracking lifecycle', () => {
    it('initializes scroll depth tracking on mount by default', () => {
      renderHook(() => useAnalytics())

      expect(initScrollDepthTracking).toHaveBeenCalledTimes(1)
    })

    it('calls cleanup function on unmount', () => {
      const cleanupFn = vi.fn()
      vi.mocked(initScrollDepthTracking).mockReturnValue(cleanupFn)

      const { unmount } = renderHook(() => useAnalytics())
      unmount()

      expect(cleanupFn).toHaveBeenCalledTimes(1)
    })

    it('does not initialize scroll tracking when disabled', () => {
      renderHook(() => useAnalytics(false))

      expect(initScrollDepthTracking).not.toHaveBeenCalled()
    })

    it('re-initializes scroll tracking when enableScrollTracking changes', () => {
      const { rerender } = renderHook(({ enabled }) => useAnalytics(enabled), {
        initialProps: { enabled: false },
      })

      expect(initScrollDepthTracking).not.toHaveBeenCalled()

      rerender({ enabled: true })

      expect(initScrollDepthTracking).toHaveBeenCalledTimes(1)
    })
  })

  describe('trackEvent', () => {
    it('delegates to analytics trackEvent', () => {
      const { result } = renderHook(() => useAnalytics())

      act(() => {
        result.current.trackEvent('custom_event', { key: 'value' })
      })

      expect(trackEvent).toHaveBeenCalledWith('custom_event', { key: 'value' })
    })

    it('works without parameters', () => {
      const { result } = renderHook(() => useAnalytics())

      act(() => {
        result.current.trackEvent('simple_event')
      })

      expect(trackEvent).toHaveBeenCalledWith('simple_event', undefined)
    })
  })

  describe('trackCTA', () => {
    it('delegates to analytics trackCTAClick', () => {
      const { result } = renderHook(() => useAnalytics())

      act(() => {
        result.current.trackCTA('Join Waitlist', 'hero')
      })

      expect(trackCTAClick).toHaveBeenCalledWith('Join Waitlist', 'hero')
    })
  })

  describe('trackExternal', () => {
    it('delegates to analytics trackExternalLink', () => {
      const { result } = renderHook(() => useAnalytics())

      act(() => {
        result.current.trackExternal('https://example.com', 'Example')
      })

      expect(trackExternalLink).toHaveBeenCalledWith('https://example.com', 'Example')
    })
  })

  describe('trackSocial', () => {
    it('delegates to analytics trackSocialClick', () => {
      const { result } = renderHook(() => useAnalytics())

      act(() => {
        result.current.trackSocial('twitter')
      })

      expect(trackSocialClick).toHaveBeenCalledWith('twitter')
    })
  })

  describe('trackNavigation', () => {
    it('tracks navigation click with destination and text', () => {
      const { result } = renderHook(() => useAnalytics())

      act(() => {
        result.current.trackNavigation('#features', 'Features')
      })

      expect(trackEvent).toHaveBeenCalledWith('Navigation_Click', {
        destination: '#features',
        link_text: 'Features',
      })
    })
  })

  describe('waitlist tracking', () => {
    it('trackWaitlistJoin sends button_location without PII', () => {
      const { result } = renderHook(() => useAnalytics())

      act(() => {
        result.current.trackWaitlistJoin('hero')
      })

      expect(trackEvent).toHaveBeenCalledWith('Waitlist_Join', {
        button_location: 'hero',
      })
    })

    it('trackWaitlistSubmit sends form_location without PII', () => {
      const { result } = renderHook(() => useAnalytics())

      act(() => {
        result.current.trackWaitlistSubmit('footer')
      })

      expect(trackEvent).toHaveBeenCalledWith('Waitlist_Submit', {
        form_location: 'footer',
      })
    })

    it('trackWaitlistSuccess sends no PII data', () => {
      const { result } = renderHook(() => useAnalytics())

      act(() => {
        result.current.trackWaitlistSuccess()
      })

      // Called with empty object - no email, no PII
      expect(trackEvent).toHaveBeenCalledWith('Waitlist_Success', {})
    })

    it('trackWaitlistError sends error_code and location without PII', () => {
      const { result } = renderHook(() => useAnalytics())

      act(() => {
        result.current.trackWaitlistError('429', 'hero')
      })

      expect(trackEvent).toHaveBeenCalledWith('Waitlist_Error', {
        error_code: '429',
        form_location: 'hero',
      })
    })
  })

  describe('trackFAQExpand', () => {
    it('tracks FAQ expansion with question index', () => {
      const { result } = renderHook(() => useAnalytics())

      act(() => {
        result.current.trackFAQExpand(2)
      })

      expect(trackEvent).toHaveBeenCalledWith('FAQ_Expand', {
        question_index: 2,
      })
    })
  })

  describe('returned event constants', () => {
    it('exposes AnalyticsEvents as events property', () => {
      const { result } = renderHook(() => useAnalytics())

      expect(result.current.events.WAITLIST_JOIN).toBe('Waitlist_Join')
      expect(result.current.events.CTA_CLICK).toBe('CTA_Click')
      expect(result.current.events.SCROLL_DEPTH).toBe('Scroll_Depth')
    })
  })

  describe('memoization', () => {
    it('returns stable function references across re-renders', () => {
      const { result, rerender } = renderHook(() => useAnalytics())

      const firstRender = { ...result.current }
      rerender()

      expect(result.current.trackEvent).toBe(firstRender.trackEvent)
      expect(result.current.trackCTA).toBe(firstRender.trackCTA)
      expect(result.current.trackExternal).toBe(firstRender.trackExternal)
      expect(result.current.trackSocial).toBe(firstRender.trackSocial)
      expect(result.current.trackWaitlistJoin).toBe(firstRender.trackWaitlistJoin)
    })
  })
})
