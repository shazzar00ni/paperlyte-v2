import { useEffect, useState, useRef, useCallback } from 'react'

/**
 * Get current scroll position values
 */
const getScrollPosition = () => {
  if (typeof window === 'undefined') {
    return { scrollX: 0, scrollY: 0, scrollProgress: 0 }
  }

  const scrollX = window.scrollX
  const scrollY = window.scrollY
  const documentHeight = document.documentElement.scrollHeight - window.innerHeight
  const scrollProgress = documentHeight > 0 ? scrollY / documentHeight : 0

  return {
    scrollX,
    scrollY,
    scrollProgress: Math.min(1, Math.max(0, scrollProgress)),
  }
}

/**
 * Custom hook that tracks scroll position with optimized performance using requestAnimationFrame
 *
 * This hook is designed for scroll-based animations like parallax effects.
 * It uses requestAnimationFrame to ensure smooth 60fps performance and
 * automatically cleans up listeners on unmount.
 *
 * @returns Object containing current scroll position (x, y) and scroll progress (0-1)
 *
 * @example
 * ```tsx
 * const MyComponent = () => {
 *   const { scrollY, scrollProgress } = useScrollPosition();
 *
 *   return (
 *     <div style={{ transform: `translateY(${scrollY * 0.5}px)` }}>
 *       Parallax element (scrolled {Math.round(scrollProgress * 100)}%)
 *     </div>
 *   );
 * };
 * ```
 */
export const useScrollPosition = () => {
  // Initialize with current scroll position
  const [scrollPosition, setScrollPosition] = useState(getScrollPosition)

  const rafId = useRef<number | null>(null)
  const ticking = useRef(false)

  const updateScrollPosition = useCallback(() => {
    setScrollPosition(getScrollPosition())
    ticking.current = false
  }, [])

  const handleScroll = useCallback(() => {
    if (!ticking.current) {
      rafId.current = requestAnimationFrame(updateScrollPosition)
      ticking.current = true
    }
  }, [updateScrollPosition])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current)
      }
    }
  }, [handleScroll])

  return scrollPosition
}
