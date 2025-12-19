import { useState, useEffect, useCallback, type FormEvent } from 'react'
import { Icon } from '@components/ui/Icon'
import { Button } from '@components/ui/Button'
import styles from './FeedbackWidget.module.css'

type FeedbackType = 'bug' | 'feature'

interface FeedbackFormData {
  type: FeedbackType
  message: string
}

interface FeedbackWidgetProps {
  onSubmit?: (data: FeedbackFormData) => Promise<void> | void
}

/**
 * Interactive user feedback widget with a floating button and modal.
 * Allows users to submit bug reports and feature requests.
 *
 * Features:
 * - Floating button accessible from anywhere on the page
 * - Modal with form for feedback submission
 * - Support for bug reports and feature ideas
 * - Confirmation message after submission
 * - Keyboard navigation and accessibility support
 * - Mobile responsive design
 *
 * @param onSubmit - Optional callback for handling feedback submission
 */
export const FeedbackWidget = ({ onSubmit }: FeedbackWidgetProps): React.ReactElement => {
  const [isOpen, setIsOpen] = useState(false)
  const [feedbackType, setFeedbackType] = useState<FeedbackType>('bug')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Handle modal open
  const handleOpen = useCallback(() => {
    setIsOpen(true)
    setError(null)
    setShowConfirmation(false)
  }, [])

  // Handle modal close
  const handleClose = useCallback(() => {
    setIsOpen(false)
    setMessage('')
    setFeedbackType('bug')
    setError(null)
    setShowConfirmation(false)
  }, [])

  // Handle form submission
  const handleSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault()

      // Validate message
      if (!message.trim()) {
        setError('Please enter a message')
        return
      }

      setIsSubmitting(true)
      setError(null)

      try {
        const feedbackData: FeedbackFormData = {
          type: feedbackType,
          message: message.trim(),
        }

        // Call custom submit handler if provided
        if (onSubmit) {
          await onSubmit(feedbackData)
        } else {
          // Default behavior: store in localStorage and log
          const timestamp = new Date().toISOString()
          const feedbackEntry = {
            ...feedbackData,
            timestamp,
          }

          // Get existing feedback from localStorage
          const existingFeedback = localStorage.getItem('paperlyte_feedback')
          let feedbackArray: unknown = []

          if (existingFeedback) {
            try {
              feedbackArray = JSON.parse(existingFeedback)
            } catch (parseError) {
              console.error('Failed to parse stored feedback from localStorage', parseError)
              feedbackArray = []
            }
          }

          if (!Array.isArray(feedbackArray)) {
            feedbackArray = []
          }

          ;(feedbackArray as unknown[]).push(feedbackEntry)
          // Store updated feedback
          localStorage.setItem('paperlyte_feedback', JSON.stringify(feedbackArray))
          console.log('Feedback submitted:', feedbackEntry)
        }

        // Show confirmation
        setShowConfirmation(true)
        setMessage('')

        // Close modal after 2 seconds
        setTimeout(() => {
          handleClose()
        }, 2000)
      } catch (err) {
        setError('Failed to submit feedback. Please try again.')
        console.error('Feedback submission error:', err)
      } finally {
        setIsSubmitting(false)
      }
    },
    [feedbackType, message, onSubmit, handleClose]
  )

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [isOpen, handleClose])

  // Handle backdrop click to close modal
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) {
        handleClose()
      }
    },
    [handleClose]
  )

  return (
    <>
      {/* Floating feedback button */}
      <button
        className={styles.floatingButton}
        onClick={handleOpen}
        aria-label="Open feedback form"
        type="button"
      >
        <Icon name="fa-comment-dots" size="lg" ariaLabel="Feedback" />
      </button>

      {/* Modal */}
      {isOpen && (
        <div
          className={styles.modalBackdrop}
          onClick={handleBackdropClick}
          role="dialog"
          aria-modal="true"
          aria-labelledby="feedback-modal-title"
        >
          <div className={styles.modalContent}>
            {/* Modal header */}
            <div className={styles.modalHeader}>
              <h2 id="feedback-modal-title" className={styles.modalTitle}>
                Send Feedback
              </h2>
              <button
                className={styles.closeButton}
                onClick={handleClose}
                aria-label="Close feedback form"
                type="button"
              >
                <Icon name="fa-x" size="md" />
              </button>
            </div>

            {/* Success confirmation */}
            {showConfirmation ? (
              <div className={styles.confirmation}>
                <Icon name="fa-circle-check" size="3x" className={styles.confirmationIcon} />
                <h3 className={styles.confirmationTitle}>Thank you!</h3>
                <p className={styles.confirmationMessage}>
                  Your feedback has been submitted successfully.
                </p>
              </div>
            ) : (
              /* Feedback form */
              <form onSubmit={handleSubmit} className={styles.form}>
                {/* Feedback type selection */}
                <div className={styles.typeSelector}>
                  <button
                    type="button"
                    className={`${styles.typeButton} ${feedbackType === 'bug' ? styles.typeButtonActive : ''}`}
                    onClick={() => setFeedbackType('bug')}
                    aria-pressed={feedbackType === 'bug'}
                  >
                    <Icon name="fa-bug" size="lg" />
                    <span>Report a Bug</span>
                  </button>
                  <button
                    type="button"
                    className={`${styles.typeButton} ${feedbackType === 'feature' ? styles.typeButtonActive : ''}`}
                    onClick={() => setFeedbackType('feature')}
                    aria-pressed={feedbackType === 'feature'}
                  >
                    <Icon name="fa-lightbulb" size="lg" />
                    <span>Request a Feature</span>
                  </button>
                </div>

                {/* Message textarea */}
                <div className={styles.formGroup}>
                  <label htmlFor="feedback-message" className={styles.label}>
                    {feedbackType === 'bug'
                      ? 'Describe the issue you encountered'
                      : 'Share your feature idea'}
                  </label>
                  <textarea
                    id="feedback-message"
                    className={styles.textarea}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={
                      feedbackType === 'bug'
                        ? 'Please provide details about the bug...'
                        : 'Tell us about your feature idea...'
                    }
                    rows={5}
                    disabled={isSubmitting}
                    required
                  />
                </div>

                {/* Error message */}
                {error && (
                  <div className={styles.error} role="alert">
                    <Icon name="fa-circle-exclamation" size="sm" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Submit button */}
                <div className={styles.formActions}>
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={isSubmitting || !message.trim()}
                    icon="fa-paper-plane"
                  >
                    {isSubmitting ? 'Sending...' : 'Send Feedback'}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}
