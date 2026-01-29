import { useState } from 'react'
import type { FormEvent } from 'react'
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

export const EmailCapture = (): React.ReactElement => {
  const [email, setEmail] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Safe origin for SSR compatibility
  const origin = typeof window !== 'undefined' ? window.location.origin : ''

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setIsLoading(false)
      setIsSubmitted(true)
    } catch {
      setIsLoading(false)
      setError('Failed to join waitlist. Please try again.')
    }
  }

  if (isSubmitted) {
    return (
      <Section id="email-capture" background="surface">
        <div className={styles.container}>
          <AnimatedElement animation="fadeIn">
            <div className={styles.successContainer}>
              <div className={styles.successIcon}>
                <Icon name="fa-circle-check" size="xl" color="var(--color-success)" />
              </div>
              <h2 className={styles.successTitle}>✓ You're on the list!</h2>
              <p className={styles.successText}>
                Check your inbox—we just sent you a welcome email with next steps.
              </p>

              <div className={styles.nextSteps}>
                <h3 className={styles.nextStepsTitle}>What happens next:</h3>
                <ul className={styles.nextStepsList}>
                  <li>We'll email you product updates as we build</li>
                  <li>You'll get early access 2 weeks before public launch</li>
                  <li>We'll ask for your feedback to make Paperlyte better</li>
                </ul>
              </div>

              <div className={styles.shareSection}>
                <p className={styles.shareText}>Share Paperlyte with friends</p>
                <div className={styles.socialButtons}>
                  <Button
                    variant="secondary"
                    size="medium"
                    icon="fa-twitter"
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent('Check out Paperlyte – the note-taking app that gets out of your way. Get early access:')}&url=${encodeURIComponent(origin)}`}
                  >
                    Twitter
                  </Button>
                  <Button
                    variant="secondary"
                    size="medium"
                    icon="fa-facebook-f"
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(origin)}`}
                  >
                    Facebook
                  </Button>
                  <Button
                    variant="secondary"
                    size="medium"
                    icon="fa-linkedin-in"
                    href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(origin)}&title=${encodeURIComponent('Check out Paperlyte – the note-taking app that gets out of your way')}`}
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
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.inputGroup}>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={styles.input}
                aria-label="Email address"
              />
              <button
                type="submit"
                className={`${styles.submitButton} ${isLoading ? styles.submitButtonLoading : ''}`}
                disabled={isLoading}
              >
                {isLoading ? 'Joining...' : 'Join the Waitlist'}
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
            <p className={styles.privacy}>
              We respect your privacy. Unsubscribe anytime. No spam, ever.
            </p>
          </form>
        </AnimatedElement>
      </div>
    </Section>
  )
}
