import { renderHook } from '@testing-library/react'
import { useAnalytics } from '@hooks/useAnalytics'
import {
  trackEvent,
  trackCTAClick,
  trackExternalLink,
  trackSocialClick,
  initScrollDepthTracking,
} from '@utils/analytics'

// Reuse the real AnalyticsEvents constants via importActual so tests catch
// regressions in the actual event-name strings emitted to the analytics provider.
vi.mock('@utils/analytics', async () => {
  const actual = await vi.importActual<typeof import('@utils/analytics')>('@utils/analytics')
  return {
    ...actual,
    trackEvent: vi.fn(),
    trackCTAClick: vi.fn(),
    trackExternalLink: vi.fn(),
    trackSocialClick: vi.fn(),
    initScrollDepthTracking: vi.fn(() => vi.fn()),
  }
})

describe('useAnalytics — scroll depth deferral', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    // resetAllMocks clears mockReturnValueOnce queues too, unlike clearAllMocks —
    // prevents stale queued values from test 3 (cancelled timer) leaking into test 4.
    vi.resetAllMocks()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('defers initScrollDepthTracking via setTimeout when requestIdleCallback is unavailable', () => {
    // jsdom does not provide requestIdleCallback — the setTimeout fallback path is taken
    expect(typeof (globalThis as unknown as Record<string, unknown>).requestIdleCallback).toBe(
      'undefined'
    )

    renderHook(() => useAnalytics(true))
    expect(initScrollDepthTracking).not.toHaveBeenCalled()

    vi.runAllTimers()
    expect(initScrollDepthTracking).toHaveBeenCalledTimes(1)
  })

  it('does not schedule scroll tracking when enableScrollTracking is false', () => {
    renderHook(() => useAnalytics(false))
    vi.runAllTimers()
    expect(initScrollDepthTracking).not.toHaveBeenCalled()
  })

  it('cancels pending setTimeout on unmount before timer fires', () => {
    const scrollCleanup = vi.fn()
    vi.mocked(initScrollDepthTracking).mockReturnValueOnce(scrollCleanup)

    const { unmount } = renderHook(() => useAnalytics(true))
    unmount()
    vi.runAllTimers()

    expect(initScrollDepthTracking).not.toHaveBeenCalled()
    expect(scrollCleanup).not.toHaveBeenCalled()
  })

  it('calls scroll cleanup on unmount after timer already fired', () => {
    const scrollCleanup = vi.fn()
    vi.mocked(initScrollDepthTracking).mockReturnValueOnce(scrollCleanup)

    const { unmount } = renderHook(() => useAnalytics(true))
    vi.runAllTimers()
    expect(initScrollDepthTracking).toHaveBeenCalledTimes(1)

    unmount()
    expect(scrollCleanup).toHaveBeenCalledTimes(1)
  })

  it('uses requestIdleCallback when available', () => {
    let idleCallback: (() => void) | undefined
    const mockRic = vi.fn((cb: () => void) => {
      idleCallback = cb
      return 1
    })
    const mockCic = vi.fn()
    Object.defineProperty(globalThis, 'requestIdleCallback', { value: mockRic, configurable: true })
    Object.defineProperty(globalThis, 'cancelIdleCallback', { value: mockCic, configurable: true })

    try {
      renderHook(() => useAnalytics(true))

      expect(mockRic).toHaveBeenCalledWith(expect.any(Function), { timeout: 3000 })
      expect(initScrollDepthTracking).not.toHaveBeenCalled()

      idleCallback?.()
      expect(initScrollDepthTracking).toHaveBeenCalledTimes(1)
    } finally {
      Reflect.deleteProperty(globalThis, 'requestIdleCallback')
      Reflect.deleteProperty(globalThis, 'cancelIdleCallback')
    }
  })
})

describe('useAnalytics — tracking functions', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns all expected tracking functions', () => {
    const { result } = renderHook(() => useAnalytics(false))
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

  it('trackCTA delegates to trackCTAClick', () => {
    const { result } = renderHook(() => useAnalytics(false))
    result.current.trackCTA('Join Waitlist', 'hero')
    expect(trackCTAClick).toHaveBeenCalledWith('Join Waitlist', 'hero')
  })

  it('trackExternal delegates to trackExternalLink', () => {
    const { result } = renderHook(() => useAnalytics(false))
    result.current.trackExternal('https://example.com', 'Example')
    expect(trackExternalLink).toHaveBeenCalledWith('https://example.com', 'Example')
  })

  it('trackSocial delegates to trackSocialClick', () => {
    const { result } = renderHook(() => useAnalytics(false))
    result.current.trackSocial('twitter')
    expect(trackSocialClick).toHaveBeenCalledWith('twitter')
  })

  it('trackWaitlistJoin calls trackEvent with button_location', () => {
    const { result } = renderHook(() => useAnalytics(false))
    result.current.trackWaitlistJoin('hero')
    expect(trackEvent).toHaveBeenCalledWith('Waitlist_Join', { button_location: 'hero' })
  })

  it('trackWaitlistSubmit calls trackEvent with form_location', () => {
    const { result } = renderHook(() => useAnalytics(false))
    result.current.trackWaitlistSubmit('hero')
    expect(trackEvent).toHaveBeenCalledWith('Waitlist_Submit', { form_location: 'hero' })
  })

  it('trackWaitlistSuccess calls trackEvent with no extra params', () => {
    const { result } = renderHook(() => useAnalytics(false))
    result.current.trackWaitlistSuccess()
    expect(trackEvent).toHaveBeenCalledWith('Waitlist_Success', {})
  })

  it('trackWaitlistError calls trackEvent with error_code and form_location', () => {
    const { result } = renderHook(() => useAnalytics(false))
    result.current.trackWaitlistError('rate_limited', 'footer')
    expect(trackEvent).toHaveBeenCalledWith('Waitlist_Error', {
      error_code: 'rate_limited',
      form_location: 'footer',
    })
  })

  it('trackNavigation calls trackEvent with destination and link_text', () => {
    const { result } = renderHook(() => useAnalytics(false))
    result.current.trackNavigation('/pricing', 'Pricing')
    expect(trackEvent).toHaveBeenCalledWith('Navigation_Click', {
      destination: '/pricing',
      link_text: 'Pricing',
    })
  })

  it('trackFAQExpand calls trackEvent with question_index', () => {
    const { result } = renderHook(() => useAnalytics(false))
    result.current.trackFAQExpand(2)
    expect(trackEvent).toHaveBeenCalledWith('FAQ_Expand', { question_index: 2 })
  })
})
