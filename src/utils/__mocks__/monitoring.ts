/**
 * Canonical manual mock for `./monitoring`.
 *
 * Picked up automatically by any test file that calls `vi.mock('@utils/monitoring')`
 * with no factory. See `./analytics.ts` in this same directory for why a shared
 * mock file — rather than a per-file factory — matters when the module registry
 * is shared across test files.
 */
import { vi } from 'vitest'

export const logError = vi.fn()
export const logWarning = vi.fn()
export const logPerformance = vi.fn()
export const logEvent = vi.fn()
