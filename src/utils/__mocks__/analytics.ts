/**
 * Canonical manual mock for `./analytics`.
 *
 * Picked up automatically by any test file that calls `vi.mock('./analytics')`
 * (or the `@utils/analytics` alias) with no factory. Centralizing the mock
 * here — instead of each test file supplying its own factory — guarantees
 * every consumer resolves to the exact same mock instances even when the
 * module registry is shared across test files (e.g. `vitest --isolate=false`),
 * where competing per-file factories for the same module previously raced
 * and left some files observing a different `trackEvent` spy than the one
 * the code under test actually called.
 */
import { vi } from 'vitest'

const actual = await vi.importActual<typeof import('../analytics')>('../analytics')

export const trackEvent = vi.fn()
export const trackCTAClick = vi.fn()
export const trackExternalLink = vi.fn()
export const trackSocialClick = vi.fn()

export const { AnalyticsEvents, isAnalyticsAvailable, trackPageView, analytics } = actual
