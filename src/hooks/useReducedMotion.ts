import { useEffect, useState } from 'react'

/**
 * Custom hook that detects if the user has requested reduced motion through system preferences
 *
 * This hook respects the user's 'prefers-reduced-motion' media query setting, which is
 * an accessibility feature that helps users who are sensitive to animations and motion.
 *
 * @returns Boolean indicating if user prefers reduced motion (true = reduce motion, false = allow motion)
 *
 * @example
 * ```tsx
 * const MyComponent = () => {
 *   const prefersReducedMotion = useReducedMotion();
 *
 *   return (
 *     <div className={prefersReducedMotion ? 'no-animation' : 'with-animation'}>
 *       Content
 *     </div>
 *   );
 * };
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
