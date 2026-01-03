/**
 * Shared test helpers for analytics testing
 *
 * Provides factory functions for creating common mocks and test utilities
 * used across analytics test suites.
 */

import { vi } from 'vitest'
import type { AnalyticsConfig } from '../analytics/types'

/**
 * Mock Plausible API function
 * Returns a vi.fn() mock for window.plausible
 */
export function mockPlausibleAPI() {
  const plausibleMock = vi.fn()

  // Set up window.plausible
  Object.defineProperty(window, 'plausible', {
    writable: true,
    configurable: true,
    value: plausibleMock,
  })

  return {
    mock: plausibleMock,
    cleanup: () => {
      delete (window as Window & { plausible?: unknown }).plausible
    },
  }
}

/**
 * Mock PerformanceObserver API
 * Returns a mock class and instance tracker
 */
export function mockPerformanceObserver() {
  const instances: Array<{
    callback: PerformanceObserverCallback
    observe: ReturnType<typeof vi.fn>
    disconnect: ReturnType<typeof vi.fn>
    takeRecords: ReturnType<typeof vi.fn>
  }> = []

  const MockObserver = class {
    callback: PerformanceObserverCallback
    observe = vi.fn()
    disconnect = vi.fn()
    takeRecords = vi.fn(() => [])

    constructor(callback: PerformanceObserverCallback) {
      this.callback = callback
      instances.push(this)
    }
  }

  const originalPO = global.PerformanceObserver

  global.PerformanceObserver = MockObserver as unknown as typeof PerformanceObserver

  return {
    instances,
    MockObserver,
    cleanup: () => {
      global.PerformanceObserver = originalPO
      instances.length = 0
    },
  }
}

/**
 * Mock Scroll API
 * Mocks window.scrollY, document.documentElement properties, and window.innerHeight
 */
export function mockScrollAPI(options: {
  scrollY?: number
  scrollHeight?: number
  clientHeight?: number
  innerHeight?: number
} = {}) {
  const {
    scrollY = 0,
    scrollHeight = 1000,
    clientHeight = 500,
    innerHeight = 500,
  } = options

  // Store original values
  const originalScrollY = window.scrollY
  const originalInnerHeight = window.innerHeight
  const originalScrollHeight = document.documentElement.scrollHeight
  const originalClientHeight = document.documentElement.clientHeight
  const originalScrollTop = document.documentElement.scrollTop

  // Mock window.scrollY
  Object.defineProperty(window, 'scrollY', {
    writable: true,
    configurable: true,
    value: scrollY,
  })

  // Mock window.innerHeight
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: innerHeight,
  })

  // Mock document.documentElement properties
  Object.defineProperty(document.documentElement, 'scrollHeight', {
    writable: true,
    configurable: true,
    value: scrollHeight,
  })

  Object.defineProperty(document.documentElement, 'clientHeight', {
    writable: true,
    configurable: true,
    value: clientHeight,
  })

  Object.defineProperty(document.documentElement, 'scrollTop', {
    writable: true,
    configurable: true,
    value: scrollY,
  })

  return {
    setScrollY: (value: number) => {
      Object.defineProperty(window, 'scrollY', { value, writable: true })
      Object.defineProperty(document.documentElement, 'scrollTop', { value, writable: true })
    },
    setScrollHeight: (value: number) => {
      Object.defineProperty(document.documentElement, 'scrollHeight', { value, writable: true })
    },
    setClientHeight: (value: number) => {
      Object.defineProperty(document.documentElement, 'clientHeight', { value, writable: true })
    },
    cleanup: () => {
      Object.defineProperty(window, 'scrollY', { value: originalScrollY, writable: true })
      Object.defineProperty(window, 'innerHeight', { value: originalInnerHeight, writable: true })
      Object.defineProperty(document.documentElement, 'scrollHeight', {
        value: originalScrollHeight,
        writable: true,
      })
      Object.defineProperty(document.documentElement, 'clientHeight', {
        value: originalClientHeight,
        writable: true,
      })
      Object.defineProperty(document.documentElement, 'scrollTop', {
        value: originalScrollTop,
        writable: true,
      })
    },
  }
}

/**
 * Create test analytics configuration
 * Returns a valid AnalyticsConfig object with sensible defaults
 */
export function createAnalyticsConfig(
  overrides: Partial<AnalyticsConfig> = {}
): AnalyticsConfig {
  return {
    provider: 'plausible',
    domain: 'test-domain.com',
    debug: false,
    trackPageviews: true,
    trackWebVitals: true,
    trackScrollDepth: true,
    respectDNT: false,
    ...overrides,
  }
}

/**
 * Mock environment variables for testing
 */
export function mockEnvironment(env: Record<string, string | undefined>) {
  Object.entries(env).forEach(([key, value]) => {
    vi.stubEnv(key, value)
  })

  return {
    cleanup: () => {
      vi.unstubAllEnvs()
    },
  }
}

/**
 * Mock Do Not Track setting
 */
export function mockDoNotTrack(enabled: boolean) {
  const original = navigator.doNotTrack

  Object.defineProperty(navigator, 'doNotTrack', {
    writable: true,
    configurable: true,
    value: enabled ? '1' : '0',
  })

  return {
    cleanup: () => {
      Object.defineProperty(navigator, 'doNotTrack', {
        writable: true,
        configurable: true,
        value: original,
      })
    },
  }
}

/**
 * Cleanup all analytics-related mocks and state
 * Comprehensive cleanup for analytics tests
 */
export function cleanupAllAnalyticsMocks() {
  // Clean up window.plausible
  delete (window as Window & { plausible?: unknown }).plausible

  // Clean up document head (remove any script tags)
  const scripts = document.head.querySelectorAll('script[data-domain]')
  scripts.forEach((script) => script.remove())

  // Restore environment variables
  vi.unstubAllEnvs()

  // Clear all timers
  vi.clearAllTimers()

  // Restore all mocks
  vi.restoreAllMocks()
}
