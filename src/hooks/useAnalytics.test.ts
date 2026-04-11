/**
 * Tests for useAnalytics hook
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAnalytics } from './useAnalytics'

// Mock the analytics utilities so we can spy on calls
vi.mock('@utils/analytics', () => ({
  trackEvent: vi.fn(),
  trackCTAClick: vi.fn(),
  trackExternalLink: vi.fn(),
  trackSocialClick: vi.fn(),
  initScrollDepthTracking: vi.fn(() => vi.fn()), // returns a cleanup fn
  AnalyticsEvents: {
    WAITLIST_JOIN: 'Waitlist_Join',
    WAITLIST_SUBMIT: 'Waitlist_Submit',
    WAITLIST_SUCCESS: 'Waitlist_Success',
    WAITLIST_ERROR: 'Waitlist_Error',
    FAQ_EXPAND: 'FAQ_Expand',
    NAVIGATION_CLICK: 'Navigation_Click',
  },
}))

describe('useAnalytics', () => {
  let trackEvent: ReturnType<typeof vi.fn>
  let trackCTAClick: ReturnType<typeof vi.fn>
  let trackExternalLink: ReturnType<typeof vi.fn>
  let trackSocialClick: ReturnType<typeof vi.fn>
  let initScrollDepthTracking: ReturnType<typeof vi.fn>

  beforeEach(async () => {
    vi.clearAllMocks()
    const analytics = await import('@utils/analytics')
    trackEvent = analytics.trackEvent as ReturnType<typeof vi.fn>
    trackCTAClick = analytics.trackCTAClick as ReturnType<typeof vi.fn>
    trackExternalLink = analytics.trackExternalLink as ReturnType<typeof vi.fn>
    trackSocialClick = analytics.trackSocialClick as ReturnType<typeof vi.fn>
    initScrollDepthTracking = analytics.initScrollDepthTracking as ReturnType<typeof vi.fn>
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  // ----------------------------------------------------------------
  // Scroll depth tracking initialisation
  // ----------------------------------------------------------------
  it('initialises scroll depth tracking on mount when enabled (default)', () => {
    renderHook(() => useAnalytics())
    expect(initScrollDepthTracking).toHaveBeenCalledTimes(1)
  })

  it('calls scroll depth cleanup function on unmount', () => {
    const cleanup = vi.fn()
    initScrollDepthTracking.mockReturnValue(cleanup)

    const { unmount } = renderHook(() => useAnalytics())
    unmount()

    expect(cleanup).toHaveBeenCalledTimes(1)
  })

  it('does NOT initialise scroll tracking when enableScrollTracking=false', () => {
    renderHook(() => useAnalytics(false))
    expect(initScrollDepthTracking).not.toHaveBeenCalled()
  })

  // ----------------------------------------------------------------
  // trackEvent
  // ----------------------------------------------------------------
  it('trackEvent calls the underlying trackEvent utility', () => {
    const { result } = renderHook(() => useAnalytics())

    act(() => {
      result.current.trackEvent('my_event', { key: 'value' })
    })

    expect(trackEvent).toHaveBeenCalledWith('my_event', { key: 'value' })
  })

  it('trackEvent can be called without params', () => {
    const { result } = renderHook(() => useAnalytics())

    act(() => {
      result.current.trackEvent('simple_event')
    })

    expect(trackEvent).toHaveBeenCalledWith('simple_event', undefined)
  })

  // ----------------------------------------------------------------
  // trackCTA
  // ----------------------------------------------------------------
  it('trackCTA calls trackCTAClick with button text and location', () => {
    const { result } = renderHook(() => useAnalytics())

    act(() => {
      result.current.trackCTA('Join Waitlist', 'hero')
    })

    expect(trackCTAClick).toHaveBeenCalledWith('Join Waitlist', 'hero')
  })

  // ----------------------------------------------------------------
  // trackExternal
  // ----------------------------------------------------------------
  it('trackExternal calls trackExternalLink with url and link text', () => {
    const { result } = renderHook(() => useAnalytics())

    act(() => {
      result.current.trackExternal('https://example.com', 'Example')
    })

    expect(trackExternalLink).toHaveBeenCalledWith('https://example.com', 'Example')
  })

  // ----------------------------------------------------------------
  // trackSocial
  // ----------------------------------------------------------------
  it('trackSocial calls trackSocialClick with platform name', () => {
    const { result } = renderHook(() => useAnalytics())

    act(() => {
      result.current.trackSocial('twitter')
    })

    expect(trackSocialClick).toHaveBeenCalledWith('twitter')
  })

  // ----------------------------------------------------------------
  // trackNavigation
  // ----------------------------------------------------------------
  it('trackNavigation calls trackEvent with NAVIGATION_CLICK event', () => {
    const { result } = renderHook(() => useAnalytics())

    act(() => {
      result.current.trackNavigation('features', 'Features')
    })

    expect(trackEvent).toHaveBeenCalledWith('Navigation_Click', {
      destination: 'features',
      link_text: 'Features',
    })
  })

  // ----------------------------------------------------------------
  // trackWaitlistJoin
  // ----------------------------------------------------------------
  it('trackWaitlistJoin calls trackEvent with WAITLIST_JOIN event and location', () => {
    const { result } = renderHook(() => useAnalytics())

    act(() => {
      result.current.trackWaitlistJoin('hero_section')
    })

    expect(trackEvent).toHaveBeenCalledWith('Waitlist_Join', {
      button_location: 'hero_section',
    })
  })

  // ----------------------------------------------------------------
  // trackWaitlistSubmit
  // ----------------------------------------------------------------
  it('trackWaitlistSubmit calls trackEvent with WAITLIST_SUBMIT event and location', () => {
    const { result } = renderHook(() => useAnalytics())

    act(() => {
      result.current.trackWaitlistSubmit('email_capture')
    })

    expect(trackEvent).toHaveBeenCalledWith('Waitlist_Submit', {
      form_location: 'email_capture',
    })
  })

  // ----------------------------------------------------------------
  // trackWaitlistSuccess
  // ----------------------------------------------------------------
  it('trackWaitlistSuccess calls trackEvent with WAITLIST_SUCCESS event', () => {
    const { result } = renderHook(() => useAnalytics())

    act(() => {
      result.current.trackWaitlistSuccess()
    })

    expect(trackEvent).toHaveBeenCalledWith('Waitlist_Success', {})
  })

  // ----------------------------------------------------------------
  // trackWaitlistError
  // ----------------------------------------------------------------
  it('trackWaitlistError calls trackEvent with WAITLIST_ERROR event, error code and location', () => {
    const { result } = renderHook(() => useAnalytics())

    act(() => {
      result.current.trackWaitlistError('network_error', 'hero')
    })

    expect(trackEvent).toHaveBeenCalledWith('Waitlist_Error', {
      error_code: 'network_error',
      form_location: 'hero',
    })
  })

  // ----------------------------------------------------------------
  // trackFAQExpand
  // ----------------------------------------------------------------
  it('trackFAQExpand calls trackEvent with FAQ_EXPAND event and question index', () => {
    const { result } = renderHook(() => useAnalytics())

    act(() => {
      result.current.trackFAQExpand(3)
    })

    expect(trackEvent).toHaveBeenCalledWith('FAQ_Expand', {
      question_index: 3,
    })
  })

  // ----------------------------------------------------------------
  // Returned interface
  // ----------------------------------------------------------------
  it('returns the AnalyticsEvents constants as events property', () => {
    const { result } = renderHook(() => useAnalytics())
    expect(result.current.events).toBeDefined()
    expect(result.current.events.WAITLIST_JOIN).toBe('Waitlist_Join')
  })

  it('memoised tracking functions are stable across re-renders', () => {
    const { result, rerender } = renderHook(() => useAnalytics())

    const firstRender = {
      trackCTA: result.current.trackCTA,
      trackWaitlistJoin: result.current.trackWaitlistJoin,
    }

    rerender()

    expect(result.current.trackCTA).toBe(firstRender.trackCTA)
    expect(result.current.trackWaitlistJoin).toBe(firstRender.trackWaitlistJoin)
  })
})
