import { Section } from '@components/layout/Section'
import { AnimatedElement } from '@components/ui/AnimatedElement'
import { Icon } from '@components/ui/Icon'
import styles from './Mobile.module.css'

/**
 * Mobile section component showcasing the Paperlyte mobile experience.
 *
 * Highlights the speed and simplicity of the mobile app and its seamless
 * desktop sync. Includes an animated headline, descriptive copy, and a
 * call-to-action link to explore mobile-specific features.
 *
 * @returns A `<Section>` element containing the mobile feature pitch.
 */
export const Mobile = (): React.ReactElement => {
  return (
    <Section id="mobile" className={styles.mobile} padding="large">
      <div className={styles.container}>
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
      </div>
    </Section>
  )
}
