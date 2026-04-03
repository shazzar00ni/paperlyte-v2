import { useState, useEffect, useCallback, useRef, type FormEvent } from 'react'
import { Icon } from '@components/ui/Icon'
import { Button } from '@components/ui/Button'
import { handleArrowNavigation, getFocusableElements } from '@utils/keyboard'
import { logError } from '@utils/monitoring'
import styles from './FeedbackWidget.module.css'

type FeedbackType = 'bug' | 'feature'

interface Focusable {
  focus: () => void
}

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
 * @param onSubmit - Optional callback for handling feedback submission
 */
export const FeedbackWidget = ({ onSubmit }: FeedbackWidgetProps): React.ReactElement => {
  const [isOpen, setIsOpen] = useState(false)
  const [feedbackType, setFeedbackType] = useState<FeedbackType>('bug')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const closeTimeoutRef = useRef<number | null>(null)
  const triggerElementRef = useRef<Focusable | null>(null)
  const modalRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const typeSelectorRef = useRef<HTMLFieldSetElement>(null)

  /**
   * Opens the feedback modal. Saves the currently focused element so focus can be
   * restored to it when the modal is closed, then resets confirmation and error state.
   */
  const handleOpen = useCallback(() => {
    // Store the element that triggered the modal for focus restoration
    const activeEl = document.activeElement
    if (activeEl !== null && typeof (activeEl as unknown as Focusable).focus === 'function') {
      triggerElementRef.current = activeEl as unknown as Focusable
    }
    setIsOpen(true)
    setError(null)
    setShowConfirmation(false)
  }, [])

  /**
   * Closes the feedback modal, clears any pending auto-close timeout, resets all
   * form fields, and restores keyboard focus to the element that triggered the modal.
   */
  const handleClose = useCallback(() => {
    // Clear any pending timeout to prevent memory leaks
    if (closeTimeoutRef.current !== null) {
      clearTimeout(closeTimeoutRef.current)
      closeTimeoutRef.current = null
    }
    setIsOpen(false)
    setMessage('')
    setFeedbackType('bug')
    setError(null)
    setShowConfirmation(false)

    // Restore focus to the element that triggered the modal
    if (triggerElementRef.current) {
      triggerElementRef.current.focus()
    }
  }, [])

  /**
   * Handles feedback form submission. Validates that a non-empty message is present,
   * then delegates to the custom `onSubmit` callback or persists the entry to
   * `localStorage`. On success, shows a confirmation message and auto-closes the
   * modal after 2 seconds. Storage failures are surfaced via the monitoring utility.
   *
   * @param e - The form submission event.
   */
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

        if (onSubmit) {
          await onSubmit(feedbackData)

          // Show confirmation only after a successful submission
          setShowConfirmation(true)
          setMessage('')

          // Close modal after 2 seconds (store timeout ID for cleanup)
          closeTimeoutRef.current = window.setTimeout(() => {
            handleClose()
          }, 2000)
        } else {
          // No handler is wired — feedback cannot be sent or persisted on this page.
          // No local persistence on the landing page (see AGENTS.md).
          if (import.meta.env.DEV) {
            console.warn(
              '[FeedbackWidget] No onSubmit handler provided. Feedback was not sent anywhere.'
            )
          }
          setError('Feedback submission is not yet available. Please try again later.')
        }
      } catch (err) {
        setError("Couldn't send your feedback. Copy your message and try again.")
        logError(
          err instanceof Error ? err : new Error(String(err)),
          {
            severity: 'medium',
            tags: { component: 'FeedbackWidget', action: 'submit' },
          },
          'FeedbackWidget'
        )
      } finally {
        setIsSubmitting(false)
      }
    },
    [feedbackType, message, onSubmit, handleClose]
  )

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current !== null) {
        clearTimeout(closeTimeoutRef.current)
      }
    }
  }, [])

  // Focus management - move focus to close button when modal opens
  useEffect(() => {
    if (isOpen && closeButtonRef.current) {
      closeButtonRef.current.focus()
    }
  }, [isOpen])

  // Arrow key navigation for type selector buttons
  useEffect(() => {
    if (!isOpen || !typeSelectorRef.current) return

    const typeSelector = typeSelectorRef.current

    const handleArrowKeys = (event: KeyboardEvent) => {
      const focusableElements = getFocusableElements(typeSelector)
      if (focusableElements.length === 0) return

      const currentIndex = focusableElements.findIndex((el) => el === document.activeElement)
      if (currentIndex === -1) return

      // Handle Arrow keys (horizontal navigation between bug/feature buttons)
      const newIndex = handleArrowNavigation(event, focusableElements, currentIndex, 'horizontal')
      if (newIndex !== null) {
        event.preventDefault()
        focusableElements[newIndex]?.focus()
      }
    }

    typeSelector.addEventListener('keydown', handleArrowKeys)

    return () => {
      typeSelector.removeEventListener('keydown', handleArrowKeys)
    }
  }, [isOpen])

  // Focus trap - prevent tabbing out of modal
  useEffect(() => {
    if (!isOpen || !modalRef.current) return

    const handleKeyDown = (e: KeyboardEvent) => {
      // Handle Escape key
      if (e.key === 'Escape') {
        handleClose()
        return
      }

      // Handle Tab key for focus trapping
      if (e.key === 'Tab') {
        const modal = modalRef.current
        if (!modal) return

        const focusableElements = modal.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        const firstElement = focusableElements[0]
        const lastElement = focusableElements[focusableElements.length - 1]

        if (e.shiftKey && document.activeElement === firstElement) {
          // Shift+Tab on first element - go to last element
          e.preventDefault()
          lastElement.focus()
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          // Tab on last element - go to first element
          e.preventDefault()
          firstElement.focus()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, handleClose])

  /**
   * Closes the modal when the user clicks the semi-transparent backdrop area
   * (i.e. outside the modal content box). Clicks within the modal content are ignored.
   *
   * @param e - The mouse click event on the backdrop element.
   */
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
          <div className={styles.modalContent} ref={modalRef}>
            {/* Modal header */}
            <div className={styles.modalHeader}>
              <h2 id="feedback-modal-title" className={styles.modalTitle}>
                Send Feedback
              </h2>
              <button
                ref={closeButtonRef}
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
                <fieldset className={styles.typeSelector} ref={typeSelectorRef}>
                  <legend className="sr-only">Feedback type selection</legend>
                  <button
                    type="button"
                    className={`${styles.typeButton} ${feedbackType === 'bug' ? styles.typeButtonActive : ''}`}
                    onClick={() => {
                      setFeedbackType('bug')
                    }}
                    aria-pressed={feedbackType === 'bug'}
                  >
                    <Icon name="fa-bug" size="lg" />
                    <span>Report a Bug</span>
                  </button>
                  <button
                    type="button"
                    className={`${styles.typeButton} ${feedbackType === 'feature' ? styles.typeButtonActive : ''}`}
                    onClick={() => {
                      setFeedbackType('feature')
                    }}
                    aria-pressed={feedbackType === 'feature'}
                  >
                    <Icon name="fa-lightbulb" size="lg" />
                    <span>Request a Feature</span>
                  </button>
                </fieldset>

                {/* Message textarea */}
                <div className={styles.formGroup}>
                  <label htmlFor="feedback-message" className={styles.label}>
                    {feedbackType === 'bug' ? 'What went wrong?' : 'Share your feature idea'}
                  </label>
                  <textarea
                    id="feedback-message"
                    className={styles.textarea}
                    value={message}
                    onChange={(e) => {
                      setMessage(e.target.value)
                    }}
                    placeholder={
                      feedbackType === 'bug'
                        ? 'What happened? What did you expect instead?'
                        : 'What would you like Paperlyte to do? How would it help you?'
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
