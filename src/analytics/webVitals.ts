/**
 * Core Web Vitals tracking
 *
 * Monitors and reports key performance metrics using the web-vitals library approach.
 * Tracks LCP, FID, CLS, TTFB, FCP, and INP for comprehensive performance monitoring.
 *
 * @see https://web.dev/vitals/
 * @see https://github.com/GoogleChrome/web-vitals
 */

import type { CoreWebVitals, PerformanceMetric } from './types'

/**
 * Callback function for performance metric reporting
 */
type ReportCallback = (metric: PerformanceMetric) => void

/**
 * Thresholds for Core Web Vitals ratings
 * Based on Google's recommended values
 */
const THRESHOLDS = {
  LCP: { good: 2500, poor: 4000 },
  FID: { good: 100, poor: 300 },
  CLS: { good: 0.1, poor: 0.25 },
  TTFB: { good: 800, poor: 1800 },
  FCP: { good: 1800, poor: 3000 },
  INP: { good: 200, poor: 500 },
} as const

/**
 * Get rating for a metric value based on thresholds
 */
function getRating(
  metricName: keyof typeof THRESHOLDS,
  value: number
): 'good' | 'needs-improvement' | 'poor' {
  const threshold = THRESHOLDS[metricName]
  if (!threshold) return 'good'

  if (value <= threshold.good) return 'good'
  if (value <= threshold.poor) return 'needs-improvement'
  return 'poor'
}

/**
 * Track Largest Contentful Paint (LCP)
 * Measures loading performance - marks the point when the main content has loaded
 */
function trackLCP(callback: ReportCallback): void {
  if (!('PerformanceObserver' in window)) return

  try {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const lastEntry = entries[entries.length - 1] as PerformanceEntry & {
        renderTime?: number
        loadTime?: number
      }

      if (lastEntry) {
        const value = lastEntry.renderTime || lastEntry.loadTime || 0
        callback({
          name: 'LCP',
          value,
          rating: getRating('LCP', value),
          entries,
        })
      }
    })

    observer.observe({ type: 'largest-contentful-paint', buffered: true })
  } catch (error) {
    console.warn('[WebVitals] LCP tracking failed:', error)
  }
}

/**
 * Track First Input Delay (FID)
 * Measures interactivity - time from user interaction to browser response
 */
function trackFID(callback: ReportCallback): void {
  if (!('PerformanceObserver' in window)) return

  try {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const firstEntry = entries[0] as PerformanceEntry & {
        processingStart?: number
        startTime?: number
      }

      if (firstEntry) {
        const value = firstEntry.processingStart
          ? firstEntry.processingStart - firstEntry.startTime
          : 0
        callback({
          name: 'FID',
          value,
          rating: getRating('FID', value),
          entries,
        })

        // FID should only be reported once
        observer.disconnect()
      }
    })

    observer.observe({ type: 'first-input', buffered: true })
  } catch (error) {
    console.warn('[WebVitals] FID tracking failed:', error)
  }
}

/**
 * Track Cumulative Layout Shift (CLS)
 * Measures visual stability - sum of all unexpected layout shifts
 */
function trackCLS(callback: ReportCallback): void {
  if (!('PerformanceObserver' in window)) return

  try {
    let clsValue = 0
    const entries: PerformanceEntry[] = []

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        // Only count layout shifts without recent user input
        const layoutShiftEntry = entry as PerformanceEntry & {
          hadRecentInput?: boolean
          value?: number
        }

        if (!layoutShiftEntry.hadRecentInput) {
          clsValue += layoutShiftEntry.value || 0
          entries.push(entry)
        }
      }
    })

    observer.observe({ type: 'layout-shift', buffered: true })

    // Report CLS on page hide (when user leaves the page)
    const reportCLS = () => {
      callback({
        name: 'CLS',
        value: clsValue,
        rating: getRating('CLS', clsValue),
        entries,
      })
    }

    // Do not add visibilitychange or pagehide listeners here.
    // The main initWebVitals function should call reportCLS when appropriate.
  } catch (error) {
    console.warn('[WebVitals] CLS tracking failed:', error)
  }
}

/**
 * Track Time to First Byte (TTFB)
 * Measures server response time
 */
function trackTTFB(callback: ReportCallback): void {
  if (!('performance' in window) || !performance.getEntriesByType) return

  try {
    const navigationEntry = performance.getEntriesByType('navigation')[0] as
      | (PerformanceEntry & { responseStart?: number })
      | undefined

    if (navigationEntry && navigationEntry.responseStart) {
      const value = navigationEntry.responseStart
      callback({
        name: 'TTFB',
        value,
        rating: getRating('TTFB', value),
        entries: [navigationEntry],
      })
    }
  } catch (error) {
    console.warn('[WebVitals] TTFB tracking failed:', error)
  }
}

/**
 * Track First Contentful Paint (FCP)
 * Measures when the first content is painted to the screen
 */
function trackFCP(callback: ReportCallback): void {
  if (!('PerformanceObserver' in window)) return

  try {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries()

      // Find the first-contentful-paint entry specifically (not first-paint)
      const fcpEntry = entries.find((entry) => entry.name === 'first-contentful-paint')

      if (fcpEntry) {
        const value = fcpEntry.startTime
        callback({
          name: 'FCP',
          value,
          rating: getRating('FCP', value),
          entries: [fcpEntry],
        })

        // FCP should only be reported once
        observer.disconnect()
      }
    })

    observer.observe({ type: 'paint', buffered: true })
  } catch (error) {
    console.warn('[WebVitals] FCP tracking failed:', error)
  }
}

/**
 * Track Interaction to Next Paint (INP)
 * Measures overall responsiveness by observing all click, tap, and keyboard interactions
 */
function trackINP(callback: ReportCallback): void {
  if (!('PerformanceObserver' in window)) return

  try {
    const interactions: number[] = []

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const eventEntry = entry as PerformanceEntry & {
          processingStart?: number
          processingEnd?: number
          startTime?: number
        }

        if (eventEntry.processingStart && eventEntry.processingEnd) {
          const duration = eventEntry.processingEnd - eventEntry.startTime
          interactions.push(duration)
        }
      }
    })

    observer.observe({ type: 'event', buffered: true })

    // Report INP on page hide
    const reportINP = () => {
      if (interactions.length > 0) {
        let value: number

        // For pages with few interactions, use max
        // For pages with many interactions, use 98th percentile
        if (interactions.length <= 10) {
          // Use the worst (longest) interaction for few interactions
          value = Math.max(...interactions)
        } else {
          // Use 98th percentile for many interactions
          const sortedInteractions = [...interactions].sort((a, b) => a - b)
          const index = Math.max(0, Math.ceil(0.98 * sortedInteractions.length) - 1)
          value = sortedInteractions[index]
        }

        callback({
          name: 'INP',
          value,
          rating: getRating('INP', value),
        })
      }
    }

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        reportINP()
      }
    })

    window.addEventListener('pagehide', reportINP)
  } catch (error) {
    // INP is a newer metric, may not be supported in all browsers
    if (error instanceof Error && !error.message.includes('event')) {
      console.warn('[WebVitals] INP tracking failed:', error)
    }
  }
}

/**
 * Initialize Core Web Vitals tracking
 * Sets up observers for all key performance metrics
 *
 * @param onReport - Callback function called when metrics are collected
 */
export function initWebVitals(onReport: (vitals: CoreWebVitals) => void): void {
  const vitals: CoreWebVitals = {}

  const handleMetric = (metric: PerformanceMetric) => {
    vitals[metric.name as keyof CoreWebVitals] = metric.value
  }

  // Track all Core Web Vitals
  trackLCP(handleMetric)
  trackFID(handleMetric)
  trackCLS(handleMetric)
  trackTTFB(handleMetric)
  trackFCP(handleMetric)
  trackINP(handleMetric)

  // Report vitals when page is hidden or unloaded
  const reportVitals = () => {
    if (Object.keys(vitals).length > 0) {
      onReport(vitals)
    }
  }

  // Report on visibility change
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      // Small delay to allow individual metric handlers to update first
      setTimeout(reportVitals, 0)
    }
  })

  // Report on page unload (backup for browsers without pagehide)
  window.addEventListener('pagehide', reportVitals)

  // Also report after a delay for metrics that are collected early
  setTimeout(reportVitals, 10000) // Report after 10 seconds
}
