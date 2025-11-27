import { Button } from '@components/ui/Button';
import { AnimatedElement } from '@components/ui/AnimatedElement';
import { Section } from '@components/layout/Section';
import styles from './Hero.module.css';

export const Hero = (): React.ReactElement => {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <Section id="hero" className={styles.hero} padding="large">
      <div className={styles.content}>
        <AnimatedElement animation="fadeIn">
          <h1 className={styles.headline}>
            Your thoughts, unchained from complexity
          </h1>
        </AnimatedElement>

        <AnimatedElement animation="fadeIn" delay={150}>
          <p className={styles.subheadline}>
            Lightning-fast, distraction-free note-taking. No bloat, no friction.
            Just you and your ideas, the way it should be.
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
            <Button
              variant="secondary"
              size="large"
              onClick={() => scrollToSection('features')}
            >
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
              <i className="fa-solid fa-cloud" aria-hidden="true" /> Offline Ready
            </span>
          </div>
        </AnimatedElement>
      </div>
    </Section>
  );
};
