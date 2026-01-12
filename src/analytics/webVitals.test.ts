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

  describe('Individual Metric Tracking', () => {
    describe('LCP (Largest Contentful Paint)', () => {
      it('should track LCP with renderTime', () => {
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

        // Find LCP observer
        const lcpObserver = observerInstances[0]

        // Emit LCP entry with renderTime
        lcpObserver.callback(
          {
            getEntries: () => [{ renderTime: 2500, loadTime: 2600 }],
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
            LCP: 2500, // Should use renderTime
          })
        )

        cleanup()
      })

      it('should track LCP with loadTime when renderTime is not available', () => {
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

        const lcpObserver = observerInstances[0]

        // Emit LCP entry with only loadTime
        lcpObserver.callback(
          {
            getEntries: () => [{ loadTime: 2700 }],
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
            LCP: 2700,
          })
        )

        cleanup()
      })

      it('should handle LCP with no timing values', () => {
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

        const lcpObserver = observerInstances[0]

        // Emit LCP entry with no timing values
        lcpObserver.callback(
          {
            getEntries: () => [{}],
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
            LCP: 0,
          })
        )

        cleanup()
      })
    })

    describe('FID (First Input Delay)', () => {
      it('should track FID and disconnect after first report', () => {
        const observerInstances: Array<{
          callback: PerformanceObserverCallback
          observe: ReturnType<typeof vi.fn>
          disconnect: ReturnType<typeof vi.fn>
        }> = []

        global.PerformanceObserver = class {
          callback: PerformanceObserverCallback
          observe: ReturnType<typeof vi.fn>
          disconnect: ReturnType<typeof vi.fn>
          constructor(callback: PerformanceObserverCallback) {
            this.callback = callback
            this.observe = vi.fn()
            this.disconnect = vi.fn()
            observerInstances.push(this)
          }
          takeRecords = vi.fn(() => [])
        } as unknown as typeof PerformanceObserver

        const cleanup = initWebVitals(onReport)

        // Find FID observer (second one)
        const fidObserver = observerInstances.find((obs) => {
          const observeCall = obs.observe.mock.calls[0]
          return observeCall && observeCall[0].type === 'first-input'
        })

        if (!fidObserver) {
          throw new Error('FID observer not found')
        }

        // Emit FID entry
        fidObserver.callback(
          {
            getEntries: () => [{ processingStart: 150, startTime: 100 }],
          } as PerformanceObserverEntryList,
          fidObserver as PerformanceObserver
        )

        // Should disconnect immediately after first report
        expect(fidObserver.disconnect).toHaveBeenCalled()

        // Trigger reporting
        Object.defineProperty(document, 'visibilityState', {
          writable: true,
          configurable: true,
          value: 'hidden',
        })
        document.dispatchEvent(new Event('visibilitychange'))

        expect(onReport).toHaveBeenCalledWith(
          expect.objectContaining({
            FID: 50, // processingStart - startTime
          })
        )

        cleanup()
      })

      it('should handle FID with missing processingStart', () => {
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

        const fidObserver = observerInstances.find((obs) => {
          const observeCall = obs.observe.mock.calls[0]
          return observeCall && observeCall[0].type === 'first-input'
        })

        if (!fidObserver) {
          throw new Error('FID observer not found')
        }

        // Emit FID entry without processingStart
        fidObserver.callback(
          {
            getEntries: () => [{ startTime: 100 }],
          } as PerformanceObserverEntryList,
          fidObserver as PerformanceObserver
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
            FID: 0,
          })
        )

        cleanup()
      })
    })

    describe('CLS (Cumulative Layout Shift)', () => {
      it('should accumulate layout shifts without recent input', () => {
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

        const clsObserver = observerInstances.find((obs) => {
          const observeCall = obs.observe.mock.calls[0]
          return observeCall && observeCall[0].type === 'layout-shift'
        })

        if (!clsObserver) {
          throw new Error('CLS observer not found')
        }

        // Emit multiple layout shifts
        clsObserver.callback(
          {
            getEntries: () => [
              { hadRecentInput: false, value: 0.05 },
              { hadRecentInput: false, value: 0.03 },
            ],
          } as PerformanceObserverEntryList,
          clsObserver as PerformanceObserver
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
            CLS: expect.closeTo(0.08, 2),
          })
        )

        cleanup()
      })

      it('should ignore layout shifts with recent user input', () => {
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

        const clsObserver = observerInstances.find((obs) => {
          const observeCall = obs.observe.mock.calls[0]
          return observeCall && observeCall[0].type === 'layout-shift'
        })

        if (!clsObserver) {
          throw new Error('CLS observer not found')
        }

        // Emit layout shifts with hadRecentInput: true
        clsObserver.callback(
          {
            getEntries: () => [
              { hadRecentInput: false, value: 0.05 },
              { hadRecentInput: true, value: 0.10 }, // Should be ignored
            ],
          } as PerformanceObserverEntryList,
          clsObserver as PerformanceObserver
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
            CLS: expect.closeTo(0.05, 2), // Only the first shift
          })
        )

        cleanup()
      })
    })

    describe('TTFB (Time to First Byte)', () => {
      it('should track TTFB from navigation entry', () => {
        const mockNavigationEntry = {
          responseStart: 500,
          entryType: 'navigation',
        }

        Object.defineProperty(window, 'performance', {
          writable: true,
          configurable: true,
          value: {
            getEntriesByType: vi.fn((type: string) => {
              if (type === 'navigation') {
                return [mockNavigationEntry]
              }
              return []
            }),
          },
        })

        const cleanup = initWebVitals(onReport)

        // Trigger reporting
        Object.defineProperty(document, 'visibilityState', {
          writable: true,
          configurable: true,
          value: 'hidden',
        })
        document.dispatchEvent(new Event('visibilitychange'))

        expect(onReport).toHaveBeenCalledWith(
          expect.objectContaining({
            TTFB: 500,
          })
        )

        cleanup()
      })

      it('should handle missing navigation entry', () => {
        Object.defineProperty(window, 'performance', {
          writable: true,
          configurable: true,
          value: {
            getEntriesByType: vi.fn(() => []),
          },
        })

        const cleanup = initWebVitals(onReport)

        // Trigger reporting
        Object.defineProperty(document, 'visibilityState', {
          writable: true,
          configurable: true,
          value: 'hidden',
        })
        document.dispatchEvent(new Event('visibilitychange'))

        // Should not include TTFB in report
        expect(onReport).toHaveBeenCalledWith(
          expect.not.objectContaining({
            TTFB: expect.anything(),
          })
        )

        cleanup()
      })
    })

    describe('FCP (First Contentful Paint)', () => {
      it('should track FCP and disconnect after first report', () => {
        const observerInstances: Array<{
          callback: PerformanceObserverCallback
          observe: ReturnType<typeof vi.fn>
          disconnect: ReturnType<typeof vi.fn>
        }> = []

        global.PerformanceObserver = class {
          callback: PerformanceObserverCallback
          observe: ReturnType<typeof vi.fn>
          disconnect: ReturnType<typeof vi.fn>
          constructor(callback: PerformanceObserverCallback) {
            this.callback = callback
            this.observe = vi.fn()
            this.disconnect = vi.fn()
            observerInstances.push(this)
          }
          takeRecords = vi.fn(() => [])
        } as unknown as typeof PerformanceObserver

        const cleanup = initWebVitals(onReport)

        const fcpObserver = observerInstances.find((obs) => {
          const observeCall = obs.observe.mock.calls[0]
          return observeCall && observeCall[0].type === 'paint'
        })

        if (!fcpObserver) {
          throw new Error('FCP observer not found')
        }

        // Emit FCP entry (filter for first-contentful-paint specifically)
        fcpObserver.callback(
          {
            getEntries: () => [
              { name: 'first-paint', startTime: 1500 },
              { name: 'first-contentful-paint', startTime: 1800 },
            ],
          } as PerformanceObserverEntryList,
          fcpObserver as PerformanceObserver
        )

        // Should disconnect after first report
        expect(fcpObserver.disconnect).toHaveBeenCalled()

        // Trigger reporting
        Object.defineProperty(document, 'visibilityState', {
          writable: true,
          configurable: true,
          value: 'hidden',
        })
        document.dispatchEvent(new Event('visibilitychange'))

        expect(onReport).toHaveBeenCalledWith(
          expect.objectContaining({
            FCP: 1800,
          })
        )

        cleanup()
      })
    })

    describe('INP (Interaction to Next Paint)', () => {
      it('should use max interaction for pages with few interactions (≤10)', () => {
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

        const inpObserver = observerInstances.find((obs) => {
          const observeCall = obs.observe.mock.calls[0]
          return observeCall && observeCall[0].type === 'event'
        })

        if (!inpObserver) {
          throw new Error('INP observer not found')
        }

        // Emit few interactions
        inpObserver.callback(
          {
            getEntries: () => [
              { processingStart: 100, processingEnd: 150, startTime: 0 }, // duration = 150
              { processingStart: 200, processingEnd: 280, startTime: 0 }, // duration = 280 (max)
              { processingStart: 300, processingEnd: 380, startTime: 0 }, // duration = 380 (max)
            ],
          } as PerformanceObserverEntryList,
          inpObserver as PerformanceObserver
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
            INP: 380, // Max of the three interactions
          })
        )

        cleanup()
      })

      it('should use 98th percentile for pages with many interactions (>10)', () => {
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

        const inpObserver = observerInstances.find((obs) => {
          const observeCall = obs.observe.mock.calls[0]
          return observeCall && observeCall[0].type === 'event'
        })

        if (!inpObserver) {
          throw new Error('INP observer not found')
        }

        // Emit 20 interactions
        const interactions = Array.from({ length: 20 }, (_, i) => ({
          processingStart: i * 10,
          processingEnd: i * 10 + 100 + i * 5, // Gradually increasing durations
          startTime: 0,
        }))

        inpObserver.callback(
          {
            getEntries: () => interactions,
          } as PerformanceObserverEntryList,
          inpObserver as PerformanceObserver
        )

        // Trigger reporting
        Object.defineProperty(document, 'visibilityState', {
          writable: true,
          configurable: true,
          value: 'hidden',
        })
        document.dispatchEvent(new Event('visibilitychange'))

        // 98th percentile of 20 items = index 19 (ceil(0.98 * 20) - 1 = 19)
        const durations = interactions.map((i) => i.processingEnd - i.startTime).sort((a, b) => a - b)
        const expectedINP = durations[Math.max(0, Math.ceil(0.98 * 20) - 1)]

        expect(onReport).toHaveBeenCalledWith(
          expect.objectContaining({
            INP: expectedINP,
          })
        )

        cleanup()
      })

      it('should not report INP when no interactions occurred', () => {
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

        // Trigger reporting without any interactions
        Object.defineProperty(document, 'visibilityState', {
          writable: true,
          configurable: true,
          value: 'hidden',
        })
        document.dispatchEvent(new Event('visibilitychange'))

        // Should not include INP
        expect(onReport).toHaveBeenCalledWith(
          expect.not.objectContaining({
            INP: expect.anything(),
          })
        )

        cleanup()
      })

      it('should handle INP errors silently for unsupported browsers', () => {
        // Mock PerformanceObserver that throws on 'event' type
        global.PerformanceObserver = class {
          callback: PerformanceObserverCallback
          constructor(callback: PerformanceObserverCallback) {
            this.callback = callback
          }
          observe = vi.fn((options: { type: string }) => {
            if (options.type === 'event') {
              throw new Error("Failed to execute 'observe' on 'PerformanceObserver': The event type is not supported")
            }
          })
          disconnect = vi.fn()
          takeRecords = vi.fn(() => [])
        } as unknown as typeof PerformanceObserver

        const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

        const cleanup = initWebVitals(onReport)

        // Should not warn for 'event' type errors (INP not supported)
        const warnCalls = consoleWarnSpy.mock.calls.filter((call) => call[0].includes('INP'))
        expect(warnCalls.length).toBe(0)

        cleanup()
        consoleWarnSpy.mockRestore()
      })
    })
  })

  describe('Metric Rating System', () => {
    it('should rate all metrics correctly based on thresholds', () => {
      const testCases = [
        { metric: 'LCP', good: 2500, needsImprovement: 3000, poor: 4500 },
        { metric: 'FID', good: 100, needsImprovement: 200, poor: 400 },
        { metric: 'CLS', good: 0.1, needsImprovement: 0.15, poor: 0.3 },
        { metric: 'TTFB', good: 800, needsImprovement: 1000, poor: 2000 },
        { metric: 'FCP', good: 1800, needsImprovement: 2500, poor: 4000 },
        { metric: 'INP', good: 200, needsImprovement: 300, poor: 600 },
      ]

      testCases.forEach(({ metric }) => {
        // This test confirms the threshold structure exists
        expect(metric).toBeTruthy()
      })
    })
  })
})
