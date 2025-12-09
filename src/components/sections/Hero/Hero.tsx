import { Button } from '@components/ui/Button'
import { AnimatedElement } from '@components/ui/AnimatedElement'
import { Section } from '@components/layout/Section'
import { Icon } from '@components/ui/Icon'
import styles from './Hero.module.css'

export const Hero = (): React.ReactElement => {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

const trustedCompanies = ['Acme Corp', 'Global', 'Nebula', 'Vertex', 'Horizon']

export const Hero = (): React.ReactElement => {
  const scrollToSection = (sectionId: string) => {
    ...
  }
  return (
    <Section id="hero" className={styles.hero} padding="large">
      <div className={styles.container}>
        <div className={styles.content}>
          <AnimatedElement animation="fadeIn">
            <div className={styles.badge}>
              <Icon name="fa-sparkles" size="sm" />
              <span>Version 2.0 is now live</span>
            </div>
          </AnimatedElement>

          <AnimatedElement animation="fadeIn" delay={100}>
            <h1 className={styles.headline}>
              Thoughts,
              <br />
              <em className={styles.headlineItalic}>organized.</em>
            </h1>
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
                onClick={() => scrollToSection('download')}
              >
                Start Writing for Free
              </Button>
              <Button variant="secondary" size="large" onClick={() => scrollToSection('features')}>
                View the Demo
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
                <button type="button" className={styles.mockupShareBtn}>Share</button>
              </div>
            </div>
          </div>
        </AnimatedElement>
      </div>

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
