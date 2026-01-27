import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Icon } from '@components/ui/Icon'
import { logError } from '@utils/monitoring'
import styles from './ErrorBoundary.module.css'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  maxRetries?: number
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  retryCount: number
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      retryCount: 0,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Increment retry count after error is caught
    this.setState((prevState) => ({
      retryCount: prevState.retryCount + 1,
    }))

    // Log error using centralized monitoring utility
    logError(
      error,
      {
        componentStack: errorInfo.componentStack ?? undefined,
        errorInfo: errorInfo as Record<string, unknown>,
        severity: 'high',
        tags: {
          retry_count: String(this.state.retryCount),
        },
      },
      'ErrorBoundary'
    )
  }

  handleReset = (): void => {
    const maxRetries = this.props.maxRetries ?? 3

    // Prevent infinite retry loops
    if (this.state.retryCount >= maxRetries) {
      // Too many retries - force page reload
      window.location.reload()
      return
    }

    // Reset error state to re-render children
    this.setState({
      hasError: false,
      error: null,
      retryCount: this.state.retryCount,
    })
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
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
            <h2 className={styles.errorTitle}>Something went wrong</h2>
            <p className={styles.errorMessage}>
              {showRetryButton
                ? "We're sorry, but something unexpected happened. You can try again or reload the page."
                : 'Multiple errors occurred. Please reload the page to continue.'}
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
                onClick={() => {
                  window.location.reload()
                }}
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
