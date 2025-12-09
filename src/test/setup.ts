import { expect, afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import * as matchers from '@testing-library/jest-dom/matchers'

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

// Mock SVGPathElement (not fully implemented in jsdom)
// Note: Tests can override getTotalLength using Object.defineProperty on the prototype
if (typeof SVGPathElement === 'undefined') {
  // @ts-expect-error - SVGPathElement is not defined in jsdom
  global.SVGPathElement = class SVGPathElement extends SVGElement {}
}

// Add getTotalLength as a configurable property so tests can override it
if (typeof SVGPathElement !== 'undefined' && typeof SVGPathElement.prototype.getTotalLength === 'undefined') {
  Object.defineProperty(SVGPathElement.prototype, 'getTotalLength', {
    writable: true,
    configurable: true,
    value: function () {
      return 100
    },
  })
}
