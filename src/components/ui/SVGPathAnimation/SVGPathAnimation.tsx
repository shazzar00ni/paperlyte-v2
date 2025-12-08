import { type ReactNode, type ReactElement, useEffect, useRef, useState, Children, cloneElement, isValidElement } from 'react'
import { useIntersectionObserver } from '@hooks/useIntersectionObserver'
import { useReducedMotion } from '@hooks/useReducedMotion'
import styles from './SVGPathAnimation.module.css'

/**
 * Props for the SVGPathAnimation component
 */
interface SVGPathAnimationProps {
  /**
   * SVG content to animate (should contain <path> elements)
   * The component will automatically measure and animate path lengths
   */
  children: ReactNode
  /**
   * Animation duration in milliseconds
   * @default 2000
   */
  duration?: number
  /**
   * Delay before animation starts in milliseconds
   * @default 0
   */
  delay?: number
  /**
   * CSS timing function for the animation
   * @default 'ease-out'
   */
  easing?: string
  /**
   * Width of the SVG viewBox
   * @default 100
   */
  width?: number
  /**
   * Height of the SVG viewBox
   * @default 100
   */
  height?: number
  /** Additional CSS class names */
  className?: string
  /**
   * Stroke color for the paths
   * @default 'currentColor'
   */
  strokeColor?: string
  /**
   * Stroke width for the paths
   * @default 2
   */
  strokeWidth?: number
  /**
   * Fill color for the paths (applies after draw completes)
   * @default 'none'
   */
  fillColor?: string
  /**
   * Whether to animate fill after stroke completes
   * @default false
   */
  animateFill?: boolean
}

/**
 * Component that animates SVG paths with a drawing effect
 *
 * Uses stroke-dasharray and stroke-dashoffset for the drawing animation.
 * Automatically calculates path lengths using element.getTotalLength().
 * Respects prefers-reduced-motion for accessibility.
 *
 * @example
 * ```tsx
 * // Simple path draw
 * <SVGPathAnimation duration={1500}>
 *   <path d="M10 10 L90 90" />
 * </SVGPathAnimation>
 *
 * // Complex shape with fill
 * <SVGPathAnimation
 *   width={200}
 *   height={200}
 *   strokeColor="#7c3aed"
 *   fillColor="#7c3aed"
 *   animateFill
 * >
 *   <path d="M100 10 L190 90 L10 90 Z" />
 * </SVGPathAnimation>
 *
 * // Multiple paths with staggered animation
 * <SVGPathAnimation duration={2000} delay={500}>
 *   <path d="M10 50 Q50 10 90 50" />
 *   <path d="M10 70 Q50 110 90 70" />
 * </SVGPathAnimation>
 * ```
 */
export const SVGPathAnimation = ({
  children,
  duration = 2000,
  delay = 0,
  easing = 'ease-out',
  width = 100,
  height = 100,
  className = '',
  strokeColor = 'currentColor',
  strokeWidth = 2,
  fillColor = 'none',
  animateFill = false,
}: SVGPathAnimationProps): React.ReactElement => {
  const { ref, isVisible } = useIntersectionObserver({ threshold: 0.3 })
  const prefersReducedMotion = useReducedMotion()
  const svgRef = useRef<SVGSVGElement>(null)
  const [pathLengths, setPathLengths] = useState<number[]>([])
  const [isAnimating, setIsAnimating] = useState(false)
  const [isComplete, setIsComplete] = useState(false)

  // Calculate path lengths after mount
  useEffect(() => {
    if (svgRef.current) {
      const paths = svgRef.current.querySelectorAll('path')
      const lengths = Array.from(paths).map((path) => {
        try {
          return path.getTotalLength()
        } catch {
          // Fallback for paths that can't calculate length
          return 1000
        }
      })
      setPathLengths(lengths)
    }
  }, [children])

  // Start animation when visible
  useEffect(() => {
    if (prefersReducedMotion) {
      // No timers; SVG is rendered directly in its final state via showFinalState
      return
    }

    let delayTimer: ReturnType<typeof setTimeout> | null = null
    let animationTimer: ReturnType<typeof setTimeout> | null = null

    if (isVisible && pathLengths.length > 0 && !isAnimating && !isComplete) {
      delayTimer = setTimeout(() => {
        setIsAnimating(true)
        // Mark as complete after animation finishes
        animationTimer = setTimeout(() => {
          setIsAnimating(false)
          setIsComplete(true)
        }, duration)
      }, delay)
    }

    return () => {
      if (delayTimer !== null) {
        clearTimeout(delayTimer)
      }
      if (animationTimer !== null) {
        clearTimeout(animationTimer)
      }
    }
  }, [isVisible, pathLengths, delay, duration, isAnimating, isComplete, prefersReducedMotion])

  // If user prefers reduced motion, show completed state immediately
  const showFinalState = prefersReducedMotion || isComplete
  const containerClasses = [styles.container, isAnimating ? styles.animating : '', className]
    .filter(Boolean)
    .join(' ')

  return (
    <div ref={ref} className={containerClasses}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
        className={styles.svg}
        style={
          {
            ['--draw-duration' as string]: `${duration}ms`,
            ['--draw-easing' as string]: easing,
          } as React.CSSProperties
        }
        aria-hidden="true"
      >
        <g
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          fill={showFinalState && animateFill ? fillColor : 'none'}
          strokeLinecap="round"
          strokeLinejoin="round"
          className={showFinalState && animateFill ? styles.filled : ''}
        >
          {/* Clone children and apply animation styles to paths */}
          {Children.map(children, (child, index) => {
            if (!isValidElement(child)) {
              return child
            }

            const pathLength = pathLengths[index] ?? 0
            const childProps = child.props as { className?: string }
            const existingClassName = childProps.className || ''
            const animatingClassName = isAnimating ? styles.drawing : ''
            const mergedClassName = [existingClassName, animatingClassName].filter(Boolean).join(' ')

            // Cast to ReactElement with SVG props to satisfy TypeScript
            const svgChild = child as ReactElement<React.SVGProps<SVGPathElement>>
            return cloneElement(svgChild, {
              style: pathLength
                ? ({
                    ['--path-length' as string]: pathLength,
                    strokeDasharray: pathLength,
                    strokeDashoffset: showFinalState ? 0 : pathLength,
                  } as React.CSSProperties)
                : undefined,
              className: mergedClassName || undefined,
            })
          })}
        </g>
      </svg>
    </div>
  )
}
