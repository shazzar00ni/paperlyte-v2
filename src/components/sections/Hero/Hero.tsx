import { Button } from '@components/ui/Button'
import { AnimatedElement } from '@components/ui/AnimatedElement'
import { Section } from '@components/layout/Section'
import { Icon } from '@components/ui/Icon'
import { scrollToSection } from '@/utils/navigation'
import { LAUNCH_QUARTER } from '@constants/waitlist'
import styles from './Hero.module.css'

export const Hero = (): React.ReactElement => {
  return (
    <Section id="hero" className={styles.hero} padding="large">
      <div className={styles.content}>
        <AnimatedElement animation="fadeIn">
          <h1 className={styles.headline}>Your thoughts, unchained.</h1>
        </AnimatedElement>

        <AnimatedElement animation="fadeIn" delay={100}>
          <p className={styles.subheadline}>
            The fastest, simplest way to capture ideas—no folders, no clutter, no friction.
          </p>
        </AnimatedElement>

        <AnimatedElement animation="fadeIn" delay={200}>
          <p className={styles.microcopy}>
            Be the first to try Paperlyte when we launch in {LAUNCH_QUARTER}
          </p>
        </AnimatedElement>

        <AnimatedElement animation="fadeIn" delay={300}>
          <div className={styles.ctas}>
            <Button
              variant="primary"
              size="large"
              icon="fa-arrow-right"
              onClick={() => scrollToSection('download')}
            >
              Join the Waitlist
            </Button>
            <Button variant="secondary" size="large" onClick={() => scrollToSection('features')}>
              View the Demo
            </Button>
          </div>
        </AnimatedElement>

        <AnimatedElement animation="fadeIn" delay={450}>
          <div className={styles.tags}>
            <span className={styles.tag}>
              <Icon name="fa-bolt" size="sm" /> Lightning Fast
            </span>
            <span className={styles.tag}>
              <Icon name="fa-lock" size="sm" /> Privacy First
            </span>
            <span className={styles.tag}>
              <Icon name="fa-wifi-slash" size="sm" /> Offline Ready
            </span>
          </div>
        </AnimatedElement>
      </div>

      <AnimatedElement animation="fadeIn" delay={400}>
        <div className={styles.mockupContainer}>
          {/* Primary mockup - Notes list view */}
          <div className={styles.mockupPrimary}>
            <picture>
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
