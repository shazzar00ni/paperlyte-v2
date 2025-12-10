import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useScrollPosition } from './useScrollPosition'

describe('useScrollPosition', () => {
  let scrollCallbacks: ((e: Event) => void)[] = []

  beforeEach(() => {
    // Ensure window exists (important after SSR test)

    // Reset scroll position
    Object.defineProperty(window, 'scrollX', {
      writable: true,
      configurable: true,
      value: 0,
    })
    Object.defineProperty(window, 'scrollY', {
      writable: true,
      configurable: true,
      value: 0,
    })
    scrollCallbacks = []

    // Mock window properties
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 768,
    })

    Object.defineProperty(document.documentElement, 'scrollHeight', {
      writable: true,
      configurable: true,
      value: 2000,
    })

    // Mock addEventListener to capture scroll event handlers
    const originalAddEventListener = window.addEventListener
    vi.spyOn(window, 'addEventListener').mockImplementation(
      (
        event: string,
        handler: EventListenerOrEventListenerObject,
        options?: boolean | AddEventListenerOptions
      ) => {
        if (event === 'scroll') {
          scrollCallbacks.push(handler as (e: Event) => void)
        }
        return originalAddEventListener.call(window, event, handler, options)
      }
    )

    // Mock requestAnimationFrame
    let rafId = 0
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb: FrameRequestCallback) => {
      // Execute callback immediately in tests
      cb(0)
      return ++rafId
    })

    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
    scrollCallbacks = []
  })

  it('should return initial scroll position', () => {
    const { result } = renderHook(() => useScrollPosition())

    expect(result.current).toEqual({
      scrollX: 0,
      scrollY: 0,
      scrollProgress: 0,
    })
  })

  it('should calculate initial scroll progress correctly', () => {
    // Set initial scroll position (Half of scrollable height (2000 - 768) / 2 = 616)
    Object.defineProperty(window, 'scrollY', {
      writable: true,
      configurable: true,
      value: 616,
    })

    const { result } = renderHook(() => useScrollPosition())

    expect(result.current.scrollY).toBe(616)
    expect(result.current.scrollProgress).toBeCloseTo(0.5, 1)
  })

  it('should update scroll position on scroll event', async () => {
    const { result } = renderHook(() => useScrollPosition())

    // Initial state
    expect(result.current.scrollY).toBe(0)

    // Simulate scroll
    Object.defineProperty(window, 'scrollY', {
      writable: true,
      configurable: true,
      value: 500,
    })

    // Trigger scroll event
    scrollCallbacks.forEach((cb) => cb(new Event('scroll')))

    await waitFor(() => {
      expect(result.current.scrollY).toBe(500)
    })
  })

  it('should use requestAnimationFrame for scroll updates', () => {
    renderHook(() => useScrollPosition())

    // Trigger scroll event
    scrollCallbacks.forEach((cb) => cb(new Event('scroll')))

    expect(window.requestAnimationFrame).toHaveBeenCalled()
  })

  it('should throttle scroll updates with requestAnimationFrame', () => {
    // Mock RAF to not execute immediately BEFORE rendering the hook
    const mockRafId = 1
    vi.mocked(window.requestAnimationFrame).mockClear()
    vi.mocked(window.requestAnimationFrame).mockImplementation(() => {
      return mockRafId
    })

    renderHook(() => useScrollPosition())

    // Trigger multiple scroll events rapidly
    scrollCallbacks.forEach((cb) => cb(new Event('scroll')))
    scrollCallbacks.forEach((cb) => cb(new Event('scroll')))
    scrollCallbacks.forEach((cb) => cb(new Event('scroll')))

    // RAF should only be called once due to throttling
    expect(window.requestAnimationFrame).toHaveBeenCalledTimes(1)
  })

  it('should calculate scroll progress correctly', async () => {
    const { result } = renderHook(() => useScrollPosition())

    // Scroll to bottom
    const maxScroll = 2000 - 768 // scrollHeight - innerHeight
    Object.defineProperty(window, 'scrollY', {
      writable: true,
      configurable: true,
      value: maxScroll,
    })

    scrollCallbacks.forEach((cb) => cb(new Event('scroll')))

    await waitFor(() => {
      expect(result.current.scrollProgress).toBe(1)
    })
  })

  it('should clamp scroll progress to 0-1 range', async () => {
    const { result } = renderHook(() => useScrollPosition())

    // Set scroll beyond max (shouldn't happen in practice, but testing edge case)
    const beyondMax = 3000
    Object.defineProperty(window, 'scrollY', {
      writable: true,
      configurable: true,
      value: beyondMax,
    })

    scrollCallbacks.forEach((cb) => cb(new Event('scroll')))

    await waitFor(() => {
      expect(result.current.scrollProgress).toBe(1)
    })
  })

  it('should handle zero documentHeight edge case', () => {
    // Set documentHeight equal to innerHeight (no scrollable content)
    Object.defineProperty(document.documentElement, 'scrollHeight', {
      writable: true,
      configurable: true,
      value: 768, // Same as innerHeight
    })

    const { result } = renderHook(() => useScrollPosition())

    expect(result.current.scrollProgress).toBe(0)
  })

  it('should clean up event listeners on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')
    const { unmount } = renderHook(() => useScrollPosition())

    unmount()

    expect(removeEventListenerSpy).toHaveBeenCalledWith('scroll', expect.any(Function))
  })

  it('should cancel animation frame on unmount', () => {
    // Clear the default mock and set up a new one that doesn't execute immediately
    vi.mocked(window.requestAnimationFrame).mockClear()
    let pendingCallback: FrameRequestCallback | null = null
    const pendingId = 12345

    // Mock requestAnimationFrame to store callback but not execute it
    vi.mocked(window.requestAnimationFrame).mockImplementation((cb: FrameRequestCallback) => {
      pendingCallback = cb
      return pendingId
    })

    const { unmount } = renderHook(() => useScrollPosition())

    // Trigger a scroll to create a pending animation frame
    scrollCallbacks.forEach((cb) => cb(new Event('scroll')))

    // At this point, pendingCallback should be set, but not executed
    expect(typeof pendingCallback).toBe('function')

    unmount()

    expect(window.cancelAnimationFrame).toHaveBeenCalledWith(pendingId)
  })

  it('should return valid initial state', () => {
    // Verify that the hook returns valid initial state with expected properties
    const { result } = renderHook(() => useScrollPosition())

    expect(result.current).toHaveProperty('scrollX')
    expect(result.current).toHaveProperty('scrollY')
    expect(result.current).toHaveProperty('scrollProgress')
    expect(typeof result.current.scrollX).toBe('number')
    expect(typeof result.current.scrollY).toBe('number')
    expect(typeof result.current.scrollProgress).toBe('number')
  })

  it('should track horizontal scroll (scrollX)', async () => {
    const { result } = renderHook(() => useScrollPosition())

    // Simulate horizontal scroll
    Object.defineProperty(window, 'scrollX', {
      writable: true,
      configurable: true,
      value: 300,
    })

    scrollCallbacks.forEach((cb) => cb(new Event('scroll')))

    await waitFor(() => {
      expect(result.current.scrollX).toBe(300)
    })
  })

  it('should register scroll listener with passive option', () => {
    renderHook(() => useScrollPosition())

    expect(window.addEventListener).toHaveBeenCalledWith('scroll', expect.any(Function), {
      passive: true,
    })
  })

  it('should update all scroll values simultaneously', async () => {
    const { result } = renderHook(() => useScrollPosition())

    // Update both x and y scroll
    Object.defineProperty(window, 'scrollX', {
      writable: true,
      configurable: true,
      value: 200,
    })
    Object.defineProperty(window, 'scrollY', {
      writable: true,
      configurable: true,
      value: 616, // ~50% progress
    })

    scrollCallbacks.forEach((cb) => cb(new Event('scroll')))

    await waitFor(() => {
      expect(result.current.scrollX).toBe(200)
      expect(result.current.scrollY).toBe(616)
      expect(result.current.scrollProgress).toBeCloseTo(0.5, 1)
    })
  })

  it('should handle negative scroll values (edge case)', async () => {
    const { result } = renderHook(() => useScrollPosition())

    // Some browsers/scenarios might have negative scroll
    Object.defineProperty(window, 'scrollY', {
      writable: true,
      configurable: true,
      value: -10,
    })

    scrollCallbacks.forEach((cb) => cb(new Event('scroll')))

    await waitFor(() => {
      expect(result.current.scrollProgress).toBeGreaterThanOrEqual(0)
      expect(result.current.scrollProgress).toBeLessThanOrEqual(1)
    })
  })
})
