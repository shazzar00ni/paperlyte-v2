/**
 * Application Monitoring & Error Reporting
 *
 * Centralized error logging and monitoring utility.
 * Handles error reporting to analytics and external services.
 */

import * as Sentry from '@sentry/react'
import { trackEvent } from './analytics'

export interface ErrorContext {
  componentStack?: string
  errorInfo?: Record<string, unknown>
  severity?: 'low' | 'medium' | 'high' | 'critical'
  tags?: Record<string, string>
}

/**
 * Map severity level to Sentry level
 * @param severity - Error severity level
 * @returns Sentry severity level
 */
function mapSeverityToLevel(
  severity: 'low' | 'medium' | 'high' | 'critical'
): 'fatal' | 'error' | 'warning' | 'info' {
  if (severity === 'critical') return 'fatal'
  if (severity === 'high') return 'error'
  if (severity === 'medium') return 'warning'
  return 'info'
}

/**
 * Report an Error with optional metadata, routing to console in development or to analytics/error-monitoring in production.
 *
 * @param error - The Error to report
 * @param context - Optional metadata about the error (e.g., `componentStack`, `errorInfo`, `severity`, `tags`)
 * @param source - Optional label identifying the error's origin (for example, a component or subsystem name)
 */
export function logError(error: Error, context?: ErrorContext, source?: string): void {
  const severity = context?.severity || 'medium'
  const errorSource = source || 'unknown'

  // Always log to console in development
  if (import.meta.env.DEV) {
    console.group(`[${severity.toUpperCase()}] Error from ${errorSource}`)
    console.error(error)
    if (context?.componentStack) {
      console.log('Component Stack:', context.componentStack)
    }
    if (context?.errorInfo) {
      console.log('Additional Info:', context.errorInfo)
    }
    if (context?.tags) {
      console.log('Tags:', context.tags)
    }
    console.groupEnd()
    return
  }

  // In production, report to monitoring services
  try {
    // Track in analytics
    trackEvent('application_error', {
      error_name: error.name,
      error_message: error.message.slice(0, 200),
      error_source: errorSource,
      severity,
      ...context?.tags,
    })

    // Send to error monitoring service (Sentry)
    // Only sends if Sentry is initialized (DSN configured)
    if (import.meta.env.VITE_SENTRY_DSN) {
      Sentry.captureException(error, {
        level: mapSeverityToLevel(severity),
        tags: {
          source: errorSource,
          ...context?.tags,
        },
        extra: {
          componentStack: context?.componentStack,
          ...context?.errorInfo,
        },
        contexts: {
          error_context: {
            severity,
            source: errorSource,
          },
        },
      })

      // Add breadcrumb for tracking error context
      Sentry.addBreadcrumb({
        category: 'error',
        message: `${errorSource}: ${error.message}`,
        level: mapSeverityToLevel(severity),
        data: context?.tags,
      })
    }

    // Log to console in production (for server logs if applicable)
    console.error(`[${errorSource}]`, error.message, {
      severity,
      tags: context?.tags,
    })
  } catch (monitoringError) {
    // Fail silently in production - don't let monitoring errors break the app
    console.error('Monitoring error:', monitoringError)
  }
}

/**
 * Record a non-critical warning message for development consoles or production telemetry.
 *
 * @param message - Human-readable warning text; in production this is truncated to 200 characters.
 * @param context - Optional additional metadata to include with the warning (logged to console in development or merged into the telemetry event in production)
 */
export function logWarning(message: string, context?: Record<string, unknown>): void {
  if (import.meta.env.DEV) {
    console.warn(message, context)
    return
  }

  // In production, track as low-severity event
  trackEvent('application_warning', {
    message: message.slice(0, 200),
    ...context,
  })
}

/**
 * Record an application performance metric.
 *
 * @param metric - Metric name (for example, "db_query_time" or "render_duration")
 * @param value - Measured value for the metric
 * @param unit - Unit of `value`; one of `"ms"`, `"bytes"`, or `"count"`. Defaults to `"ms"`.
 */
export function logPerformance(
  metric: string,
  value: number,
  unit: 'ms' | 'bytes' | 'count' = 'ms'
): void {
  if (import.meta.env.DEV) {
    console.log(`[Performance] ${metric}: ${value}${unit}`)
    return
  }

  trackEvent('performance_metric', {
    metric,
    value,
    unit,
  })
}

/**
 * Log a custom analytics event for application-specific tracking.
 *
 * @param eventName - Name of the event to record
 * @param properties - Optional key-value properties to include with the event
 */
export function logEvent(
  eventName: string,
  properties?: Record<string, string | number | boolean>
): void {
  if (import.meta.env.DEV) {
    console.log(`[Event] ${eventName}`, properties)
  }

  trackEvent(eventName, properties)
}
