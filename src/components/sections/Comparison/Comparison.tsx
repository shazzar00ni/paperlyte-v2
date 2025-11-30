import { Section } from '@components/layout/Section'
import { AnimatedElement } from '@components/ui/AnimatedElement'
import { Icon } from '@components/ui/Icon'
import { COMPARISON_FEATURES, COMPETITORS } from '@constants/comparison'
import styles from './Comparison.module.css'

/**
 * Renders a checkmark, X, or text value for a comparison cell
 */
const ComparisonCell = ({ value }: { value: boolean | string }): React.ReactElement => {
  if (typeof value === 'boolean') {
    return (
      <Icon
        name={value ? 'fa-check' : 'fa-xmark'}
        color={value ? 'var(--color-success)' : 'var(--color-error)'}
        ariaLabel={value ? 'Supported' : 'Not supported'}
      />
    )
  }
  return <span className={styles.textValue}>{value}</span>
}

export const Comparison = (): React.ReactElement => {
  return (
    <Section id="comparison" background="default">
      <div className={styles.header}>
        <AnimatedElement animation="fadeIn">
          <h2 className={styles.title}>See How We Compare</h2>
        </AnimatedElement>
        <AnimatedElement animation="fadeIn" delay={100}>
          <p className={styles.subtitle}>
            We believe in transparency. Here's how Paperlyte stacks up against the competition.
          </p>
        </AnimatedElement>
      </div>

      <AnimatedElement animation="fadeIn" delay={200}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.featureHeader} scope="col">
                  Feature
                </th>
                {COMPETITORS.map((competitor) => (
                  <th
                    key={competitor.id}
                    className={styles.competitorHeader}
                    scope="col"
                    style={
                      competitor.id === 'paperlyte'
                        ? { color: competitor.color, fontWeight: 700 }
                        : undefined
                    }
                  >
                    {competitor.name}
                    {competitor.id === 'paperlyte' && (
                      <span className={styles.badge} aria-label="Our product">
                        You
                      </span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARISON_FEATURES.map((feature, index) => (
                <tr key={index}>
                  <th className={styles.featureCell} scope="row">
                    {feature.feature}
                  </th>
                  <td className={`${styles.cell} ${styles.highlightCell}`}>
                    <ComparisonCell value={feature.paperlyte} />
                  </td>
                  <td className={styles.cell}>
                    <ComparisonCell value={feature.notion} />
                  </td>
                  <td className={styles.cell}>
                    <ComparisonCell value={feature.evernote} />
                  </td>
                  <td className={styles.cell}>
                    <ComparisonCell value={feature.onenote} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AnimatedElement>

      <AnimatedElement animation="fadeIn" delay={300}>
        <p className={styles.disclaimer}>
          Comparison data accurate as of{' '}
          {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}. Competitor
          features may vary by plan and region.
        </p>
      </AnimatedElement>
    </Section>
  )
}
