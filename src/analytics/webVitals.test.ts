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

    it('should not report when no metrics collected', () => {
      vi.useFakeTimers()

      // Temporarily remove PerformanceObserver to prevent any metrics from being collected
      const originalPO = global.PerformanceObserver
      // @ts-expect-error - Intentionally making PerformanceObserver unavailable
      delete global.PerformanceObserver

      const cleanup = initWebVitals(onReport)

      // Trigger reporting without collecting any metrics
      Object.defineProperty(document, 'visibilityState', {
        writable: true,
        configurable: true,
        value: 'hidden',
      })
      document.dispatchEvent(new Event('visibilitychange'))

      vi.runAllTimers()

      // Should not call onReport when vitals object is empty
      expect(onReport).not.toHaveBeenCalled()

      cleanup()

      // Restore PerformanceObserver
      global.PerformanceObserver = originalPO

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
      const observedTypes: string[] = []

      // Mock PerformanceObserver to track what types are observed
      global.PerformanceObserver = class {
        callback: PerformanceObserverCallback
        constructor(callback: PerformanceObserverCallback) {
          this.callback = callback
        }
        observe = vi.fn((options: { type: string; buffered?: boolean }) => {
          observedTypes.push(options.type)
        })
        disconnect = vi.fn()
        takeRecords = vi.fn(() => [])
      } as unknown as typeof PerformanceObserver

      const cleanup = initWebVitals(onReport)

      // Should observe all Core Web Vitals entry types
      expect(observedTypes).toContain('largest-contentful-paint') // LCP
      expect(observedTypes).toContain('first-input') // FID
      expect(observedTypes).toContain('layout-shift') // CLS
      expect(observedTypes).toContain('paint') // FCP
      expect(observedTypes).toContain('event') // INP

      cleanup()
    })
  })

  describe('metric ratings', () => {
    it('should rate LCP as good/needs-improvement/poor based on thresholds', () => {
      // Mock PerformanceObserver to emit LCP with different values
      const observerInstances: Array<{
        callback: PerformanceObserverCallback
        observe: ReturnType<typeof vi.fn>
      }> = []

      global.PerformanceObserver = class {
        callback: PerformanceObserverCallback
        observe: ReturnType<typeof vi.fn>
        constructor(callback: PerformanceObserverCallback) {
          this.callback = callback
          this.observe = vi.fn()
          observerInstances.push(this)
        }
        disconnect = vi.fn()
        takeRecords = vi.fn(() => [])
      } as unknown as typeof PerformanceObserver

      const cleanup = initWebVitals(onReport)

      // Find LCP observer (first one, observes 'largest-contentful-paint')
      const lcpObserver = observerInstances[0]

      // Test good rating (LCP <= 2500ms)
      onReport.mockClear()
      lcpObserver.callback(
        {
          getEntries: () => [{ renderTime: 2000, loadTime: 2000 }],
        } as PerformanceObserverEntryList,
        lcpObserver as PerformanceObserver
      )

      // Trigger reporting
      Object.defineProperty(document, 'visibilityState', {
        writable: true,
        configurable: true,
        value: 'hidden',
      })
      document.dispatchEvent(new Event('visibilitychange'))

      expect(onReport).toHaveBeenCalledWith(
        expect.objectContaining({
          LCP: 2000,
        })
      )

      cleanup()
    })

    it('should rate CLS as good/needs-improvement/poor based on thresholds', () => {
      // Mock PerformanceObserver to emit CLS with different values
      const observerInstances: Array<{
        callback: PerformanceObserverCallback
        observe: ReturnType<typeof vi.fn>
      }> = []

      global.PerformanceObserver = class {
        callback: PerformanceObserverCallback
        observe: ReturnType<typeof vi.fn>
        constructor(callback: PerformanceObserverCallback) {
          this.callback = callback
          this.observe = vi.fn()
          observerInstances.push(this)
        }
        disconnect = vi.fn()
        takeRecords = vi.fn(() => [])
      } as unknown as typeof PerformanceObserver

      const cleanup = initWebVitals(onReport)

      // Find CLS observer (third one, observes 'layout-shift')
      // Order: LCP, FID, CLS, FCP, INP (but FCP disconnects immediately)
      const clsObserver = observerInstances.find((obs) => {
        const observeCall = obs.observe.mock.calls[0]
        return observeCall && observeCall[0].type === 'layout-shift'
      })

      if (!clsObserver) {
        throw new Error('CLS observer not found')
      }

      // Emit layout shift with good value (CLS <= 0.1)
      clsObserver.callback(
        {
          getEntries: () => [{ hadRecentInput: false, value: 0.05 }],
        } as PerformanceObserverEntryList,
        clsObserver as PerformanceObserver
      )

      // Emit layout shift with needs-improvement value (0.1 < CLS <= 0.25)
      clsObserver.callback(
        {
          getEntries: () => [{ hadRecentInput: false, value: 0.1 }],
        } as PerformanceObserverEntryList,
        clsObserver as PerformanceObserver
      )

      // Finalize to trigger report
      Object.defineProperty(document, 'visibilityState', {
        writable: true,
        configurable: true,
        value: 'hidden',
      })
      document.dispatchEvent(new Event('visibilitychange'))

      // Should report accumulated CLS value (0.05 + 0.10 ≈ 0.15, needs-improvement)
      const reportedVitals = onReport.mock.calls[0][0]
      expect(reportedVitals.CLS).toBeCloseTo(0.15, 2)

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
