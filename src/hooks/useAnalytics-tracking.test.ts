/**
 * Tests for the specific tracking functions exposed by useAnalytics.
 * Verifies each function delegates to the correct underlying analytics utility
 * with the expected event name and parameters.
 *
 * The sibling useAnalytics.test.ts covers mount/unmount lifecycle and scroll
 * depth wiring; this file focuses purely on per-function call correctness.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useAnalytics } from '@/hooks/useAnalytics'
import {
  trackEvent,
  trackCTAClick,
  trackExternalLink,
  trackSocialClick,
  AnalyticsEvents,
} from '@utils/analytics'

vi.mock('@/analytics/scrollDepth', () => ({
  createScrollTracker: vi.fn(() => ({ disable: vi.fn() })),
}))

// Resolves to the canonical mock in @utils/__mocks__/analytics.ts so this
// file's tracked functions stay in sync with the module registry even when
// it's shared across test files.
vi.mock('@utils/analytics')

describe('useAnalytics — tracking function behavior', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('trackCTA calls trackCTAClick with button text and location', () => {
    const { result } = renderHook(() => useAnalytics(false))
    result.current.trackCTA('Join Waitlist', 'hero')
    expect(trackCTAClick).toHaveBeenCalledWith('Join Waitlist', 'hero')
  })

  it('trackCTA passes through arbitrary text and location strings', () => {
    const { result } = renderHook(() => useAnalytics(false))
    result.current.trackCTA('Get Early Access', 'footer_cta')
    expect(trackCTAClick).toHaveBeenCalledWith('Get Early Access', 'footer_cta')
  })

  it('trackExternal calls trackExternalLink with url and link text', () => {
    const { result } = renderHook(() => useAnalytics(false))
    result.current.trackExternal('https://github.com/paperlyte', 'GitHub')
    expect(trackExternalLink).toHaveBeenCalledWith('https://github.com/paperlyte', 'GitHub')
  })

  it('trackSocial calls trackSocialClick with platform name', () => {
    const { result } = renderHook(() => useAnalytics(false))
    result.current.trackSocial('twitter')
    expect(trackSocialClick).toHaveBeenCalledWith('twitter')
  })

  it('trackSocial passes the platform name as-is to trackSocialClick', () => {
    const { result } = renderHook(() => useAnalytics(false))
    result.current.trackSocial('LinkedIn')
    expect(trackSocialClick).toHaveBeenCalledWith('LinkedIn')
  })

  it('trackWaitlistJoin fires WAITLIST_JOIN with button_location', () => {
    const { result } = renderHook(() => useAnalytics(false))
    result.current.trackWaitlistJoin('hero_section')
    expect(trackEvent).toHaveBeenCalledWith(AnalyticsEvents.WAITLIST_JOIN, {
      button_location: 'hero_section',
    })
  })

  it('trackWaitlistJoin passes different locations correctly', () => {
    const { result } = renderHook(() => useAnalytics(false))
    result.current.trackWaitlistJoin('cta_section')
    expect(trackEvent).toHaveBeenCalledWith(AnalyticsEvents.WAITLIST_JOIN, {
      button_location: 'cta_section',
    })
  })

  it('trackWaitlistSubmit fires WAITLIST_SUBMIT with form_location', () => {
    const { result } = renderHook(() => useAnalytics(false))
    result.current.trackWaitlistSubmit('email_capture')
    expect(trackEvent).toHaveBeenCalledWith(AnalyticsEvents.WAITLIST_SUBMIT, {
      form_location: 'email_capture',
    })
  })

  it('trackWaitlistSuccess fires WAITLIST_SUCCESS with no PII params', () => {
    const { result } = renderHook(() => useAnalytics(false))
    result.current.trackWaitlistSuccess()
    expect(trackEvent).toHaveBeenCalledWith(AnalyticsEvents.WAITLIST_SUCCESS, {})
  })

  it('trackWaitlistError fires WAITLIST_ERROR with error_code and form_location', () => {
    const { result } = renderHook(() => useAnalytics(false))
    result.current.trackWaitlistError('NETWORK_ERROR', 'hero_section')
    expect(trackEvent).toHaveBeenCalledWith(AnalyticsEvents.WAITLIST_ERROR, {
      error_code: 'NETWORK_ERROR',
      form_location: 'hero_section',
    })
  })

  it('trackWaitlistError passes different error codes correctly', () => {
    const { result } = renderHook(() => useAnalytics(false))
    result.current.trackWaitlistError('VALIDATION_FAILED', 'cta_section')
    expect(trackEvent).toHaveBeenCalledWith(AnalyticsEvents.WAITLIST_ERROR, {
      error_code: 'VALIDATION_FAILED',
      form_location: 'cta_section',
    })
  })

  it('trackFAQExpand fires FAQ_EXPAND with question_index', () => {
    const { result } = renderHook(() => useAnalytics(false))
    result.current.trackFAQExpand(0)
    expect(trackEvent).toHaveBeenCalledWith(AnalyticsEvents.FAQ_EXPAND, {
      question_index: 0,
    })
  })

  it('trackFAQExpand passes the question index numerically', () => {
    const { result } = renderHook(() => useAnalytics(false))
    result.current.trackFAQExpand(3)
    expect(trackEvent).toHaveBeenCalledWith(AnalyticsEvents.FAQ_EXPAND, {
      question_index: 3,
    })
  })

  it('trackNavigation fires NAVIGATION_CLICK with destination and link_text', () => {
    const { result } = renderHook(() => useAnalytics(false))
    result.current.trackNavigation('/features', 'Features')
    expect(trackEvent).toHaveBeenCalledWith(AnalyticsEvents.NAVIGATION_CLICK, {
      destination: '/features',
      link_text: 'Features',
    })
  })

  it('trackNavigation passes anchor-hash destinations correctly', () => {
    const { result } = renderHook(() => useAnalytics(false))
    result.current.trackNavigation('#pricing', 'Pricing')
    expect(trackEvent).toHaveBeenCalledWith(AnalyticsEvents.NAVIGATION_CLICK, {
      destination: '#pricing',
      link_text: 'Pricing',
    })
  })

  it('trackEvent delegates directly to the underlying trackEvent utility', () => {
    const { result } = renderHook(() => useAnalytics(false))
    result.current.trackEvent('Custom_Event', { category: 'test' })
    expect(trackEvent).toHaveBeenCalledWith('Custom_Event', { category: 'test' })
  })

  it('trackEvent forwards undefined params when none are provided', () => {
    const { result } = renderHook(() => useAnalytics(false))
    result.current.trackEvent('Bare_Event')
    expect(trackEvent).toHaveBeenCalledWith('Bare_Event', undefined)
  })

  it('exposes the AnalyticsEvents constants object', () => {
    const { result } = renderHook(() => useAnalytics(false))
    expect(result.current.events).toBe(AnalyticsEvents)
  })
})
