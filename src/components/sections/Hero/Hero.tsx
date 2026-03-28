import { useState } from 'react'
import type { FormEvent } from 'react'
import { Button } from '@components/ui/Button'
import { AnimatedElement } from '@components/ui/AnimatedElement'
import { Section } from '@components/layout/Section'
import { Icon } from '@components/ui/Icon'
import { logError } from '@utils/monitoring'
import { validateEmail } from '@utils/validation'
import { WAITLIST_COUNT, WAITLIST_API_ENDPOINT } from '@constants/waitlist'
import styles from './Hero.module.css'

/**
 * Hero section component - the main landing section of the application
 * Features animated headline, subheadline, inline email capture, and social proof badge
 *
 * @returns A hero section with animated content and waitlist signup form
 */
export const Hero = (): React.ReactElement => {
  const [email, setEmail] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const validation = validateEmail(email)
    if (!validation.isValid) {
      setError(validation.error ?? 'Please enter a valid email address')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(WAITLIST_API_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = (await response.json()) as { error?: string; success?: boolean }

      if (!response.ok) {
        throw new Error(data.error ?? 'Failed to join waitlist')
      }

      setIsLoading(false)
      setIsSubmitted(true)
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err))
      logError(e, { tags: { context: 'hero-waitlist-submit' } })
      setIsLoading(false)
      setError('Something went wrong. Please try again.')
    }
  }

  return (
    <Section id="hero" className={styles.hero} padding="large">
      <div className={styles.content}>
        <AnimatedElement animation="fadeIn">
          <h1 className={styles.headline}>
            Your thoughts, <em>unchained.</em>
          </h1>
        </AnimatedElement>

        <AnimatedElement animation="fadeIn" delay={100}>
          <p className={styles.subheadline}>
            Note-taking that gets out of your way. Sub-10ms response, offline-first, and beautifully
            minimal.
          </p>
        </AnimatedElement>

        <AnimatedElement animation="fadeIn" delay={300}>
          {isSubmitted ? (
            <p className={styles.successMessage}>
              <Icon name="fa-check-circle" size="sm" color="var(--color-success)" />
              &nbsp;You&apos;re on the list! We&apos;ll be in touch soon.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className={styles.heroForm} noValidate>
              <div className={styles.emailWrapper}>
                <input
                  type="email"
                  id="hero-email"
                  name="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={styles.heroEmailInput}
                  aria-label="Email address"
                  disabled={isLoading}
                />
                <Button
                  variant="primary"
                  size="large"
                  icon={isLoading ? 'fa-spinner' : 'fa-arrow-right'}
                  disabled={isLoading}
                  type="submit"
                >
                  {isLoading ? 'Joining…' : 'Join the Waitlist'}
                </Button>
              </div>
              {error && (
                <p className={styles.heroFormError} role="alert">
                  {error}
                </p>
              )}
            </form>
          )}
        </AnimatedElement>

        <AnimatedElement animation="fadeIn" delay={400}>
          <p className={styles.socialProof}>
            <Icon name="fa-users" size="sm" color="var(--color-text-secondary)" />
            &nbsp;Join{' '}
            <strong>{WAITLIST_COUNT}</strong> people already on the waitlist
          </p>
        </AnimatedElement>
      </div>

      <AnimatedElement animation="fadeIn" delay={400}>
        <div className={styles.mockupContainer} aria-hidden="true">
          {/* Productivity stat badge */}
          <div className={styles.statBadge}>
            <span className={styles.statValue}>+120%</span>
            <span className={styles.statLabel}>PRODUCTIVITY</span>
          </div>

          {/* Primary mockup - Notes list view */}
          <div className={styles.mockupPrimary}>
            <picture>
              <source
                srcSet="/mockups/notes-list-400w.avif 400w, /mockups/notes-list-800w.avif 800w, /mockups/notes-list.avif 1100w"
                sizes="(max-width: 480px) 400px, (max-width: 768px) 800px, 1100px"
                type="image/avif"
              />
              <source
                srcSet="/mockups/notes-list-400w.webp 400w, /mockups/notes-list-800w.webp 800w, /mockups/notes-list.webp 1100w"
                sizes="(max-width: 480px) 400px, (max-width: 768px) 800px, 1100px"
                type="image/webp"
              />
              <source srcSet="/mockups/notes-list.png" type="image/png" />
              <img
                src="/mockups/notes-list.svg"
                alt="Paperlyte notes list showing Today's Notes with three items: Project Ideas for brainstorming, Meeting Notes with key takeaways, and Quick Thoughts being written"
                width={1100}
                height={800}
                loading="eager"
                decoding="async"
                className={styles.mockupImage}
              />
            </picture>
          </div>

          {/* Secondary mockup - Note detail view (floating) */}
          <div className={styles.mockupSecondary}>
            <picture>
              <source
                srcSet="/mockups/note-detail-400w.avif 400w, /mockups/note-detail.avif 800w"
                sizes="(max-width: 480px) 400px, 800px"
                type="image/avif"
              />
              <source
                srcSet="/mockups/note-detail-400w.webp 400w, /mockups/note-detail.webp 800w"
                sizes="(max-width: 480px) 400px, 800px"
                type="image/webp"
              />
              <source srcSet="/mockups/note-detail.png" type="image/png" />
              <img
                src="/mockups/note-detail.svg"
                alt="Paperlyte note editor with bullet points including quick project ideas, meeting reminders, and presentation notes"
                width={800}
                height={600}
                loading="lazy"
                decoding="async"
                className={styles.mockupImage}
              />
            </picture>
          </div>
        </div>
      </AnimatedElement>
    </Section>
  )
}
