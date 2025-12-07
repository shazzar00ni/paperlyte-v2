import { Section } from '@components/layout/Section'
import { Button } from '@components/ui/Button'
import { AnimatedElement } from '@components/ui/AnimatedElement'
import styles from './CTA.module.css'

export const CTA = (): React.ReactElement => {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
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
            <Button variant="primary" size="large" onClick={() => scrollToSection('hero')}>
              Get Started for Free
            </Button>
            <Button variant="secondary" size="large" onClick={() => scrollToSection('pricing')}>
              Compare Plans
            </Button>
          </div>
        </AnimatedElement>
      </div>
    </Section>
  )
}
