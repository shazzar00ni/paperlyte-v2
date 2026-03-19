import { type ReactNode, useEffect } from 'react'
import { useIntersectionObserver } from '@hooks/useIntersectionObserver'
import { useReducedMotion } from '@hooks/useReducedMotion'
import styles from './AnimatedElement.module.css'

interface AnimatedElementProps {
  children: ReactNode
  animation?: 'fadeIn' | 'slideUp' | 'slideInLeft' | 'slideInRight' | 'scale'
  delay?: number
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

  const classes = [animationClass, isVisible ? styles.visible : '', className]
    .filter(Boolean)
    .join(' ')

  // Set CSS custom property for animation delay programmatically
  useEffect(() => {
    if (ref.current) {
      ref.current.style.setProperty('--animation-delay', `${delay}ms`)
    }
    // ref is a stable object and doesn't need to be in dependencies
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [delay])

  return (
    <div ref={ref} className={classes}>
      {children}
    </div>
  )
}
