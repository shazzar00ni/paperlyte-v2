import { Button } from '@components/ui/Button'
import { AnimatedElement } from '@components/ui/AnimatedElement'
import { ParallaxLayer } from '@components/ui/ParallaxLayer'
import { FloatingElement } from '@components/ui/FloatingElement'
import { TextReveal } from '@components/ui/TextReveal'
import { Section } from '@components/layout/Section'
import styles from './Hero.module.css'

export const Hero = (): React.ReactElement => {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <Section id="hero" className={styles.hero} padding="large">
      {/* Parallax background decorations */}
      <div className={styles.decorations} aria-hidden="true">
        {/* Slow-moving background shapes */}
        <ParallaxLayer speed={0.15} absolute zIndex={-3} opacity={0.6}>
          <div className={`${styles.shape} ${styles.shape1}`} />
        </ParallaxLayer>

        <ParallaxLayer speed={0.25} absolute zIndex={-2} opacity={0.4}>
          <div className={`${styles.shape} ${styles.shape2}`} />
        </ParallaxLayer>

        <ParallaxLayer speed={0.1} absolute zIndex={-2} opacity={0.3}>
          <div className={`${styles.shape} ${styles.shape3}`} />
        </ParallaxLayer>

        {/* Floating decorative elements */}
        <div className={styles.floatingContainer}>
          <FloatingElement duration={4} distance={15} delay={0}>
            <div className={`${styles.floatingIcon} ${styles.floatingIcon1}`}>
              <i className="fa-solid fa-note-sticky" aria-hidden="true" />
            </div>
          </FloatingElement>

          <FloatingElement duration={5} distance={20} delay={0.5}>
            <div className={`${styles.floatingIcon} ${styles.floatingIcon2}`}>
              <i className="fa-solid fa-pen" aria-hidden="true" />
            </div>
          </FloatingElement>

          <FloatingElement duration={3.5} distance={12} delay={1}>
            <div className={`${styles.floatingIcon} ${styles.floatingIcon3}`}>
              <i className="fa-solid fa-lightbulb" aria-hidden="true" />
            </div>
          </FloatingElement>

          <FloatingElement duration={6} distance={18} delay={0.3} direction="horizontal">
            <div className={`${styles.floatingIcon} ${styles.floatingIcon4}`}>
              <i className="fa-solid fa-bolt" aria-hidden="true" />
            </div>
          </FloatingElement>
        </div>
      </div>

      <div className={styles.content}>
        <AnimatedElement animation="fadeIn">
          <TextReveal
            as="h1"
            type="word"
            stagger={80}
            animation="fadeUp"
            className={styles.headline}
          >
            Your thoughts, unchained from complexity
          </TextReveal>
        </AnimatedElement>

        <AnimatedElement animation="fadeIn" delay={150}>
          <p className={styles.subheadline}>
            Lightning-fast, distraction-free note-taking. No bloat, no friction. Just you and your
            ideas, the way it should be.
          </p>
        </AnimatedElement>

        <AnimatedElement animation="fadeIn" delay={300}>
          <div className={styles.ctas}>
            <Button
              variant="primary"
              size="large"
              icon="fa-download"
              onClick={() => scrollToSection('download')}
            >
              Download Now
            </Button>
            <Button variant="secondary" size="large" onClick={() => scrollToSection('features')}>
              See Features
            </Button>
          </div>
        </AnimatedElement>

        <AnimatedElement animation="fadeIn" delay={450}>
          <div className={styles.tags}>
            <span className={styles.tag}>
              <i className="fa-solid fa-bolt" aria-hidden="true" /> Lightning Fast
            </span>
            <span className={styles.tag}>
              <i className="fa-solid fa-lock" aria-hidden="true" /> Privacy First
            </span>
            <span className={styles.tag}>
              <i className="fa-solid fa-wifi-slash" aria-hidden="true" /> Offline Ready
            </span>
          </div>
        </AnimatedElement>
      </div>
    </Section>
  )
}
