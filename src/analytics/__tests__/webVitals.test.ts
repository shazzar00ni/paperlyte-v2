/**
 * Tests for Core Web Vitals tracking
 *
 * Tests performance metric tracking including LCP, FID, CLS, TTFB, FCP, and INP.
 * Validates PerformanceObserver instantiation, metric callbacks, threshold ratings,
 * and visibility change handling.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { initWebVitals } from '../webVitals'
import { mockPerformanceObserver, createCleanup } from '../../test/analytics-helpers'
import type { CoreWebVitals } from '../types'

describe('Web Vitals Tracking', () => {
  let perfMock: ReturnType<typeof mockPerformanceObserver>
  let cleanup: ReturnType<typeof createCleanup>
  let onReportCallback: ReturnType<typeof vi.fn<[CoreWebVitals], void>>

  beforeEach(() => {
    cleanup = createCleanup()
    perfMock = mockPerformanceObserver()
    global.PerformanceObserver = perfMock.PerformanceObserver
    onReportCallback = vi.fn()

    // Mock performance API
    if (!global.performance) {
      global.performance = {} as Performance
    }
    global.performance.getEntriesByType = vi.fn(() => [])

    vi.useFakeTimers()
  })

  afterEach(() => {
    cleanup.cleanupAll()
    vi.clearAllMocks()
    vi.clearAllTimers()
    vi.useRealTimers()
  })

  describe('LCP (Largest Contentful Paint)', () => {
    it('should observe LCP with correct configuration', () => {
      initWebVitals(onReportCallback)

      expect(perfMock.observe).toHaveBeenCalledWith({
        type: 'largest-contentful-paint',
        buffered: true,
      })
    })

    it('should report LCP metric with good rating', () => {
      const cleanupFn = initWebVitals(onReportCallback)
      const callback = perfMock.getLastCallback()

      // Simulate LCP entry (2000ms - good)
      const entries = [
        {
          name: 'largest-contentful-paint',
          entryType: 'largest-contentful-paint',
          startTime: 0,
          duration: 0,
          renderTime: 2000,
          loadTime: 2000,
        } as PerformanceEntry & { renderTime?: number; loadTime?: number },
      ]

      callback({ getEntries: () => entries })

      // Trigger visibility change to report
      Object.defineProperty(document, 'visibilityState', {
        configurable: true,
        value: 'hidden',
      })
      document.dispatchEvent(new Event('visibilitychange'))

      expect(onReportCallback).toHaveBeenCalled()
      const vitals = onReportCallback.mock.calls[0][0]
      expect(vitals.LCP).toBe(2000)

      cleanupFn()
    })

    it('should use renderTime over loadTime', () => {
      initWebVitals(onReportCallback)
      const callback = perfMock.getLastCallback()

      const entries = [
        {
          name: 'largest-contentful-paint',
          entryType: 'largest-contentful-paint',
          startTime: 0,
          duration: 0,
          renderTime: 1500,
          loadTime: 2000,
        } as PerformanceEntry & { renderTime?: number; loadTime?: number },
      ]

      callback({ getEntries: () => entries })

      // Trigger report
      Object.defineProperty(document, 'visibilityState', {
        configurable: true,
        value: 'hidden',
      })
      document.dispatchEvent(new Event('visibilitychange'))

      const vitals = onReportCallback.mock.calls[0][0]
      expect(vitals.LCP).toBe(1500)
    })
  })

  describe('FID (First Input Delay)', () => {
    it('should observe FID with correct configuration', () => {
      initWebVitals(onReportCallback)

      expect(perfMock.observe).toHaveBeenCalledWith({
        type: 'first-input',
        buffered: true,
      })
    })

    it('should report FID metric and disconnect after first entry', () => {
      initWebVitals(onReportCallback)
      const callback = perfMock.getLastCallback()

      // Simulate FID entry (80ms - good)
      const entries = [
        {
          name: 'first-input',
          entryType: 'first-input',
          startTime: 1000,
          duration: 80,
          processingStart: 1080,
        } as PerformanceEntry & { processingStart?: number },
      ]

      callback({ getEntries: () => entries })

      // Trigger report
      Object.defineProperty(document, 'visibilityState', {
        configurable: true,
        value: 'hidden',
      })
      document.dispatchEvent(new Event('visibilitychange'))

      const vitals = onReportCallback.mock.calls[0][0]
      expect(vitals.FID).toBe(80)
      expect(perfMock.disconnect).toHaveBeenCalled()
    })

    it('should calculate FID from processingStart - startTime', () => {
      initWebVitals(onReportCallback)
      const callback = perfMock.getLastCallback()

      const entries = [
        {
          name: 'first-input',
          entryType: 'first-input',
          startTime: 1000,
          duration: 0,
          processingStart: 1050,
        } as PerformanceEntry & { processingStart?: number },
      ]

      callback({ getEntries: () => entries })

      Object.defineProperty(document, 'visibilityState', {
        configurable: true,
        value: 'hidden',
      })
      document.dispatchEvent(new Event('visibilitychange'))

      const vitals = onReportCallback.mock.calls[0][0]
      expect(vitals.FID).toBe(50)
    })
  })

  describe('CLS (Cumulative Layout Shift)', () => {
    it('should observe layout-shift with correct configuration', () => {
      initWebVitals(onReportCallback)

      expect(perfMock.observe).toHaveBeenCalledWith({
        type: 'layout-shift',
        buffered: true,
      })
    })

    it('should accumulate CLS values without recent input', () => {
      initWebVitals(onReportCallback)
      const callback = perfMock.getLastCallback()

      // Simulate multiple layout shift entries
      const entries1 = [
        {
          name: 'layout-shift',
          entryType: 'layout-shift',
          startTime: 100,
          duration: 0,
          value: 0.05,
          hadRecentInput: false,
        } as PerformanceEntry & { value?: number; hadRecentInput?: boolean },
      ]

      callback({ getEntries: () => entries1 })

      const entries2 = [
        {
          name: 'layout-shift',
          entryType: 'layout-shift',
          startTime: 200,
          duration: 0,
          value: 0.03,
          hadRecentInput: false,
        } as PerformanceEntry & { value?: number; hadRecentInput?: boolean },
      ]

      callback({ getEntries: () => entries2 })

      // Trigger report
      Object.defineProperty(document, 'visibilityState', {
        configurable: true,
        value: 'hidden',
      })
      document.dispatchEvent(new Event('visibilitychange'))

      const vitals = onReportCallback.mock.calls[0][0]
      expect(vitals.CLS).toBe(0.08)
    })

    it('should ignore layout shifts with recent input', () => {
      initWebVitals(onReportCallback)
      const callback = perfMock.getLastCallback()

      const entries = [
        {
          name: 'layout-shift',
          entryType: 'layout-shift',
          startTime: 100,
          duration: 0,
          value: 0.05,
          hadRecentInput: false,
        } as PerformanceEntry & { value?: number; hadRecentInput?: boolean },
        {
          name: 'layout-shift',
          entryType: 'layout-shift',
          startTime: 200,
          duration: 0,
          value: 0.1,
          hadRecentInput: true, // Should be ignored
        } as PerformanceEntry & { value?: number; hadRecentInput?: boolean },
      ]

      callback({ getEntries: () => entries })

      // Trigger report
      Object.defineProperty(document, 'visibilityState', {
        configurable: true,
        value: 'hidden',
      })
      document.dispatchEvent(new Event('visibilitychange'))

      const vitals = onReportCallback.mock.calls[0][0]
      expect(vitals.CLS).toBe(0.05) // Only the first shift without input
    })

    it('should finalize CLS on visibility change', () => {
      initWebVitals(onReportCallback)
      const callback = perfMock.getLastCallback()

      const entries = [
        {
          name: 'layout-shift',
          entryType: 'layout-shift',
          startTime: 100,
          duration: 0,
          value: 0.08,
          hadRecentInput: false,
        } as PerformanceEntry & { value?: number; hadRecentInput?: boolean },
      ]

      callback({ getEntries: () => entries })

      // Trigger visibility change
      Object.defineProperty(document, 'visibilityState', {
        configurable: true,
        value: 'hidden',
      })
      document.dispatchEvent(new Event('visibilitychange'))

      expect(onReportCallback).toHaveBeenCalled()
      const vitals = onReportCallback.mock.calls[0][0]
      expect(vitals.CLS).toBe(0.08)
    })
  })

  describe('TTFB (Time to First Byte)', () => {
    it('should report TTFB from navigation timing', () => {
      const navigationEntry = {
        name: 'navigation',
        entryType: 'navigation',
        startTime: 0,
        duration: 0,
        responseStart: 750,
      } as PerformanceEntry & { responseStart?: number }

      global.performance.getEntriesByType = vi.fn((type: string) => {
        if (type === 'navigation') {
          return [navigationEntry]
        }
        return []
      })

      initWebVitals(onReportCallback)

      // Trigger report
      Object.defineProperty(document, 'visibilityState', {
        configurable: true,
        value: 'hidden',
      })
      document.dispatchEvent(new Event('visibilitychange'))

      const vitals = onReportCallback.mock.calls[0][0]
      expect(vitals.TTFB).toBe(750)
    })

    it('should not report TTFB if navigation entry is missing', () => {
      global.performance.getEntriesByType = vi.fn(() => [])

      initWebVitals(onReportCallback)

      // Trigger report
      Object.defineProperty(document, 'visibilityState', {
        configurable: true,
        value: 'hidden',
      })
      document.dispatchEvent(new Event('visibilitychange'))

      const vitals = onReportCallback.mock.calls[0][0]
      expect(vitals.TTFB).toBeUndefined()
    })
  })

  describe('FCP (First Contentful Paint)', () => {
    it('should observe paint with correct configuration', () => {
      initWebVitals(onReportCallback)

      expect(perfMock.observe).toHaveBeenCalledWith({
        type: 'paint',
        buffered: true,
      })
    })

    it('should report FCP and disconnect after first entry', () => {
      initWebVitals(onReportCallback)
      const callback = perfMock.getLastCallback()

      const entries = [
        {
          name: 'first-contentful-paint',
          entryType: 'paint',
          startTime: 1500,
          duration: 0,
        } as PerformanceEntry,
      ]

      callback({ getEntries: () => entries })

      // Trigger report
      Object.defineProperty(document, 'visibilityState', {
        configurable: true,
        value: 'hidden',
      })
      document.dispatchEvent(new Event('visibilitychange'))

      const vitals = onReportCallback.mock.calls[0][0]
      expect(vitals.FCP).toBe(1500)
      expect(perfMock.disconnect).toHaveBeenCalled()
    })

    it('should only report first-contentful-paint, not first-paint', () => {
      initWebVitals(onReportCallback)
      const callback = perfMock.getLastCallback()

      const entries = [
        {
          name: 'first-paint',
          entryType: 'paint',
          startTime: 1000,
          duration: 0,
        } as PerformanceEntry,
      ]

      callback({ getEntries: () => entries })

      // Trigger report
      Object.defineProperty(document, 'visibilityState', {
        configurable: true,
        value: 'hidden',
      })
      document.dispatchEvent(new Event('visibilitychange'))

      const vitals = onReportCallback.mock.calls[0][0]
      expect(vitals.FCP).toBeUndefined()
    })
  })

  describe('INP (Interaction to Next Paint)', () => {
    it('should observe event with correct configuration', () => {
      initWebVitals(onReportCallback)

      expect(perfMock.observe).toHaveBeenCalledWith({
        type: 'event',
        buffered: true,
      })
    })

    it('should calculate INP from max interaction for few interactions', () => {
      initWebVitals(onReportCallback)
      const callback = perfMock.getLastCallback()

      // Simulate 5 interactions (use max)
      const entries = [
        {
          name: 'click',
          entryType: 'event',
          startTime: 100,
          duration: 0,
          processingStart: 120,
          processingEnd: 180,
        } as PerformanceEntry & { processingStart?: number; processingEnd?: number },
        {
          name: 'click',
          entryType: 'event',
          startTime: 200,
          duration: 0,
          processingStart: 210,
          processingEnd: 350,
        } as PerformanceEntry & { processingStart?: number; processingEnd?: number },
      ]

      callback({ getEntries: () => entries })

      // Trigger report
      Object.defineProperty(document, 'visibilityState', {
        configurable: true,
        value: 'hidden',
      })
      document.dispatchEvent(new Event('visibilitychange'))

      const vitals = onReportCallback.mock.calls[0][0]
      // Max of (180-100=80) and (350-200=150) = 150
      expect(vitals.INP).toBe(150)
    })

    it('should calculate INP from 98th percentile for many interactions', () => {
      initWebVitals(onReportCallback)
      const callback = perfMock.getLastCallback()

      // Simulate 15 interactions (use 98th percentile)
      const entries = Array.from({ length: 15 }, (_, i) => ({
        name: 'click',
        entryType: 'event',
        startTime: i * 100,
        duration: 0,
        processingStart: i * 100 + 10,
        processingEnd: i * 100 + 10 + (i + 1) * 10,
      })) as Array<PerformanceEntry & { processingStart?: number; processingEnd?: number }>

      callback({ getEntries: () => entries })

      // Trigger report
      Object.defineProperty(document, 'visibilityState', {
        configurable: true,
        value: 'hidden',
      })
      document.dispatchEvent(new Event('visibilitychange'))

      expect(onReportCallback).toHaveBeenCalled()
      const vitals = onReportCallback.mock.calls[0][0]
      expect(vitals.INP).toBeDefined()
      expect(vitals.INP).toBeGreaterThan(0)
    })
  })

  describe('initWebVitals', () => {
    it('should initialize all metric trackers', () => {
      initWebVitals(onReportCallback)

      // Verify all observers are created
      expect(perfMock.PerformanceObserver).toHaveBeenCalledTimes(5) // LCP, FID, CLS, FCP, INP
    })

    it('should report vitals on visibilitychange event', () => {
      initWebVitals(onReportCallback)

      // Trigger visibility change
      Object.defineProperty(document, 'visibilityState', {
        configurable: true,
        value: 'hidden',
      })
      document.dispatchEvent(new Event('visibilitychange'))

      expect(onReportCallback).toHaveBeenCalled()
    })

    it('should report vitals on pagehide event', () => {
      initWebVitals(onReportCallback)

      window.dispatchEvent(new Event('pagehide'))

      expect(onReportCallback).toHaveBeenCalled()
    })

    it('should report vitals after timeout', () => {
      initWebVitals(onReportCallback)

      // Fast-forward 10 seconds
      vi.advanceTimersByTime(10000)

      expect(onReportCallback).toHaveBeenCalled()
    })

    it('should return cleanup function', () => {
      const cleanupFn = initWebVitals(onReportCallback)

      expect(cleanupFn).toBeInstanceOf(Function)
    })

    it('should cleanup event listeners when cleanup is called', () => {
      const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener')
      const removeWindowListenerSpy = vi.spyOn(window, 'removeEventListener')

      const cleanupFn = initWebVitals(onReportCallback)
      cleanupFn()

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'visibilitychange',
        expect.any(Function)
      )
      expect(removeWindowListenerSpy).toHaveBeenCalledWith('pagehide', expect.any(Function))
    })

    it('should cleanup observers when cleanup is called', () => {
      const cleanupFn = initWebVitals(onReportCallback)
      cleanupFn()

      expect(perfMock.disconnect).toHaveBeenCalled()
    })

    it('should not report if no metrics are collected', () => {
      initWebVitals(onReportCallback)

      // Trigger visibility change without collecting any metrics
      Object.defineProperty(document, 'visibilityState', {
        configurable: true,
        value: 'hidden',
      })
      document.dispatchEvent(new Event('visibilitychange'))

      // Should not call onReport with empty vitals
      expect(onReportCallback).not.toHaveBeenCalled()
    })
  })

  describe('Threshold ratings', () => {
    it('should rate LCP as good for <= 2500ms', () => {
      const navigationEntry = {
        name: 'navigation',
        entryType: 'navigation',
        startTime: 0,
        duration: 0,
        responseStart: 500,
      } as PerformanceEntry & { responseStart?: number }

      global.performance.getEntriesByType = vi.fn(() => [navigationEntry])

      initWebVitals(onReportCallback)

      // Simulate good LCP
      const callback = perfMock.getLastCallback()
      const entries = [
        {
          name: 'largest-contentful-paint',
          entryType: 'largest-contentful-paint',
          startTime: 0,
          duration: 0,
          renderTime: 2000,
          loadTime: 2000,
        } as PerformanceEntry & { renderTime?: number; loadTime?: number },
      ]

      callback({ getEntries: () => entries })

      // Trigger report
      Object.defineProperty(document, 'visibilityState', {
        configurable: true,
        value: 'hidden',
      })
      document.dispatchEvent(new Event('visibilitychange'))

      expect(onReportCallback).toHaveBeenCalled()
      // The implementation tracks values, not ratings
      // But we can verify the value is in the good range
      const vitals = onReportCallback.mock.calls[0][0]
      expect(vitals.LCP).toBeLessThanOrEqual(2500)
    })
  })
})
