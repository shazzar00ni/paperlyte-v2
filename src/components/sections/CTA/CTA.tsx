import { Section } from '@components/layout/Section'
import { Button } from '@components/ui/Button'
import { AnimatedElement } from '@components/ui/AnimatedElement'
import { scrollToSection } from '@/utils/navigation'
import { WAITLIST_COUNT, LAUNCH_QUARTER } from '@constants/waitlist'
import styles from './CTA.module.css'

export const CTA = (): React.ReactElement => {
  return (
    <Section id="download" background="primary" className={styles.cta}>
      <div className={styles.content}>
        <AnimatedElement animation="fadeIn">
          <h2 className={styles.title}>Stop fighting your tools. Start thinking clearly.</h2>
        </AnimatedElement>

        <AnimatedElement animation="fadeIn" delay={150}>
          <p className={styles.subtitle}>
            Note-taking shouldn't feel like work. It should feel like breathing—natural,
            effortless, invisible.
          </p>
          <p className={styles.subtitle}>
            Join the waitlist today and be among the first to experience what note-taking
            should have been all along.
          </p>
        </AnimatedElement>

        <AnimatedElement animation="fadeIn" delay={300}>
          <div className={styles.buttons}>
            <Button variant="primary" size="large" onClick={() => scrollToSection('email-capture')}>
              Join the Waitlist
            </Button>
            <button
              type="button"
              className={styles.textLink}
              onClick={() => scrollToSection('hero')}
            >
              Watch the Demo Again
            </button>
          </div>
        </AnimatedElement>

        <AnimatedElement animation="fadeIn" delay={300}>
          <p className={styles.microcopy}>
            Launching {LAUNCH_QUARTER} · {WAITLIST_COUNT} already waiting · No credit card required
          </p>
        </AnimatedElement>
      </div>
    </Section>
  )
}
