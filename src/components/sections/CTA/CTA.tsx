import { Section } from '@components/layout/Section'
import { Button } from '@components/ui/Button'
import { AnimatedElement } from '@components/ui/AnimatedElement'
import styles from './CTA.module.css'

export const CTA = (): React.ReactElement => {
  return (
    <Section id="download" background="primary" className={styles.cta}>
      <div className={styles.content}>
        <AnimatedElement animation="fadeIn">
          <h2 className={styles.title}>Start capturing your thoughts instantly</h2>
        </AnimatedElement>

        <AnimatedElement animation="fadeIn" delay={150}>
          <p className={styles.subtitle}>
            Free to start. No credit card required. Available on all your devices.
          </p>
        </AnimatedElement>

        <AnimatedElement animation="fadeIn" delay={300}>
          <div className={styles.buttons}>
            <Button
              variant="secondary"
              size="large"
              icon="fa-apple"
              href="#"
              className={styles.downloadButton}
            >
              Download for Mac
            </Button>
            <Button
              variant="secondary"
              size="large"
              icon="fa-windows"
              href="#"
              className={styles.downloadButton}
            >
              Download for Windows
            </Button>
          </div>
        </AnimatedElement>

        <AnimatedElement animation="fadeIn" delay={450}>
          <div className={styles.platforms}>
            <p className={styles.platformText}>
              Also available for{' '}
              <a href="#" className={styles.platformLink}>
                iOS
              </a>
              ,{' '}
              <a href="#" className={styles.platformLink}>
                Android
              </a>
              , and{' '}
              <a href="#" className={styles.platformLink}>
                Linux
              </a>
            </p>
          </div>
        </AnimatedElement>

        <AnimatedElement animation="fadeIn" delay={600}>
          <div className={styles.badge}>
            <i className="fa-brands fa-github" aria-hidden="true" />
            <span>Open source on GitHub</span>
          </div>
        </AnimatedElement>
      </div>
    </Section>
  )
}
