import { useState, useEffect, useCallback, useRef, useTransition, type FormEvent } from 'react'
import { Icon } from '@components/ui/Icon'
import { Button } from '@components/ui/Button'
import { handleArrowNavigation, getFocusableElements } from '@utils/keyboard'
import { logError } from '@utils/monitoring'
import styles from './FeedbackWidget.module.css'

const FEEDBACK_KEY = 'paperlyte:v1:feedback'
const LEGACY_FEEDBACK_KEY = 'paperlyte_feedback'

// One-time migration of feedback entries from the legacy unversioned key.
// Module-level flag avoids repeated reads on every widget mount.
// TODO: add test coverage for migrateLegacyFeedback (legacy-only, versioned-only,
// both-present collision, and incognito/throwing-storage cases) — mirrors the
// migration test suite in useTheme.test.ts. Note: the module-level flag means
// tests must reset modules (vi.resetModules()) between cases.
let legacyFeedbackMigrationRun = false
const migrateLegacyFeedback = (): void => {
  if (legacyFeedbackMigrationRun) return
  legacyFeedbackMigrationRun = true
  try {
    const legacy = localStorage.getItem(LEGACY_FEEDBACK_KEY)
    if (legacy === null) return
    // Backfill only — never overwrite an already-migrated versioned entry
    if (localStorage.getItem(FEEDBACK_KEY) === null) {
      localStorage.setItem(FEEDBACK_KEY, legacy)
    }
    localStorage.removeItem(LEGACY_FEEDBACK_KEY)
  } catch {
    // Silently ignore — incognito/storage-disabled browsers
  }
}

// Append a feedback entry to localStorage. Throws on setItem failure so the
// caller can surface an error to the user; logs via centralized monitoring.
const appendFeedbackToStorage = (entry: unknown): void => {
  let existing: string | null = null
  try {
    existing = localStorage.getItem(FEEDBACK_KEY)
  } catch {
    // Incognito or storage-disabled — treat as empty
  }

  let arr: unknown = []
  if (existing) {
    try {
      arr = JSON.parse(existing)
    } catch (parseError) {
      console.error('Failed to parse stored feedback from localStorage', parseError)
      arr = []
    }
  }
  if (!Array.isArray(arr)) arr = []
  ;(arr as unknown[]).push(entry)

  try {
    localStorage.setItem(FEEDBACK_KEY, JSON.stringify(arr))
  } catch (storageError) {
    logError(
      storageError instanceof Error ? storageError : new Error(String(storageError)),
      {
        severity: 'medium',
        tags: { module: 'FeedbackWidget', action: 'saveFeedback' },
        errorInfo: { note: 'local storage failure' },
      },
      'FeedbackWidget'
    )
    throw new Error(
      `Unable to save feedback locally. Your browser storage may be full or disabled. ${
        storageError instanceof Error ? storageError.message : String(storageError)
      }`,
      { cause: storageError }
    )
  }
}

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
  const [isPending, startTransition] = useTransition()
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const closeTimeoutRef = useRef<number | null>(null)
  const triggerElementRef = useRef<HTMLElement | null>(null)
  const modalRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const typeSelectorRef = useRef<HTMLFieldSetElement>(null)
  // Tracks the submission in flight so the success path can detect whether
  // the user closed the modal (or unmounted) mid-submit and skip auto-close.
  const submissionIdRef = useRef(0)
  const isMountedRef = useRef(true)

  // Run one-time legacy localStorage key migration on first mount
  useEffect(() => {
    migrateLegacyFeedback()
  }, [])

  // Track unmount so async callbacks don't touch state after teardown
  useEffect(() => {
    return () => {
      isMountedRef.current = false
    }
  }, [])

  // Handle modal open
  const handleOpen = useCallback(() => {
    // Store the element that triggered the modal for focus restoration
    triggerElementRef.current = document.activeElement as HTMLElement
    setIsOpen(true)
    setError(null)
    setShowConfirmation(false)
  }, [])

  // Handle modal close
  const handleClose = useCallback(() => {
    // Clear any pending timeout to prevent memory leaks
    if (closeTimeoutRef.current !== null) {
      clearTimeout(closeTimeoutRef.current)
      closeTimeoutRef.current = null
    }
    // Invalidate any in-flight submission so its success path won't re-open
    // confirmation or schedule auto-close after the user manually closed.
    submissionIdRef.current += 1
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

  // Handle form submission
  const handleSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault()

      // Validate message
      if (!message.trim()) {
        setError('Please enter a message')
        return
      }

      setError(null)

      const submissionId = ++submissionIdRef.current

      startTransition(async () => {
        try {
          const feedbackData: FeedbackFormData = {
            type: feedbackType,
            message: message.trim(),
          }

          if (onSubmit) {
            await onSubmit(feedbackData)
          } else {
            appendFeedbackToStorage({
              ...feedbackData,
              timestamp: new Date().toISOString(),
            })
          }

          // Skip success-path side effects if the user closed the modal or
          // started a newer submission while this one was in flight.
          if (!isMountedRef.current || submissionId !== submissionIdRef.current) {
            return
          }

          setShowConfirmation(true)
          setMessage('')

          // Close modal after 2 seconds (store timeout ID for cleanup)
          closeTimeoutRef.current = window.setTimeout(() => {
            handleClose()
          }, 2000)
        } catch (err) {
          if (!isMountedRef.current || submissionId !== submissionIdRef.current) {
            return
          }
          setError('Failed to submit feedback. Please try again.')
          console.error('Feedback submission error:', err)
        }
      })
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
                    {feedbackType === 'bug'
                      ? 'Describe the issue you encountered'
                      : 'Share your feature idea'}
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
                        ? 'Please provide details about the bug...'
                        : 'Tell us about your feature idea...'
                    }
                    rows={5}
                    disabled={isPending}
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
                    disabled={isPending || !message.trim()}
                    icon="fa-paper-plane"
                  >
                    {isPending ? 'Sending...' : 'Send Feedback'}
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
