import { Section } from '@components/layout/Section'
import { AnimatedElement } from '@components/ui/AnimatedElement'
import { CounterAnimation } from '@components/ui/CounterAnimation'
import { SVGPathAnimation } from '@components/ui/SVGPathAnimation'
import styles from './Statistics.module.css'

/**
 * Represents a single statistic item for the counter animations
 */
interface StatisticItem {
  /** The numeric value to count up to */
  value: number
  /** Display label shown below the counter */
  label: string
  /** Font Awesome icon class (e.g., 'fa-users') */
  icon: string
  /** Text displayed after the number (e.g., '+', '%', 'M+') */
  suffix?: string
  /** Text displayed before the number (e.g., '$') */
  prefix?: string
  /** Number of decimal places to display */
  decimals?: number
}

/**
 * Statistics data for the counter animations
 */
const statistics: StatisticItem[] = [
  {
    value: 50000,
    suffix: '+',
    label: 'Active Users',
    icon: 'fa-users',
  },
  {
    value: 10,
    suffix: 'M+',
    label: 'Notes Created',
    icon: 'fa-note-sticky',
  },
  {
    value: 99.9,
    suffix: '%',
    decimals: 1,
    label: 'Uptime',
    icon: 'fa-server',
  },
  {
    value: 4.9,
    suffix: '/5',
    decimals: 1,
    label: 'User Rating',
    icon: 'fa-star',
  },
]

/**
 * Statistics section displaying animated counters showcasing product metrics
 *
 * Features:
 * - Animated number counters that count up when scrolled into view
 * - SVG path animation for decorative elements
 * - Staggered reveal animations for each stat card
 * - Fully accessible with proper ARIA labels
 */
export const Statistics = (): React.ReactElement => {
  return (
    <Section id="statistics" className={styles.statistics} background="surface">
      <div className={styles.container}>
        <AnimatedElement animation="fadeIn">
          <div className={styles.header}>
            <h2 className={styles.title}>Trusted by Note-Takers Worldwide</h2>
            <p className={styles.subtitle}>
              Join thousands of users who have simplified their note-taking workflow
            </p>
          </div>
        </AnimatedElement>

        <div className={styles.grid}>
          {statistics.map((stat, index) => (
            <AnimatedElement key={stat.label} animation="slideUp" delay={100 + index * 100}>
              <div className={styles.card}>
                <div className={styles.iconWrapper}>
                  <SVGPathAnimation
                    width={48}
                    height={48}
                    duration={1500}
                    delay={200 + index * 150}
                    strokeColor="var(--color-primary)"
                    strokeWidth={2}
                  >
                    <circle cx="24" cy="24" r="20" fill="none" />
                  </SVGPathAnimation>
                  <i className={`fa-solid ${stat.icon}`} aria-hidden="true" />
                </div>

                <div className={styles.value}>
                  <CounterAnimation
                    end={stat.value}
                    prefix={stat.prefix}
                    suffix={stat.suffix}
                    decimals={stat.decimals || 0}
                    duration={2000}
                    easing="easeOutQuart"
                  />
                </div>

                <div className={styles.label}>{stat.label}</div>
              </div>
            </AnimatedElement>
          ))}
        </div>
      </div>
    </Section>
  )
}
