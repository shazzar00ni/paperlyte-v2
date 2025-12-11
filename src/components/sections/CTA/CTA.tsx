import { Section } from '@components/layout/Section'
import { Button } from '@components/ui/Button'
import { AnimatedElement } from '@components/ui/AnimatedElement'
import { useAnalytics } from '@hooks/useAnalytics'
import styles from './CTA.module.css'

export const CTA = (): React.ReactElement => {
  const { trackDownload } = useAnalytics()

  const handleDownloadClick = (platform: string) => {
    trackDownload(platform, 'cta-section')
  }

  return (
    <Section id="download" background="primary" className={styles.cta}>
      <div className={styles.content}>
        <AnimatedElement animation="fadeIn">
          <h2 className={styles.title}>Ready to declutter your mind?</h2>
        </AnimatedElement>

        <AnimatedElement animation="fadeIn" delay={150}>
          <p className={styles.subtitle}>
            Join thousands simplifying their notes. Start free, stay focused.
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
              onClick={() => handleDownloadClick('mac')}
            >
              Download for Mac
            </Button>
            <Button
              variant="secondary"
              size="large"
              icon="fa-windows"
              href="#"
              className={styles.downloadButton}
              onClick={() => handleDownloadClick('windows')}
            >
              Download for Windows
            </Button>
          </div>
        </AnimatedElement>

        <AnimatedElement animation="fadeIn" delay={450}>
          <div className={styles.platforms}>
            <p className={styles.platformText}>
              Also available for{' '}
              <button
                type="button"
                className={styles.platformLink}
                onClick={() => handleDownloadClick('ios')}
                aria-label="Download for iOS"
              >
                iOS
              </button>
              ,{' '}
              <button
                type="button"
                className={styles.platformLink}
                onClick={() => handleDownloadClick('android')}
                aria-label="Download for Android"
              >
                Android
              </button>
              , and{' '}
              <button
                type="button"
                className={styles.platformLink}
                onClick={() => handleDownloadClick('linux')}
                aria-label="Download for Linux"
              >
                Linux
              </button>
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
