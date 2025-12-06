import { type ReactNode } from 'react'
import { useIntersectionObserver } from '@hooks/useIntersectionObserver'
import { useReducedMotion } from '@hooks/useReducedMotion'
import styles from './AnimatedElement.module.css'

/**
 * Props for the AnimatedElement component
 */
interface AnimatedElementProps {
  /** Content to be animated */
  children: ReactNode
  /** Type of animation to apply (default: 'fadeIn') */
  animation?: 'fadeIn' | 'slideUp' | 'slideInLeft' | 'slideInRight' | 'scale'
  /** Animation delay in milliseconds (default: 0) */
  delay?: number
  /** Intersection Observer threshold (0-1, default: 0.1) */
  threshold?: number
  /** Additional CSS class names to apply */
  className?: string
}

/**
 * Wrapper component that animates its children when they scroll into view
 *
 * Uses Intersection Observer to detect when elements enter the viewport and applies
 * CSS animations. Automatically respects user's prefers-reduced-motion setting for
 * accessibility compliance.
 *
 * @example
 * ```tsx
 * // Fade in when visible
 * <AnimatedElement animation="fadeIn">
 *   <h1>Welcome!</h1>
 * </AnimatedElement>
 *
 * // Slide up with delay
 * <AnimatedElement animation="slideUp" delay={200}>
 *   <p>This content appears after 200ms</p>
 * </AnimatedElement>
 *
 * // Scale animation with custom threshold
 * <AnimatedElement animation="scale" threshold={0.5}>
 *   <div>Animates when 50% visible</div>
 * </AnimatedElement>
 * ```
 */
/**
 * Maps delay values to CSS class names
 * Rounds to nearest predefined delay for CSP compliance (no inline styles)
 */
const getDelayClass = (delay: number): string => {
  // Predefined delay values that have corresponding CSS classes
  const delays = [0, 50, 100, 150, 200, 250, 300, 350, 400, 450, 500, 600, 700, 800, 900, 1000]

  // Round to nearest predefined delay
  const nearest = delays.reduce((prev, curr) =>
    Math.abs(curr - delay) < Math.abs(prev - delay) ? curr : prev
  )

  return styles[`delay${nearest}`] || ''
}

export const AnimatedElement = ({
  children,
  animation = 'fadeIn',
  delay = 0,
  threshold = 0.1,
  className = '',
}: AnimatedElementProps): React.ReactElement => {
  const { ref, isVisible } = useIntersectionObserver({ threshold })
  const prefersReducedMotion = useReducedMotion()

  const animationClass = prefersReducedMotion ? '' : styles[animation]
  const delayClass = prefersReducedMotion ? '' : getDelayClass(delay)

  const classes = [animationClass, delayClass, isVisible ? styles.visible : '', className]
    .filter(Boolean)
    .join(' ')

  return (
    <div ref={ref} className={classes}>
      {children}
    </div>
  )
}
