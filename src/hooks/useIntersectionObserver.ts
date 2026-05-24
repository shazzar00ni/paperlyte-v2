import { useEffect, useRef, useState } from 'react'

interface UseIntersectionObserverOptions {
  threshold?: number
  rootMargin?: string
  triggerOnce?: boolean
}

/**
 * Hook to detect when an element becomes visible in the viewport using Intersection Observer API
 * Useful for triggering animations, lazy loading, or analytics when elements scroll into view
 *
 * @template T - The HTMLElement type (default: HTMLDivElement)
 * @param options - Configuration options
 * @param options.threshold - Percentage of element visibility required to trigger (0-1, default: 0.1)
 * @param options.rootMargin - Margin around viewport for early/late triggering (default: '0px')
 * @param options.triggerOnce - Whether to trigger only once and then disconnect (default: true)
 * @returns Object containing ref to attach to element and isVisible boolean state
 *
 * @example
 * ```tsx
 * const { ref, isVisible } = useIntersectionObserver({ threshold: 0.5 })
 *
 * return (
 *   <div ref={ref} className={isVisible ? 'animate-in' : ''}>
 *     Content appears when 50% visible
 *   </div>
 * )
 * ```
 */
export const useIntersectionObserver = <T extends HTMLElement = HTMLDivElement>(
  options: UseIntersectionObserverOptions = {}
) => {
  const { threshold = 0.1, rootMargin = '0px', triggerOnce = true } = options
  const ref = useRef<T>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          if (triggerOnce && ref.current) {
            observer.unobserve(ref.current)
          }
        } else if (!triggerOnce) {
          setIsVisible(false)
        }
      },
      { threshold, rootMargin }
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
  }, [threshold, rootMargin, triggerOnce])

  return { ref, isVisible }
}
