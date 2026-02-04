import { Section } from '@components/layout/Section'
import { AnimatedElement } from '@components/ui/AnimatedElement'
import { Button } from '@components/ui/Button'
import { Icon } from '@components/ui/Icon'
import { PRICING_PLANS } from '@constants/pricing'
import styles from './Pricing.module.css'

export const Pricing = (): React.ReactElement => {
  return (
    <Section id="pricing" background="surface">
      <div className={styles.header}>
        <AnimatedElement animation="fadeIn">
          <h2 className={styles.title}>Simple pricing. No surprises.</h2>
        </AnimatedElement>
        <AnimatedElement animation="fadeIn" delay={100}>
          <p className={styles.subtitle}>
            Start free, upgrade whenever. No credit card needed to get started.
          </p>
        </AnimatedElement>
      </div>

      <div className={styles.grid}>
        {PRICING_PLANS.map((plan, index) => (
          <AnimatedElement key={plan.id} animation="slideUp" delay={150 + index * 100}>
            <article className={`${styles.card} ${plan.isPopular ? styles.popularCard : ''}`}>
              {plan.isPopular && (
                <div className={styles.popularBadge} data-testid="most-popular-badge">
                  <Icon name="fa-star" size="sm" ariaLabel="Most popular" />
                  <span>Most Popular</span>
                </div>
              )}

              {plan.icon && (
                <div className={styles.iconWrapper}>
                  <Icon
                    name={plan.icon}
                    size="2x"
                    color="var(--color-primary)"
                    ariaLabel={`${plan.name} plan icon`}
                  />
                </div>
              )}

              <h3 className={styles.planName}>{plan.name}</h3>
              <p className={styles.tagline}>{plan.tagline}</p>

              <div className={styles.priceWrapper}>
                {plan.price === null ? (
                  <span className={styles.price}>Free</span>
                ) : (
                  <>
                    <span className={styles.currency}>$</span>
                    <span className={styles.price}>{plan.price}</span>
                    <span className={styles.period}>/month</span>
                  </>
                )}
              </div>

              <ul className={styles.featureList}>
                {plan.features.map((feature, i) => (
                  <li key={i} className={styles.feature}>
                    <Icon
                      name="fa-check"
                      size="sm"
                      color="var(--color-success)"
                      ariaLabel="Included"
                    />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                variant={plan.isPopular ? 'primary' : 'secondary'}
                size="large"
                className={styles.ctaButton}
                ariaLabel={`${plan.ctaText} for ${plan.name} plan`}
              >
                {plan.ctaText}
              </Button>
            </article>
          </AnimatedElement>
        ))}
      </div>

      <AnimatedElement animation="fadeIn" delay={500}>
        <div className={styles.footer}>
          <p className={styles.guarantee}>
            <Icon name="fa-circle-check" color="var(--color-success)" ariaLabel="Guarantee" />
            <span>30-day money-back guarantee • Cancel anytime • No hidden fees</span>
          </p>
        </div>
      </AnimatedElement>
    </Section>
  )
}
