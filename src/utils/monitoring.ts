/**
 * Application Monitoring & Error Reporting
 *
 * Centralized error logging and monitoring utility.
 * Handles error reporting to analytics and external services.
 */

import { trackEvent } from "./analytics";

export interface ErrorContext {
  componentStack?: string;
  errorInfo?: Record<string, unknown>;
  severity?: "low" | "medium" | "high" | "critical";
  tags?: Record<string, string>;
}

/**
 * Log an error with context
 * In production, reports to analytics and error monitoring services
 * In development, logs to console with full details
 */
export function logError(
  error: Error,
  context?: ErrorContext,
  source?: string,
): void {
  const severity = context?.severity || "medium";
  const errorSource = source || "unknown";

  // Always log to console in development
  if (import.meta.env.DEV) {
    console.group(`[${severity.toUpperCase()}] Error from ${errorSource}`);
    console.error(error);
    if (context?.componentStack) {
      console.log("Component Stack:", context.componentStack);
    }
    if (context?.errorInfo) {
      console.log("Additional Info:", context.errorInfo);
    }
    if (context?.tags) {
      console.log("Tags:", context.tags);
    }
    console.groupEnd();
    return;
  }

  // In production, report to monitoring services
  try {
    // Track in analytics
    trackEvent("application_error", {
      error_name: error.name,
      error_message: error.message.slice(0, 200),
      error_source: errorSource,
      severity,
      ...context?.tags,
    });

    // Send to error monitoring service (e.g., Sentry)
    // Note: Uncomment and configure when error monitoring is set up
    // if (window.Sentry) {
    //   window.Sentry.captureException(error, {
    //     level: severity,
    //     tags: {
    //       source: errorSource,
    //       ...context?.tags,
    //     },
    //     extra: {
    //       componentStack: context?.componentStack,
    //       ...context?.errorInfo,
    //     },
    //   });
    // }

    // Log to console in production (for server logs if applicable)
    console.error(`[${errorSource}]`, error.message, {
      severity,
      tags: context?.tags,
    });
  } catch (monitoringError) {
    // Fail silently in production - don't let monitoring errors break the app
    console.error("Monitoring error:", monitoringError);
  }
}

/**
 * Log a warning (non-critical issue)
 */
export function logWarning(
  message: string,
  context?: Record<string, unknown>,
): void {
  if (import.meta.env.DEV) {
    console.warn(message, context);
    return;
  }

  // In production, track as low-severity event
  trackEvent("application_warning", {
    message: message.slice(0, 200),
    ...context,
  });
}

/**
 * Log performance metrics
 */
export function logPerformance(
  metric: string,
  value: number,
  unit: "ms" | "bytes" | "count" = "ms",
): void {
  if (import.meta.env.DEV) {
    console.log(`[Performance] ${metric}: ${value}${unit}`);
    return;
  }

  trackEvent("performance_metric", {
    metric,
    value,
    unit,
  });
}

/**
 * Log a custom event (for application-specific tracking)
 */
export function logEvent(
  eventName: string,
  properties?: Record<string, string | number | boolean>,
): void {
  if (import.meta.env.DEV) {
    console.log(`[Event] ${eventName}`, properties);
  }

  trackEvent(eventName, properties);
}
