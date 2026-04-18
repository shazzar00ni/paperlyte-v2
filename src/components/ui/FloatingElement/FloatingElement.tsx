import { type ReactNode, useRef } from 'react'
import { useReducedMotion } from '@hooks/useReducedMotion'
import { useIntersectionObserver } from '@hooks/useIntersectionObserver'
import styles from './FloatingElement.module.css'

/**
 * Props for the FloatingElement component
 */
interface FloatingElementProps {
  /** Content to float */
  children: ReactNode
  /**
   * Animation duration in seconds
   * @default 3
   */
  duration?: number
  /**
   * Delay before animation starts in seconds
   * @default 0
   */
  delay?: number
  /**
   * Floating distance in pixels (amplitude of the float)
   * @default 20
   */
  distance?: number
  /**
   * Direction of the float animation
   * @default 'vertical'
   */
  direction?: 'vertical' | 'horizontal' | 'circular'
  /** Additional CSS class names */
  className?: string
  /**
   * Whether to pause animation when out of viewport
   * @default true
   */
  pauseWhenHidden?: boolean
}

/**
 * Component that creates a gentle floating animation effect
 *
 * Uses CSS animations with GPU-accelerated transforms for performance.
 * Automatically pauses when out of viewport to save CPU.
 * Respects prefers-reduced-motion for accessibility.
 *
 * @example
 * ```tsx
 * // Gentle vertical float
 * <FloatingElement duration={4} distance={15}>
 *   <div className="floating-icon">🌟</div>
 * </FloatingElement>
 *
 * // Fast horizontal float with delay
 * <FloatingElement direction="horizontal" duration={2} delay={0.5}>
 *   <span>→</span>
 * </FloatingElement>
 *
 * // Circular orbit
 * <FloatingElement direction="circular" duration={8} distance={30}>
 *   <div className="orbiting-element" />
 * </FloatingElement>
 * ```
 */
export const FloatingElement = ({
  children,
  duration = 3,
  delay = 0,
  distance = 20,
  direction = 'vertical',
  className = '',
  pauseWhenHidden = true,
}: FloatingElementProps): React.ReactElement => {
  const prefersReducedMotion = useReducedMotion()
  const { ref, isVisible } = useIntersectionObserver({
    threshold: 0,
    triggerOnce: false,
  })

  const containerRef = useRef<HTMLDivElement>(null)

  // Derive isPaused from isVisible - no effect needed, just compute during render
  const isPaused = pauseWhenHidden && !isVisible

  // If user prefers reduced motion, don't animate
  if (prefersReducedMotion) {
    return (
      <div ref={ref} className={className}>
        {children}
      </div>
    )
  }

  const animationClass =
    direction === 'vertical'
      ? styles.floatVertical
      : direction === 'horizontal'
        ? styles.floatHorizontal
        : styles.floatCircular

  const elementClasses = [styles.floating, animationClass, isPaused ? styles.paused : '', className]
    .filter(Boolean)
    .join(' ')

  return (
    <div ref={ref}>
      <div
        ref={containerRef}
        className={elementClasses}
        style={{
          ['--float-duration' as string]: `${duration}s`,
          ['--float-delay' as string]: `${delay}s`,
          ['--float-distance' as string]: `${distance}px`,
        }}
      >
        {children}
      </div>
    </div>
  )
}
