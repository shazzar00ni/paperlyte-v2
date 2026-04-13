import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useAnalytics } from './useAnalytics'

// Stub createScrollTracker so tests don't depend on DOM scroll events
vi.mock('../analytics/scrollDepth', () => ({
  createScrollTracker: vi.fn(() => ({ disable: vi.fn() })),
}))

describe('useAnalytics', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('initialises scroll tracking on mount when enabled', async () => {
    const { createScrollTracker } = await import('../analytics/scrollDepth')
    renderHook(() => useAnalytics(true))
    expect(createScrollTracker).toHaveBeenCalledTimes(1)
  })

  it('does not initialise scroll tracking when disabled', async () => {
    const { createScrollTracker } = await import('../analytics/scrollDepth')
    renderHook(() => useAnalytics(false))
    expect(createScrollTracker).not.toHaveBeenCalled()
  })

  it('calls tracker.disable() on unmount', async () => {
    const disableMock = vi.fn()
    const { createScrollTracker } = await import('../analytics/scrollDepth')
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
