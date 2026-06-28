import { Suspense, type ReactNode } from 'react'
import { ErrorBoundary } from '@components/ErrorBoundary'

interface LazySectionProps {
  /** The lazily-loaded section content to render. */
  children: ReactNode
}

/**
 * Wraps a lazily-loaded section in an ErrorBoundary and Suspense boundary.
 *
 * Centralizes the boilerplate previously repeated for every code-split section
 * in `App.tsx`: a failed load renders nothing (empty fallback) instead of
 * crashing the page, and a pending load renders nothing until ready.
 *
 * @param props - Component props.
 * @param props.children - The lazily-loaded section content to render.
 * @returns The children wrapped in error and suspense boundaries.
 */
export function LazySection({ children }: LazySectionProps): React.ReactElement {
  return (
    <ErrorBoundary fallback={<></>}>
      <Suspense fallback={null}>{children}</Suspense>
    </ErrorBoundary>
  )
}
