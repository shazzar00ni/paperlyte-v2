import { expect, afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import * as matchers from '@testing-library/jest-dom/matchers'
// Import icon library to initialize Font Awesome icons for tests
import '@utils/iconLibrary'

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers)

// Cleanup after each test
afterEach(() => {
  cleanup()
})

// Mock IntersectionObserver (not available in jsdom).
// The callback is invoked synchronously with isIntersecting: true so that
// AnimatedElement (and any other component that uses useIntersectionObserver)
// renders its visible state immediately, preventing race-condition flakiness
// in tests that assert on content inside animated wrappers.
global.IntersectionObserver = class IntersectionObserver {
  private callback: IntersectionObserverCallback

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback
  }

  observe(target: Element) {
    // Fire the callback synchronously so isVisible becomes true right away
    this.callback(
      [
        {
          isIntersecting: true,
          target,
          boundingClientRect: target.getBoundingClientRect(),
          intersectionRatio: 1,
          intersectionRect: target.getBoundingClientRect(),
          rootBounds: null,
          time: Date.now(),
        } as IntersectionObserverEntry,
      ],
      this
    )
  }

  disconnect() {}
  unobserve() {}
  takeRecords(): IntersectionObserverEntry[] {
    return []
  }
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
