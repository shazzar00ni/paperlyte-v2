import { expect, afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import * as matchers from '@testing-library/jest-dom/matchers'

// Mock the Font Awesome icon library instead of importing it. The real module
// pulls in ~50 named icons from @fortawesome/free-{solid,brands}-svg-icons and
// calls library.add(...) at import time, which dominates per-worker setup cost
// under jsdom + v8 coverage and was the primary cause of CI test timeouts /
// "Timeout terminating forks worker" failures.
vi.mock('@utils/iconLibrary', () => ({
  iconNameMap: {},
  brandIconNames: new Set<string>(),
  validIconNames: new Set<string>(),
  convertIconName: (oldName: string) => oldName.replace(/^fa-/, ''),
  isBrandIcon: () => false,
  isValidIcon: () => true,
}))

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers)

// Cleanup after each test
afterEach(() => {
  cleanup()
})

// Mock IntersectionObserver (not available in jsdom)
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords(): IntersectionObserverEntry[] {
    return []
  }
  unobserve() {}
} as unknown as typeof global.IntersectionObserver

// Mock matchMedia (not available in jsdom)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {}, // deprecated
    removeListener: () => {}, // deprecated
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => true,
  }),
})
