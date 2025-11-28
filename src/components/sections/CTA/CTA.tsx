import { Section } from '@components/layout/Section';
import { Button } from '@components/ui/Button';
import { AnimatedElement } from '@components/ui/AnimatedElement';
import { DOWNLOAD_URLS, GITHUB_URL } from '@/constants/downloads';
import styles from './CTA.module.css';

export const CTA = (): React.ReactElement => {
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
              href={DOWNLOAD_URLS.mac}
              className={styles.downloadButton}
            >
              Download for Mac
            </Button>
            <Button
              variant="secondary"
              size="large"
              icon="fa-windows"
              href={DOWNLOAD_URLS.windows}
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
              <a href={DOWNLOAD_URLS.ios} className={styles.platformLink}>
                iOS
              </a>
              ,{' '}
              <a href={DOWNLOAD_URLS.android} className={styles.platformLink}>
                Android
              </a>
              , and{' '}
              <a href={DOWNLOAD_URLS.linux} className={styles.platformLink}>
                Linux
              </a>
            </p>
          </div>
        </AnimatedElement>

        <AnimatedElement animation="fadeIn" delay={600}>
          <a href={GITHUB_URL} className={styles.badge} target="_blank" rel="noopener noreferrer">
            <i className="fa-brands fa-github" aria-hidden="true" />
            <span>Open source on GitHub</span>
          </a>
        </AnimatedElement>
      </div>
    </Section>
  );
};
