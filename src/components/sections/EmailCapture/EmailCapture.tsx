import { useEffect, useRef } from 'react'
import { Section } from '@components/layout/Section'
import { AnimatedElement } from '@components/ui/AnimatedElement'
import { Button } from '@components/ui/Button'
import { Icon } from '@components/ui/Icon'
import { useWaitlistSubscribe } from '@/hooks/useWaitlistSubscribe'
import { WAITLIST_COUNT, LAUNCH_QUARTER } from '@constants/waitlist'
import {
  EMAIL_CAPTURE_CONTENT as COPY,
  BENEFITS,
} from '@components/sections/EmailCapture/emailCapture.data'
import styles from './EmailCapture.module.css'

/** Renders the Email Capture section with a waitlist signup form and benefit highlights. */
export const EmailCapture = (): React.ReactElement => {
  const { email, setEmail, isSubmitted, isLoading, error, handleSubmit } =
    useWaitlistSubscribe('EmailCapture')
  const successHeadingRef = useRef<HTMLHeadingElement>(null)

  // Move focus to the confirmation heading once the form is replaced by the
  // success view. This announces the result to screen readers (heading + level)
  // and lands keyboard focus inside the new content, so the next Tab reaches the
  // share buttons instead of being lost on the now-unmounted submit button.
  useEffect(() => {
    if (isSubmitted) {
      successHeadingRef.current?.focus()
    }
  }, [isSubmitted])

  // Safe origin for SSR compatibility
  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  const shareText =
    'Check out Paperlyte – the note-taking app that gets out of your way. Get early access:'
  const shareTitle = 'Check out Paperlyte – the note-taking app that gets out of your way'
  const encodedOrigin = encodeURIComponent(origin)
  const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodedOrigin}`
  const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedOrigin}`
  const linkedinShareUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${encodedOrigin}&title=${encodeURIComponent(shareTitle)}`

  if (isSubmitted) {
    return (
      <Section id="email-capture" background="surface">
        <div className={styles.container}>
          <div className={styles.successContainer}>
            <div className={styles.successIcon}>
              <Icon name="fa-check-circle" size="xl" color="var(--color-success)" />
            </div>
            <h2 ref={successHeadingRef} tabIndex={-1} className={styles.successTitle}>
              {COPY.successTitle}
            </h2>
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
                <Button variant="secondary" size="medium" icon="fa-twitter" href={twitterShareUrl}>
                  Twitter
                </Button>
                <Button
                  variant="secondary"
                  size="medium"
                  icon="fa-facebook"
                  href={facebookShareUrl}
                >
                  Facebook
                </Button>
                <Button
                  variant="secondary"
                  size="medium"
                  icon="fa-linkedin"
                  href={linkedinShareUrl}
                >
                  LinkedIn
                </Button>
              </div>
            </div>
          </div>
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
          <p className={styles.subtitle}>Launching {LAUNCH_QUARTER}. Join the waitlist to:</p>
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
                aria-invalid={!!error}
                aria-describedby={error ? 'email-error' : undefined}
              />
              <button
                type="submit"
                className={`${styles.submitButton} ${isLoading ? styles.submitButtonLoading : ''}`}
                disabled={isLoading}
              >
                {isLoading ? COPY.loadingText : COPY.submitText}
                {!isLoading && (
                  <Icon name="fa-arrow-right" size="sm" style={{ marginLeft: '0.5rem' }} />
                )}
              </button>
            </div>
            {error && (
              <p id="email-error" className={styles.error} role="alert">
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
