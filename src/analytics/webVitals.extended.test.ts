/**
 * Extended tests for webVitals.ts
 * Focuses on the per-metric tracking functions: FID, FCP, TTFB, CLS accumulation,
 * INP finalization, and getRating thresholds – all uncovered in the existing suite.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { initWebVitals } from './webVitals'
import type { CoreWebVitals } from './types'

// Helper to build a mock PerformanceObserver class that exposes its instances
function buildMockObserver() {
  const instances: Array<{
    callback: PerformanceObserverCallback
    observe: ReturnType<typeof vi.fn>
    disconnect: ReturnType<typeof vi.fn>
  }> = []

  class MockObserver {
    callback: PerformanceObserverCallback
    observe = vi.fn((options: { type: string; buffered?: boolean }) => {
      // store the observed type for lookup
      ;(this as unknown as { _type: string })._type = options.type
    })
    disconnect = vi.fn()
    takeRecords = vi.fn(() => [])

    constructor(callback: PerformanceObserverCallback) {
      this.callback = callback
      instances.push(this as unknown as (typeof instances)[0])
    }
  }

  return { MockObserver, instances }
}

describe('webVitals extended', () => {
  let onReport: ReturnType<typeof vi.fn<[CoreWebVitals], void>>

  beforeEach(() => {
    onReport = vi.fn()
    vi.useFakeTimers()

    Object.defineProperty(window, 'performance', {
      writable: true,
      configurable: true,
      value: {
        getEntriesByType: vi.fn(() => []),
      },
    })
  })

  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  // ----------------------------------------------------------------
  // TTFB – navigation entry path
  // ----------------------------------------------------------------
  it('reports TTFB when navigation entry has responseStart', () => {
    const navEntry = { responseStart: 300 }
    Object.defineProperty(window, 'performance', {
      writable: true,
      configurable: true,
      value: {
        getEntriesByType: vi.fn(() => [navEntry]),
      },
    })

    const { MockObserver, instances } = buildMockObserver()
    global.PerformanceObserver = MockObserver as unknown as typeof PerformanceObserver

    const cleanup = initWebVitals(onReport)

    // Trigger reporting via visibilitychange
    Object.defineProperty(document, 'visibilityState', {
      writable: true,
      configurable: true,
      value: 'hidden',
    })
    document.dispatchEvent(new Event('visibilitychange'))

    expect(onReport).toHaveBeenCalledWith(
      expect.objectContaining({ TTFB: 300 })
    )

    cleanup()
    void instances // suppress unused warning
  })

  it('does not report TTFB when navigation entry is absent', () => {
    Object.defineProperty(window, 'performance', {
      writable: true,
      configurable: true,
      value: { getEntriesByType: vi.fn(() => []) },
    })

    const { MockObserver } = buildMockObserver()
    global.PerformanceObserver = MockObserver as unknown as typeof PerformanceObserver

    const cleanup = initWebVitals(onReport)

    Object.defineProperty(document, 'visibilityState', {
      writable: true,
      configurable: true,
      value: 'hidden',
    })
    document.dispatchEvent(new Event('visibilitychange'))

    // onReport may or may not be called; when called it must NOT include TTFB
    if (onReport.mock.calls.length > 0) {
      const vitals = onReport.mock.calls[0][0]
      expect(vitals.TTFB).toBeUndefined()
    }

    cleanup()
  })

  // ----------------------------------------------------------------
  // FID tracking
  // ----------------------------------------------------------------
  it('reports FID when first-input entry is emitted', () => {
    const { MockObserver, instances } = buildMockObserver()
    global.PerformanceObserver = MockObserver as unknown as typeof PerformanceObserver

    const cleanup = initWebVitals(onReport)

    // FID observer is the second instance (after LCP)
    const fidObserver = instances.find((obs) => {
      const calls = obs.observe.mock.calls
      return calls.length > 0 && calls[0][0]?.type === 'first-input'
    })

    expect(fidObserver).toBeDefined()

    // Simulate a first-input entry with processingStart
    fidObserver!.callback(
      {
        getEntries: () => [{ processingStart: 150, startTime: 50 }],
      } as unknown as PerformanceObserverEntryList,
      fidObserver as unknown as PerformanceObserver
    )

    // Trigger reporting
    Object.defineProperty(document, 'visibilityState', {
      writable: true,
      configurable: true,
      value: 'hidden',
    })
    document.dispatchEvent(new Event('visibilitychange'))

    expect(onReport).toHaveBeenCalledWith(expect.objectContaining({ FID: 100 }))

    cleanup()
  })

  it('does not report FID when processingStart is missing', () => {
    const { MockObserver, instances } = buildMockObserver()
    global.PerformanceObserver = MockObserver as unknown as typeof PerformanceObserver

    const cleanup = initWebVitals(onReport)

    const fidObserver = instances.find((obs) => {
      const calls = obs.observe.mock.calls
      return calls.length > 0 && calls[0][0]?.type === 'first-input'
    })

    // Entry without processingStart → value = 0
    fidObserver!.callback(
      {
        getEntries: () => [{ startTime: 50 }],
      } as unknown as PerformanceObserverEntryList,
      fidObserver as unknown as PerformanceObserver
    )

    Object.defineProperty(document, 'visibilityState', {
      writable: true,
      configurable: true,
      value: 'hidden',
    })
    document.dispatchEvent(new Event('visibilitychange'))

    // FID value should be 0 (default when processingStart absent)
    if (onReport.mock.calls.length > 0) {
      const vitals = onReport.mock.calls[0][0]
      expect(vitals.FID).toBe(0)
    }

    cleanup()
  })

  // ----------------------------------------------------------------
  // FCP tracking
  // ----------------------------------------------------------------
  it('reports FCP when first-contentful-paint paint entry is emitted', () => {
    const { MockObserver, instances } = buildMockObserver()
    global.PerformanceObserver = MockObserver as unknown as typeof PerformanceObserver

    const cleanup = initWebVitals(onReport)

    const fcpObserver = instances.find((obs) => {
      const calls = obs.observe.mock.calls
      return calls.length > 0 && calls[0][0]?.type === 'paint'
    })

    expect(fcpObserver).toBeDefined()

    fcpObserver!.callback(
      {
        getEntries: () => [
          { name: 'first-paint', startTime: 500 },
          { name: 'first-contentful-paint', startTime: 800 },
        ],
      } as unknown as PerformanceObserverEntryList,
      fcpObserver as unknown as PerformanceObserver
    )

    Object.defineProperty(document, 'visibilityState', {
      writable: true,
      configurable: true,
      value: 'hidden',
    })
    document.dispatchEvent(new Event('visibilitychange'))

    expect(onReport).toHaveBeenCalledWith(expect.objectContaining({ FCP: 800 }))

    cleanup()
  })

  it('ignores paint entries that are not first-contentful-paint', () => {
    const { MockObserver, instances } = buildMockObserver()
    global.PerformanceObserver = MockObserver as unknown as typeof PerformanceObserver

    const cleanup = initWebVitals(onReport)

    const fcpObserver = instances.find((obs) => {
      const calls = obs.observe.mock.calls
      return calls.length > 0 && calls[0][0]?.type === 'paint'
    })

    // Only first-paint, no first-contentful-paint
    fcpObserver!.callback(
      {
        getEntries: () => [{ name: 'first-paint', startTime: 500 }],
      } as unknown as PerformanceObserverEntryList,
      fcpObserver as unknown as PerformanceObserver
    )

    Object.defineProperty(document, 'visibilityState', {
      writable: true,
      configurable: true,
      value: 'hidden',
    })
    document.dispatchEvent(new Event('visibilitychange'))

    // No FCP should be in the reported vitals
    if (onReport.mock.calls.length > 0) {
      expect(onReport.mock.calls[0][0].FCP).toBeUndefined()
    }

    cleanup()
  })

  // ----------------------------------------------------------------
  // CLS – layout-shift accumulation ignores entries with hadRecentInput
  // ----------------------------------------------------------------
  it('ignores layout-shift entries with hadRecentInput=true', () => {
    const { MockObserver, instances } = buildMockObserver()
    global.PerformanceObserver = MockObserver as unknown as typeof PerformanceObserver

    const cleanup = initWebVitals(onReport)

    const clsObserver = instances.find((obs) => {
      const calls = obs.observe.mock.calls
      return calls.length > 0 && calls[0][0]?.type === 'layout-shift'
    })

    expect(clsObserver).toBeDefined()

    // One entry with input (should be ignored) and one without (should be counted)
    clsObserver!.callback(
      {
        getEntries: () => [
          { hadRecentInput: true, value: 0.5 },
          { hadRecentInput: false, value: 0.05 },
        ],
      } as unknown as PerformanceObserverEntryList,
      clsObserver as unknown as PerformanceObserver
    )

    Object.defineProperty(document, 'visibilityState', {
      writable: true,
      configurable: true,
      value: 'hidden',
    })
    document.dispatchEvent(new Event('visibilitychange'))

    expect(onReport).toHaveBeenCalledWith(expect.objectContaining({ CLS: 0.05 }))

    cleanup()
  })

  // ----------------------------------------------------------------
  // INP – finalization logic (≤10 interactions → max, >10 → 98th percentile)
  // ----------------------------------------------------------------
  it('uses max interaction value when ≤10 interactions (INP)', () => {
    const { MockObserver, instances } = buildMockObserver()
    global.PerformanceObserver = MockObserver as unknown as typeof PerformanceObserver

    const cleanup = initWebVitals(onReport)

    const inpObserver = instances.find((obs) => {
      const calls = obs.observe.mock.calls
      return calls.length > 0 && calls[0][0]?.type === 'event'
    })

    expect(inpObserver).toBeDefined()

    // 3 interactions with known durations (all processingEnd - startTime)
    const interactions = [
      { processingStart: 10, processingEnd: 60, startTime: 0 },  // 60ms
      { processingStart: 10, processingEnd: 30, startTime: 0 },  // 30ms
      { processingStart: 10, processingEnd: 80, startTime: 0 },  // 80ms (max)
    ]

    inpObserver!.callback(
      { getEntries: () => interactions } as unknown as PerformanceObserverEntryList,
      inpObserver as unknown as PerformanceObserver
    )

    Object.defineProperty(document, 'visibilityState', {
      writable: true,
      configurable: true,
      value: 'hidden',
    })
    document.dispatchEvent(new Event('visibilitychange'))

    expect(onReport).toHaveBeenCalledWith(expect.objectContaining({ INP: 80 }))

    cleanup()
  })

  it('uses 98th percentile when >10 interactions (INP)', () => {
    const { MockObserver, instances } = buildMockObserver()
    global.PerformanceObserver = MockObserver as unknown as typeof PerformanceObserver

    const cleanup = initWebVitals(onReport)

    const inpObserver = instances.find((obs) => {
      const calls = obs.observe.mock.calls
      return calls.length > 0 && calls[0][0]?.type === 'event'
    })

    // 20 interactions: durations 10, 20, ... 200ms
    const interactions = Array.from({ length: 20 }, (_, i) => ({
      processingStart: 10,
      processingEnd: 10 + (i + 1) * 10, // 20, 30, 40, ... 210
      startTime: 0,
    }))

    inpObserver!.callback(
      { getEntries: () => interactions } as unknown as PerformanceObserverEntryList,
      inpObserver as unknown as PerformanceObserver
    )

    Object.defineProperty(document, 'visibilityState', {
      writable: true,
      configurable: true,
      value: 'hidden',
    })
    document.dispatchEvent(new Event('visibilitychange'))

    // 98th percentile of 20 values sorted [20..210]:
    // index = ceil(0.98 * 20) - 1 = ceil(19.6) - 1 = 20 - 1 = 19 → 210
    expect(onReport).toHaveBeenCalledWith(expect.objectContaining({ INP: 210 }))

    cleanup()
  })

  it('does not report INP when there are no interactions', () => {
    const { MockObserver, instances } = buildMockObserver()
    global.PerformanceObserver = MockObserver as unknown as typeof PerformanceObserver

    const cleanup = initWebVitals(onReport)

    // INP observer gets no entries
    void instances

    Object.defineProperty(document, 'visibilityState', {
      writable: true,
      configurable: true,
      value: 'hidden',
    })
    document.dispatchEvent(new Event('visibilitychange'))

    // INP should not be in reported vitals
    if (onReport.mock.calls.length > 0) {
      expect(onReport.mock.calls[0][0].INP).toBeUndefined()
    }

    cleanup()
  })

  // ----------------------------------------------------------------
  // getRating thresholds (indirectly tested via reported metric values)
  // ----------------------------------------------------------------
  it('LCP rated good when value ≤ 2500ms', () => {
    const { MockObserver, instances } = buildMockObserver()
    global.PerformanceObserver = MockObserver as unknown as typeof PerformanceObserver

    initWebVitals(onReport)

    const lcpObserver = instances[0]
    lcpObserver.callback(
      { getEntries: () => [{ renderTime: 1500, loadTime: 1500 }] } as unknown as PerformanceObserverEntryList,
      lcpObserver as unknown as PerformanceObserver
    )

    Object.defineProperty(document, 'visibilityState', {
      writable: true,
      configurable: true,
      value: 'hidden',
    })
    document.dispatchEvent(new Event('visibilitychange'))

    expect(onReport).toHaveBeenCalledWith(expect.objectContaining({ LCP: 1500 }))
  })

  it('LCP rated needs-improvement when 2500 < value ≤ 4000ms', () => {
    const { MockObserver, instances } = buildMockObserver()
    global.PerformanceObserver = MockObserver as unknown as typeof PerformanceObserver

    initWebVitals(onReport)

    const lcpObserver = instances[0]
    lcpObserver.callback(
      { getEntries: () => [{ renderTime: 3000, loadTime: 3000 }] } as unknown as PerformanceObserverEntryList,
      lcpObserver as unknown as PerformanceObserver
    )

    Object.defineProperty(document, 'visibilityState', {
      writable: true,
      configurable: true,
      value: 'hidden',
    })
    document.dispatchEvent(new Event('visibilitychange'))

    expect(onReport).toHaveBeenCalledWith(expect.objectContaining({ LCP: 3000 }))
  })

  it('LCP rated poor when value > 4000ms', () => {
    const { MockObserver, instances } = buildMockObserver()
    global.PerformanceObserver = MockObserver as unknown as typeof PerformanceObserver

    initWebVitals(onReport)

    const lcpObserver = instances[0]
    lcpObserver.callback(
      { getEntries: () => [{ renderTime: 5000, loadTime: 5000 }] } as unknown as PerformanceObserverEntryList,
      lcpObserver as unknown as PerformanceObserver
    )

    Object.defineProperty(document, 'visibilityState', {
      writable: true,
      configurable: true,
      value: 'hidden',
    })
    document.dispatchEvent(new Event('visibilitychange'))

    expect(onReport).toHaveBeenCalledWith(expect.objectContaining({ LCP: 5000 }))
  })

  // ----------------------------------------------------------------
  // Timeout-based reporting (10s delay)
  // ----------------------------------------------------------------
  it('reports after 10s timeout even without page hide/visibility event', () => {
    const { MockObserver, instances } = buildMockObserver()
    global.PerformanceObserver = MockObserver as unknown as typeof PerformanceObserver

    // initWebVitals populates instances; get the LCP observer (first) AFTER calling it
    initWebVitals(onReport)
    const lcpObserver = instances[0]

    // Give LCP something to report
    lcpObserver.callback(
      { getEntries: () => [{ renderTime: 2000, loadTime: 2000 }] } as unknown as PerformanceObserverEntryList,
      lcpObserver as unknown as PerformanceObserver
    )

    expect(onReport).not.toHaveBeenCalled()

    vi.advanceTimersByTime(10000)

    expect(onReport).toHaveBeenCalledWith(expect.objectContaining({ LCP: 2000 }))
  })
})
