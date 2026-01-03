/**
 * Tests for scroll depth tracking
 *
 * Tests ScrollDepthTracker initialization, scroll event handling,
 * milestone tracking, throttling, and lifecycle management.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { ScrollDepthTracker, createScrollTracker } from '../scrollDepth'
import { mockScrollAPI, createCleanup } from '../../test/analytics-helpers'
import type { ScrollDepth } from '../types'

describe('Scroll Depth Tracking', () => {
  let scrollMock: ReturnType<typeof mockScrollAPI>
  let cleanup: ReturnType<typeof createCleanup>
  let callback: ReturnType<typeof vi.fn<[ScrollDepth], void>>

  beforeEach(() => {
    cleanup = createCleanup()
    scrollMock = mockScrollAPI()
    callback = vi.fn()
    vi.useFakeTimers()
  })

  afterEach(() => {
    cleanup.cleanupAll()
    scrollMock.restore()
    vi.clearAllMocks()
    vi.clearAllTimers()
    vi.useRealTimers()
  })

  describe('ScrollDepthTracker initialization', () => {
    it('should create tracker instance', () => {
      const tracker = new ScrollDepthTracker(callback)
      expect(tracker).toBeInstanceOf(ScrollDepthTracker)
    })

    it('should not be enabled before init', () => {
      const tracker = new ScrollDepthTracker(callback)
      expect(tracker.isComplete()).toBe(false)
      expect(tracker.getTrackedDepths()).toHaveLength(0)
    })

    it('should attach scroll listener on init', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener')
      const tracker = new ScrollDepthTracker(callback)
      tracker.init()

      expect(addEventListenerSpy).toHaveBeenCalledWith(
        'scroll',
        expect.any(Function),
        { passive: true }
      )
    })

    it('should check initial scroll position on init', () => {
      scrollMock.setScroll({
        scrollY: 500,
        scrollHeight: 2000,
        innerHeight: 800,
      })

      const tracker = new ScrollDepthTracker(callback)
      tracker.init()

      // At 500px scroll with 1200px scrollable height = 41.67%, should trigger 25% milestone
      expect(callback).toHaveBeenCalledWith(25)
    })

    it('should not initialize twice', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener')
      const tracker = new ScrollDepthTracker(callback)
      tracker.init()
      tracker.init()

      // Should only be called once
      expect(addEventListenerSpy).toHaveBeenCalledTimes(1)
    })
  })

  describe('Scroll milestone tracking', () => {
    it('should trigger 25% milestone', () => {
      scrollMock.setScroll({
        scrollY: 0,
        scrollHeight: 2000,
        innerHeight: 800,
      })

      const tracker = new ScrollDepthTracker(callback)
      tracker.init()

      // Scroll to 25%: scrollable = 1200px, 25% = 300px
      scrollMock.setScroll({ scrollY: 300 })
      scrollMock.triggerScroll()
      vi.advanceTimersByTime(250)

      expect(callback).toHaveBeenCalledWith(25)
      expect(tracker.getTrackedDepths()).toEqual([25])
    })

    it('should trigger 50% milestone', () => {
      scrollMock.setScroll({
        scrollY: 0,
        scrollHeight: 2000,
        innerHeight: 800,
      })

      const tracker = new ScrollDepthTracker(callback)
      tracker.init()

      // Scroll to 50%: scrollable = 1200px, 50% = 600px
      scrollMock.setScroll({ scrollY: 600 })
      scrollMock.triggerScroll()
      vi.advanceTimersByTime(250)

      expect(callback).toHaveBeenCalledWith(25)
      expect(callback).toHaveBeenCalledWith(50)
      expect(tracker.getTrackedDepths()).toEqual([25, 50])
    })

    it('should trigger 75% milestone', () => {
      scrollMock.setScroll({
        scrollY: 0,
        scrollHeight: 2000,
        innerHeight: 800,
      })

      const tracker = new ScrollDepthTracker(callback)
      tracker.init()

      // Scroll to 75%: scrollable = 1200px, 75% = 900px
      scrollMock.setScroll({ scrollY: 900 })
      scrollMock.triggerScroll()
      vi.advanceTimersByTime(250)

      expect(callback).toHaveBeenCalledWith(25)
      expect(callback).toHaveBeenCalledWith(50)
      expect(callback).toHaveBeenCalledWith(75)
      expect(tracker.getTrackedDepths()).toEqual([25, 50, 75])
    })

    it('should trigger 100% milestone', () => {
      scrollMock.setScroll({
        scrollY: 0,
        scrollHeight: 2000,
        innerHeight: 800,
      })

      const tracker = new ScrollDepthTracker(callback)
      tracker.init()

      // Scroll to 100%: scrollable = 1200px, 100% = 1200px
      scrollMock.setScroll({ scrollY: 1200 })
      scrollMock.triggerScroll()
      vi.advanceTimersByTime(250)

      expect(callback).toHaveBeenCalledWith(25)
      expect(callback).toHaveBeenCalledWith(50)
      expect(callback).toHaveBeenCalledWith(75)
      expect(callback).toHaveBeenCalledWith(100)
      expect(tracker.getTrackedDepths()).toEqual([25, 50, 75, 100])
    })

    it('should only trigger each milestone once', () => {
      scrollMock.setScroll({
        scrollY: 0,
        scrollHeight: 2000,
        innerHeight: 800,
      })

      const tracker = new ScrollDepthTracker(callback)
      tracker.init()

      // Scroll to 50% multiple times
      scrollMock.setScroll({ scrollY: 600 })
      scrollMock.triggerScroll()
      vi.advanceTimersByTime(250)

      scrollMock.triggerScroll()
      vi.advanceTimersByTime(250)

      scrollMock.triggerScroll()
      vi.advanceTimersByTime(250)

      // Should only be called once for each milestone
      expect(callback).toHaveBeenCalledTimes(2) // 25% and 50%
      expect(tracker.getTrackedDepths()).toEqual([25, 50])
    })

    it('should skip milestones when scrolling past them', () => {
      scrollMock.setScroll({
        scrollY: 0,
        scrollHeight: 2000,
        innerHeight: 800,
      })

      const tracker = new ScrollDepthTracker(callback)
      tracker.init()

      // Scroll directly to 75%
      scrollMock.setScroll({ scrollY: 900 })
      scrollMock.triggerScroll()
      vi.advanceTimersByTime(250)

      // Should trigger all milestones up to 75%
      expect(callback).toHaveBeenCalledWith(25)
      expect(callback).toHaveBeenCalledWith(50)
      expect(callback).toHaveBeenCalledWith(75)
      expect(callback).toHaveBeenCalledTimes(3)
    })
  })

  describe('Throttling', () => {
    it('should throttle scroll events to 250ms', () => {
      scrollMock.setScroll({
        scrollY: 0,
        scrollHeight: 2000,
        innerHeight: 800,
      })

      const tracker = new ScrollDepthTracker(callback)
      tracker.init()

      // Trigger multiple scroll events rapidly
      scrollMock.setScroll({ scrollY: 300 })
      scrollMock.triggerScroll()

      scrollMock.setScroll({ scrollY: 400 })
      scrollMock.triggerScroll()

      scrollMock.setScroll({ scrollY: 500 })
      scrollMock.triggerScroll()

      // Should not trigger callback yet (throttled)
      expect(callback).not.toHaveBeenCalled()

      // Advance 250ms
      vi.advanceTimersByTime(250)

      // Should trigger callback once with latest scroll position
      expect(callback).toHaveBeenCalledWith(25)
    })

    it('should allow check after throttle timeout', () => {
      scrollMock.setScroll({
        scrollY: 0,
        scrollHeight: 2000,
        innerHeight: 800,
      })

      const tracker = new ScrollDepthTracker(callback)
      tracker.init()

      // First scroll
      scrollMock.setScroll({ scrollY: 300 })
      scrollMock.triggerScroll()
      vi.advanceTimersByTime(250)

      expect(callback).toHaveBeenCalledWith(25)
      callback.mockClear()

      // Second scroll after throttle timeout
      scrollMock.setScroll({ scrollY: 600 })
      scrollMock.triggerScroll()
      vi.advanceTimersByTime(250)

      expect(callback).toHaveBeenCalledWith(50)
    })

    it('should handle rapid scrolling with throttle', () => {
      scrollMock.setScroll({
        scrollY: 0,
        scrollHeight: 2000,
        innerHeight: 800,
      })

      const tracker = new ScrollDepthTracker(callback)
      tracker.init()

      // Rapidly scroll through milestones
      for (let i = 0; i < 10; i++) {
        scrollMock.setScroll({ scrollY: 100 * i })
        scrollMock.triggerScroll()
        vi.advanceTimersByTime(100) // Less than throttle time
      }

      // Should have triggered milestones based on throttled checks
      expect(callback.mock.calls.length).toBeGreaterThan(0)
    })
  })

  describe('Enable/Disable', () => {
    it('should disable scroll tracking', () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')
      const tracker = new ScrollDepthTracker(callback)
      tracker.init()
      tracker.disable()

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'scroll',
        expect.any(Function)
      )
    })

    it('should not track after disable', () => {
      scrollMock.setScroll({
        scrollY: 0,
        scrollHeight: 2000,
        innerHeight: 800,
      })

      const tracker = new ScrollDepthTracker(callback)
      tracker.init()
      tracker.disable()

      scrollMock.setScroll({ scrollY: 600 })
      scrollMock.triggerScroll()
      vi.advanceTimersByTime(250)

      expect(callback).not.toHaveBeenCalled()
    })

    it('should clear throttle timeout on disable', () => {
      const tracker = new ScrollDepthTracker(callback)
      tracker.init()

      scrollMock.triggerScroll()
      tracker.disable()

      vi.advanceTimersByTime(250)

      // Should not trigger callback after disable
      expect(callback).not.toHaveBeenCalled()
    })

    it('should auto-disable when all milestones are tracked', () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')

      scrollMock.setScroll({
        scrollY: 0,
        scrollHeight: 2000,
        innerHeight: 800,
      })

      const tracker = new ScrollDepthTracker(callback)
      tracker.init()

      // Scroll to 100%
      scrollMock.setScroll({ scrollY: 1200 })
      scrollMock.triggerScroll()
      vi.advanceTimersByTime(250)

      expect(tracker.isComplete()).toBe(true)
      expect(removeEventListenerSpy).toHaveBeenCalled()
    })
  })

  describe('Reset', () => {
    it('should reset tracked depths', () => {
      scrollMock.setScroll({
        scrollY: 0,
        scrollHeight: 2000,
        innerHeight: 800,
      })

      const tracker = new ScrollDepthTracker(callback)
      tracker.init()

      scrollMock.setScroll({ scrollY: 600 })
      scrollMock.triggerScroll()
      vi.advanceTimersByTime(250)

      expect(tracker.getTrackedDepths()).toEqual([25, 50])

      tracker.reset()

      expect(tracker.getTrackedDepths()).toEqual([])
      expect(tracker.isComplete()).toBe(false)
    })

    it('should re-initialize if disabled after reset', () => {
      const tracker = new ScrollDepthTracker(callback)
      tracker.init()
      tracker.disable()

      expect(tracker.getTrackedDepths()).toEqual([])

      tracker.reset()

      // Should re-initialize
      scrollMock.setScroll({
        scrollY: 600,
        scrollHeight: 2000,
        innerHeight: 800,
      })
      scrollMock.triggerScroll()
      vi.advanceTimersByTime(250)

      expect(callback).toHaveBeenCalled()
    })
  })

  describe('createScrollTracker', () => {
    it('should create and initialize tracker', () => {
      const tracker = createScrollTracker(callback)

      expect(tracker).toBeInstanceOf(ScrollDepthTracker)
      expect(tracker.getTrackedDepths()).toBeDefined()
    })

    it('should auto-initialize on creation', () => {
      scrollMock.setScroll({
        scrollY: 300,
        scrollHeight: 2000,
        innerHeight: 800,
      })

      createScrollTracker(callback)

      // Should have checked initial scroll position
      expect(callback).toHaveBeenCalledWith(25)
    })
  })

  describe('Edge cases', () => {
    it('should handle zero scrollable height', () => {
      scrollMock.setScroll({
        scrollY: 0,
        scrollHeight: 800,
        innerHeight: 800,
      })

      const tracker = new ScrollDepthTracker(callback)
      tracker.init()

      scrollMock.triggerScroll()
      vi.advanceTimersByTime(250)

      // With no scrollable content, scroll percentage should be 0
      expect(callback).not.toHaveBeenCalled()
    })

    it('should handle scrollTop as fallback to scrollY', () => {
      // The implementation uses scrollY || scrollTop, so if scrollY is 0 but scrollTop has value,
      // it will use scrollTop as fallback
      scrollMock.setScroll({
        scrollY: 0,
        scrollTop: 600,
        scrollHeight: 2000,
        innerHeight: 800,
      })

      const tracker = new ScrollDepthTracker(callback)
      tracker.init()

      scrollMock.triggerScroll()
      vi.advanceTimersByTime(250)

      // When scrollY is 0, scrollTop is used as fallback
      // At 600px scroll with 1200px scrollable = 50%
      expect(callback).toHaveBeenCalledWith(25)
      expect(callback).toHaveBeenCalledWith(50)
    })

    it('should handle very tall pages', () => {
      scrollMock.setScroll({
        scrollY: 0,
        scrollHeight: 20000,
        innerHeight: 800,
      })

      const tracker = new ScrollDepthTracker(callback)
      tracker.init()

      // Scroll to 50%: scrollable = 19200px, 50% = 9600px
      scrollMock.setScroll({ scrollY: 9600 })
      scrollMock.triggerScroll()
      vi.advanceTimersByTime(250)

      expect(callback).toHaveBeenCalledWith(25)
      expect(callback).toHaveBeenCalledWith(50)
    })

    it('should handle scroll beyond 100%', () => {
      scrollMock.setScroll({
        scrollY: 0,
        scrollHeight: 2000,
        innerHeight: 800,
      })

      const tracker = new ScrollDepthTracker(callback)
      tracker.init()

      // Scroll beyond 100% (e.g., due to overscroll)
      scrollMock.setScroll({ scrollY: 1500 })
      scrollMock.triggerScroll()
      vi.advanceTimersByTime(250)

      expect(tracker.getTrackedDepths()).toEqual([25, 50, 75, 100])
      expect(tracker.isComplete()).toBe(true)
    })
  })

  describe('Completion tracking', () => {
    it('should report isComplete when all milestones tracked', () => {
      scrollMock.setScroll({
        scrollY: 1200,
        scrollHeight: 2000,
        innerHeight: 800,
      })

      const tracker = new ScrollDepthTracker(callback)
      tracker.init()

      vi.advanceTimersByTime(250)

      expect(tracker.isComplete()).toBe(true)
    })

    it('should not be complete with partial tracking', () => {
      scrollMock.setScroll({
        scrollY: 600,
        scrollHeight: 2000,
        innerHeight: 800,
      })

      const tracker = new ScrollDepthTracker(callback)
      tracker.init()

      vi.advanceTimersByTime(250)

      expect(tracker.isComplete()).toBe(false)
      expect(tracker.getTrackedDepths()).toEqual([25, 50])
    })
  })
})
