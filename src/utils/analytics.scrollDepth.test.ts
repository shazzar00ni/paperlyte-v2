import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { initScrollDepthTracking, AnalyticsEvents } from './analytics'

describe('Analytics Scroll Depth Tracking', () => {
  let scrollEventListener: (() => void) | null = null

  beforeEach(() => {
    // Clear any existing gtag
    delete (window as Window & { gtag?: unknown }).gtag
    delete (window as Window & { dataLayer?: unknown }).dataLayer

    // Mock window dimensions
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 1000,
    })

    Object.defineProperty(window, 'scrollY', {
      writable: true,
      configurable: true,
      value: 0,
    })

    Object.defineProperty(document.documentElement, 'scrollHeight', {
      writable: true,
      configurable: true,
      value: 4000,
    })

    // Capture the scroll event listener
    const originalAddEventListener = window.addEventListener
    vi.spyOn(window, 'addEventListener').mockImplementation(
      (
        event: string,
        listener: EventListener | EventListenerObject,
        options?: boolean | AddEventListenerOptions
      ) => {
        if (event === 'scroll') {
          scrollEventListener = listener as () => void
        }
        return originalAddEventListener.call(window, event, listener, options)
      }
    )

    // Mock requestAnimationFrame
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      callback(0)
      return 0
    })
  })

  afterEach(() => {
    scrollEventListener = null
    vi.restoreAllMocks()
  })

  it('should return cleanup function', () => {
    const cleanup = initScrollDepthTracking()
    expect(cleanup).toBeInstanceOf(Function)
    cleanup()
  })

  it('should add scroll event listener with passive option', () => {
    const addEventListenerSpy = vi.spyOn(window, 'addEventListener')

    const cleanup = initScrollDepthTracking()

    expect(addEventListenerSpy).toHaveBeenCalledWith('scroll', expect.any(Function), {
      passive: true,
    })

    cleanup()
  })

  it('should track 25% milestone', () => {
    const mockGtag = vi.fn()
    ;(window as Window & { gtag?: typeof mockGtag }).gtag = mockGtag

    const cleanup = initScrollDepthTracking()

    // Scroll to 25% (1000 + scrollY = 0.25 * 4000 = 1000)
    Object.defineProperty(window, 'scrollY', {
      writable: true,
      configurable: true,
      value: 0, // (0 + 1000) / 4000 = 0.25 = 25%
    })

    if (scrollEventListener) {
      scrollEventListener()
    }

    expect(mockGtag).toHaveBeenCalledWith('event', AnalyticsEvents.SCROLL_DEPTH, {
      depth_percentage: 25,
    })

    cleanup()
  })

  it('should track 50% milestone', () => {
    const mockGtag = vi.fn()
    ;(window as Window & { gtag?: typeof mockGtag }).gtag = mockGtag

    const cleanup = initScrollDepthTracking()

    // Scroll to 50% (scrollY + 1000 = 0.50 * 4000 = 2000)
    Object.defineProperty(window, 'scrollY', {
      writable: true,
      configurable: true,
      value: 1000, // (1000 + 1000) / 4000 = 0.50 = 50%
    })

    if (scrollEventListener) {
      scrollEventListener()
    }

    expect(mockGtag).toHaveBeenCalledWith('event', AnalyticsEvents.SCROLL_DEPTH, {
      depth_percentage: 50,
    })

    cleanup()
  })

  it('should track 75% milestone', () => {
    const mockGtag = vi.fn()
    ;(window as Window & { gtag?: typeof mockGtag }).gtag = mockGtag

    const cleanup = initScrollDepthTracking()

    // Scroll to 75%
    Object.defineProperty(window, 'scrollY', {
      writable: true,
      configurable: true,
      value: 2000, // (2000 + 1000) / 4000 = 0.75 = 75%
    })

    if (scrollEventListener) {
      scrollEventListener()
    }

    expect(mockGtag).toHaveBeenCalledWith('event', AnalyticsEvents.SCROLL_DEPTH, {
      depth_percentage: 75,
    })

    cleanup()
  })

  it('should track 100% milestone', () => {
    const mockGtag = vi.fn()
    ;(window as Window & { gtag?: typeof mockGtag }).gtag = mockGtag

    const cleanup = initScrollDepthTracking()

    // Scroll to 100%
    Object.defineProperty(window, 'scrollY', {
      writable: true,
      configurable: true,
      value: 3000, // (3000 + 1000) / 4000 = 1.0 = 100%
    })

    if (scrollEventListener) {
      scrollEventListener()
    }

    expect(mockGtag).toHaveBeenCalledWith('event', AnalyticsEvents.SCROLL_DEPTH, {
      depth_percentage: 100,
    })

    cleanup()
  })

  it('should track each milestone only once', () => {
    const mockGtag = vi.fn()
    ;(window as Window & { gtag?: typeof mockGtag }).gtag = mockGtag

    const cleanup = initScrollDepthTracking()

    // Scroll to 50%
    Object.defineProperty(window, 'scrollY', {
      writable: true,
      configurable: true,
      value: 1000,
    })

    if (scrollEventListener) {
      scrollEventListener()
      scrollEventListener()
      scrollEventListener()
    }

    // Should only track once despite multiple scroll events
    expect(mockGtag).toHaveBeenCalledTimes(2) // 25% and 50%

    cleanup()
  })

  it('should track multiple milestones in sequence', () => {
    const mockGtag = vi.fn()
    ;(window as Window & { gtag?: typeof mockGtag }).gtag = mockGtag

    const cleanup = initScrollDepthTracking()

    // Start at 0, scroll to 100% to trigger all milestones
    Object.defineProperty(window, 'scrollY', {
      writable: true,
      configurable: true,
      value: 3000, // (3000 + 1000) / 4000 = 100%
    })

    if (scrollEventListener) {
      scrollEventListener()
    }

    // Should track all milestones that have been reached (25%, 50%, 75%, 100%)
    expect(mockGtag).toHaveBeenCalledWith('event', AnalyticsEvents.SCROLL_DEPTH, {
      depth_percentage: 25,
    })
    expect(mockGtag).toHaveBeenCalledWith('event', AnalyticsEvents.SCROLL_DEPTH, {
      depth_percentage: 50,
    })
    expect(mockGtag).toHaveBeenCalledWith('event', AnalyticsEvents.SCROLL_DEPTH, {
      depth_percentage: 75,
    })
    expect(mockGtag).toHaveBeenCalledWith('event', AnalyticsEvents.SCROLL_DEPTH, {
      depth_percentage: 100,
    })

    cleanup()
  })

  it('should throttle scroll events using requestAnimationFrame', () => {
    const rafSpy = vi.spyOn(window, 'requestAnimationFrame')

    const cleanup = initScrollDepthTracking()

    if (scrollEventListener) {
      scrollEventListener()
    }

    expect(rafSpy).toHaveBeenCalled()

    cleanup()
  })

  it('should remove scroll listener on cleanup', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')

    const cleanup = initScrollDepthTracking()
    cleanup()

    expect(removeEventListenerSpy).toHaveBeenCalledWith('scroll', expect.any(Function))
  })

  it('should handle edge case when document height is zero', () => {
    const mockGtag = vi.fn()
    ;(window as Window & { gtag?: typeof mockGtag }).gtag = mockGtag

    Object.defineProperty(document.documentElement, 'scrollHeight', {
      writable: true,
      configurable: true,
      value: 0,
    })

    const cleanup = initScrollDepthTracking()

    if (scrollEventListener) {
      scrollEventListener()
    }

    // Should not track anything when document height is 0
    expect(mockGtag).not.toHaveBeenCalled()

    cleanup()
  })

  it('should work without gtag available', () => {
    const cleanup = initScrollDepthTracking()

    if (scrollEventListener) {
      expect(() => {
        scrollEventListener()
      }).not.toThrow()
    }

    cleanup()
  })
})
