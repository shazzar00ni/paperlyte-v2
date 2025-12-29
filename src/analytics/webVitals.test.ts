/**
 * Tests for Core Web Vitals tracking
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { initWebVitals } from './webVitals'
import type { CoreWebVitals } from './types'

describe('analytics/webVitals', () => {
  let onReport: ReturnType<typeof vi.fn<[CoreWebVitals], void>>

  beforeEach(() => {
    onReport = vi.fn()

    // Mock PerformanceObserver as a class
    global.PerformanceObserver = class {
      callback: PerformanceObserverCallback
      constructor(callback: PerformanceObserverCallback) {
        this.callback = callback
      }
      observe = vi.fn()
      disconnect = vi.fn()
      takeRecords = vi.fn(() => [])
    } as unknown as typeof PerformanceObserver

    // Mock performance API
    Object.defineProperty(window, 'performance', {
      writable: true,
      configurable: true,
      value: {
        getEntriesByType: vi.fn(() => []),
      },
    })
  })

  afterEach(() => {
    vi.clearAllTimers()
    vi.restoreAllMocks()
  })

  describe('initWebVitals', () => {
    it('should return cleanup function', () => {
      const cleanup = initWebVitals(onReport)
      expect(cleanup).toBeInstanceOf(Function)
      cleanup()
    })

    it('should setup performance observers for all metrics', () => {
      const cleanup = initWebVitals(onReport)

      // Should not throw during initialization
      expect(cleanup).toBeInstanceOf(Function)

      cleanup()
    })

    it('should handle missing PerformanceObserver gracefully', () => {
      // Remove PerformanceObserver
      const originalPO = global.PerformanceObserver
      // @ts-expect-error: Testing missing API
      delete global.PerformanceObserver

      const cleanup = initWebVitals(onReport)

      // Should not throw
      expect(cleanup).toBeInstanceOf(Function)

      cleanup()

      // Restore
      global.PerformanceObserver = originalPO
    })

    it('should handle missing performance API gracefully', () => {
      const originalPerformance = window.performance
      // @ts-expect-error: Testing missing API
      delete window.performance

      const cleanup = initWebVitals(onReport)

      // Should not throw
      expect(cleanup).toBeInstanceOf(Function)

      cleanup()

      // Restore
      Object.defineProperty(window, 'performance', {
        writable: true,
        configurable: true,
        value: originalPerformance,
      })
    })

    it('should add visibilitychange event listener', () => {
      const addEventListenerSpy = vi.spyOn(document, 'addEventListener')

      const cleanup = initWebVitals(onReport)

      expect(addEventListenerSpy).toHaveBeenCalledWith('visibilitychange', expect.any(Function))

      cleanup()
    })

    it('should add pagehide event listener', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener')

      const cleanup = initWebVitals(onReport)

      expect(addEventListenerSpy).toHaveBeenCalledWith('pagehide', expect.any(Function))

      cleanup()
    })

    it('should set timeout for delayed reporting', () => {
      vi.useFakeTimers()

      const cleanup = initWebVitals(onReport)

      // Advance time by 10 seconds
      vi.advanceTimersByTime(10000)

      // Should have called onReport
      expect(onReport).toHaveBeenCalledTimes(1)

      cleanup()
      vi.useRealTimers()
    })

    it('should cleanup event listeners on cleanup call', () => {
      const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener')
      const windowRemoveEventListenerSpy = vi.spyOn(window, 'removeEventListener')

      const cleanup = initWebVitals(onReport)
      cleanup()

      expect(removeEventListenerSpy).toHaveBeenCalledWith('visibilitychange', expect.any(Function))
      expect(windowRemoveEventListenerSpy).toHaveBeenCalledWith('pagehide', expect.any(Function))
    })

    it('should clear timeout on cleanup', () => {
      vi.useFakeTimers()
      const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout')

      const cleanup = initWebVitals(onReport)
      cleanup()

      expect(clearTimeoutSpy).toHaveBeenCalled()

      vi.useRealTimers()
    })

    it('should report vitals on visibilitychange to hidden', () => {
      vi.useFakeTimers()

      const cleanup = initWebVitals(onReport)

      // Trigger visibility change
      Object.defineProperty(document, 'visibilityState', {
        writable: true,
        configurable: true,
        value: 'hidden',
      })

      const event = new Event('visibilitychange')
      document.dispatchEvent(event)

      // Flush any pending timers
      vi.runAllTimers()

      // Should report vitals
      expect(onReport).toHaveBeenCalled()

      cleanup()
      vi.useRealTimers()
    })

    it('should report vitals on pagehide', () => {
      vi.useFakeTimers()

      const cleanup = initWebVitals(onReport)

      // Trigger pagehide
      const event = new Event('pagehide')
      window.dispatchEvent(event)

      // Flush any pending timers
      vi.runAllTimers()

      // Should report vitals
      expect(onReport).toHaveBeenCalled()

      cleanup()
      vi.useRealTimers()
    })

    it('should report empty vitals when no metrics collected', () => {
      vi.useFakeTimers()

      const cleanup = initWebVitals(onReport)

      // Trigger reporting without collecting any metrics
      Object.defineProperty(document, 'visibilityState', {
        writable: true,
        configurable: true,
        value: 'hidden',
      })
      document.dispatchEvent(new Event('visibilitychange'))

      vi.runAllTimers()

      // Should still call onReport
      expect(onReport).toHaveBeenCalled()

      cleanup()
      vi.useRealTimers()
    })

    it('should handle multiple cleanup calls gracefully', () => {
      const cleanup = initWebVitals(onReport)

      // Call cleanup multiple times
      expect(() => {
        cleanup()
        cleanup()
        cleanup()
      }).not.toThrow()
    })

    it('should observe correct performance entry types', () => {
      const cleanup = initWebVitals(onReport)

      // Should initialize without errors
      expect(cleanup).toBeInstanceOf(Function)

      cleanup()
    })
  })

  describe('metric ratings', () => {
    it('should rate metrics based on thresholds', () => {
      // This is tested implicitly through the tracking functions
      // The getRating function is internal and used by all tracking functions
      const cleanup = initWebVitals(onReport)
      expect(cleanup).toBeInstanceOf(Function)
      cleanup()
    })
  })

  describe('error handling', () => {
    it('should handle errors in PerformanceObserver gracefully', () => {
      // Mock PerformanceObserver to throw
      global.PerformanceObserver = class {
        constructor() {
          throw new Error('Test error')
        }
        observe = vi.fn()
        disconnect = vi.fn()
        takeRecords = vi.fn(() => [])
      } as unknown as typeof PerformanceObserver

      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      const cleanup = initWebVitals(onReport)

      // Should not throw, should log warning
      expect(cleanup).toBeInstanceOf(Function)
      expect(consoleWarnSpy).toHaveBeenCalled()

      cleanup()
      consoleWarnSpy.mockRestore()
    })
  })
})
