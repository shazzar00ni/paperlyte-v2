import { Section } from '@components/layout/Section'
import { AnimatedElement } from '@components/ui/AnimatedElement'
import { Icon } from '@components/ui/Icon'
import { Illustration } from '@components/ui/Illustration'
import styles from './Mobile.module.css'

export const Mobile = (): React.ReactElement => {
  return (
    <Section id="mobile" className={styles.mobile} padding="large">
      <div className={styles.container}>
        <div className={styles.layout}>
          <div className={styles.content}>
            <AnimatedElement animation="fadeIn">
              <h2 className={styles.headline}>
                Capture inspiration,
                <br />
                wherever you are.
              </h2>
            </AnimatedElement>

            <AnimatedElement animation="fadeIn" delay={100}>
              <p className={styles.description}>
                Our mobile app is designed for speed. Open, type, close. Everything syncs to your
                desktop instantly so you never lose a fleeting thought.
              </p>
            </AnimatedElement>

            <AnimatedElement animation="fadeIn" delay={200}>
              <a href="#mobile" className={styles.link}>
                Explore Mobile Features
                <Icon name="fa-arrow-right" size="sm" />
              </a>
            </AnimatedElement>
          </div>

          <AnimatedElement animation="fadeIn" delay={300}>
            <div className={styles.illustration}>
              <Illustration
                name="mobile-phone"
                size="lg"
                ariaLabel="Mobile phone showing Paperlyte app"
              />
            </div>
          </AnimatedElement>
        </div>
      </div>
    </Section>
  )
}
