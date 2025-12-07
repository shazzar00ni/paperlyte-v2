import { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import { useReducedMotion } from './useReducedMotion'
import { useMediaQuery } from './useMediaQuery'

/**
 * Options for configuring the parallax effect
 */
interface UseParallaxOptions {
  /**
   * Speed multiplier for the parallax effect
   * - Positive values move slower than scroll (background effect)
   * - Negative values move faster than scroll (foreground effect)
   * - 0 = no parallax, 1 = moves with scroll
   * @default 0.5
   */
  speed?: number
  /**
   * Direction of the parallax movement
   * @default 'vertical'
   */
  direction?: 'vertical' | 'horizontal'
  /**
   * Whether to disable the effect on mobile devices for performance
   * @default true
   */
  disableOnMobile?: boolean
  /**
   * Breakpoint below which to consider "mobile" (in pixels)
   * @default 768
   */
  mobileBreakpoint?: number
}

/**
 * Custom hook that calculates parallax offset based on element position and scroll
 *
 * Uses Intersection Observer to only calculate when element is in viewport,
 * and requestAnimationFrame for smooth 60fps performance. Automatically
 * respects prefers-reduced-motion and can disable on mobile for performance.
 *
 * @param options - Configuration options for the parallax effect
 * @returns Object containing ref, offset value, and whether effect is active
 *
 * @example
 * ```tsx
 * const MyComponent = () => {
 *   const { ref, offset, isActive } = useParallax({ speed: 0.3 });
 *
 *   return (
 *     <div ref={ref}>
 *       <div style={{ transform: `translateY(${offset}px)` }}>
 *         Parallax content
 *       </div>
 *     </div>
 *   );
 * };
 * ```
 */
export const useParallax = (options: UseParallaxOptions = {}) => {
  const {
    speed = 0.5,
    direction = 'vertical',
    disableOnMobile = true,
    mobileBreakpoint = 768,
  } = options

  const ref = useRef<HTMLDivElement>(null)
  const [rawOffset, setRawOffset] = useState(0)
  const [isInView, setIsInView] = useState(false)
  const prefersReducedMotion = useReducedMotion()
  const isMobile = useMediaQuery(`(max-width: ${mobileBreakpoint - 1}px)`)

  const rafId = useRef<number | null>(null)
  const ticking = useRef(false)
  const elementTop = useRef(0)
  const elementHeight = useRef(0)

  // Pre-calculate element dimensions to prevent layout shifts
  const updateDimensions = useCallback(() => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect()
      elementTop.current = rect.top + window.scrollY
      elementHeight.current = rect.height
    }
  }, [])

  // Calculate parallax offset
  const calculateOffset = useCallback(() => {
    if (!ref.current || !isInView) return

    const scrollY = window.scrollY
    const windowHeight = window.innerHeight

    // Calculate how far the element center is from viewport center
    const elementCenter = elementTop.current + elementHeight.current / 2
    const viewportCenter = scrollY + windowHeight / 2
    const distanceFromCenter = elementCenter - viewportCenter

    // Apply parallax speed multiplier
    const parallaxOffset = distanceFromCenter * speed

    setRawOffset(parallaxOffset)
    ticking.current = false
  }, [isInView, speed])

  // Handle scroll with requestAnimationFrame
  const handleScroll = useCallback(() => {
    if (!ticking.current && isInView) {
      rafId.current = requestAnimationFrame(calculateOffset)
      ticking.current = true
    }
  }, [calculateOffset, isInView])

  // Determine if effect should be active
  const isActive = !prefersReducedMotion && !(disableOnMobile && isMobile)

  // Set up Intersection Observer for viewport detection
  useEffect(() => {
    if (!isActive) {
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting)
        if (entry.isIntersecting) {
          updateDimensions()
          calculateOffset()
        }
      },
      { rootMargin: '50px' }
    )

    const currentRef = ref.current
    if (currentRef) {
      observer.observe(currentRef)
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef)
      }
      observer.disconnect()
    }
  }, [isActive, updateDimensions, calculateOffset])

  // Add scroll listener when in view
  useEffect(() => {
    if (!isActive || !isInView) {
      return
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', updateDimensions, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', updateDimensions)
      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current)
      }
    }
  }, [handleScroll, updateDimensions, isInView, isActive])

  // Compute final offset - 0 when inactive, raw value otherwise
  const offset = isActive ? rawOffset : 0

  // Generate transform based on direction
  const transform = useMemo(
    () =>
      direction === 'vertical'
        ? `translate3d(0, ${offset}px, 0)`
        : `translate3d(${offset}px, 0, 0)`,
    [direction, offset]
  )

  return {
    ref,
    offset,
    transform,
    isActive,
    isInView,
  }
}
