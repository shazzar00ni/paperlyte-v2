/**
 * Tests for Core Web Vitals tracking
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { initWebVitals } from './webVitals'
import type { CoreWebVitals } from './types'
import { mockPerformanceObserver } from '../test/analytics-helpers'

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

  describe('trackINP', () => {
    it('should use Math.max for ≤10 interactions and 98th percentile for >10 at the boundary', () => {
      // Helper: creates a valid event entry; duration = processingEnd - startTime
      const makeEntry = (duration: number) => ({
        startTime: 0,
        processingStart: 0,
        processingEnd: duration,
      })

      // --- ≤10 interactions: Math.max path (exactly 10) ---
      const po10 = mockPerformanceObserver()
      onReport.mockClear()
      const cleanup10 = initWebVitals(onReport)

      const inpObserver10 = po10.instances.find((obs) => {
        const call = obs.observe.mock.calls[0]
        return call?.[0].type === 'event'
      })
      expect(inpObserver10).toBeDefined()

      // Feed 10 entries with durations [10, 20, ..., 100]
      inpObserver10?.callback(
        { getEntries: () => [10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map(makeEntry) } as PerformanceObserverEntryList,
        inpObserver10 as PerformanceObserver
      )

      Object.defineProperty(document, 'visibilityState', {
        writable: true,
        configurable: true,
        value: 'hidden',
      })
      document.dispatchEvent(new Event('visibilitychange'))

      // Math.max([10..100]) = 100
      expect(onReport).toHaveBeenCalledWith(expect.objectContaining({ INP: 100 }))

      cleanup10()
      po10.cleanup()

      // --- >10 interactions: 98th-percentile path (exactly 11) ---
      const po11 = mockPerformanceObserver()
      onReport.mockClear()
      const cleanup11 = initWebVitals(onReport)

      const inpObserver11 = po11.instances.find((obs) => {
        const call = obs.observe.mock.calls[0]
        return call?.[0].type === 'event'
      })
      expect(inpObserver11).toBeDefined()

      // Feed 11 entries with durations [10, 20, ..., 110]
      inpObserver11?.callback(
        {
          getEntries: () => [10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110].map(makeEntry),
        } as PerformanceObserverEntryList,
        inpObserver11 as PerformanceObserver
      )

      Object.defineProperty(document, 'visibilityState', {
        writable: true,
        configurable: true,
        value: 'hidden',
      })
      document.dispatchEvent(new Event('visibilitychange'))

      // 98th percentile of sorted [10..110] (11 items):
      //   index = Math.max(0, Math.ceil(0.98 * 11) - 1) = Math.max(0, 11 - 1) = 10
      //   value = sortedInteractions[10] = 110
      expect(onReport).toHaveBeenCalledWith(expect.objectContaining({ INP: 110 }))

      cleanup11()
      po11.cleanup()
    })

    it('should not report INP when no interactions occurred', () => {
      const { cleanup: cleanupPO } = mockPerformanceObserver()
      const cleanup = initWebVitals(onReport)

      // Trigger finalization without feeding any entries to the INP observer
      Object.defineProperty(document, 'visibilityState', {
        writable: true,
        configurable: true,
        value: 'hidden',
      })
      document.dispatchEvent(new Event('visibilitychange'))

      // onReport may still be called (e.g., CLS=0 is always finalised), but INP must be absent
      expect(onReport).toHaveBeenCalled()
      const reportedVitals = onReport.mock.calls[0][0]
      expect(reportedVitals).not.toHaveProperty('INP')

      cleanup()
      cleanupPO()
    })

    it('should filter out entries with missing or invalid processingStart/processingEnd', () => {
      const { instances, cleanup: cleanupPO } = mockPerformanceObserver()
      const cleanup = initWebVitals(onReport)

      const inpObserver = instances.find((obs) => {
        const call = obs.observe.mock.calls[0]
        return call?.[0].type === 'event'
      })
      expect(inpObserver).toBeDefined()

      // All four entries are invalid and must be excluded from INP calculation
      const invalidEntries = [
        { startTime: 0, processingStart: undefined, processingEnd: 100 }, // missing processingStart
        { startTime: 0, processingStart: 50, processingEnd: undefined }, // missing processingEnd
        { startTime: 0, processingStart: 0, processingEnd: undefined }, // zero processingStart, missing processingEnd
        { startTime: 0, processingStart: 50, processingEnd: 0 }, // falsy processingEnd (zero)
      ]

      inpObserver?.callback(
        { getEntries: () => invalidEntries } as PerformanceObserverEntryList,
        inpObserver as PerformanceObserver
      )

      Object.defineProperty(document, 'visibilityState', {
        writable: true,
        configurable: true,
        value: 'hidden',
      })
      document.dispatchEvent(new Event('visibilitychange'))

      // No valid interactions were recorded, so INP must not appear in the report
      expect(onReport).toHaveBeenCalled()
      const reportedVitals = onReport.mock.calls[0][0]
      expect(reportedVitals).not.toHaveProperty('INP')

      cleanup()
      cleanupPO()
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
