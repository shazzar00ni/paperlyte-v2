import { useState, useId } from 'react'
import type { FormEvent, ChangeEvent } from 'react'
import { logError } from '@utils/monitoring'
import { validateEmail, suggestEmailCorrection } from '@utils/validation'
import { Section } from '@components/layout/Section'
import { AnimatedElement } from '@components/ui/AnimatedElement'
import { Button } from '@components/ui/Button'
import { Icon } from '@components/ui/Icon'
import { WAITLIST_COUNT, LAUNCH_QUARTER } from '@constants/waitlist'
import styles from './EmailCapture.module.css'

const BENEFITS = [
  'Get early access before public launch',
  'Influence features and design decisions',
  'Lock in founder pricing (save 50% for life)',
  'Receive exclusive productivity tips and updates',
]

type Status = 'idle' | 'loading' | 'success' | 'error'

/** Renders the Email Capture section with a waitlist signup form, optional name field, and benefit highlights. */
export const EmailCapture = (): React.ReactElement => {
  const emailId = useId()
  const nameId = useId()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [emailTouched, setEmailTouched] = useState(false)
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState<string | null>(null)
  const [emailSuggestion, setEmailSuggestion] = useState<string | null>(null)

  // Safe origin for SSR compatibility
  const origin = typeof window !== 'undefined' ? window.location.origin : ''

  const isLoading = status === 'loading'

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setEmail(val)
    if (error) setError(null)

    // Live typo suggestion
    const suggestion = suggestEmailCorrection(val)
    setEmailSuggestion(suggestion !== val ? suggestion : null)
  }

  const handleEmailBlur = () => {
    setEmailTouched(true)
  }

  const applyEmailSuggestion = () => {
    if (emailSuggestion) {
      setEmail(emailSuggestion)
      setEmailSuggestion(null)
    }
  }

  const getInlineEmailError = () => {
    if (!emailTouched || !email) return null
    const { isValid, error: msg } = validateEmail(email)
    return isValid ? null : msg ?? 'Please enter a valid email address'
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setEmailTouched(true)

    const { isValid, error: validationError } = validateEmail(email)
    if (!isValid) {
      setError(validationError ?? 'Please enter a valid email address')
      return
    }

    setStatus('loading')
    setError(null)

    try {
      // Simulate API call — replace with real endpoint
      await new Promise<void>((resolve, reject) => {
        setTimeout(() => {
          // Simulate occasional network errors in dev
          if (email.toLowerCase().includes('error')) {
            reject(new Error('Network error. Please try again.'))
          } else {
            resolve()
          }
        }, 1200)
      })

      setStatus('success')
    } catch (err) {
      const caught = err instanceof Error ? err : new Error(String(err))
      logError(caught, { tags: { context: 'waitlist-submit' } })

      let message = 'Failed to join waitlist. Please try again.'
      if (
        caught.name === 'TypeError' ||
        caught.message.toLowerCase().includes('network') ||
        caught.message.toLowerCase().includes('fetch')
      ) {
        message = 'Network error. Please check your connection and try again.'
      }

      setStatus('error')
      setError(message)
    }
  }

  const inlineEmailError = getInlineEmailError()

  if (status === 'success') {
    return (
      <Section id="email-capture" background="surface">
        <div className={styles.container}>
          <AnimatedElement animation="fadeIn">
            <div className={styles.successContainer} role="status" aria-live="polite">
              <div className={styles.successIconWrap}>
                <Icon name="fa-circle-check" size="xl" color="var(--color-success)" />
              </div>
              <h2 className={styles.successTitle}>
                {name ? `Welcome, ${name.split(' ')[0]}!` : "You're on the list!"}
              </h2>
              <p className={styles.successText}>
                We sent a confirmation to <strong>{email}</strong>. Check your inbox for next steps.
              </p>

              <div className={styles.nextSteps}>
                <h3 className={styles.nextStepsTitle}>What happens next:</h3>
                <ul className={styles.nextStepsList}>
                  <li>We&apos;ll email you product updates as we build</li>
                  <li>You&apos;ll get early access 2 weeks before public launch</li>
                  <li>We&apos;ll ask for your feedback to make Paperlyte better</li>
                </ul>
              </div>

              <div className={styles.shareSection}>
                <p className={styles.shareText}>Share Paperlyte with friends</p>
                <div className={styles.socialButtons}>
                  <Button
                    variant="secondary"
                    size="medium"
                    icon="fa-brands fa-twitter"
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent('Check out Paperlyte – the note-taking app that gets out of your way. Get early access:')}&url=${encodeURIComponent(origin)}`}
                  >
                    Twitter
                  </Button>
                  <Button
                    variant="secondary"
                    size="medium"
                    icon="fa-brands fa-linkedin"
                    href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(origin)}&title=${encodeURIComponent('Check out Paperlyte')}`}
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
            We&apos;re launching in {LAUNCH_QUARTER}. Join the waitlist now to:
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
          <form
            onSubmit={handleSubmit}
            className={styles.form}
            noValidate
            aria-label="Newsletter subscription form"
          >
            {/* Optional name field */}
            <div className={styles.fieldGroup}>
              <label htmlFor={nameId} className={styles.label}>
                First name <span className={styles.optional}>(optional)</span>
              </label>
              <input
                id={nameId}
                type="text"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane"
                className={styles.input}
                disabled={isLoading}
                autoComplete="given-name"
                maxLength={100}
              />
            </div>

            {/* Email field */}
            <div className={styles.fieldGroup}>
              <label htmlFor={emailId} className={styles.label}>
                Email address <span className={styles.required} aria-hidden="true">*</span>
              </label>
              <div className={styles.inputRow}>
                <input
                  id={emailId}
                  type="email"
                  name="email"
                  value={email}
                  onChange={handleEmailChange}
                  onBlur={handleEmailBlur}
                  placeholder="you@example.com"
                  className={`${styles.input} ${inlineEmailError ? styles.inputError : ''} ${emailTouched && !inlineEmailError && email ? styles.inputValid : ''}`}
                  disabled={isLoading}
                  required
                  autoComplete="email"
                  aria-invalid={!!inlineEmailError}
                  aria-describedby={
                    inlineEmailError
                      ? `${emailId}-error`
                      : emailSuggestion
                        ? `${emailId}-suggestion`
                        : undefined
                  }
                />
                <button
                  type="submit"
                  className={`${styles.submitButton} ${isLoading ? styles.submitButtonLoading : ''}`}
                  disabled={isLoading}
                  aria-busy={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className={styles.spinner} aria-hidden="true" />
                      <span>Joining&hellip;</span>
                    </>
                  ) : (
                    <>
                      <span>Join the Waitlist</span>
                      <i className="fa-solid fa-arrow-right" aria-hidden="true" />
                    </>
                  )}
                </button>
              </div>

              {/* Inline email validation error */}
              {inlineEmailError && (
                <p id={`${emailId}-error`} className={styles.fieldError} role="alert">
                  <Icon name="fa-circle-exclamation" size="sm" />
                  {inlineEmailError}
                </p>
              )}

              {/* Typo suggestion */}
              {emailSuggestion && !inlineEmailError && (
                <p id={`${emailId}-suggestion`} className={styles.suggestion}>
                  Did you mean{' '}
                  <button
                    type="button"
                    className={styles.suggestionBtn}
                    onClick={applyEmailSuggestion}
                  >
                    {emailSuggestion}
                  </button>
                  ?
                </p>
              )}
            </div>

            {/* Submit-level error */}
            {status === 'error' && error && (
              <div className={styles.errorBanner} role="alert" aria-live="assertive">
                <Icon name="fa-triangle-exclamation" size="sm" />
                <span>{error}</span>
              </div>
            )}

            {/* Privacy notice */}
            <p className={styles.privacy}>
              <Icon name="fa-lock" size="sm" />
              We respect your privacy. No spam, ever. Unsubscribe anytime.{' '}
              <a href="/privacy.html" className={styles.privacyLink} target="_blank" rel="noopener noreferrer">
                Privacy policy
              </a>
            </p>
          </form>
        </AnimatedElement>
      </div>
    </Section>
  )
}
