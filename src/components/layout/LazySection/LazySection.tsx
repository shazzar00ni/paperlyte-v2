import { Suspense, lazy, type ComponentType } from 'react'
import { ErrorBoundary } from '@components/ErrorBoundary'

/** Dynamic import resolving to a module whose `default` export is the section component. */
type SectionLoader = () => Promise<{ default: ComponentType }>

/**
 * Creates a code-split section component, pairing `React.lazy` with `Suspense`
 * and an `ErrorBoundary` in a single place.
 *
 * Call this at module scope so the returned component has a stable identity: a
 * failed load renders nothing (empty fallback) instead of crashing the page,
 * and a pending load renders nothing until the chunk arrives.
 *
 * @param load - Dynamic import resolving to `{ default: Component }`.
 * @returns A component that renders the lazily-loaded section behind the boundaries.
 */
export function createLazySection(load: SectionLoader): ComponentType {
  const LazyComponent = lazy(load)

  return function LazySection(): React.ReactElement {
    return (
      <ErrorBoundary fallback={<></>}>
        <Suspense fallback={null}>
          <LazyComponent />
        </Suspense>
      </ErrorBoundary>
    )
  }
}
