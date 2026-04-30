import { renderHook } from '@testing-library/react'
import { useAnalytics } from './useAnalytics'

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

// Import after mocking so we get the spy references
import {
  trackEvent,
  trackCTAClick,
  trackExternalLink,
  trackSocialClick,
  initScrollDepthTracking,
} from '@utils/analytics'

describe('useAnalytics — scroll depth deferral', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('defers initScrollDepthTracking via setTimeout when requestIdleCallback is unavailable', () => {
    // jsdom does not provide requestIdleCallback, so the setTimeout path is taken
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

  it('cancels pending setTimeout and calls scroll cleanup on unmount before timer fires', () => {
    const scrollCleanup = vi.fn()
    vi.mocked(initScrollDepthTracking).mockReturnValueOnce(scrollCleanup)

    const { unmount } = renderHook(() => useAnalytics(true))

    // Unmount before the deferred callback fires
    unmount()
    vi.runAllTimers()

    // Timer was cancelled — initScrollDepthTracking never ran
    expect(initScrollDepthTracking).not.toHaveBeenCalled()
    expect(scrollCleanup).not.toHaveBeenCalled()
  })

  it('calls scroll cleanup on unmount when timer already fired', () => {
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

      // Fire the idle callback
      idleCallback?.()
      expect(initScrollDepthTracking).toHaveBeenCalledTimes(1)
    } finally {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (globalThis as any).requestIdleCallback
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (globalThis as any).cancelIdleCallback
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

  it('trackCTA calls trackCTAClick with button text and location', () => {
    const { result } = renderHook(() => useAnalytics(false))
    result.current.trackCTA('Join Waitlist', 'hero')
    expect(trackCTAClick).toHaveBeenCalledWith('Join Waitlist', 'hero')
  })

  it('trackExternal calls trackExternalLink with url and text', () => {
    const { result } = renderHook(() => useAnalytics(false))
    result.current.trackExternal('https://example.com', 'Example')
    expect(trackExternalLink).toHaveBeenCalledWith('https://example.com', 'Example')
  })

  it('trackSocial calls trackSocialClick with platform', () => {
    const { result } = renderHook(() => useAnalytics(false))
    result.current.trackSocial('twitter')
    expect(trackSocialClick).toHaveBeenCalledWith('twitter')
  })

  it('trackWaitlistJoin calls trackEvent with button_location', () => {
    const { result } = renderHook(() => useAnalytics(false))
    result.current.trackWaitlistJoin('hero')
    expect(trackEvent).toHaveBeenCalledWith('waitlist_join', { button_location: 'hero' })
  })

  it('trackFAQExpand calls trackEvent with question_index', () => {
    const { result } = renderHook(() => useAnalytics(false))
    result.current.trackFAQExpand(2)
    expect(trackEvent).toHaveBeenCalledWith('faq_expand', { question_index: 2 })
  })
})
