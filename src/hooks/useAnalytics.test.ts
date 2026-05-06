import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { createScrollTracker } from '@/analytics/scrollDepth'
import { trackEvent, trackCTAClick, trackExternalLink, trackSocialClick, AnalyticsEvents } from '@utils/analytics'
import { useAnalytics } from '@/hooks/useAnalytics'

// Stub createScrollTracker so tests don't depend on DOM scroll events
vi.mock('@/analytics/scrollDepth', () => ({
  createScrollTracker: vi.fn(() => ({ disable: vi.fn() })),
}))

// Stub tracking functions so we can assert they are called correctly
vi.mock('@utils/analytics', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@utils/analytics')>()
  return {
    ...actual,
    trackEvent: vi.fn(),
    trackCTAClick: vi.fn(),
    trackExternalLink: vi.fn(),
    trackSocialClick: vi.fn(),
  }
})

describe('useAnalytics', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('scroll depth tracking', () => {
    it('initialises scroll tracking on mount when enabled', () => {
      renderHook(() => useAnalytics(true))
      expect(createScrollTracker).toHaveBeenCalledTimes(1)
    })

    it('fires SCROLL_DEPTH event when the scroll callback is invoked', () => {
      renderHook(() => useAnalytics(true))

      // Grab the callback that useAnalytics passed to createScrollTracker
      const cb = vi.mocked(createScrollTracker).mock.calls[0][0]
      cb(75 as Parameters<typeof cb>[0])

      expect(trackEvent).toHaveBeenCalledWith(AnalyticsEvents.SCROLL_DEPTH, {
        depth_percentage: 75,
      })
    })

    it('does not initialise scroll tracking when disabled', () => {
      renderHook(() => useAnalytics(false))
      expect(createScrollTracker).not.toHaveBeenCalled()
    })

    it('calls tracker.disable() on unmount', () => {
      const disableMock = vi.fn()
      vi.mocked(createScrollTracker).mockReturnValueOnce({ disable: disableMock })

      const { unmount } = renderHook(() => useAnalytics(true))
      unmount()

      expect(disableMock).toHaveBeenCalledTimes(1)
    })
  })

  it('returns tracking functions', () => {
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

  describe('trackEvent', () => {
    it('should call trackEvent with event name', () => {
      const { result } = renderHook(() => useAnalytics())

      act(() => {
        result.current.trackEvent('test_event')
      })

      expect(trackEvent).toHaveBeenCalledWith('test_event', undefined)
    })

    it('should call trackEvent with event name and params', () => {
      const { result } = renderHook(() => useAnalytics())

      act(() => {
        result.current.trackEvent('test_event', { key: 'value' })
      })

      expect(trackEvent).toHaveBeenCalledWith('test_event', { key: 'value' })
    })
  })

  describe('trackCTA', () => {
    it('should call trackCTAClick with button text and location', () => {
      const { result } = renderHook(() => useAnalytics())

      act(() => {
        result.current.trackCTA('Join Waitlist', 'hero')
      })

      expect(trackCTAClick).toHaveBeenCalledWith('Join Waitlist', 'hero')
    })
  })

  describe('trackExternal', () => {
    it('should call trackExternalLink with url and link text', () => {
      const { result } = renderHook(() => useAnalytics())

      act(() => {
        result.current.trackExternal('https://example.com', 'Example')
      })

      expect(trackExternalLink).toHaveBeenCalledWith('https://example.com', 'Example')
    })
  })

  describe('trackSocial', () => {
    it('should call trackSocialClick with platform', () => {
      const { result } = renderHook(() => useAnalytics())

      act(() => {
        result.current.trackSocial('twitter')
      })

      expect(trackSocialClick).toHaveBeenCalledWith('twitter')
    })
  })

  describe('trackWaitlistJoin', () => {
    it('should track waitlist join with location', () => {
      const { result } = renderHook(() => useAnalytics())

      act(() => {
        result.current.trackWaitlistJoin('hero_section')
      })

      expect(trackEvent).toHaveBeenCalledWith(AnalyticsEvents.WAITLIST_JOIN, {
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

      expect(trackEvent).toHaveBeenCalledWith(AnalyticsEvents.WAITLIST_SUBMIT, {
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

      expect(trackEvent).toHaveBeenCalledWith(AnalyticsEvents.WAITLIST_SUCCESS, {})
    })
  })

  describe('trackWaitlistError', () => {
    it('should track waitlist error with error code and location', () => {
      const { result } = renderHook(() => useAnalytics())

      act(() => {
        result.current.trackWaitlistError('INVALID_EMAIL', 'hero')
      })

      expect(trackEvent).toHaveBeenCalledWith(AnalyticsEvents.WAITLIST_ERROR, {
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

      expect(trackEvent).toHaveBeenCalledWith(AnalyticsEvents.FAQ_EXPAND, {
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

      expect(trackEvent).toHaveBeenCalledWith(AnalyticsEvents.NAVIGATION_CLICK, {
        destination: '/features',
        link_text: 'Features',
      })
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
