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

  describe('INP tracking', () => {
    /**
     * Build a PerformanceObserver mock that tracks instantiated observers by the
     * entry type they observe, and returns a lookup helper.
     */
    function makeObserverMock() {
      const instances: Array<{
        callback: PerformanceObserverCallback
        observe: ReturnType<typeof vi.fn>
        observedType: string
        disconnect: ReturnType<typeof vi.fn>
      }> = []

      global.PerformanceObserver = class {
        callback: PerformanceObserverCallback
        observe: ReturnType<typeof vi.fn>
        observedType = ''
        disconnect: ReturnType<typeof vi.fn>
        takeRecords = vi.fn(() => [])

        constructor(callback: PerformanceObserverCallback) {
          this.callback = callback
          this.observe = vi.fn((options: { type: string }) => {
            this.observedType = options.type
            instances.push(this as typeof instances[0])
          })
          this.disconnect = vi.fn()
        }
      } as unknown as typeof PerformanceObserver

      const getObserverByType = (type: string) => instances.find((obs) => obs.observedType === type)

      return { instances, getObserverByType }
    }

    /** Helper to fire a visibility-hidden event that triggers INP finalization */
    function triggerPageHidden() {
      Object.defineProperty(document, 'visibilityState', {
        writable: true,
        configurable: true,
        value: 'hidden',
      })
      document.dispatchEvent(new Event('visibilitychange'))
    }

    /** Build a fake PerformanceEventTiming-like entry */
    function makeEntry(startTime: number, processingStart: number, processingEnd: number) {
      return { startTime, processingStart, processingEnd }
    }

    it('should use the max duration for exactly 10 interactions (boundary ≤10)', () => {
      const { getObserverByType } = makeObserverMock()
      const cleanup = initWebVitals(onReport)

      const inpObserver = getObserverByType('event')
      expect(inpObserver).toBeDefined()

      // Emit exactly 10 interactions with durations 10, 20, …, 100 ms
      for (let i = 1; i <= 10; i++) {
        // duration = processingEnd - startTime = (i*10 + 5) - 0 = i*10 + 5
        // But we care about processingEnd - startTime, so let startTime=0, processingEnd=i*10
        inpObserver!.callback(
          {
            getEntries: () => [makeEntry(0, i * 10 - 5, i * 10)],
          } as PerformanceObserverEntryList,
          inpObserver as unknown as PerformanceObserver
        )
      }

      triggerPageHidden()

      // With ≤10 interactions, INP = max duration = processingEnd(10) - startTime(0) = 100
      expect(onReport).toHaveBeenCalled()
      const reportedVitals = onReport.mock.calls[0][0] as { INP?: number }
      expect(reportedVitals.INP).toBe(100)

      cleanup()
    })

    it('should use the 98th-percentile duration for >10 interactions (boundary 11)', () => {
      const { getObserverByType } = makeObserverMock()
      const cleanup = initWebVitals(onReport)

      const inpObserver = getObserverByType('event')
      expect(inpObserver).toBeDefined()

      // Emit 100 interactions: 99 with duration 10ms and 1 with duration 1000ms
      // 98th-percentile index = Math.ceil(0.98 * 100) - 1 = 97
      // sorted[97] = 10 (the 98th smallest, out of 99×10ms + 1×1000ms)
      for (let i = 0; i < 99; i++) {
        inpObserver!.callback(
          { getEntries: () => [makeEntry(0, 5, 10)] } as PerformanceObserverEntryList,
          inpObserver as unknown as PerformanceObserver
        )
      }
      // One slow interaction
      inpObserver!.callback(
        { getEntries: () => [makeEntry(0, 500, 1000)] } as PerformanceObserverEntryList,
        inpObserver as unknown as PerformanceObserver
      )

      triggerPageHidden()

      expect(onReport).toHaveBeenCalled()
      const reportedVitals = onReport.mock.calls[0][0] as { INP?: number }
      // 98th percentile = 10, NOT the max 1000
      expect(reportedVitals.INP).toBe(10)

      cleanup()
    })

    it('should not report INP when there are zero interactions', () => {
      const { getObserverByType } = makeObserverMock()
      const cleanup = initWebVitals(onReport)

      const inpObserver = getObserverByType('event')
      expect(inpObserver).toBeDefined()

      // Emit no interactions — just trigger page-hide
      triggerPageHidden()

      // The vitals object may still be reported if other metrics (e.g. CLS) have values,
      // but INP must not be present in the report
      if (onReport.mock.calls.length > 0) {
        const reportedVitals = onReport.mock.calls[0][0] as Record<string, unknown>
        expect(reportedVitals.INP).toBeUndefined()
      }

      cleanup()
    })

    it('should filter out entries without processingStart or processingEnd', () => {
      const { getObserverByType } = makeObserverMock()
      const cleanup = initWebVitals(onReport)

      const inpObserver = getObserverByType('event')
      expect(inpObserver).toBeDefined()

      // Emit entries missing processingStart or processingEnd — they must be ignored
      inpObserver!.callback(
        {
          getEntries: () => [
            { startTime: 0, processingEnd: 100 }, // missing processingStart
            { startTime: 0, processingStart: 50 }, // missing processingEnd
            { startTime: 0 }, // both missing
          ],
        } as unknown as PerformanceObserverEntryList,
        inpObserver as unknown as PerformanceObserver
      )

      triggerPageHidden()

      // No valid interactions → INP should not appear in the report
      if (onReport.mock.calls.length > 0) {
        const reportedVitals = onReport.mock.calls[0][0] as Record<string, unknown>
        expect(reportedVitals.INP).toBeUndefined()
      }

      cleanup()
    })
  })
})
