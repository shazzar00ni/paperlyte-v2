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

      expect(consoleSpy.group).toHaveBeenCalledWith('[MEDIUM] Error from TestComponent')
      expect(consoleSpy.error).toHaveBeenCalledWith(error)
      expect(consoleSpy.groupEnd).toHaveBeenCalled()
    })

    it('should log error with additional info', () => {
      const error = new Error('Test error')
      const context = {
        errorInfo: { userId: '123', action: 'click' },
      }

      logError(error, context, 'TestComponent')

      expect(consoleSpy.group).toHaveBeenCalledWith('[MEDIUM] Error from TestComponent')
      expect(consoleSpy.error).toHaveBeenCalledWith(error)
      expect(consoleSpy.groupEnd).toHaveBeenCalled()
    })

    it('should log error with tags', () => {
      const error = new Error('Test error')
      const context = {
        tags: { environment: 'dev', version: '1.0.0' },
      }

      logError(error, context, 'TestComponent')

      expect(consoleSpy.group).toHaveBeenCalledWith('[MEDIUM] Error from TestComponent')
      expect(consoleSpy.error).toHaveBeenCalledWith(error)
      expect(consoleSpy.groupEnd).toHaveBeenCalled()
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
    it('should return early in development without logging', () => {
      logPerformance('render_time', 150)

      expect(consoleSpy.log).not.toHaveBeenCalled()
      expect(analytics.trackEvent).not.toHaveBeenCalled()
    })

    it('should not log performance metric with custom unit in development', () => {
      logPerformance('bundle_size', 1024, 'bytes')

      expect(consoleSpy.log).not.toHaveBeenCalled()
    })

    it('should default to "ms" unit', () => {
      logPerformance('query_time', 50)

      expect(consoleSpy.log).not.toHaveBeenCalled()
    })

    it('should support "count" unit', () => {
      logPerformance('api_calls', 5, 'count')

      expect(consoleSpy.log).not.toHaveBeenCalled()
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
      expect(consoleSpy.log).not.toHaveBeenCalled()
    })

    it('should handle negative values', () => {
      logPerformance('negative_metric', -1)
      expect(consoleSpy.log).not.toHaveBeenCalled()
    })
  })

  describe('logEvent', () => {
    it('should forward event to trackEvent', () => {
      logEvent('button_click')

      expect(analytics.trackEvent).toHaveBeenCalledWith('button_click', undefined)
    })

    it('should forward event with properties to trackEvent', () => {
      const properties = { location: 'header', text: 'Sign Up' }
      logEvent('button_click', properties)

      expect(analytics.trackEvent).toHaveBeenCalledWith('button_click', properties)
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
