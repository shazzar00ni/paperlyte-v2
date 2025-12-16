import { Section } from '@components/layout/Section'
import { Button } from '@components/ui/Button'
import { AnimatedElement } from '@components/ui/AnimatedElement'
import { scrollToSection } from '@/utils/navigation'
import { useAnalytics } from '@hooks/useAnalytics'
import styles from './CTA.module.css'

export const CTA = () => {
  const { trackCTAClick } = useAnalytics()

  const handleGetStartedClick = () => {
    trackCTAClick('Get Started for Free', 'cta-section')
    scrollToSection('hero')
  }

  const handleLearnMoreClick = () => {
    trackCTAClick('Learn More', 'cta-section')
    scrollToSection('features')
  }
  return (
    <Section id="download" background="default" className={styles.cta}>
      <div className={styles.container}>
        <AnimatedElement animation="fadeIn">
          <h2 className={styles.title}>Ready to declutter your mind?</h2>
        </AnimatedElement>

        <AnimatedElement animation="fadeIn" delay={100}>
          <p className={styles.subtitle}>
            Join 20,000+ professionals organizing their life with Paperlyte.
          </p>
        </AnimatedElement>

        <AnimatedElement animation="fadeIn" delay={200}>
          <div className={styles.buttons}>
            <Button variant="primary" size="large" onClick={handleGetStartedClick}>
              Get Started for Free
            </Button>
            <Button variant="secondary" size="large" onClick={handleLearnMoreClick}>
              Learn More
            </Button>
          </div>
        </AnimatedElement>
      </div>
    </Section>
  )
}
