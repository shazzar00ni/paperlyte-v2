import { useMediaQuery } from './useMediaQuery'

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
export const useReducedMotion = (): boolean =>
  useMediaQuery('(prefers-reduced-motion: reduce)')
