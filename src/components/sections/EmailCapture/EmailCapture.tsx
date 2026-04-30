import { useState } from 'react'
import type { FormEvent } from 'react'
import { logError } from '@utils/monitoring'
import { validateEmail } from '@utils/validation'
import { Section } from '@components/layout/Section'
import { AnimatedElement } from '@components/ui/AnimatedElement'
import { Button } from '@components/ui/Button'
import { Icon } from '@components/ui/Icon'
import { WAITLIST_COUNT, LAUNCH_QUARTER } from '@constants/waitlist'
import {
  EMAIL_CAPTURE_CONTENT as COPY,
  BENEFITS,
} from '@components/sections/EmailCapture/emailCapture.data'
import styles from './EmailCapture.module.css'

/** Renders the Email Capture section with a waitlist signup form and benefit highlights. */
export const EmailCapture = (): React.ReactElement => {
  const [email, setEmail] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Safe origin for SSR compatibility
  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  const shareText =
    'Check out Paperlyte – the note-taking app that gets out of your way. Get early access:'
  const shareTitle = 'Check out Paperlyte – the note-taking app that gets out of your way'
  const encodedOrigin = encodeURIComponent(origin)
  const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodedOrigin}`
  const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedOrigin}`
  const linkedinShareUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${encodedOrigin}&title=${encodeURIComponent(shareTitle)}`

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()
    setError(null)

    const normalizedEmail = email.trim().toLowerCase()

    const validation = validateEmail(normalizedEmail)
    if (!validation.isValid) {
      setError(validation.error ?? 'Please enter a valid email address.')
      return
    }

    setIsLoading(true)

    try {
      const res = await fetch('/.netlify/functions/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail }),
      })

      if (!res.ok) {
        const data: unknown = await res.json().catch(() => ({}))
        const serverMessage =
          typeof data === 'object' &&
          data !== null &&
          'error' in data &&
          typeof data.error === 'string'
            ? data.error
            : undefined

        if (res.status === 400 || res.status === 429) {
          // User-caused error — display message without logging to monitoring
          setIsLoading(false)
          setError(
            serverMessage ??
              (res.status === 429
                ? 'Too many requests. Please try again later.'
                : 'Invalid email address. Please check and try again.')
          )
          return
        }

        // Unexpected server error — propagate to catch block for monitoring
        throw new Error(serverMessage ?? 'Subscription failed')
      }

      setIsLoading(false)
      setIsSubmitted(true)
    } catch (err) {
      const caughtError = err instanceof Error ? err : new Error(String(err))
      logError(caughtError, { tags: { context: 'waitlist-submit' } })

      setIsLoading(false)
      setError(
        caughtError.name === 'TypeError' ||
          caughtError.message.toLowerCase().includes('network') ||
          caughtError.message.toLowerCase().includes('fetch')
          ? 'Network error. Please check your connection and try again.'
          : 'Failed to join waitlist. Please try again.'
      )
    }
  }

  if (isSubmitted) {
    return (
      <Section id="email-capture" background="surface">
        <div className={styles.container}>
          <AnimatedElement animation="fadeIn">
            <div className={styles.successContainer}>
              <div className={styles.successIcon}>
                <Icon name="fa-check-circle" size="xl" color="var(--color-success)" />
              </div>
              <h2 className={styles.successTitle}>{COPY.successTitle}</h2>
              <p className={styles.successText}>{COPY.successText}</p>

              <div className={styles.nextSteps}>
                <h3 className={styles.nextStepsTitle}>{COPY.nextStepsTitle}</h3>
                <ul className={styles.nextStepsList}>
                  {COPY.nextSteps.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ul>
              </div>

              <div className={styles.shareSection}>
                <p className={styles.shareText}>{COPY.shareText}</p>
                <div className={styles.socialButtons}>
                  <Button
                    variant="secondary"
                    size="medium"
                    icon="fa-brands fa-twitter"
                    href={twitterShareUrl}
                  >
                    Twitter
                  </Button>
                  <Button
                    variant="secondary"
                    size="medium"
                    icon="fa-brands fa-facebook"
                    href={facebookShareUrl}
                  >
                    Facebook
                  </Button>
                  <Button
                    variant="secondary"
                    size="medium"
                    icon="fa-brands fa-linkedin"
                    href={linkedinShareUrl}
                  >
                    LinkedIn
                  </Button>
                </div>
              </div>
            </div>
          </AnimatedElement>
        </div>
      </Section>
    )
  }

  return (
    <Section id="email-capture" background="surface">
      <div className={styles.container}>
        <AnimatedElement animation="fadeIn">
          <h2 className={styles.title}>Join {WAITLIST_COUNT} people on the waitlist</h2>
        </AnimatedElement>

        <AnimatedElement animation="fadeIn" delay={100}>
          <p className={styles.subtitle}>
            We're launching in {LAUNCH_QUARTER}. Join the waitlist now to:
          </p>
        </AnimatedElement>

        <AnimatedElement animation="fadeIn" delay={200}>
          <ul className={styles.benefits}>
            {BENEFITS.map((benefit, index) => (
              <li key={index} className={styles.benefit}>
                <Icon name="fa-check" size="sm" color="var(--color-primary)" />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </AnimatedElement>

        <AnimatedElement animation="fadeIn" delay={300}>
          <form onSubmit={handleSubmit} className={styles.form} noValidate>
            <div className={styles.inputGroup}>
              <input
                type="email"
                id="email"
                name="email"
                placeholder={COPY.placeholder}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                }}
                required
                className={styles.input}
                aria-label="Email address"
              />
              <button
                type="submit"
                className={`${styles.submitButton} ${isLoading ? styles.submitButtonLoading : ''}`}
                disabled={isLoading}
              >
                {isLoading ? COPY.loadingText : COPY.submitText}
                {!isLoading && (
                  <i className="fa-solid fa-arrow-right" style={{ marginLeft: '0.5rem' }} />
                )}
              </button>
            </div>
            {error && (
              <p className={styles.error} role="alert">
                {error}
              </p>
            )}
            <p className={styles.privacy}>{COPY.privacy}</p>
          </form>
        </AnimatedElement>
      </div>
    </Section>
  )
}
