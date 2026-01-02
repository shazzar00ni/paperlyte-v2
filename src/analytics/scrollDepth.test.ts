/**
 * Tests for scroll depth tracking
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ScrollDepthTracker, createScrollTracker } from './scrollDepth'
import type { ScrollDepth } from './types'

describe('analytics/scrollDepth', () => {
  let scrollCallback: ReturnType<typeof vi.fn<[ScrollDepth], void>>

  beforeEach(() => {
    scrollCallback = vi.fn()

    // Mock document and window properties for scroll calculation
    Object.defineProperty(document.documentElement, 'scrollHeight', {
      writable: true,
      configurable: true,
      value: 1000,
    })

    Object.defineProperty(document.documentElement, 'clientHeight', {
      writable: true,
      configurable: true,
      value: 500,
    })

    Object.defineProperty(document.documentElement, 'scrollTop', {
      writable: true,
      configurable: true,
      value: 0,
    })

    Object.defineProperty(window, 'scrollY', {
      writable: true,
      configurable: true,
      value: 0,
    })
  })

  afterEach(() => {
    vi.clearAllTimers()
  })

  describe('ScrollDepthTracker', () => {
    it('should initialize with empty tracked depths', () => {
      const tracker = new ScrollDepthTracker(scrollCallback)
      expect(tracker.getTrackedDepths()).toEqual([])
      expect(tracker.isComplete()).toBe(false)
    })

    it('should track 25% scroll depth', () => {
      vi.useFakeTimers()
      const tracker = new ScrollDepthTracker(scrollCallback)
      tracker.init()

      // Simulate scrolling to 25%
      Object.defineProperty(window, 'scrollY', { value: 125, writable: true })
      window.dispatchEvent(new Event('scroll'))

      // Wait for throttle
      vi.advanceTimersByTime(250)

      expect(scrollCallback).toHaveBeenCalledWith(25)
      expect(tracker.getTrackedDepths()).toEqual([25])

      tracker.disable()
      vi.useRealTimers()
    })

    it('should track 50% scroll depth', () => {
      vi.useFakeTimers()
      const tracker = new ScrollDepthTracker(scrollCallback)
      tracker.init()

      // Simulate scrolling to 50%
      Object.defineProperty(window, 'scrollY', { value: 250, writable: true })
      window.dispatchEvent(new Event('scroll'))

      // Wait for throttle
      vi.advanceTimersByTime(250)

      expect(scrollCallback).toHaveBeenCalledWith(25)
      expect(scrollCallback).toHaveBeenCalledWith(50)
      expect(tracker.getTrackedDepths()).toEqual([25, 50])

      tracker.disable()
      vi.useRealTimers()
    })

    it('should track 75% scroll depth', () => {
      vi.useFakeTimers()
      const tracker = new ScrollDepthTracker(scrollCallback)
      tracker.init()

      // Simulate scrolling to 75%
      Object.defineProperty(window, 'scrollY', { value: 375, writable: true })
      window.dispatchEvent(new Event('scroll'))

      // Wait for throttle
      vi.advanceTimersByTime(250)

      expect(scrollCallback).toHaveBeenCalledWith(25)
      expect(scrollCallback).toHaveBeenCalledWith(50)
      expect(scrollCallback).toHaveBeenCalledWith(75)
      expect(tracker.getTrackedDepths()).toEqual([25, 50, 75])

      tracker.disable()
      vi.useRealTimers()
    })

    it('should track 100% scroll depth', () => {
      vi.useFakeTimers()
      const tracker = new ScrollDepthTracker(scrollCallback)
      tracker.init()

      // Simulate scrolling to 100%
      Object.defineProperty(window, 'scrollY', { value: 500, writable: true })
      window.dispatchEvent(new Event('scroll'))

      // Wait for throttle
      vi.advanceTimersByTime(250)

      expect(scrollCallback).toHaveBeenCalledWith(25)
      expect(scrollCallback).toHaveBeenCalledWith(50)
      expect(scrollCallback).toHaveBeenCalledWith(75)
      expect(scrollCallback).toHaveBeenCalledWith(100)
      expect(tracker.getTrackedDepths()).toEqual([25, 50, 75, 100])
      expect(tracker.isComplete()).toBe(true)

      vi.useRealTimers()
    })

    it('should not track the same depth twice', () => {
      vi.useFakeTimers()
      const tracker = new ScrollDepthTracker(scrollCallback)
      tracker.init()

      // Simulate scrolling to 50%
      Object.defineProperty(window, 'scrollY', { value: 250, writable: true })
      window.dispatchEvent(new Event('scroll'))
      vi.advanceTimersByTime(250)

      // Clear the mock
      scrollCallback.mockClear()

      // Scroll again at same depth
      window.dispatchEvent(new Event('scroll'))
      vi.advanceTimersByTime(250)

      // Should not call callback again for already tracked depths
      expect(scrollCallback).not.toHaveBeenCalledWith(50)

      tracker.disable()
      vi.useRealTimers()
    })

    it('should throttle scroll events', () => {
      vi.useFakeTimers()

      // Set scroll before creating tracker
      Object.defineProperty(window, 'scrollY', { value: 0, writable: true })

      const tracker = new ScrollDepthTracker(scrollCallback)
      tracker.init()

      // Wait for initial check to complete
      vi.runAllTimers()
      scrollCallback.mockClear()

      // Simulate multiple rapid scroll events
      Object.defineProperty(window, 'scrollY', { value: 250, writable: true })

      for (let i = 0; i < 5; i++) {
        window.dispatchEvent(new Event('scroll'))
        vi.advanceTimersByTime(100) // Advance less than throttle time (250ms)
      }

      // Advance to pass throttle window
      vi.advanceTimersByTime(250)

      // Should have processed depth
      expect(scrollCallback).toHaveBeenCalled()
      expect(scrollCallback).toHaveBeenCalledWith(25)
      expect(scrollCallback).toHaveBeenCalledWith(50)

      tracker.disable()
      vi.useRealTimers()
    })

    it('should check initial scroll position on init', () => {
      vi.useFakeTimers()
      // Set initial scroll to 50%
      Object.defineProperty(window, 'scrollY', { value: 250, writable: true })

      const tracker = new ScrollDepthTracker(scrollCallback)
      tracker.init()

      // Should immediately check and track current position
      expect(scrollCallback).toHaveBeenCalledWith(25)
      expect(scrollCallback).toHaveBeenCalledWith(50)

      tracker.disable()
      vi.useRealTimers()
    })

    it('should auto-disable after all depths are tracked', () => {
      vi.useFakeTimers()
      const tracker = new ScrollDepthTracker(scrollCallback)
      tracker.init()

      // Simulate scrolling to 100%
      Object.defineProperty(window, 'scrollY', { value: 500, writable: true })
      window.dispatchEvent(new Event('scroll'))
      vi.advanceTimersByTime(250)

      expect(tracker.isComplete()).toBe(true)

      // Clear callback and scroll again
      scrollCallback.mockClear()
      window.dispatchEvent(new Event('scroll'))
      vi.advanceTimersByTime(250)

      // Should not track anymore as it's disabled
      expect(scrollCallback).not.toHaveBeenCalled()

      vi.useRealTimers()
    })

    it('should reset tracked depths', () => {
      vi.useFakeTimers()
      const tracker = new ScrollDepthTracker(scrollCallback)
      tracker.init()

      // Track some depths
      Object.defineProperty(window, 'scrollY', { value: 250, writable: true })
      window.dispatchEvent(new Event('scroll'))
      vi.advanceTimersByTime(250)

      expect(tracker.getTrackedDepths()).toEqual([25, 50])

      tracker.disable()

      // Reset scroll position before reset
      Object.defineProperty(window, 'scrollY', { value: 0, writable: true })

      // Reset
      tracker.reset()

      expect(tracker.getTrackedDepths()).toEqual([])
      expect(tracker.isComplete()).toBe(false)

      tracker.disable()
      vi.useRealTimers()
    })

    it('should re-init after reset', () => {
      vi.useFakeTimers()
      const tracker = new ScrollDepthTracker(scrollCallback)
      tracker.init()

      // Track some depths
      Object.defineProperty(window, 'scrollY', { value: 250, writable: true })
      window.dispatchEvent(new Event('scroll'))
      vi.advanceTimersByTime(250)

      tracker.disable()
      scrollCallback.mockClear()

      // Reset should re-init
      tracker.reset()

      // Should check current position again
      window.dispatchEvent(new Event('scroll'))
      vi.advanceTimersByTime(250)

      expect(scrollCallback).toHaveBeenCalled()

      tracker.disable()
      vi.useRealTimers()
    })

    it('should cleanup on disable', () => {
      vi.useFakeTimers()
      const tracker = new ScrollDepthTracker(scrollCallback)
      tracker.init()

      tracker.disable()

      // Scroll after disable should not trigger callback
      Object.defineProperty(window, 'scrollY', { value: 250, writable: true })
      window.dispatchEvent(new Event('scroll'))
      vi.advanceTimersByTime(250)

      expect(scrollCallback).not.toHaveBeenCalled()

      vi.useRealTimers()
    })

    it('should handle zero scrollable height', () => {
      vi.useFakeTimers()
      // Set scrollHeight equal to clientHeight (no scrollable area)
      Object.defineProperty(document.documentElement, 'scrollHeight', {
        writable: true,
        value: 500,
      })

      const tracker = new ScrollDepthTracker(scrollCallback)
      tracker.init()

      window.dispatchEvent(new Event('scroll'))
      vi.advanceTimersByTime(250)

      // Should track 100% immediately since scroll percentage is 0
      expect(scrollCallback).not.toHaveBeenCalled()

      tracker.disable()
      vi.useRealTimers()
    })
  })

  describe('createScrollTracker', () => {
    it('should create and initialize tracker', () => {
      vi.useFakeTimers()
      const tracker = createScrollTracker(scrollCallback)

      // Tracker should be initialized
      Object.defineProperty(window, 'scrollY', { value: 250, writable: true })
      window.dispatchEvent(new Event('scroll'))
      vi.advanceTimersByTime(250)

      expect(scrollCallback).toHaveBeenCalled()

      tracker.disable()
      vi.useRealTimers()
    })

    it('should return ScrollDepthTracker instance', () => {
      const tracker = createScrollTracker(scrollCallback)
      expect(tracker).toBeInstanceOf(ScrollDepthTracker)
      expect(tracker.getTrackedDepths).toBeDefined()
      expect(tracker.isComplete).toBeDefined()
      expect(tracker.reset).toBeDefined()
      expect(tracker.disable).toBeDefined()
      tracker.disable()
    })
  })
})
