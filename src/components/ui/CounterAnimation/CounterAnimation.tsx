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
  /**
   * Minimum width to prevent layout shift during animation.
   * If not provided, automatically calculated based on the final formatted value.
   * Accepts any valid CSS width value (e.g., "4ch", "80px", "5em")
   */
  minWidth?: string
}

/** Type for easing functions */
type EasingFunction = (num: number) => number

/** Default easing function name */
const DEFAULT_EASING_NAME = 'easeOutQuart'

/** Linear easing - constant rate of change */
const linearEasing: EasingFunction = (progress) => progress

/** Ease out quart - decelerating to zero velocity */
const easeOutQuartEasing: EasingFunction = (progress) => 1 - Math.pow(1 - progress, 4)

/** Ease out expo - exponential deceleration */
const easeOutExpoEasing: EasingFunction = (progress) =>
  progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress)

/**
 * Map of easing functions for smooth animations.
 * Using a Map instead of an object prevents prototype pollution attacks
 * and eliminates generic object injection sink vulnerabilities.
 */
const easingFunctionsMap: ReadonlyMap<string, EasingFunction> = new Map([
  ['linear', linearEasing],
  ['easeOutQuart', easeOutQuartEasing],
  ['easeOutExpo', easeOutExpoEasing],
])

/**
 * Safely retrieves an easing function by name.
 * Uses a Map for O(1) lookup without prototype chain risks.
 *
 * @param easingName - The name of the easing function to retrieve
 * @returns The easing function, or the default easing if the name is invalid
 */
function getEasingFunction(easingName: string): EasingFunction {
  const easingFn = easingFunctionsMap.get(easingName)
  if (easingFn) {
    return easingFn
  }

  console.warn(`Invalid easing function "${easingName}", falling back to "${DEFAULT_EASING_NAME}"`)
  // Non-null assertion is safe here because DEFAULT_EASING_NAME is a known key
  return easingFunctionsMap.get(DEFAULT_EASING_NAME) ?? linearEasing
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
  minWidth,
}: CounterAnimationProps): React.ReactElement => {
  const [animatedValue, setAnimatedValue] = useState(start)
  const { ref, isVisible } = useIntersectionObserver<HTMLOutputElement>({ threshold: 0.3 })
  const prefersReducedMotion = useReducedMotion()
  const hasAnimated = useRef(false)
  const rafId = useRef<number | null>(null)
  const startTime = useRef<number | null>(null)

  // Clamp duration to non-negative to avoid division by zero or infinite loops
  const safeDuration = Math.max(0, duration)

  useEffect(() => {
    // Skip animation if reduced motion is preferred or duration is 0
    if (prefersReducedMotion || safeDuration === 0) {
      return
    }

    // Start animation when visible (and only once)
    if (isVisible && !hasAnimated.current) {
      hasAnimated.current = true
      startTime.current = null

      // Capture current props values at animation start time
      const animDuration = safeDuration
      const animEnd = end
      const animStart = start
      // Safely retrieve easing function with runtime validation
      const easingFn = getEasingFunction(easing)

      const animate = (timestamp: number) => {
        if (startTime.current === null) {
          startTime.current = timestamp
        }

        const elapsed = timestamp - startTime.current
        const progress = Math.min(elapsed / animDuration, 1)
        const easedProgress = easingFn(progress)
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
  }, [isVisible, prefersReducedMotion, end, safeDuration, start, easing])

  // Compute display value: use end value if reduced motion or zero duration, otherwise use animated value
  const displayValue = prefersReducedMotion || safeDuration === 0 ? end : animatedValue
  const formattedValue = formatNumber(displayValue, decimals, separator)

  // Calculate minimum width based on final formatted value to prevent layout shift
  // Uses ch units (width of "0" character) with a small buffer for non-monospace fonts
  const calculatedMinWidth = (() => {
    const finalFormatted = formatNumber(end, decimals, separator)
    const totalChars = prefix.length + finalFormatted.length + suffix.length
    // Add 0.5ch buffer for font variations and rounding
    return `${totalChars + 0.5}ch`
  })()

  const effectiveMinWidth = minWidth ?? calculatedMinWidth

  return (
    <output
      ref={ref}
      className={`${styles.counter} ${className}`}
      aria-live="polite"
      aria-label={`${prefix}${formatNumber(end, decimals, separator)}${suffix}`}
      style={{ minWidth: effectiveMinWidth }}
    >
      <span aria-hidden="true">
        {prefix}
        {formattedValue}
        {suffix}
      </span>
    </output>
  )
}
