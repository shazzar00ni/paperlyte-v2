import { useState, type FormEvent } from 'react'
import { Button } from '@components/ui/Button'
import { Icon } from '@components/ui/Icon'
import { trackEvent } from '@utils/analytics'
import styles from './EmailCapture.module.css'

interface EmailCaptureProps {
  variant?: 'inline' | 'centered'
  placeholder?: string
  buttonText?: string
}

// Pure validation function - moved outside component to avoid recreation on every render
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const EmailCapture = ({
  variant = 'inline',
  placeholder = 'Enter your email',
  buttonText = 'Join Waitlist',
}: EmailCaptureProps): React.ReactElement => {
  const [email, setEmail] = useState('')
  const [honeypot, setHoneypot] = useState('') // Spam protection
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [gdprConsent, setGdprConsent] = useState(false)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    // Honeypot check - if filled, it's a bot
    if (honeypot) {
      return
    }

    // Validation
    if (!email.trim()) {
      setStatus('error')
      setErrorMessage('Please enter your email address')
      return
    }

    if (!validateEmail(email)) {
      setStatus('error')
      setErrorMessage('Please enter a valid email address')
      return
    }

    if (!gdprConsent) {
      setStatus('error')
      setErrorMessage('Please agree to receive emails from Paperlyte')
      return
    }

    setStatus('loading')
    setErrorMessage('')

    try {
      // Call Netlify serverless function
      const response = await fetch('/.netlify/functions/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Subscription failed')
      }

      setStatus('success')
      setEmail('')
      setGdprConsent(false)

      // Track conversion
      trackEvent('email_signup', {
        category: 'engagement',
        label: 'waitlist',
      })
    } catch (error) {
      setStatus('error')
      const message =
        error instanceof Error ? error.message : 'Something went wrong. Please try again.'
      setErrorMessage(message)
      console.error('Email subscription error:', error)
    }
  }

  if (status === 'success') {
    return (
      <div className={`${styles.container} ${styles[variant]}`}>
        <div className={styles.success} role="alert">
          <Icon name="fa-circle-check" size="lg" />
          <p className={styles.successMessage}>
            <strong>You're on the list!</strong>
            <br />
            Check your email to confirm your subscription.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={`${styles.container} ${styles[variant]}`}>
      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        {/* Honeypot field - hidden from users */}
        <input
          type="text"
          name="website"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
          className={styles.honeypot}
          aria-hidden="true"
        />

        <div className={styles.inputGroup}>
          <label htmlFor="email" className={styles.visuallyHidden}>
            Email address
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={placeholder}
            className={styles.input}
            disabled={status === 'loading'}
            required
            autoComplete="email"
            aria-invalid={status === 'error'}
            aria-describedby={status === 'error' ? 'email-error' : undefined}
          />
          <Button
            type="submit"
            variant="primary"
            size="medium"
            disabled={status === 'loading'}
            className={styles.button}
          >
            {status === 'loading' ? (
              <>
                <Icon name="fa-spinner" size="sm" className={styles.spinner} />
                Joining...
              </>
            ) : (
              buttonText
            )}
          </Button>
        </div>

        <div className={styles.gdprWrapper}>
          <label htmlFor="gdpr-consent" className={styles.gdprLabel}>
            <input
              type="checkbox"
              id="gdpr-consent"
              checked={gdprConsent}
              onChange={(e) => setGdprConsent(e.target.checked)}
              className={styles.checkbox}
              disabled={status === 'loading'}
              required
            />
            <span className={styles.gdprText}>
              I agree to receive emails from Paperlyte. View our{' '}
              <a
                href="/privacy.html"
                className={styles.link}
                target="_blank"
                rel="noopener noreferrer"
              >
                Privacy Policy
              </a>
            </span>
          </label>
        </div>

        {status === 'error' && errorMessage && (
          <div id="email-error" className={styles.error} role="alert" aria-live="polite">
            <Icon name="fa-circle-exclamation" size="sm" />
            {errorMessage}
          </div>
        )}
      </form>
    </div>
  )
}
