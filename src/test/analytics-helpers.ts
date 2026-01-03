/**
 * Shared test helpers for analytics testing
 *
 * Provides mock factories and utilities for testing analytics functionality
 * including Plausible API, PerformanceObserver, scroll tracking, and configuration.
 */

import { vi } from 'vitest'
import type { AnalyticsConfig } from '../analytics/types'

/**
 * Mock Plausible API function type
 */
export type PlausibleMockFn = ReturnType<typeof vi.fn>

/**
 * Create a mock for window.plausible API
 *
 * Returns a vi.fn() mock that can be used to verify Plausible API calls
 *
 * @example
 * const plausibleMock = mockPlausibleAPI()
 * window.plausible = plausibleMock
 * // ... test code
 * expect(plausibleMock).toHaveBeenCalledWith('pageview', { props: { path: '/' } })
 */
export function mockPlausibleAPI(): PlausibleMockFn {
  return vi.fn()
}

/**
 * Mock PerformanceObserver constructor and methods
 *
 * Returns an object with mock implementations that can be used to:
 * - Verify observer instantiation
 * - Simulate performance entries
 * - Verify observe/disconnect calls
 *
 * @example
 * const perfMock = mockPerformanceObserver()
 * global.PerformanceObserver = perfMock.PerformanceObserver
 * // ... test code
 * expect(perfMock.observe).toHaveBeenCalledWith({ type: 'largest-contentful-paint', buffered: true })
 * perfMock.triggerEntry([{ name: 'LCP', startTime: 1500 }])
 */
export function mockPerformanceObserver() {
  const callbacks: ((list: { getEntries: () => PerformanceEntry[] }) => void)[] = []

  const observe = vi.fn()
  const disconnect = vi.fn()
  const takeRecords = vi.fn(() => [])

  const PerformanceObserverMock = vi.fn(function (
    this: PerformanceObserver,
    callback: (list: { getEntries: () => PerformanceEntry[] }) => void
  ) {
    callbacks.push(callback)
    this.observe = observe
    this.disconnect = disconnect
    this.takeRecords = takeRecords
  }) as unknown as typeof PerformanceObserver

  /**
   * Trigger a performance entry callback
   * Simulates the PerformanceObserver firing with entries
   */
  const triggerEntry = (entries: PerformanceEntry[]) => {
    callbacks.forEach((callback) => {
      callback({
        getEntries: () => entries,
      })
    })
  }

  /**
   * Get the last callback registered
   */
  const getLastCallback = () => callbacks[callbacks.length - 1]

  /**
   * Clear all registered callbacks
   */
  const clearCallbacks = () => {
    callbacks.length = 0
  }

  return {
    PerformanceObserver: PerformanceObserverMock,
    observe,
    disconnect,
    takeRecords,
    triggerEntry,
    getLastCallback,
    clearCallbacks,
  }
}

/**
 * Mock scroll-related window APIs
 *
 * Returns an object with utilities to:
 * - Mock window.scrollY
 * - Mock document.documentElement.scrollHeight
 * - Mock window.innerHeight
 * - Simulate scroll events
 *
 * @example
 * const scrollMock = mockScrollAPI()
 * scrollMock.setScroll({ scrollY: 500, scrollHeight: 2000, innerHeight: 800 })
 * scrollMock.triggerScroll()
 */
export function mockScrollAPI() {
  let scrollY = 0
  let scrollHeight = 1000
  let innerHeight = 800
  let scrollTop = 0

  // Store original values
  const originalScrollY = Object.getOwnPropertyDescriptor(window, 'scrollY')
  const originalInnerHeight = Object.getOwnPropertyDescriptor(window, 'innerHeight')

  /**
   * Set scroll position and dimensions
   */
  const setScroll = (config: {
    scrollY?: number
    scrollHeight?: number
    innerHeight?: number
    scrollTop?: number
  }) => {
    if (config.scrollY !== undefined) scrollY = config.scrollY
    if (config.scrollHeight !== undefined) scrollHeight = config.scrollHeight
    if (config.innerHeight !== undefined) innerHeight = config.innerHeight
    if (config.scrollTop !== undefined) scrollTop = config.scrollTop
  }

  // Mock window.scrollY
  Object.defineProperty(window, 'scrollY', {
    configurable: true,
    get: () => scrollY,
  })

  // Mock window.innerHeight
  Object.defineProperty(window, 'innerHeight', {
    configurable: true,
    get: () => innerHeight,
  })

  // Mock document.documentElement properties
  Object.defineProperty(document.documentElement, 'scrollHeight', {
    configurable: true,
    get: () => scrollHeight,
  })

  Object.defineProperty(document.documentElement, 'scrollTop', {
    configurable: true,
    get: () => scrollTop,
  })

  Object.defineProperty(document.documentElement, 'clientHeight', {
    configurable: true,
    get: () => innerHeight,
  })

  /**
   * Trigger a scroll event
   */
  const triggerScroll = () => {
    window.dispatchEvent(new Event('scroll'))
  }

  // Store original document properties
  const originalScrollHeight = Object.getOwnPropertyDescriptor(document.documentElement, 'scrollHeight')
  const originalScrollTop = Object.getOwnPropertyDescriptor(document.documentElement, 'scrollTop')
  const originalClientHeight = Object.getOwnPropertyDescriptor(document.documentElement, 'clientHeight')

  /**
   * Restore original window properties
   */
  const restore = () => {
    if (originalScrollY) {
      Object.defineProperty(window, 'scrollY', originalScrollY)
    }
    if (originalInnerHeight) {
      Object.defineProperty(window, 'innerHeight', originalInnerHeight)
    }
    if (originalScrollHeight) {
      Object.defineProperty(document.documentElement, 'scrollHeight', originalScrollHeight)
    }
    if (originalScrollTop) {
      Object.defineProperty(document.documentElement, 'scrollTop', originalScrollTop)
    }
    if (originalClientHeight) {
      Object.defineProperty(document.documentElement, 'clientHeight', originalClientHeight)
    }
  }

  return {
    setScroll,
    triggerScroll,
    restore,
    get scrollY() {
      return scrollY
    },
    get scrollHeight() {
      return scrollHeight
    },
    get innerHeight() {
      return innerHeight
    },
  }
}

/**
 * Create a test analytics configuration with sensible defaults
 *
 * @param overrides - Optional configuration overrides
 * @returns Complete AnalyticsConfig object for testing
 *
 * @example
 * const config = createAnalyticsConfig({ debug: true })
 * analytics.init(config)
 */
export function createAnalyticsConfig(
  overrides?: Partial<AnalyticsConfig>
): AnalyticsConfig {
  return {
    provider: 'plausible',
    domain: 'test.example.com',
    scriptUrl: 'https://plausible.io/js/script.js',
    debug: false,
    trackPageviews: true,
    trackWebVitals: true,
    trackScrollDepth: true,
    respectDNT: true,
    ...overrides,
  }
}

/**
 * Cleanup utilities to restore mocks after tests
 */
export class AnalyticsTestCleanup {
  private cleanupFunctions: (() => void)[] = []

  /**
   * Register a cleanup function to be called later
   */
  register(cleanupFn: () => void): void {
    this.cleanupFunctions.push(cleanupFn)
  }

  /**
   * Run all registered cleanup functions
   */
  cleanup(): void {
    this.cleanupFunctions.forEach((fn) => fn())
    this.cleanupFunctions = []
  }

  /**
   * Clear window.plausible
   */
  cleanupPlausible(): void {
    if (typeof window !== 'undefined' && 'plausible' in window) {
      delete (window as { plausible?: unknown }).plausible
    }
  }

  /**
   * Remove all script tags with data-domain attribute (Plausible scripts)
   */
  cleanupScripts(): void {
    if (typeof document !== 'undefined') {
      const scripts = document.querySelectorAll('script[data-domain]')
      scripts.forEach((script) => script.remove())
    }
  }

  /**
   * Reset document.hidden and visibilityState
   */
  cleanupVisibility(): void {
    // Remove any mocked properties
    const descriptor = Object.getOwnPropertyDescriptor(document, 'hidden')
    if (descriptor && descriptor.configurable) {
      delete (document as { hidden?: boolean }).hidden
    }
  }

  /**
   * Run all cleanup operations
   */
  cleanupAll(): void {
    this.cleanupPlausible()
    this.cleanupScripts()
    this.cleanupVisibility()
    this.cleanup()
  }
}

/**
 * Create a cleanup helper instance
 */
export function createCleanup(): AnalyticsTestCleanup {
  return new AnalyticsTestCleanup()
}

/**
 * Mock import.meta.env for testing
 *
 * @param env - Environment variables to set
 * @returns Cleanup function to restore original env
 *
 * @example
 * const restore = mockEnv({ VITE_ANALYTICS_DOMAIN: 'test.com', PROD: true })
 * // ... test code
 * restore()
 */
export function mockEnv(env: Record<string, unknown>): () => void {
  const original = { ...import.meta.env }

  Object.keys(env).forEach((key) => {
    ;(import.meta.env as Record<string, unknown>)[key] = env[key]
  })

  return () => {
    Object.keys(import.meta.env).forEach((key) => {
      if (key in original) {
        ;(import.meta.env as Record<string, unknown>)[key] = original[
          key as keyof typeof original
        ]
      } else {
        delete (import.meta.env as Record<string, unknown>)[key]
      }
    })
  }
}

/**
 * Wait for a condition to be true
 *
 * @param condition - Function that returns true when condition is met
 * @param timeout - Maximum time to wait in ms (default: 1000)
 * @returns Promise that resolves when condition is met or rejects on timeout
 */
export function waitFor(condition: () => boolean, timeout = 1000): Promise<void> {
  return new Promise((resolve, reject) => {
    const startTime = Date.now()
    const checkCondition = () => {
      if (condition()) {
        resolve()
      } else if (Date.now() - startTime > timeout) {
        reject(new Error('Timeout waiting for condition'))
      } else {
        setTimeout(checkCondition, 10)
      }
    }
    checkCondition()
  })
}
