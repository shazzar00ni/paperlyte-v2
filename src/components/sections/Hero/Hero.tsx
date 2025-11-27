import { Button } from '@components/ui/Button';
import { AnimatedElement } from '@components/ui/AnimatedElement';
import styles from './Hero.module.css';

export const Hero = (): React.ReactElement => {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className={styles.hero} id="hero">
      <div className={styles.container}>
        <AnimatedElement animation="fadeIn">
          <h1 className={styles.headline}>
            Your thoughts, unchained from complexity
          </h1>
        </AnimatedElement>

        <AnimatedElement animation="fadeIn" delay={150}>
          <p className={styles.subheadline}>
            The lightning-fast, distraction-free note-taking app that prioritizes
            simplicity over feature bloat. Capture your ideas instantly, organize
            effortlessly with tags, and access your notes anywhere—even offline.
          </p>
        </AnimatedElement>

        <AnimatedElement animation="slideUp" delay={300}>
          <div className={styles.ctas}>
            <Button
              variant="primary"
              size="large"
              icon="fa-download"
              onClick={() => scrollToSection('download')}
              ariaLabel="Download Paperlyte"
            >
              Download Now
            </Button>
            <Button
              variant="secondary"
              size="large"
              onClick={() => scrollToSection('features')}
              ariaLabel="Learn more about features"
            >
              Learn More
            </Button>
          </div>
        </AnimatedElement>

        <AnimatedElement animation="fadeIn" delay={450}>
          <div className={styles.badges}>
            <div className={styles.badge}>
              <i className="fa-solid fa-bolt" aria-hidden="true"></i>
              <span>Lightning Fast</span>
            </div>
            <div className={styles.badge}>
              <i className="fa-solid fa-shield-halved" aria-hidden="true"></i>
              <span>Privacy First</span>
            </div>
            <div className={styles.badge}>
              <i className="fa-solid fa-cloud-arrow-down" aria-hidden="true"></i>
              <span>Offline Ready</span>
            </div>
          </div>
        </AnimatedElement>
      </div>
    </section>
  );
};
