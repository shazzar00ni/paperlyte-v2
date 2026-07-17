import { Section } from '@components/layout/Section'
import { AnimatedElement } from '@components/ui/AnimatedElement'
import { Button } from '@components/ui/Button'
import { Icon } from '@components/ui/Icon'
import { scrollToSection } from '@/utils/navigation'
import { WAITLIST_COUNT } from '@constants/waitlist'
import { SOLUTION_VALUE_PROPS } from '@constants/solution'
import styles from './Solution.module.css'

/** Renders the Solution section presenting Paperlyte's key differentiating features. */
export const Solution = (): React.ReactElement => {
  return (
    <Section id="solution" background="default">
      <div className={styles.container}>
        <AnimatedElement animation="fadeIn">
          <h2 className={styles.sectionTitle}>Three promises. Zero compromises.</h2>
        </AnimatedElement>

        <AnimatedElement animation="fadeIn" delay={100}>
          <p className={styles.sectionSubtitle}>
            Paperlyte is built on three core principles that make note-taking feel effortless again.
          </p>
        </AnimatedElement>

        <div className={styles.valueProps}>
          {SOLUTION_VALUE_PROPS.map((prop, index) => (
            <AnimatedElement key={prop.headline} animation="slideUp" delay={200 + index * 100}>
              <article className={styles.valueProp}>
                <div className={styles.valueHeader}>
                  <div className={styles.iconContainer}>
                    <Icon name={prop.icon} size="lg" color="var(--color-primary)" />
                  </div>
                  <h3 className={styles.valueHeadline}>
                    <span className={styles.emoji} aria-hidden="true">
                      {prop.emoji}
                    </span>{' '}
                    {prop.headline}
                  </h3>
                </div>

                <h4 className={styles.valueTitle}>{prop.title}</h4>

                <div className={styles.valueBody}>
                  {prop.body.map((paragraph, pIndex) => (
                    <p key={pIndex} className={styles.valueParagraph}>
                      {paragraph}
                    </p>
                  ))}
                </div>

                <div className={styles.valueProof}>
                  <Icon name="fa-check-circle" size="sm" color="var(--color-primary)" />
                  <span>{prop.proof}</span>
                </div>
              </article>
            </AnimatedElement>
          ))}
        </div>

        <AnimatedElement animation="fadeIn" delay={600}>
          <div className={styles.cta}>
            <Button
              variant="primary"
              size="large"
              icon="fa-arrow-right"
              onClick={() => scrollToSection('email-capture')}
            >
              Join the Waitlist
            </Button>
            <p className={styles.ctaMicrocopy}>
              {WAITLIST_COUNT} people already ahead of you. Join them for early access.
            </p>
          </div>
        </AnimatedElement>
      </div>
    </Section>
  )
}
