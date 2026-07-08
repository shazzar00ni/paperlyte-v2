import { Section } from '@components/layout/Section'
import { Button } from '@components/ui/Button'
import { AnimatedElement } from '@components/ui/AnimatedElement'
import { scrollToSection } from '@/utils/navigation'
import { WAITLIST_COUNT, LAUNCH_QUARTER } from '@constants/waitlist'
import styles from './CTA.module.css'

/**
 * Call-to-Action section component that encourages users to join the waitlist
 * Features headline, subtitle, action buttons, and social proof with waitlist count
 * Uses AnimatedElement for staggered entrance animations
 *
 * @returns A CTA section with download/waitlist buttons and social proof
 *
 * @example
 * ```tsx
 * <CTA />
 * ```
 */
export const CTA = (): React.ReactElement => {
  return (
    <Section id="download" background="primary" className={styles.cta}>
      <div className={styles.content}>
        <AnimatedElement animation="fadeIn">
          <h2 className={styles.title}>Ready when your thoughts are.</h2>
        </AnimatedElement>

        <AnimatedElement animation="fadeIn" delay={150}>
          <p className={styles.subtitle}>
            Paperlyte is opening early access for people who want a faster, calmer place to write.
          </p>
          <p className={styles.subtitle}>
            Join the waitlist for a launch invite, founder pricing, and a clear heads-up before your
            spot opens.
          </p>
        </AnimatedElement>

        <AnimatedElement animation="fadeIn" delay={300}>
          <div className={styles.buttons}>
            <Button variant="primary" size="large" onClick={() => scrollToSection('email-capture')}>
              Get Early Access
            </Button>
            <button
              type="button"
              className={styles.textLink}
              onClick={() => scrollToSection('features')}
            >
              Review the features
            </button>
          </div>
        </AnimatedElement>

        <AnimatedElement animation="fadeIn" delay={300}>
          <p className={styles.microcopy}>
            Early access starts {LAUNCH_QUARTER} · {WAITLIST_COUNT} already waiting · No credit card
            required
          </p>
        </AnimatedElement>
      </div>
    </Section>
  )
}
