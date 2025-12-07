import { useEffect, useState, useRef } from 'react'
import { useIntersectionObserver } from '@hooks/useIntersectionObserver'
import { useReducedMotion } from '@hooks/useReducedMotion'
import styles from './CounterAnimation.module.css'

/**
 * Props for the CounterAnimation component
 */
interface CounterAnimationProps {
  /** Target number to count to */
  end: number
  /** Starting number (default: 0) */
  start?: number
  /** Duration of the animation in milliseconds (default: 2000) */
  duration?: number
  /** Prefix to display before the number (e.g., "$") */
  prefix?: string
  /** Suffix to display after the number (e.g., "+", "%") */
  suffix?: string
  /** Number of decimal places to show (default: 0) */
  decimals?: number
  /** Additional CSS class names */
  className?: string
  /**
   * Easing function to use
   * @default 'easeOutQuart'
   */
  easing?: 'linear' | 'easeOutQuart' | 'easeOutExpo'
  /** Whether to add thousands separator (default: true) */
  separator?: boolean
}

/**
 * Easing functions for smooth animations
 */
const easingFunctions = {
  linear: (t: number) => t,
  easeOutQuart: (t: number) => 1 - Math.pow(1 - t, 4),
  easeOutExpo: (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
}

/**
 * Format number with thousands separator
 */
const formatNumber = (num: number, decimals: number, separator: boolean): string => {
  const fixed = num.toFixed(decimals)
  if (!separator) return fixed

  const parts = fixed.split('.')
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return parts.join('.')
}

/**
 * Component that animates a number counting up from start to end
 *
 * Uses requestAnimationFrame for smooth 60fps performance.
 * Triggers when element scrolls into view using Intersection Observer.
 * Respects prefers-reduced-motion for accessibility.
 *
 * @example
 * ```tsx
 * // Simple counter
 * <CounterAnimation end={1000} />
 *
 * // Currency counter
 * <CounterAnimation end={99.99} prefix="$" decimals={2} />
 *
 * // Percentage counter
 * <CounterAnimation end={99} suffix="%" duration={3000} />
 *
 * // Large number with custom easing
 * <CounterAnimation end={10000000} easing="easeOutExpo" suffix="+" />
 * ```
 */
export const CounterAnimation = ({
  end,
  start = 0,
  duration = 2000,
  prefix = '',
  suffix = '',
  decimals = 0,
  className = '',
  easing = 'easeOutQuart',
  separator = true,
}: CounterAnimationProps): React.ReactElement => {
  const [animatedValue, setAnimatedValue] = useState(start)
  const { ref, isVisible } = useIntersectionObserver({ threshold: 0.3 })
  const prefersReducedMotion = useReducedMotion()
  const hasAnimated = useRef(false)
  const rafId = useRef<number | null>(null)
  const startTime = useRef<number | null>(null)

  useEffect(() => {
    // Skip animation if reduced motion is preferred
    if (prefersReducedMotion) {
      return
    }

    // Start animation when visible (and only once)
    if (isVisible && !hasAnimated.current) {
      hasAnimated.current = true
      startTime.current = null

      // Capture current props values at animation start time
      const animDuration = duration
      const animEnd = end
      const animStart = start
      const animEasing = easing

      const animate = (timestamp: number) => {
        if (startTime.current === null) {
          startTime.current = timestamp
        }

        const elapsed = timestamp - startTime.current
        const progress = Math.min(elapsed / animDuration, 1)
        const easedProgress = easingFunctions[animEasing](progress)
        const currentValue = animStart + (animEnd - animStart) * easedProgress

        setAnimatedValue(currentValue)

        if (progress < 1) {
          rafId.current = requestAnimationFrame(animate)
        }
      }

      rafId.current = requestAnimationFrame(animate)
    }

    return () => {
      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current)
      }
    }
  }, [isVisible, prefersReducedMotion, end, duration, start, easing])

  // Compute display value: use end value if reduced motion, otherwise use animated value
  const displayValue = prefersReducedMotion ? end : animatedValue
  const formattedValue = formatNumber(displayValue, decimals, separator)

  return (
    <span ref={ref} className={`${styles.counter} ${className}`} aria-label={`${prefix}${end}${suffix}`}>
      <span aria-hidden="true">
        {prefix}
        {formattedValue}
        {suffix}
      </span>
    </span>
  )
}
