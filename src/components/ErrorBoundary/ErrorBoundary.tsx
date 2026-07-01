import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Icon } from '@components/ui/Icon'
import { logError } from '@utils/monitoring'
import styles from './ErrorBoundary.module.css'

interface ErrorBoundaryProps {
  /** Subtree to render when no error is present */
  children: ReactNode
  /**
   * UI to render instead of the default error card when an error is caught.
   * Pass `null` or an empty fragment to render nothing on error.
   * When omitted, the built-in retry/reload card is shown.
   */
  fallback?: ReactNode
  /**
   * Maximum number of in-place retries before falling back to a full page reload.
   * @default 3
   */
  maxRetries?: number
}

interface ErrorBoundaryState {
  /** Whether a rendering error has been caught and the boundary is in its error state */
  hasError: boolean
  /** The most recently caught error, or `null` when no error is active */
  error: Error | null
  /** Number of times the user has pressed "Try Again" since the last successful render */
  retryCount: number
}

/**
 * React Error Boundary component that catches JavaScript errors in child components
 * Displays fallback UI when errors occur and logs errors to monitoring system
 * Includes retry mechanism with configurable max retries to prevent infinite loops
 *
 * @example
 * ```tsx
 * // Wrap your app or specific components
 * <ErrorBoundary maxRetries={3}>
 *   <App />
 * </ErrorBoundary>
 *
 * // With custom fallback
 * <ErrorBoundary fallback={<CustomErrorPage />}>
 *   <RiskyComponent />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      retryCount: 0,
    }
  }

  /**
   * React lifecycle — called during rendering when a descendant throws.
   * Returns state updates that switch the boundary into error mode so the
   * next render shows the fallback UI.
   */
  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    }
  }

  /**
   * React lifecycle — called after the boundary has rendered its fallback UI.
   * Increments the retry counter and forwards the error to `logError` so it is
   * reported to Sentry (production) or the console (development).
   */
  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    let newRetryCount: number
    this.setState(
      (prevState) => {
        newRetryCount = prevState.retryCount + 1
        return { retryCount: newRetryCount }
      },
      () => {
        // Log after state is committed so retry_count reflects the updated value
        const { componentStack, ...restErrorInfo } = errorInfo
        logError(
          error,
          {
            componentStack: componentStack ? componentStack : undefined,
            errorInfo: restErrorInfo as Record<string, unknown>,
            severity: 'high',
            tags: {
              retry_count: String(newRetryCount),
            },
          },
          'ErrorBoundary'
        )
      }
    )
  }

  /**
   * Attempts an in-place recovery by resetting error state so the child tree
   * re-renders. After `maxRetries` attempts the page is fully reloaded instead,
   * preventing an infinite error loop.
   */
  handleReset = (): void => {
    const maxRetries = this.props.maxRetries ?? 3

    // Prevent infinite retry loops
    if (this.state.retryCount >= maxRetries) {
      // Too many retries - force page reload
      globalThis.location.reload()
      return
    }

    // Reset error state to re-render children
    this.setState({
      hasError: false,
      error: null,
      retryCount: this.state.retryCount,
    })
  }

  /**
   * Renders children when no error is active. On error, renders either the
   * consumer-supplied `fallback` prop or the built-in error card with retry
   * and reload actions.
   */
  render(): ReactNode {
    if (this.state.hasError) {
      // Use custom fallback if provided (including null to render nothing)
      if (this.props.fallback !== undefined) {
        return this.props.fallback
      }

      // Default fallback UI
      const maxRetries = this.props.maxRetries ?? 3
      const showRetryButton = this.state.retryCount < maxRetries

      return (
        <div className={styles.errorContainer} role="alert">
          <div className={styles.errorContent}>
            <div className={styles.errorIcon} aria-hidden="true">
              <Icon name="fa-triangle-exclamation" size="xl" />
            </div>
            <h2 className={styles.errorTitle}>Paperlyte ran into a problem</h2>
            <p className={styles.errorMessage}>
              {showRetryButton
                ? 'An unexpected error occurred. Try reloading to continue.'
                : 'We keep hitting an error. Reload the page to start fresh.'}
            </p>
            {this.state.error && import.meta.env.DEV && (
              <details className={styles.errorDetails}>
                <summary>Error details (development only)</summary>
                <pre className={styles.errorStack}>
                  {this.state.error.toString()}
                  {'\n'}
                  {this.state.error.stack}
                </pre>
              </details>
            )}
            <div className={styles.errorActions}>
              {showRetryButton && (
                <button
                  onClick={this.handleReset}
                  className={styles.retryButton}
                  type="button"
                  aria-label={`Try again (attempt ${this.state.retryCount + 1} of ${maxRetries})`}
                >
                  Try Again
                </button>
              )}
              <button
                onClick={() => globalThis.location.reload()}
                className={styles.reloadButton}
                type="button"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
