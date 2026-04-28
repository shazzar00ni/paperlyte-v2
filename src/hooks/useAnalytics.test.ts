import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { createScrollTracker } from '@/analytics/scrollDepth'
import { trackEvent, AnalyticsEvents } from '@utils/analytics'
import { useAnalytics } from '@/hooks/useAnalytics'

// Stub createScrollTracker so tests don't depend on DOM scroll events
vi.mock('@/analytics/scrollDepth', () => ({
  createScrollTracker: vi.fn(() => ({ disable: vi.fn() })),
}))

// Stub trackEvent so we can assert the scroll-depth callback wiring
vi.mock('@utils/analytics', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@utils/analytics')>()
  return {
    ...actual,
    trackEvent: vi.fn(),
  }
})

describe('useAnalytics', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

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
})
