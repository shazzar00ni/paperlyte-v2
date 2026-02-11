import { type FC, useState, useEffect, useCallback } from 'react'
import { Icon } from '@/components/ui/Icon'
import styles from './OfflinePage.module.css'

interface OfflinePageProps {
  /**
   * Custom message to display (optional)
   */
  message?: string
  /**
   * Show cached content availability info (optional)
   */
  showCachedInfo?: boolean
  /**
   * Callback when connection is restored (optional)
   */
  onConnectionRestored?: () => void
}

export const OfflinePage: FC<OfflinePageProps> = ({
  message,
  showCachedInfo = true,
  onConnectionRestored,
}) => {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  )
  const [isChecking, setIsChecking] = useState(false)

  // Memoize handlers to ensure stable references and proper cleanup
  const handleOnline = useCallback((): void => {
    setIsOnline(true)
    if (onConnectionRestored) {
      onConnectionRestored()
    }
  }, [onConnectionRestored])

  const handleOffline = useCallback((): void => {
    setIsOnline(false)
  }, [])

  useEffect(() => {
    // Add event listeners
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Cleanup function - guaranteed to run on unmount
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [handleOnline, handleOffline])

  const handleRetry = async (): Promise<void> => {
    setIsChecking(true)

    // Create abort controller with timeout to prevent hanging
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout

    try {
      // Use a reliable external endpoint to check for real internet connectivity
      const response = await fetch('https://www.gstatic.com/generate_204', {
        method: 'HEAD',
        cache: 'no-cache',
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      // Only reload if we got a successful response
      if (response.ok || response.status === 204) {
        window.location.reload()
      }
    } catch {
      // Connection still not available (or timeout/abort)
      clearTimeout(timeoutId)
    } finally {
      // Always reset checking state
      setIsChecking(false)
    }
  }

  return (
    <div className={styles.container} role="status" aria-labelledby="offline-title">
      <div className={styles.content}>
        {/* Connection status illustration */}
        <div className={styles.illustration} aria-hidden="true">
          <div className={styles.iconWrapper}>
            {/* Decorative icon - aria-hidden on parent makes ariaLabel unnecessary */}
            <Icon name="fa-wifi" size="3x" />
            <div className={styles.disconnectedSlash} />
          </div>
          <div className={styles.statusIndicator}>
            <span
              className={isOnline ? styles.statusOnline : styles.statusOffline}
              aria-hidden="true"
            />
            <span className={styles.statusText}>{isOnline ? 'Connected' : 'Disconnected'}</span>
          </div>
        </div>

        {/* Main content */}
        <h1 id="offline-title" className={styles.title}>
          {isOnline ? 'Connection Restored!' : "You're offline"}
        </h1>

        <p className={styles.message}>
          {isOnline
            ? 'Your internet connection has been restored. You can now continue using Paperlyte.'
            : message ??
              "It looks like you've lost your internet connection. Don't worry, Paperlyte is designed to work offline."}
        </p>

        {/* Action buttons */}
        <div className={styles.actions}>
          <button
            onClick={handleRetry}
            className={styles.primaryButton}
            type="button"
            disabled={isChecking}
            aria-label="Check connection and retry"
          >
            <Icon
              name={isChecking ? 'fa-spinner fa-spin' : 'fa-rotate-right'}
              ariaLabel={isChecking ? 'Checking connection' : 'Retry icon'}
            />
            <span>{isChecking ? 'Checking...' : 'Try Again'}</span>
          </button>

          {isOnline && (
            <button
              onClick={() => window.location.reload()}
              className={styles.secondaryButton}
              type="button"
              aria-label="Reload the page"
            >
              <Icon name="fa-arrow-rotate-right" />
              <span>Reload Page</span>
            </button>
          )}
        </div>

        {/* Offline features */}
        {!isOnline && showCachedInfo && (
          <div className={styles.featuresInfo}>
            <h2 className={styles.featuresTitle}>
              <Icon name="fa-circle-check" size="sm" />
              <span>What you can still do:</span>
            </h2>
            <ul className={styles.featuresList}>
              <li>
                <Icon name="fa-pen" size="sm" />
                <span>Create and edit notes (they'll sync when you're back online)</span>
              </li>
              <li>
                <Icon name="fa-book" size="sm" />
                <span>View all your previously loaded content</span>
              </li>
              <li>
                <Icon name="fa-magnifying-glass" size="sm" />
                <span>Search through your existing notes</span>
              </li>
            </ul>
          </div>
        )}

        {/* Connection tips */}
        {!isOnline && (
          <div className={styles.tipsInfo}>
            <h3 className={styles.tipsTitle}>Connection troubleshooting:</h3>
            <ul className={styles.tipsList}>
              <li>
                <Icon name="fa-wifi" size="sm" />
                <span>Check your WiFi or mobile data is enabled</span>
              </li>
              <li>
                <Icon name="fa-plane" size="sm" />
                <span>Make sure airplane mode is turned off</span>
              </li>
              <li>
                <Icon name="fa-route" size="sm" />
                <span>Try moving closer to your router</span>
              </li>
              <li>
                <Icon name="fa-arrow-rotate-left" size="sm" />
                <span>Restart your device if the issue persists</span>
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
