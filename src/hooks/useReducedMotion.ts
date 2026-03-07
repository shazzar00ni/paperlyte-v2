import { useEffect, useState } from 'react'

/**
 * Hook to detect if user has enabled reduced motion in their system preferences
 * Respects the prefers-reduced-motion media query for accessibility
 * Automatically updates when system preference changes
 *
 * @returns Boolean indicating whether user prefers reduced motion
 *
 * @example
 * ```tsx
 * const prefersReducedMotion = useReducedMotion()
 *
 * return (
 *   <div className={prefersReducedMotion ? 'no-animation' : 'animated'}>
 *     Content
 *   </div>
 * )
 * ```
 */
export const useReducedMotion = (): boolean => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  })

  useEffect(() => {
    if (typeof window === 'undefined') return

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')

    const listener = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches)
    }

    mediaQuery.addEventListener('change', listener)
    return () => mediaQuery.removeEventListener('change', listener)
  }, [])

  return prefersReducedMotion
}
