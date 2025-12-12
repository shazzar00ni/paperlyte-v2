import { Section } from '@components/layout/Section'
import { Button } from '@components/ui/Button'
import { AnimatedElement } from '@components/ui/AnimatedElement'
import { scrollToSection } from '@/utils/navigation'
import styles from './CTA.module.css'

export const CTA = () => {
  return (
    <Section id="download" background="default" className={styles.cta}>
      <div className={styles.container}>
        <AnimatedElement animation="fadeIn">
          <h2 className={styles.title}>Ready to declutter your mind?</h2>
        </AnimatedElement>

        <AnimatedElement animation="fadeIn" delay={100}>
          <p className={styles.subtitle}>
            Be the first to try Paperlyte when we launch in Q2 2025.
          </p>
        </AnimatedElement>

        <AnimatedElement animation="fadeIn" delay={200}>
          <div className={styles.buttons}>
            <Button variant="primary" size="large" onClick={() => scrollToSection('hero')}>
              Join the Waitlist
            </Button>
            <Button variant="secondary" size="large" onClick={() => scrollToSection('features')}>
              Learn More
            </Button>
          </div>
        </AnimatedElement>
      </div>
    </Section>
  )
}
