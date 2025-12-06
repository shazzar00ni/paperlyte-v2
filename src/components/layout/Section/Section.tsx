import { type ReactNode } from 'react'
import styles from './Section.module.css'

/**
 * Props for the Section component
 */
interface SectionProps {
  /** Optional ID for anchor linking and navigation */
  id?: string
  /** Content to be rendered inside the section */
  children: ReactNode
  /** Additional CSS class names to apply */
  className?: string
  /** Background color variant (default: 'default') */
  background?: 'default' | 'surface' | 'primary'
  /** Padding size variant (default: 'default') */
  padding?: 'default' | 'large' | 'none'
}

/**
 * Semantic section wrapper component with consistent spacing and layout
 *
 * Provides a consistent container structure with configurable background colors
 * and padding. All sections use a centered max-width container for content.
 *
 * @example
 * ```tsx
 * // Default section
 * <Section id="hero">
 *   <h1>Welcome</h1>
 * </Section>
 *
 * // Section with surface background and large padding
 * <Section background="surface" padding="large">
 *   <FeatureGrid />
 * </Section>
 *
 * // Section with primary background (branded)
 * <Section background="primary">
 *   <CallToAction />
 * </Section>
 * ```
 */
export const Section = ({
  id,
  children,
  className = '',
  background = 'default',
  padding = 'default',
}: SectionProps): React.ReactElement => {
  const classNames = [
    styles.section,
    styles[`bg-${background}`],
    styles[`padding-${padding}`],
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <section id={id} className={classNames}>
      <div className={styles.container}>{children}</div>
    </section>
  )
}
