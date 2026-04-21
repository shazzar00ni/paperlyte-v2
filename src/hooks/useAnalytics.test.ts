import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useAnalytics } from './useAnalytics'
import * as Analytics from '@utils/analytics'

describe('useAnalytics hook', () => {
  beforeEach(() => {
    vi.spyOn(Analytics, 'shouldRenderAnalytics').mockReturnValue(true)
    vi.spyOn(Analytics, 'trackEvent').mockImplementation(() => {})
    vi.spyOn(Analytics, 'trackCTAClick').mockImplementation(() => {})
    vi.spyOn(Analytics, 'trackExternalLink').mockImplementation(() => {})
    vi.spyOn(Analytics, 'trackSocialClick').mockImplementation(() => {})
    vi.spyOn(Analytics, 'initScrollDepthTracking').mockReturnValue(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should initialize scroll tracking on mount by default', () => {
    const initSpy = vi.spyOn(Analytics, 'initScrollDepthTracking')
    renderHook(() => useAnalytics())
    expect(initSpy).toHaveBeenCalled()
  })

  it('should NOT initialize scroll tracking when disabled', () => {
    const initSpy = vi.spyOn(Analytics, 'initScrollDepthTracking')
    renderHook(() => useAnalytics(false))
    expect(initSpy).not.toHaveBeenCalled()
  })

  it('should provide tracking functions', () => {
    const { result } = renderHook(() => useAnalytics())

    result.current.trackCTA('Test', 'hero')
    expect(Analytics.trackCTAClick).toHaveBeenCalledWith('Test', 'hero')

    result.current.trackExternal('https://test.com', 'Link')
    expect(Analytics.trackExternalLink).toHaveBeenCalledWith('https://test.com', 'Link')

    result.current.trackSocial('Twitter')
    expect(Analytics.trackSocialClick).toHaveBeenCalledWith('Twitter')
  })

  it('should provide specific waitlist tracking functions', () => {
    const { result } = renderHook(() => useAnalytics())

    result.current.trackWaitlistJoin('hero')
    expect(Analytics.trackEvent).toHaveBeenCalledWith(Analytics.AnalyticsEvents.WAITLIST_JOIN, {
      button_location: 'hero',
    })

    result.current.trackWaitlistSubmit('footer')
    expect(Analytics.trackEvent).toHaveBeenCalledWith(Analytics.AnalyticsEvents.WAITLIST_SUBMIT, {
      form_location: 'footer',
    })

    result.current.trackWaitlistSuccess()
    expect(Analytics.trackEvent).toHaveBeenCalledWith(
      Analytics.AnalyticsEvents.WAITLIST_SUCCESS,
      {}
    )

    result.current.trackWaitlistError('ERR_CODE', 'hero')
    expect(Analytics.trackEvent).toHaveBeenCalledWith(Analytics.AnalyticsEvents.WAITLIST_ERROR, {
      error_code: 'ERR_CODE',
      form_location: 'hero',
    })
  })

  it('should provide navigation and content tracking', () => {
    const { result } = renderHook(() => useAnalytics())

    result.current.trackNavigation('/path', 'Link Text')
    expect(Analytics.trackEvent).toHaveBeenCalledWith(Analytics.AnalyticsEvents.NAVIGATION_CLICK, {
      destination: '/path',
      link_text: 'Link Text',
    })

    result.current.trackFAQExpand(1)
    expect(Analytics.trackEvent).toHaveBeenCalledWith(Analytics.AnalyticsEvents.FAQ_EXPAND, {
      question_index: 1,
    })
  })
})
