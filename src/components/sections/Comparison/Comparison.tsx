import { memo, useMemo } from 'react'
import { Section } from '@components/layout/Section'
import { AnimatedElement } from '@components/ui/AnimatedElement'
import { Icon } from '@components/ui/Icon'
import { COMPARISON_FEATURES, COMPETITORS } from '@constants/comparison'
import styles from './Comparison.module.css'

// Precomputed styles for competitor header cells – avoids recreating objects on every render
const COMPETITOR_HEADER_STYLES = new Map(
  COMPETITORS.map((c) => [
    c.id,
    c.id === 'paperlyte' ? { color: c.color, fontWeight: 700 } : undefined,
  ])
)

/**
 * Renders a checkmark, X, or text value for a comparison cell
 * @param props - Cell props
 * @param props.value - Boolean for check/x or string for text value
 * @returns Icon or text element
 */
const ComparisonCell = memo(({ value }: { value: boolean | string }): React.ReactElement => {
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
})

ComparisonCell.displayName = 'ComparisonCell'

/**
 * Comparison section component that shows feature comparison table
 * Compares Paperlyte against competitor note-taking applications
 * Uses responsive table with horizontal scroll on mobile
 *
 * @returns A comparison section with feature matrix table
 *
 * @example
 * ```tsx
 * <Comparison />
 * ```
 */
export const Comparison = (): React.ReactElement => {
  // Compute once on mount; only changes if the component is remounted in a new month
  const comparisonDate = useMemo(
    () => new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    []
  )

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
                    style={COMPETITOR_HEADER_STYLES.get(competitor.id)}
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
          Comparison data accurate as of {comparisonDate}. Competitor features may vary by plan and
          region.
        </p>
      </AnimatedElement>
    </Section>
  )
}
