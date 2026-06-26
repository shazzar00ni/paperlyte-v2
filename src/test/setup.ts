import { expect, afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import * as matchers from '@testing-library/jest-dom/matchers'
// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers)

// Cleanup after each test (only in jsdom environment)
afterEach(() => {
  if (typeof window !== 'undefined') {
    cleanup()
  }
})

// Mock IntersectionObserver (not available in jsdom)
// Only set up if we're in a browser-like environment
if (typeof global !== 'undefined' && typeof window !== 'undefined') {
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
}
