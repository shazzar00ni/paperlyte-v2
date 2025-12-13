import { type FC } from 'react'
import { Icon } from '@/components/ui/Icon'
import { CONTACT } from '@/constants/config'
import styles from './ServerErrorPage.module.css'

// Export button labels for test stability
export const BUTTON_LABELS = {
  RETRY: 'Retry loading the page',
  HOMEPAGE: 'Return to homepage',
} as const

interface ServerErrorPageProps {
  /**
   * Custom error message to display (optional)
   */
  message?: string
  /**
   * Custom error details (optional, shown in development only)
   */
  errorDetails?: string
  /**
   * Callback for retry button (optional)
   */
  onRetry?: () => void
  /**
   * Show contact support link (default: true)
   */
  showSupport?: boolean
}

export const ServerErrorPage: FC<ServerErrorPageProps> = ({
  message,
  errorDetails,
  onRetry,
  showSupport = true,
}) => {
  const handleRetry = (): void => {
    if (onRetry) {
      onRetry()
    } else {
      // Default behavior: full page reload to clear error state
      // Note: window.location.reload() is intentional for error recovery.
      // In an SPA with routing, consider passing a custom onRetry callback.
      window.location.reload()
    }
  }

  const handleGoHome = (): void => {
    // Full page navigation to homepage
    // Note: window.location.href is intentional for error recovery.
    // In an SPA with routing, consider using navigate('/') via callback.
    window.location.href = '/'
  }

  return (
    <main className={styles.container} aria-labelledby="error-title">
      <div className={styles.content}>
        {/* Error illustration */}
        <div className={styles.illustration} aria-hidden="true">
          <div className={styles.iconWrapper}>
            <Icon name="fa-server" size="3x" />
            <div className={styles.errorBadge}>
              <Icon name="fa-triangle-exclamation" />
            </div>
          </div>
          <div className={styles.errorCode}>500</div>
        </div>

        {/* Main content */}
        <h1 id="error-title" className={styles.title}>
          Oops! Something went wrong
        </h1>

        <p className={styles.message}>
          {message ||
            "We're sorry, but something unexpected happened on our end. This isn't your fault, and we're working to fix it."}
        </p>

        {/* Error details (development only) */}
        {errorDetails && import.meta.env.DEV && (
          <details className={styles.errorDetails}>
            <summary className={styles.detailsSummary}>
              <Icon name="fa-code" size="sm" />
              <span>Error details (development only)</span>
            </summary>
            <pre className={styles.errorStack}>{errorDetails}</pre>
          </details>
        )}

        {/* Action buttons */}
        <div className={styles.actions}>
          <button
            onClick={handleRetry}
            className={styles.primaryButton}
            type="button"
            aria-label={BUTTON_LABELS.RETRY}
          >
            <Icon name="fa-rotate-right" />
            <span>Try Again</span>
          </button>

          <button
            onClick={handleGoHome}
            className={styles.secondaryButton}
            type="button"
            aria-label={BUTTON_LABELS.HOMEPAGE}
          >
            <Icon name="fa-home" />
            <span>Go to Homepage</span>
          </button>
        </div>

        {/* Support information */}
        {showSupport && (
          <div className={styles.supportInfo}>
            <p className={styles.supportText}>
              <Icon name="fa-circle-info" size="sm" />
              <span>
                If this problem persists, please{' '}
                <a href={`mailto:${CONTACT.supportEmail}`} className={styles.supportLink}>
                  contact our support team
                </a>
                .
              </span>
            </p>
          </div>
        )}

        {/* Status information */}
        <div className={styles.statusInfo}>
          <p className={styles.statusText}>
            <Icon name="fa-clock" size="sm" />
            <span>
              Our team has been notified and is working to resolve this issue as quickly as
              possible.
            </span>
          </p>
        </div>
      </div>
    </main>
  )
}
