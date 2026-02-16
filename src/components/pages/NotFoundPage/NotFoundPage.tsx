import { type FC } from 'react'
import { Icon } from '@/components/ui/Icon'
import { safeNavigate } from '@/utils/navigation'
import styles from './NotFoundPage.module.css'

interface NotFoundPageProps {
  /**
   * Custom message to display (optional)
   */
  message?: string
  /**
   * Custom callback for the home button (optional)
   * Defaults to navigating to '/' (homepage)
   */
  onGoHome?: () => void
}

export const NotFoundPage: FC<NotFoundPageProps> = ({ message, onGoHome }) => {
  const handleGoHome = (): void => {
    if (onGoHome) {
      onGoHome()
    } else {
      // Default behavior: navigate to homepage using safe navigation
      safeNavigate('/')
    }
  }

  return (
    <main className={styles.container} aria-labelledby="not-found-title">
      <div className={styles.content}>
        {/* Decorative illustration */}
        <div className={styles.illustration} aria-hidden="true">
          <div className={styles.numberWrapper}>
            <span className={styles.number}>4</span>
            <Icon name="fa-file-circle-question" size="3x" />
            <span className={styles.number}>4</span>
          </div>
        </div>

        {/* Main content */}
        <h1 id="not-found-title" className={styles.title}>
          Hmm, we can't find that page
        </h1>

        <p className={styles.message}>
          {message ||
            "The page you're looking for doesn't exist or may have been moved. Let's get you back on track."}
        </p>

        {/* Action buttons */}
        <div className={styles.actions}>
          <button
            onClick={handleGoHome}
            className={styles.primaryButton}
            type="button"
            aria-label="Return to homepage"
          >
            <Icon name="fa-home" />
            <span>Back to Home</span>
          </button>

          <button
            onClick={() => window.history.back()}
            className={styles.secondaryButton}
            type="button"
            aria-label="Go to previous page"
          >
            <Icon name="fa-arrow-left" />
            <span>Go Back</span>
          </button>
        </div>

        {/* Helpful suggestions */}
        <div className={styles.suggestions}>
          <h2 className={styles.suggestionsTitle}>Helpful suggestions:</h2>
          <ul className={styles.suggestionsList}>
            <li>
              <Icon name="fa-magnifying-glass" size="sm" />
              <span>Double-check the URL for typos</span>
            </li>
            <li>
              <Icon name="fa-house" size="sm" />
              <span>Visit our homepage to start fresh</span>
            </li>
            <li>
              <Icon name="fa-arrow-rotate-left" size="sm" />
              <span>Use your browser's back button</span>
            </li>
          </ul>
        </div>
      </div>
    </main>
  )
}
