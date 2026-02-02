/**
 * Shared test utilities for analytics tests
 */
import { vi, beforeEach, afterEach } from 'vitest'

/**
 * Clears analytics-related global objects before each test
 * Call this in beforeEach to ensure clean test state
 */
export function clearAnalyticsGlobals() {
  delete (window as Window & { gtag?: unknown }).gtag
  delete (window as Window & { dataLayer?: unknown }).dataLayer
}

/**
 * Sets up console spy mocks and cleanup
 * Returns an object with spy references and cleanup function
 */
export function setupConsoleSpy() {
  const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(vi.fn())
  const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(vi.fn())
  const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(vi.fn())

  const cleanup = () => {
    consoleWarnSpy.mockRestore()
    consoleLogSpy.mockRestore()
    consoleErrorSpy.mockRestore()
  }

  return {
    consoleWarnSpy,
    consoleLogSpy,
    consoleErrorSpy,
    cleanup,
  }
}

/**
 * Complete analytics test setup with console spies and cleanup
 * Use this for tests that need console mocking
 */
export function setupAnalyticsTest() {
  let spies: ReturnType<typeof setupConsoleSpy>

  beforeEach(() => {
    clearAnalyticsGlobals()
    spies = setupConsoleSpy()
  })

  afterEach(() => {
    spies.cleanup()
    vi.unstubAllEnvs()
  })

  return spies
}
