import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import * as Sentry from '@sentry/react'
import { logError, logWarning, logPerformance, logEvent } from './monitoring'
import * as analytics from './analytics'

// Mock Sentry
vi.mock('@sentry/react', () => ({
  captureException: vi.fn(),
  addBreadcrumb: vi.fn(),
}))

// Mock analytics
vi.mock('./analytics', () => ({
  trackEvent: vi.fn(),
}))

describe('monitoring', () => {
  let consoleSpy: {
    log: ReturnType<typeof vi.spyOn>
    warn: ReturnType<typeof vi.spyOn>
    error: ReturnType<typeof vi.spyOn>
    group: ReturnType<typeof vi.spyOn>
    groupEnd: ReturnType<typeof vi.spyOn>
  }

  beforeEach(() => {
    // Mock console methods
    consoleSpy = {
      log: vi.spyOn(console, 'log').mockImplementation(() => {}),
      warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
      error: vi.spyOn(console, 'error').mockImplementation(() => {}),
      group: vi.spyOn(console, 'group').mockImplementation(() => {}),
      groupEnd: vi.spyOn(console, 'groupEnd').mockImplementation(() => {}),
    }

    // Clear all mocks
    vi.clearAllMocks()
  })

  afterEach(() => {
    // Restore all mocks
    Object.values(consoleSpy).forEach((spy) => spy.mockRestore())
  })

  describe('logError', () => {
    it('should log error to console with group formatting', () => {
      const error = new Error('Test error')
      logError(error, undefined, 'TestComponent')

      expect(consoleSpy.group).toHaveBeenCalledWith('[MEDIUM] Error from TestComponent')
      expect(consoleSpy.error).toHaveBeenCalledWith(error)
      expect(consoleSpy.groupEnd).toHaveBeenCalled()
    })

    it('should log error with component stack', () => {
      const error = new Error('Test error')
      const context = {
        componentStack: 'at Component\n  at App',
      }

      logError(error, context, 'TestComponent')

      expect(consoleSpy.log).toHaveBeenCalledWith('Component Stack:', context.componentStack)
    })

    it('should log error with additional info', () => {
      const error = new Error('Test error')
      const context = {
        errorInfo: { userId: '123', action: 'click' },
      }

      logError(error, context, 'TestComponent')

      expect(consoleSpy.log).toHaveBeenCalledWith('Additional Info:', context.errorInfo)
    })

    it('should log error with tags', () => {
      const error = new Error('Test error')
      const context = {
        tags: { environment: 'dev', version: '1.0.0' },
      }

      logError(error, context, 'TestComponent')

      expect(consoleSpy.log).toHaveBeenCalledWith('Tags:', context.tags)
    })

    it('should use "medium" severity by default', () => {
      const error = new Error('Test error')
      logError(error)

      expect(consoleSpy.group).toHaveBeenCalledWith('[MEDIUM] Error from unknown')
    })

    it('should use custom severity', () => {
      const error = new Error('Test error')
      logError(error, { severity: 'critical' }, 'TestComponent')

      expect(consoleSpy.group).toHaveBeenCalledWith('[CRITICAL] Error from TestComponent')
    })

    it('should use "unknown" as default source', () => {
      const error = new Error('Test error')
      logError(error)

      expect(consoleSpy.group).toHaveBeenCalledWith('[MEDIUM] Error from unknown')
    })

    it('should not call trackEvent in development', () => {
      const error = new Error('Test error')
      logError(error)

      expect(analytics.trackEvent).not.toHaveBeenCalled()
    })

    it('should not call Sentry in development', () => {
      const error = new Error('Test error')
      logError(error)

      expect(Sentry.captureException).not.toHaveBeenCalled()
    })

    it('should handle all severity levels', () => {
      const error = new Error('Test error')

      logError(error, { severity: 'critical' })
      expect(consoleSpy.group).toHaveBeenCalledWith('[CRITICAL] Error from unknown')

      logError(error, { severity: 'high' })
      expect(consoleSpy.group).toHaveBeenCalledWith('[HIGH] Error from unknown')

      logError(error, { severity: 'medium' })
      expect(consoleSpy.group).toHaveBeenCalledWith('[MEDIUM] Error from unknown')

      logError(error, { severity: 'low' })
      expect(consoleSpy.group).toHaveBeenCalledWith('[LOW] Error from unknown')
    })

    it('should handle errors without context', () => {
      const error = new Error('Test error')
      expect(() => logError(error)).not.toThrow()
    })

    it('should handle errors with empty context', () => {
      const error = new Error('Test error')
      expect(() => logError(error, {}, 'TestComponent')).not.toThrow()
    })
  })

  describe('logError (production mode)', () => {
    beforeEach(() => {
      // Set production mode
      vi.stubEnv('DEV', false as unknown as string)
      vi.stubEnv('VITE_SENTRY_DSN', 'https://test@sentry.io/123')
    })

    afterEach(() => {
      vi.unstubAllEnvs()
    })

    it('should call trackEvent in production', () => {
      const error = new Error('Production error')
      logError(error, { severity: 'high' }, 'ProdComponent')

      expect(analytics.trackEvent).toHaveBeenCalledWith(
        'application_error',
        expect.objectContaining({
          error_name: 'Error',
          error_source: 'ProdComponent',
          severity: 'high',
        })
      )
    })

    it('should call Sentry.captureException in production with DSN', () => {
      const error = new Error('Sentry error')
      logError(error, { severity: 'critical', tags: { feature: 'auth' } }, 'AuthService')

      expect(Sentry.captureException).toHaveBeenCalledWith(
        error,
        expect.objectContaining({
          level: 'fatal',
          tags: expect.objectContaining({
            source: 'AuthService',
            feature: 'auth',
          }),
        })
      )
    })

    it('should add Sentry breadcrumb in production', () => {
      const error = new Error('Breadcrumb error')
      logError(error, { tags: { module: 'ui' } }, 'UIComponent')

      expect(Sentry.addBreadcrumb).toHaveBeenCalledWith(
        expect.objectContaining({
          category: 'error',
          message: 'UIComponent: Breadcrumb error',
          data: { module: 'ui' },
        })
      )
    })

    it('should truncate error messages to 200 characters', () => {
      const longMessage = 'A'.repeat(300)
      const error = new Error(longMessage)
      logError(error)

      expect(analytics.trackEvent).toHaveBeenCalledWith(
        'application_error',
        expect.objectContaining({
          error_message: 'A'.repeat(200),
        })
      )
    })

    it('should log to console.error in production', () => {
      const error = new Error('Console error')
      logError(error, undefined, 'TestSource')

      expect(consoleSpy.error).toHaveBeenCalledWith(
        '[Error]',
        'TestSource',
        'Console error',
        expect.objectContaining({ severity: 'medium' })
      )
    })

    it('should handle monitoring errors gracefully in production', () => {
      // Make trackEvent throw
      vi.mocked(analytics.trackEvent).mockImplementationOnce(() => {
        throw new Error('Monitoring failed')
      })

      const error = new Error('Original error')
      expect(() => logError(error)).not.toThrow()

      // Should log the monitoring error
      expect(consoleSpy.error).toHaveBeenCalledWith('Monitoring error:', expect.any(Error))
    })

    it('should include componentStack and errorInfo in Sentry extra', () => {
      const error = new Error('Component error')
      logError(
        error,
        {
          componentStack: 'at Comp\n  at App',
          errorInfo: { retryCount: 3 },
        },
        'ErrorBoundary'
      )

      expect(Sentry.captureException).toHaveBeenCalledWith(
        error,
        expect.objectContaining({
          extra: expect.objectContaining({
            componentStack: 'at Comp\n  at App',
            retryCount: 3,
          }),
        })
      )
    })
  })

  describe('logWarning (production mode)', () => {
    beforeEach(() => {
      vi.stubEnv('DEV', false as unknown as string)
    })

    afterEach(() => {
      vi.unstubAllEnvs()
    })

    it('should call trackEvent in production', () => {
      logWarning('Production warning', { area: 'cache' })

      expect(analytics.trackEvent).toHaveBeenCalledWith(
        'application_warning',
        expect.objectContaining({
          message: 'Production warning',
          area: 'cache',
        })
      )
    })

    it('should truncate warning messages to 200 characters in production', () => {
      const longMessage = 'W'.repeat(300)
      logWarning(longMessage)

      expect(analytics.trackEvent).toHaveBeenCalledWith(
        'application_warning',
        expect.objectContaining({
          message: 'W'.repeat(200),
        })
      )
    })
  })

  describe('logPerformance (production mode)', () => {
    beforeEach(() => {
      vi.stubEnv('DEV', false as unknown as string)
    })

    afterEach(() => {
      vi.unstubAllEnvs()
    })

    it('should call trackEvent in production', () => {
      logPerformance('render_time', 150, 'ms')

      expect(analytics.trackEvent).toHaveBeenCalledWith('performance_metric', {
        metric: 'render_time',
        value: 150,
        unit: 'ms',
      })
    })
  })

  describe('logWarning', () => {
    it('should log warning to console', () => {
      logWarning('This is a warning')

      expect(consoleSpy.warn).toHaveBeenCalledWith('This is a warning', undefined)
    })

    it('should log warning with context', () => {
      const context = { component: 'Button', reason: 'deprecated' }
      logWarning('This is a warning', context)

      expect(consoleSpy.warn).toHaveBeenCalledWith('This is a warning', context)
    })

    it('should not call trackEvent in development', () => {
      logWarning('This is a warning')

      expect(analytics.trackEvent).not.toHaveBeenCalled()
    })

    it('should handle warnings without context', () => {
      expect(() => logWarning('Test warning')).not.toThrow()
    })

    it('should handle warnings with empty context', () => {
      expect(() => logWarning('Test warning', {})).not.toThrow()
    })
  })

  describe('logPerformance', () => {
    it('should log performance metric to console', () => {
      logPerformance('render_time', 150)

      expect(consoleSpy.log).toHaveBeenCalledWith('[Performance] render_time: 150ms')
    })

    it('should log performance metric with custom unit', () => {
      logPerformance('bundle_size', 1024, 'bytes')

      expect(consoleSpy.log).toHaveBeenCalledWith('[Performance] bundle_size: 1024bytes')
    })

    it('should default to "ms" unit', () => {
      logPerformance('query_time', 50)

      expect(consoleSpy.log).toHaveBeenCalledWith('[Performance] query_time: 50ms')
    })

    it('should support "count" unit', () => {
      logPerformance('api_calls', 5, 'count')

      expect(consoleSpy.log).toHaveBeenCalledWith('[Performance] api_calls: 5count')
    })

    it('should not call trackEvent in development', () => {
      logPerformance('render_time', 150)

      expect(analytics.trackEvent).not.toHaveBeenCalled()
    })

    it('should handle all unit types', () => {
      expect(() => logPerformance('test1', 100, 'ms')).not.toThrow()
      expect(() => logPerformance('test2', 1024, 'bytes')).not.toThrow()
      expect(() => logPerformance('test3', 5, 'count')).not.toThrow()
    })

    it('should handle zero values', () => {
      logPerformance('zero_metric', 0)
      expect(consoleSpy.log).toHaveBeenCalledWith('[Performance] zero_metric: 0ms')
    })

    it('should handle negative values', () => {
      logPerformance('negative_metric', -1)
      expect(consoleSpy.log).toHaveBeenCalledWith('[Performance] negative_metric: -1ms')
    })
  })

  describe('logEvent', () => {
    it('should log event to console', () => {
      logEvent('button_click')

      expect(consoleSpy.log).toHaveBeenCalledWith('[Event]', 'button_click', undefined)
    })

    it('should log event with properties', () => {
      const properties = { location: 'header', text: 'Sign Up' }
      logEvent('button_click', properties)

      expect(consoleSpy.log).toHaveBeenCalledWith('[Event]', 'button_click', properties)
    })

    it('should track event in analytics even in development', () => {
      logEvent('button_click', { location: 'header' })

      expect(analytics.trackEvent).toHaveBeenCalledWith('button_click', { location: 'header' })
    })

    it('should track event without properties', () => {
      logEvent('simple_event')

      expect(analytics.trackEvent).toHaveBeenCalledWith('simple_event', undefined)
    })

    it('should handle string properties', () => {
      logEvent('test_event', { prop: 'value' })

      expect(analytics.trackEvent).toHaveBeenCalledWith('test_event', { prop: 'value' })
    })

    it('should handle number properties', () => {
      logEvent('test_event', { prop: 123 })

      expect(analytics.trackEvent).toHaveBeenCalledWith('test_event', { prop: 123 })
    })

    it('should handle boolean properties', () => {
      logEvent('test_event', { prop: true })

      expect(analytics.trackEvent).toHaveBeenCalledWith('test_event', { prop: true })
    })

    it('should handle mixed property types', () => {
      logEvent('test_event', {
        stringProp: 'value',
        numberProp: 123,
        booleanProp: false,
      })

      expect(analytics.trackEvent).toHaveBeenCalledWith('test_event', {
        stringProp: 'value',
        numberProp: 123,
        booleanProp: false,
      })
    })

    it('should handle empty properties object', () => {
      logEvent('test_event', {})

      expect(analytics.trackEvent).toHaveBeenCalledWith('test_event', {})
    })
  })
})
