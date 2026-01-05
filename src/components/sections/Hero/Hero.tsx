import { Button } from '@components/ui/Button'
import { EmailCapture } from '@components/ui/EmailCapture'
import { AnimatedElement } from '@components/ui/AnimatedElement'
import { Section } from '@components/layout/Section'
import { Icon } from '@components/ui/Icon'
import { scrollToSection } from '@/utils/navigation'
import styles from './Hero.module.css'

export const Hero = (): React.ReactElement => {
  return (
    <Section id="hero" className={styles.hero} padding="large">
      <div className={styles.content}>
        {/* Headline - Optimized for conversion */}
        <AnimatedElement animation="fadeIn">
          <h1 id="hero-headline" className={styles.headline}>
            Your thoughts, <em className={styles.emphasis}>unchained</em>
          </h1>
        </AnimatedElement>

        {/* Subheadline */}
        <AnimatedElement animation="fadeIn" delay={100}>
          <p className={styles.subheadline}>
            Lightning-fast note-taking without the bloat. Write, organize with tags, and sync
            everywhere—offline first, always private.
          </p>
        </AnimatedElement>

        {/* Email Capture Form */}
        <AnimatedElement animation="fadeIn" delay={200}>
          <div className={styles.emailWrapper}>
            <EmailCapture variant="inline" placeholder="your@email.com" buttonText="Join Waitlist" />
          </div>
        </AnimatedElement>

        {/* Secondary CTA */}
        <AnimatedElement animation="fadeIn" delay={300}>
          <div className={styles.secondaryCta}>
            <Button
              variant="ghost"
              size="large"
              icon="fa-play-circle"
              onClick={() => scrollToSection('features')}
              ariaLabel="See how Paperlyte works - scroll to features section"
            >
              See How It Works
            </Button>
          </div>
        </AnimatedElement>

        {/* Social Proof / Trust Badges */}
        <AnimatedElement animation="fadeIn" delay={400}>
          <div className={styles.trustBadges} role="status" aria-live="polite">
            <div className={styles.badge}>
              <Icon name="fa-users" size="sm" />
              <span className={styles.badgeText}>Join 1,234 early adopters</span>
            </div>
            <div className={styles.badge}>
              <Icon name="fa-star" size="sm" />
              <span className={styles.badgeText}>Free forever for early users</span>
            </div>
            <div className={styles.badge}>
              <Icon name="fa-shield-check" size="sm" />
              <span className={styles.badgeText}>No credit card required</span>
            </div>
          </div>
        </AnimatedElement>
      </div>

      {/* Hero Image/Mockup */}
      <AnimatedElement animation="fadeIn" delay={500}>
        <div className={styles.mockupContainer} aria-hidden="true">
          {/* Primary mockup - Notes list view */}
          <div className={styles.mockupPrimary}>
            <picture>
              <source srcSet="/mockups/notes-list.avif" type="image/avif" />
              <source srcSet="/mockups/notes-list.webp" type="image/webp" />
              <source srcSet="/mockups/notes-list.png" type="image/png" />
              <img
                src="/mockups/notes-list.svg"
                alt="Paperlyte notes list showing Today's Notes with three items: Project Ideas for brainstorming, Meeting Notes with key takeaways, and Quick Thoughts being written"
                width={1100}
                height={800}
                loading="eager"
                decoding="async"
                fetchPriority="high"
                className={styles.mockupImage}
              />
            </picture>
          </div>

          {/* Secondary mockup - Note detail view (floating) */}
          <div className={styles.mockupSecondary}>
            <picture>
              <source srcSet="/mockups/note-detail.avif" type="image/avif" />
              <source srcSet="/mockups/note-detail.webp" type="image/webp" />
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
