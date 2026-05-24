import React, { type ReactNode } from 'react'
import styles from './Section.module.css'

interface SectionProps {
  id?: string
  children: ReactNode
  className?: string
  background?: 'default' | 'surface' | 'primary'
  padding?: 'default' | 'large' | 'none'
}

/**
 * Section layout component with configurable background and padding
 * Provides consistent section styling across the application
 * Automatically wraps content in a centered container with max-width
 *
 * @param props - Section component props
 * @param props.id - Optional HTML id attribute for anchor links
 * @param props.children - Content to render inside the section
 * @param props.className - Additional CSS classes
 * @param props.background - Background color variant (default: 'default')
 * @param props.padding - Padding size variant (default: 'default')
 * @returns A semantic section element with centered container
 *
 * @example
 * ```tsx
 * // Basic section
 * <Section id="features">
 *   <h2>Features</h2>
 * </Section>
 *
 * // Section with custom background and padding
 * <Section background="surface" padding="large">
 *   <Hero />
 * </Section>
 * ```
 */
export const Section = React.memo<SectionProps>(
  ({ id, children, className = '', background = 'default', padding = 'default' }) => {
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
)

Section.displayName = 'Section'
