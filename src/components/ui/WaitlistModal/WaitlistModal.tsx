import { useEffect, useRef } from 'react'
import { Icon } from '@components/ui/Icon'
import { getFocusableElements } from '@utils/keyboard'
import { useWaitlistSubscribe } from '@/hooks/useWaitlistSubscribe'
import { WAITLIST_COUNT, LAUNCH_QUARTER } from '@constants/waitlist'
import { EMAIL_CAPTURE_CONTENT as COPY } from '@components/sections/EmailCapture/emailCapture.data'
import styles from './WaitlistModal.module.css'

interface WaitlistModalProps {
  isOpen: boolean
  onClose: () => void
}

/**
 * Modal dialog that lets a user join the waitlist without leaving the section
 * they're on. Shares its submission logic with the EmailCapture section via
 * useWaitlistSubscribe.
 */
export const WaitlistModal = ({
  isOpen,
  onClose,
}: WaitlistModalProps): React.ReactElement | null => {
  const { email, setEmail, isSubmitted, isLoading, error, handleSubmit, reset } =
    useWaitlistSubscribe('WaitlistModal')
  const triggerElementRef = useRef<HTMLElement | null>(null)
  const modalRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const emailInputRef = useRef<HTMLInputElement>(null)
  const successHeadingRef = useRef<HTMLHeadingElement>(null)

  // Remember what had focus before opening, so it can be restored on close
  useEffect(() => {
    if (isOpen) {
      const activeEl = document.activeElement
      triggerElementRef.current = activeEl instanceof HTMLElement ? activeEl : null
    }
  }, [isOpen])

  const handleClose = (): void => {
    onClose()
    reset()
    triggerElementRef.current?.focus()
  }

  // Focus the email input on open, or the success heading once submitted
  useEffect(() => {
    if (!isOpen) return
    if (isSubmitted) {
      successHeadingRef.current?.focus()
    } else {
      emailInputRef.current?.focus()
    }
  }, [isOpen, isSubmitted])

  // Escape to close, Tab trapped within the modal, body scroll locked while open
  useEffect(() => {
    if (!isOpen || !modalRef.current) return

    const modal = modalRef.current

    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        handleClose()
        return
      }

      if (e.key === 'Tab') {
        const focusableElements = getFocusableElements(modal)
        const firstElement = focusableElements[0]
        const lastElement = focusableElements[focusableElements.length - 1]
        if (!firstElement || !lastElement) return

        // Focus can sit on a non-tabbable anchor within the modal (e.g. the
        // tabIndex={-1} success heading, focused programmatically for screen
        // readers). getFocusableElements excludes tabindex="-1", so such an
        // element never equals firstElement/lastElement — without this check,
        // Tab from it wouldn't be trapped and would escape to the page behind.
        const activeElement = document.activeElement
        const isActiveElementTracked = focusableElements.includes(activeElement as HTMLElement)

        if (e.shiftKey && (activeElement === firstElement || !isActiveElementTracked)) {
          e.preventDefault()
          lastElement.focus()
        } else if (!e.shiftKey && (activeElement === lastElement || !isActiveElementTracked)) {
          e.preventDefault()
          firstElement.focus()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- handleClose is stable enough for this effect's purpose
  }, [isOpen])

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>): void => {
    if (e.target === e.currentTarget) {
      handleClose()
    }
  }

  if (!isOpen) return null

  return (
    <div
      className={styles.modalBackdrop}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="waitlist-modal-title"
    >
      <div className={styles.modalContent} ref={modalRef}>
        <div className={styles.modalHeader}>
          <h2 id="waitlist-modal-title" className={styles.modalTitle}>
            Join {WAITLIST_COUNT} people on the waitlist
          </h2>
          <button
            ref={closeButtonRef}
            className={styles.closeButton}
            onClick={handleClose}
            aria-label="Close"
            type="button"
          >
            <Icon name="fa-x" size="md" />
          </button>
        </div>

        {isSubmitted ? (
          <div className={styles.confirmation}>
            <Icon
              name="fa-circle-check"
              size="3x"
              className={styles.confirmationIcon}
              color="var(--color-success)"
            />
            <h3 ref={successHeadingRef} tabIndex={-1} className={styles.confirmationTitle}>
              {COPY.successTitle}
            </h3>
            <p className={styles.confirmationMessage}>{COPY.successText}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={styles.form} noValidate>
            <p className={styles.subtitle}>Launching {LAUNCH_QUARTER}. Join the waitlist to:</p>
            <div className={styles.inputGroup}>
              <label htmlFor="waitlist-modal-email" className="sr-only">
                Email address
              </label>
              <input
                ref={emailInputRef}
                type="email"
                id="waitlist-modal-email"
                name="email"
                placeholder={COPY.placeholder}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                }}
                required
                className={styles.input}
                aria-invalid={!!error}
                aria-describedby={error ? 'waitlist-modal-error' : undefined}
              />
              <button
                type="submit"
                className={`${styles.submitButton} ${isLoading ? styles.submitButtonLoading : ''}`}
                disabled={isLoading}
              >
                {isLoading ? COPY.loadingText : COPY.submitText}
              </button>
            </div>
            {error && (
              <p id="waitlist-modal-error" className={styles.error} role="alert">
                {error}
              </p>
            )}
            <p className={styles.privacy}>{COPY.privacy}</p>
          </form>
        )}
      </div>
    </div>
  )
}
