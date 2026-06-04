import { type ReactNode, memo } from 'react'
import { useIntersectionObserver } from '@hooks/useIntersectionObserver'
import { useReducedMotion } from '@hooks/useReducedMotion'
import styles from './AnimatedElement.module.css'

interface AnimatedElementProps {
  children: ReactNode
  animation?: 'fadeIn' | 'slideUp' | 'slideInLeft' | 'slideInRight' | 'scale'
  delay?: number
  initiallyVisible?: boolean
  threshold?: number
  className?: string
}

/**
 * Animated wrapper component that triggers entrance animations when element becomes visible
 * Uses Intersection Observer API for performance-optimized scroll-triggered animations
 * Respects user's prefers-reduced-motion preference for accessibility
 *
 * @param props - AnimatedElement component props
 * @param props.children - Content to animate
 * @param props.animation - Animation type to apply (default: 'fadeIn')
 * @param props.delay - Animation delay in milliseconds (default: 0)
 * @param props.threshold - Intersection Observer threshold 0-1 (default: 0.1)
 * @param props.className - Additional CSS classes
 * @param props.initiallyVisible - Render visible immediately for above-the-fold content
 * @returns A div wrapper with scroll-triggered animation
 *
 * @example
 * ```tsx
 * // Basic fade-in animation
 * <AnimatedElement animation="fadeIn">
 *   <h1>Hello World</h1>
 * </AnimatedElement>
 *
 * // Staggered animations with delay
 * <AnimatedElement animation="slideUp" delay={200}>
 *   <p>This appears 200ms after visibility</p>
 * </AnimatedElement>
 * ```
 */
const DELAY_STEPS = [
  0, 75, 100, 150, 200, 225, 250, 300, 350, 375, 400, 450, 500, 600, 700, 800, 900,
] as const

const getDelayClass = (delay: number): string => {
  const normalizedDelay = Math.max(0, delay)
  const nearestDelay = DELAY_STEPS.reduce((nearest, step) =>
    Math.abs(step - normalizedDelay) < Math.abs(nearest - normalizedDelay) ? step : nearest
  )

  return styles[`delay${nearestDelay}`] || ''
}

const AnimatedElementComponent = ({
  children,
  animation = 'fadeIn',
  delay = 0,
  threshold = 0.1,
  className = '',
  initiallyVisible = false,
}: AnimatedElementProps): React.ReactElement => {
  const { ref, isVisible } = useIntersectionObserver({
    threshold,
    initialVisible: initiallyVisible,
  })
  const prefersReducedMotion = useReducedMotion()

  const animationClass = prefersReducedMotion ? '' : styles[animation]

  const delayClass = prefersReducedMotion ? '' : getDelayClass(delay)

  const classes = [animationClass, delayClass, isVisible ? styles.visible : '', className]
    .filter(Boolean)
    .join(' ')

  return (
    <div ref={ref} className={classes} data-reduced-motion={prefersReducedMotion}>
      {children}
    </div>
  )
}

export const AnimatedElement = memo(AnimatedElementComponent)
AnimatedElement.displayName = 'AnimatedElement'
