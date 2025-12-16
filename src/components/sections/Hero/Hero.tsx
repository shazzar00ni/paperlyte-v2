import { Button } from "@components/ui/Button";
import { AnimatedElement } from "@components/ui/AnimatedElement";
import { EmailCapture } from "@components/ui/EmailCapture";
import { Section } from "@components/layout/Section";
import { Icon } from "@components/ui/Icon";
import styles from "./Hero.module.css";

export const Hero = (): React.ReactElement => {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
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

        <AnimatedElement animation="fadeIn" delay={200}>
          <p className={styles.subheadline}>
            Lightning-fast, distraction-free note-taking. No bloat, no friction.
            Just you and your ideas, the way it should be.
          </p>
        </AnimatedElement>

        <AnimatedElement animation="fadeIn" delay={300}>
          <div className={styles.emailWrapper}>
            <EmailCapture
              variant="inline"
              placeholder="your@email.com"
              buttonText="Join Waitlist"
            />
          </div>
        </AnimatedElement>

        <AnimatedElement animation="fadeIn" delay={375}>
          <div className={styles.secondaryCta}>
            <Button
              variant="ghost"
              size="medium"
              onClick={() => scrollToSection("features")}
            >
              See Features →
            </Button>
          </div>
        </AnimatedElement>

        <AnimatedElement animation="fadeIn" delay={450}>
          <div className={styles.tags}>
            <span className={styles.tag}>
              <Icon name="fa-bolt" size="sm" /> Lightning Fast
            </span>
            <span className={styles.tag}>
              <Icon name="fa-lock" size="sm" /> Privacy First
            </span>
            <span className={styles.tag}>
              <Icon name="fa-wifi-slash" size="sm" /> Offline Ready
            </span>
          </div>
        </AnimatedElement>
      </div>
    </Section>
  );
};
