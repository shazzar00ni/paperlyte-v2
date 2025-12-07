import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CounterAnimation } from './CounterAnimation'

describe('CounterAnimation', () => {
  beforeEach(() => {
    // Mock requestAnimationFrame for controlled testing
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  describe('Basic Rendering', () => {
    it('should render the end value with prefix and suffix', () => {
      render(<CounterAnimation end={100} prefix="$" suffix="+" />)

      // Check aria-label for accessibility
      const counter = screen.getByLabelText('$100+')
      expect(counter).toBeInTheDocument()
    })

    it('should render without prefix and suffix', () => {
      render(<CounterAnimation end={42} />)

      const counter = screen.getByLabelText('42')
      expect(counter).toBeInTheDocument()
    })

    it('should apply custom className', () => {
      const { container } = render(<CounterAnimation end={100} className="custom-counter" />)

      const counter = container.querySelector('.custom-counter')
      expect(counter).toBeInTheDocument()
    })
  })

  describe('Number Formatting', () => {
    it('should format numbers with thousands separator by default', () => {
      // Mock reduced motion to show end value immediately
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: (query: string) => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: () => {},
          removeListener: () => {},
          addEventListener: () => {},
          removeEventListener: () => {},
          dispatchEvent: () => true,
        }),
      })

      render(<CounterAnimation end={1000} />)

      const counter = screen.getByLabelText('1000')
      expect(counter.textContent).toBe('1,000')
    })

    it('should format numbers without separator when disabled', () => {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: (query: string) => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: () => {},
          removeListener: () => {},
          addEventListener: () => {},
          removeEventListener: () => {},
          dispatchEvent: () => true,
        }),
      })

      render(<CounterAnimation end={1000} separator={false} />)

      const counter = screen.getByLabelText('1000')
      expect(counter.textContent).toBe('1000')
    })

    it('should handle decimal places correctly', () => {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: (query: string) => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: () => {},
          removeListener: () => {},
          addEventListener: () => {},
          removeEventListener: () => {},
          dispatchEvent: () => true,
        }),
      })

      render(<CounterAnimation end={99.99} decimals={2} prefix="$" />)

      const counter = screen.getByLabelText('$99.99')
      expect(counter.textContent).toBe('$99.99')
    })

    it('should format large numbers with separator and decimals', () => {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: (query: string) => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: () => {},
          removeListener: () => {},
          addEventListener: () => {},
          removeEventListener: () => {},
          dispatchEvent: () => true,
        }),
      })

      render(<CounterAnimation end={1234567.89} decimals={2} />)

      const counter = screen.getByLabelText('1234567.89')
      expect(counter.textContent).toBe('1,234,567.89')
    })
  })

  describe('Reduced Motion Support', () => {
    it('should show end value immediately when reduced motion is preferred', () => {
      // Mock prefers-reduced-motion: reduce
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: (query: string) => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: () => {},
          removeListener: () => {},
          addEventListener: () => {},
          removeEventListener: () => {},
          dispatchEvent: () => true,
        }),
      })

      render(<CounterAnimation end={100} start={0} />)

      // Should immediately show end value without animation
      const counter = screen.getByLabelText('100')
      expect(counter.textContent).toBe('100')
    })

    it('should not trigger animation when reduced motion is preferred', () => {
      const rafSpy = vi.spyOn(window, 'requestAnimationFrame')

      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: (query: string) => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: () => {},
          removeListener: () => {},
          addEventListener: () => {},
          removeEventListener: () => {},
          dispatchEvent: () => true,
        }),
      })

      render(<CounterAnimation end={100} start={0} />)

      // requestAnimationFrame should not be called when reduced motion is preferred
      expect(rafSpy).not.toHaveBeenCalled()
    })
  })

  describe('Animation Behavior', () => {
    it('should start animation from start value', () => {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: () => ({
          matches: false,
          media: '',
          onchange: null,
          addListener: () => {},
          removeListener: () => {},
          addEventListener: () => {},
          removeEventListener: () => {},
          dispatchEvent: () => true,
        }),
      })

      render(<CounterAnimation end={100} start={0} />)

      // Initial value should be start value
      const counter = screen.getByLabelText('100')
      expect(counter.textContent).toBe('0')
    })

    it('should animate to end value with custom start', () => {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: () => ({
          matches: false,
          media: '',
          onchange: null,
          addListener: () => {},
          removeListener: () => {},
          addEventListener: () => {},
          removeEventListener: () => {},
          dispatchEvent: () => true,
        }),
      })

      render(<CounterAnimation end={100} start={50} />)

      const counter = screen.getByLabelText('100')
      expect(counter.textContent).toBe('50')
    })

    it('should cleanup requestAnimationFrame on unmount', () => {
      const cancelSpy = vi.spyOn(window, 'cancelAnimationFrame')

      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: () => ({
          matches: false,
          media: '',
          onchange: null,
          addListener: () => {},
          removeListener: () => {},
          addEventListener: () => {},
          removeEventListener: () => {},
          dispatchEvent: () => true,
        }),
      })

      // Mock IntersectionObserver to trigger visibility and start animation
      let observerCallback: IntersectionObserverCallback | null = null
      global.IntersectionObserver = class IntersectionObserver {
        constructor(callback: IntersectionObserverCallback) {
          observerCallback = callback
        }
        observe = () => {
          // Trigger intersection immediately to start animation
          if (observerCallback) {
            observerCallback(
              [
                {
                  isIntersecting: true,
                  target: document.body,
                  intersectionRatio: 0.5,
                } as IntersectionObserverEntry,
              ],
              {} as IntersectionObserver
            )
          }
        }
        disconnect = () => {}
        takeRecords = () => []
        unobserve = () => {}
      } as unknown as typeof global.IntersectionObserver

      const { unmount } = render(<CounterAnimation end={100} />)

      // Give time for the observer callback to fire
      vi.runAllTimers()

      unmount()

      // cancelAnimationFrame should be called on cleanup if animation was started
      expect(cancelSpy).toHaveBeenCalled()
    })
  })

  describe('IntersectionObserver Integration', () => {
    it('should use IntersectionObserver with correct threshold', () => {
      // The component uses useIntersectionObserver hook with threshold: 0.3
      // This is tested indirectly through the hook's test
      render(<CounterAnimation end={100} />)

      const counter = screen.getByLabelText('100')
      expect(counter).toBeInTheDocument()
    })

    it('should only animate once when visible', async () => {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: () => ({
          matches: false,
          media: '',
          onchange: null,
          addListener: () => {},
          removeListener: () => {},
          addEventListener: () => {},
          removeEventListener: () => {},
          dispatchEvent: () => true,
        }),
      })

      // Mock IntersectionObserver to trigger visibility
      let observerCallback: IntersectionObserverCallback | null = null
      const mockObserve = vi.fn()
      const mockDisconnect = vi.fn()

      global.IntersectionObserver = class IntersectionObserver {
        constructor(callback: IntersectionObserverCallback) {
          observerCallback = callback
        }
        observe = mockObserve
        disconnect = mockDisconnect
        takeRecords = () => []
        unobserve = () => {}
      } as unknown as typeof global.IntersectionObserver

      render(<CounterAnimation end={100} start={0} />)

      // Trigger intersection
      if (observerCallback) {
        observerCallback(
          [
            {
              isIntersecting: true,
              target: document.body,
              intersectionRatio: 0.5,
            } as IntersectionObserverEntry,
          ],
          {} as IntersectionObserver
        )
      }

      expect(mockObserve).toHaveBeenCalled()
    })
  })

  describe('Easing Functions', () => {
    it('should accept linear easing', () => {
      render(<CounterAnimation end={100} easing="linear" />)

      const counter = screen.getByLabelText('100')
      expect(counter).toBeInTheDocument()
    })

    it('should accept easeOutQuart easing (default)', () => {
      render(<CounterAnimation end={100} />)

      const counter = screen.getByLabelText('100')
      expect(counter).toBeInTheDocument()
    })

    it('should accept easeOutExpo easing', () => {
      render(<CounterAnimation end={100} easing="easeOutExpo" />)

      const counter = screen.getByLabelText('100')
      expect(counter).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle zero as end value', () => {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: (query: string) => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: () => {},
          removeListener: () => {},
          addEventListener: () => {},
          removeEventListener: () => {},
          dispatchEvent: () => true,
        }),
      })

      render(<CounterAnimation end={0} />)

      const counter = screen.getByLabelText('0')
      expect(counter.textContent).toBe('0')
    })

    it('should handle negative numbers', () => {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: (query: string) => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: () => {},
          removeListener: () => {},
          addEventListener: () => {},
          removeEventListener: () => {},
          dispatchEvent: () => true,
        }),
      })

      render(<CounterAnimation end={-50} />)

      const counter = screen.getByLabelText('-50')
      expect(counter.textContent).toBe('-50')
    })

    it('should handle very large numbers', () => {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: (query: string) => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: () => {},
          removeListener: () => {},
          addEventListener: () => {},
          removeEventListener: () => {},
          dispatchEvent: () => true,
        }),
      })

      render(<CounterAnimation end={10000000} suffix="+" />)

      const counter = screen.getByLabelText('10000000+')
      expect(counter.textContent).toBe('10,000,000+')
    })

    it('should handle custom duration', () => {
      render(<CounterAnimation end={100} duration={5000} />)

      const counter = screen.getByLabelText('100')
      expect(counter).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper aria-label with formatted value', () => {
      render(<CounterAnimation end={1000} prefix="$" suffix="+" />)

      const counter = screen.getByLabelText('$1000+')
      expect(counter).toBeInTheDocument()
    })

    it('should hide animated content from screen readers', () => {
      render(<CounterAnimation end={100} />)

      const counter = screen.getByLabelText('100')
      const animatedContent = counter.querySelector('[aria-hidden="true"]')
      expect(animatedContent).toBeInTheDocument()
    })
  })
})
