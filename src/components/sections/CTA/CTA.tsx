import { Section } from '@components/layout/Section';
import { Button } from '@components/ui/Button';
import { AnimatedElement } from '@components/ui/AnimatedElement';
import { Icon } from '@components/ui/Icon';
import styles from './CTA.module.css';

export const CTA = (): React.ReactElement => {
  return (
    <Section id="download" background="primary">
      <div className={styles.content}>
        <AnimatedElement animation="fadeIn">
          <h2 className={styles.title}>Ready to declutter your mind?</h2>
        </AnimatedElement>

        <AnimatedElement animation="fadeIn" delay={100}>
          <p className={styles.subtitle}>
            Join thousands of people who've simplified their note-taking with Paperlyte
          </p>
        </AnimatedElement>

        <AnimatedElement animation="slideUp" delay={200}>
          <div className={styles.downloads}>
            <Button
              variant="secondary"
              size="large"
              className={styles.downloadButton}
              ariaLabel="Download for macOS"
            >
              <Icon name="fa-apple" size="lg" />
              <div className={styles.downloadText}>
                <span className={styles.downloadLabel}>Download for</span>
                <span className={styles.downloadPlatform}>macOS</span>
              </div>
            </Button>

            <Button
              variant="secondary"
              size="large"
              className={styles.downloadButton}
              ariaLabel="Download for Windows"
            >
              <Icon name="fa-windows" size="lg" />
              <div className={styles.downloadText}>
                <span className={styles.downloadLabel}>Download for</span>
                <span className={styles.downloadPlatform}>Windows</span>
              </div>
            </Button>

            <Button
              variant="secondary"
              size="large"
              className={styles.downloadButton}
              ariaLabel="Download for Linux"
            >
              <Icon name="fa-linux" size="lg" />
              <div className={styles.downloadText}>
                <span className={styles.downloadLabel}>Download for</span>
                <span className={styles.downloadPlatform}>Linux</span>
              </div>
            </Button>
          </div>
        </AnimatedElement>

        <AnimatedElement animation="fadeIn" delay={300}>
          <div className={styles.mobileBadges}>
            <a
              href="#"
              className={styles.mobileBadge}
              aria-label="Download on the App Store"
            >
              <Icon name="fa-app-store-ios" size="2x" />
              <span>App Store</span>
            </a>
            <a
              href="#"
              className={styles.mobileBadge}
              aria-label="Get it on Google Play"
            >
              <Icon name="fa-google-play" size="2x" />
              <span>Google Play</span>
            </a>
          </div>
        </AnimatedElement>

        <AnimatedElement animation="fadeIn" delay={400}>
          <p className={styles.note}>
            <Icon name="fa-github" size="sm" />
            Open source and free forever. View on{' '}
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.link}
            >
              GitHub
            </a>
          </p>
        </AnimatedElement>
      </div>
    </Section>
  );
};
