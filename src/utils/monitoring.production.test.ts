/**
 * Tests for monitoring.ts in production-like environment
 *
 * The existing monitoring.test.ts covers development (DEV=true) paths.
 * This file covers the production paths by setting import.meta.env.DEV = false.
 */
import { describe, it, expect, vi, beforeAll, beforeEach, afterEach, afterAll } from 'vitest'

// Mock Sentry
vi.mock('@sentry/react', () => ({
  captureException: vi.fn(),
  addBreadcrumb: vi.fn(),
}))

// Mock analytics
vi.mock('./analytics', () => ({
  trackEvent: vi.fn(),
}))

describe('monitoring (production paths)', () => {
  // We need to import the module AFTER stubbing the env so that
  // the module-level `import.meta.env.DEV` evaluates to false.
  // Vitest re-evaluates modules per test file by default.

  let logError: typeof import('./monitoring').logError
  let logWarning: typeof import('./monitoring').logWarning
  let logPerformance: typeof import('./monitoring').logPerformance
  let logEvent: typeof import('./monitoring').logEvent
  let trackEvent: ReturnType<typeof vi.fn>

  let consoleSpy: {
    log: ReturnType<typeof vi.spyOn>
    warn: ReturnType<typeof vi.spyOn>
    error: ReturnType<typeof vi.spyOn>
    group: ReturnType<typeof vi.spyOn>
    groupEnd: ReturnType<typeof vi.spyOn>
  }

  beforeAll(() => {
    // Override import.meta.env to simulate production before any imports
    vi.stubEnv('DEV', false)
    vi.stubEnv('PROD', true)
  })

  afterAll(() => {
    vi.unstubAllEnvs()
  })

  beforeEach(async () => {
    // Reset module registry so the fresh import below re-evaluates import.meta.env.DEV
    // with the stub already in place (set by beforeAll).
    vi.resetModules()
    vi.clearAllMocks()
    consoleSpy = {
      log: vi.spyOn(console, 'log').mockImplementation(() => {}),
      warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
      error: vi.spyOn(console, 'error').mockImplementation(() => {}),
      group: vi.spyOn(console, 'group').mockImplementation(() => {}),
      groupEnd: vi.spyOn(console, 'groupEnd').mockImplementation(() => {}),
    }

    // Import fresh after env stub
    const monitoring = await import('./monitoring')
    logError = monitoring.logError
    logWarning = monitoring.logWarning
    logPerformance = monitoring.logPerformance
    logEvent = monitoring.logEvent

    const analyticsModule = await import('./analytics')
    trackEvent = analyticsModule.trackEvent as ReturnType<typeof vi.fn>
  })

  afterEach(() => {
    Object.values(consoleSpy).forEach((spy) => spy.mockRestore())
  })

  describe('logWarning in production', () => {
    it('calls trackEvent with application_warning in production', () => {
      logWarning('Test warning')
      expect(trackEvent).toHaveBeenCalledWith('application_warning', { message: 'Test warning' })
      expect(consoleSpy.warn).not.toHaveBeenCalled()
    })

    it('spreads context into the trackEvent payload', () => {
      logWarning('Warning with context', { component: 'Test', line: 42 })
      expect(trackEvent).toHaveBeenCalledWith('application_warning', {
        message: 'Warning with context',
        component: 'Test',
        line: 42,
      })
      expect(consoleSpy.warn).not.toHaveBeenCalled()
    })
  })

  describe('logPerformance in production', () => {
    it('calls trackEvent with performance_metric and default ms unit', () => {
      logPerformance('render', 100)
      expect(trackEvent).toHaveBeenCalledWith('performance_metric', {
        metric: 'render',
        value: 100,
        unit: 'ms',
      })
      expect(consoleSpy.log).not.toHaveBeenCalled()
    })

    it('calls trackEvent with bytes unit', () => {
      logPerformance('bundle', 50000, 'bytes')
      expect(trackEvent).toHaveBeenCalledWith('performance_metric', {
        metric: 'bundle',
        value: 50000,
        unit: 'bytes',
      })
    })

    it('calls trackEvent with count unit', () => {
      logPerformance('requests', 10, 'count')
      expect(trackEvent).toHaveBeenCalledWith('performance_metric', {
        metric: 'requests',
        value: 10,
        unit: 'count',
      })
    })
  })

  describe('logEvent in production', () => {
    it('always calls trackEvent regardless of environment', () => {
      // logEvent explicitly calls trackEvent even in dev
      logEvent('test_event', { key: 'val' })
      expect(trackEvent).toHaveBeenCalledWith('test_event', { key: 'val' })
    })

    it('calls trackEvent with undefined properties when none provided', () => {
      logEvent('no_props')
      expect(trackEvent).toHaveBeenCalledWith('no_props', undefined)
    })
  })

  describe('logError edge cases', () => {
    it('handles error with all context fields populated', () => {
      const error = new Error('Full context error')
      expect(() =>
        logError(
          error,
          {
            componentStack: 'at Foo\n  at Bar',
            errorInfo: { extra: 'data' },
            severity: 'high',
            tags: { env: 'test', version: '1.0' },
          },
          'FullContextComponent'
        )
      ).not.toThrow()
    })

    it('handles error with only severity set', () => {
      const error = new Error('Severity only')
      expect(() => logError(error, { severity: 'low' })).not.toThrow()
    })

    it('handles error with only tags set', () => {
      const error = new Error('Tags only')
      expect(() => logError(error, { tags: { feature: 'auth' } })).not.toThrow()
    })

    it('handles error with only componentStack set', () => {
      const error = new Error('Stack only')
      expect(() => logError(error, { componentStack: 'at SomeComponent' })).not.toThrow()
    })

    it('handles error with only errorInfo set', () => {
      const error = new Error('ErrorInfo only')
      expect(() => logError(error, { errorInfo: { userId: 'abc' } })).not.toThrow()
    })

    it('handles non-standard Error objects', () => {
      const error = { name: 'CustomError', message: 'custom', stack: '' } as Error
      expect(() => logError(error)).not.toThrow()
    })
  })
})
