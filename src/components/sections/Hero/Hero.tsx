import { Button } from '@components/ui/Button'
import { AnimatedElement } from '@components/ui/AnimatedElement'
import { Section } from '@components/layout/Section'
import { scrollToSection } from '@/utils/navigation'
import styles from './Hero.module.css'

export const Hero = (): React.ReactElement => {
  return (
    <Section id="hero" className={styles.hero} padding="large">
      <div className={styles.content}>
        <AnimatedElement animation="fadeIn">
          <h1 className={styles.headline}>
            Your thoughts, <em>organized.</em>
          </h1>
        </AnimatedElement>

        <AnimatedElement animation="fadeIn" delay={100}>
          <p className={styles.subheadline}>
            The minimal workspace for busy professionals.
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
              Start Writing for Free
            </Button>
            <Button variant="secondary" size="large" onClick={() => scrollToSection('features')}>
              View the Demo
            </Button>
          </div>
        </AnimatedElement>

        <AnimatedElement animation="fadeIn" delay={450}>
          <div className={styles.trustedBy}>
            <p className={styles.trustedByLabel}>TRUSTED BY TEAMS AT</p>
            <ul className={styles.companies}>
              <li className={styles.company}>Acme Corp</li>
              <li className={styles.company}>Global</li>
              <li className={styles.company}>Nebula</li>
              <li className={styles.company}>Vertex</li>
              <li className={styles.company}>Horizon</li>
            </ul>
          </div>
        </AnimatedElement>
      </div>

      <AnimatedElement animation="fadeIn" delay={400}>
        <div className={styles.mockupContainer} aria-hidden="true" data-testid="hero-mockup">
          {/* App mockup with productivity stat */}
          <div className={styles.mockupPrimary}>
            <div className={styles.productivityStat}>
              <div className={styles.statValue}>+120%</div>
              <div className={styles.statLabel}>PRODUCTIVITY</div>
            </div>
          </div>
        </div>
      </AnimatedElement>
    </Section>
  )
}
