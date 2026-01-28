import { Section } from '@components/layout/Section'
import { AnimatedElement } from '@components/ui/AnimatedElement'
import { Icon } from '@components/ui/Icon'
import { FEATURES } from '@constants/features'
import styles from './Features.module.css'

export const Features = (): React.ReactElement => {
  return (
    <Section id="features" background="surface">
      <div className={styles.header}>
        <AnimatedElement animation="fadeIn">
          <h2 className={styles.title}>Everything you need. Nothing you don't.</h2>
        </AnimatedElement>
        <AnimatedElement animation="fadeIn" delay={100}>
          <p className={styles.subtitle}>
            Built for speed, designed for simplicity. Focus on your ideas, not the tool.
          </p>
        </AnimatedElement>
      </div>

      <div className={styles.grid}>
        {FEATURES.map((feature, index) => (
          <AnimatedElement key={feature.id} animation="slideUp" delay={150 + index * 75}>
            <article className={styles.card}>
              <div className={styles.iconWrapper}>
                <Icon
                  name={feature.icon}
                  size="2x"
                  color="var(--color-primary)"
                />
              </div>
              <h3 className={styles.cardTitle}>{feature.title}</h3>
              <p className={styles.cardDescription}>{feature.description}</p>
            </article>
          </AnimatedElement>
        ))}
      </div>
    </Section>
  )
}
