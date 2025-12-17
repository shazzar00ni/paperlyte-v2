import { Button } from '@components/ui/Button'
import { AnimatedElement } from '@components/ui/AnimatedElement'
import { ParallaxLayer } from '@components/ui/ParallaxLayer'
import { FloatingElement } from '@components/ui/FloatingElement'
import { TextReveal } from '@components/ui/TextReveal'
import { Section } from '@components/layout/Section'
import { Icon } from '@components/ui/Icon'
import { scrollToSection } from '@/utils/navigation'
import { useAnalytics } from '@hooks/useAnalytics'
import styles from './Hero.module.css'

// Constants for CTA labels and navigation targets
const START_WRITING_LABEL = 'Start Writing for Free'
const VIEW_DEMO_LABEL = 'View the Demo'
const DOWNLOAD_SECTION_ID = 'download'
const FEATURES_SECTION_ID = 'features'
const HERO_LOCATION = 'hero'

const trustedCompanies = ['Acme Corp', 'Global', 'Nebula', 'Vertex', 'Horizon']

export const Hero = () => {
  const { trackCTAClick } = useAnalytics()

  const handleStartWritingClick = () => {
    trackCTAClick(START_WRITING_LABEL, HERO_LOCATION)
    scrollToSection(DOWNLOAD_SECTION_ID)
  }

  const handleViewDemoClick = () => {
    trackCTAClick(VIEW_DEMO_LABEL, HERO_LOCATION)
    scrollToSection(FEATURES_SECTION_ID)
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

        <AnimatedElement animation="fadeIn" delay={200}>
          <p className={styles.subheadline}>
            The minimal workspace for busy professionals. Capture ideas, structure documents, and
            focus on what truly matters—without the clutter.
          </p>
        </AnimatedElement>

        <AnimatedElement animation="fadeIn" delay={300}>
          <div className={styles.ctas}>
            <Button
              variant="primary"
              size="large"
              icon="fa-arrow-right"
              onClick={handleStartWritingClick}
            >
              {START_WRITING_LABEL}
            </Button>
            <Button variant="secondary" size="large" onClick={handleViewDemoClick}>
              {VIEW_DEMO_LABEL}
            </Button>
          </div>
        </AnimatedElement>
      </div>

      <AnimatedElement animation="fadeIn" delay={400}>
        <div className={styles.mockup} aria-hidden="true">
          <div className={styles.mockupCard}>
            <div className={styles.mockupHeader}>
              <div className={styles.mockupDot} />
              <div className={styles.mockupTitle} />
            </div>
            <div className={styles.mockupContent}>
              <div className={`${styles.mockupLine} ${styles.mockupLineLong}`} />
              <div className={styles.mockupLine} />
              <div className={`${styles.mockupLine} ${styles.mockupLineMedium}`} />
              <div className={`${styles.mockupLine} ${styles.mockupLineShort}`} />
              <div className={styles.mockupSpacer} />
              <div className={styles.mockupCheckbox}>
                <div className={styles.mockupCheck} />
                <div className={`${styles.mockupLine} ${styles.mockupLineCheckbox}`} />
              </div>
              <div className={styles.mockupCheckbox}>
                <div className={styles.mockupCheck} />
                <div className={`${styles.mockupLine} ${styles.mockupLineCheckboxShort}`} />
              </div>
            </div>
            <div className={styles.mockupStats}>
              <div className={styles.mockupStatCard}>
                <div className={styles.mockupStatIcon}>
                  <Icon name="fa-clock" size="sm" />
                </div>
                <span className={styles.mockupStatLabel}>PRODUCTIVITY</span>
                <span className={styles.mockupStatValue}>+120%</span>
                <span className={styles.mockupStatDesc}>Focus increase reported by users</span>
              </div>
              <button type="button" className={styles.mockupShareBtn}>
                Share
              </button>
            </div>
          </div>
        </div>
      </AnimatedElement>

      <AnimatedElement animation="fadeIn" delay={500}>
        <div className={styles.trusted}>
          <span className={styles.trustedLabel}>TRUSTED BY TEAMS AT</span>
          <div className={styles.trustedLogos}>
            {trustedCompanies.map((company) => (
              <span key={company} className={styles.trustedLogo}>
                {company}
              </span>
            ))}
          </div>
        </div>
      </AnimatedElement>
    </Section>
  )
}
