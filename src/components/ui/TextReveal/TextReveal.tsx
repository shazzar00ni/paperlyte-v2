import { useMemo } from 'react'
import { useIntersectionObserver } from '@hooks/useIntersectionObserver'
import { useReducedMotion } from '@hooks/useReducedMotion'
import styles from './TextReveal.module.css'

/**
 * Props for the TextReveal component
 */
interface TextRevealProps {
  /** Text content to animate */
  children: string
  /**
   * Animation type
   * - 'character': Reveals each character individually
   * - 'word': Reveals each word individually
   * @default 'word'
   */
  type?: 'character' | 'word'
  /**
   * Base delay before animation starts in milliseconds
   * @default 0
   */
  delay?: number
  /**
   * Stagger delay between each unit (character or word) in milliseconds
   * @default 50
   */
  stagger?: number
  /**
   * Animation effect to use
   * @default 'fadeUp'
   */
  animation?: 'fadeUp' | 'fadeIn' | 'slideUp' | 'blur'
  /** HTML tag to render as */
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span' | 'div'
  /** Additional CSS class names */
  className?: string
  /** Intersection Observer threshold (0-1, default: 0.2) */
  threshold?: number
}

/**
 * Get CSS classes for delay values (CSP compliant)
 * Rounds to nearest predefined delay for performance
 */
const getDelayClass = (index: number, stagger: number, baseDelay: number): string => {
  // Compute delay and ensure it's never negative
  const delay = Math.max(0, baseDelay + index * stagger)
  // Round to nearest 50ms for predefined CSS classes
  const rounded = Math.round(delay / 50) * 50
  // Cap at 2000ms
  const capped = Math.min(rounded, 2000)
  return styles[`delay${capped}`] ?? ''
}

/**
 * Component that animates text revealing character by character or word by word
 *
 * Uses CSS animations with GPU-accelerated transforms for performance.
 * Triggers when element scrolls into view.
 * Respects prefers-reduced-motion for accessibility.
 *
 * @example
 * ```tsx
 * // Word-by-word reveal
 * <TextReveal as="h1">
 *   Welcome to Paperlyte
 * </TextReveal>
 *
 * // Character reveal with custom timing
 * <TextReveal type="character" stagger={30} animation="blur">
 *   Lightning Fast
 * </TextReveal>
 *
 * // Word reveal with delay
 * <TextReveal delay={500} animation="slideUp">
 *   Your thoughts, unchained
 * </TextReveal>
 * ```
 */
export const TextReveal = ({
  children,
  type = 'word',
  delay = 0,
  stagger = 50,
  animation = 'fadeUp',
  as: Component = 'span',
  className = '',
  threshold = 0.2,
}: TextRevealProps): React.ReactElement => {
  // Use HTMLElement generic to support all possible Component element types
  const { ref, isVisible } = useIntersectionObserver<HTMLElement>({ threshold })
  const prefersReducedMotion = useReducedMotion()

  // Split text into units (characters or words)
  const units = useMemo(() => {
    if (type === 'character') {
      return children.split('')
    }
    // Split by spaces but preserve them for proper word spacing
    return children.split(/(\s+)/)
  }, [children, type])

  // Cast ref for compatibility with dynamic element types
  // Safe because all allowed Component types (h1-h4, p, span, div) extend HTMLElement
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const elementRef = ref as React.RefObject<any>

  // If user prefers reduced motion, render plain text
  if (prefersReducedMotion) {
    return (
      <Component ref={elementRef} className={className}>
        {children}
      </Component>
    )
  }

  const validAnimations = new Map<string, string | undefined>([
    ['fadeUp', styles.fadeUp],
    ['fadeIn', styles.fadeIn],
    ['slideUp', styles.slideUp],
    ['blur', styles.blur],
  ])
  const animationClass = validAnimations.get(animation) ?? styles.fadeUp
  const containerClasses = [styles.container, className].filter(Boolean).join(' ')

  return (
    <Component ref={elementRef} className={containerClasses} aria-label={children}>
      {units.map((unit, index) => {
        // Handle whitespace units
        if (/^\s+$/.test(unit)) {
          return (
            <span key={`space-${index}`} className={styles.space}>
              {unit}
            </span>
          )
        }

        const delayClass = getDelayClass(index, stagger, delay)
        const unitClasses = [
          styles.unit,
          animationClass,
          delayClass,
          isVisible ? styles.visible : '',
        ]
          .filter(Boolean)
          .join(' ')

        return (
          <span key={`unit-${index}`} className={unitClasses} aria-hidden="true">
            {unit}
          </span>
        )
      })}
    </Component>
  )
}
