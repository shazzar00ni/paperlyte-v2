import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { CounterAnimation } from './CounterAnimation'

/**
 * Helper to mock matchMedia with reduced motion preference
 */
const mockReducedMotion = (prefersReduced: boolean) => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: prefersReduced && query === '(prefers-reduced-motion: reduce)',
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => true,
    }),
  })
}

/**
 * Helper to create IntersectionObserver mock with configurable behavior
 */
const mockIntersectionObserver = (triggerImmediately = false, spyOnMethods = false) => {
  let observerCallback: IntersectionObserverCallback | null = null
  const mockObserve = spyOnMethods ? vi.fn() : () => {}
  const mockDisconnect = spyOnMethods ? vi.fn() : () => {}

  // Shared helper to trigger intersection callback
  const triggerIntersectionCallback = () => {
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

  const observeFunction = () => {
    if (spyOnMethods) mockObserve()
    if (triggerImmediately) {
      triggerIntersectionCallback()
    }
  }

  global.IntersectionObserver = class IntersectionObserver {
    constructor(callback: IntersectionObserverCallback) {
      observerCallback = callback
    }
    observe = observeFunction
    disconnect = () => {
      if (spyOnMethods) mockDisconnect()
    }
    takeRecords = () => []
    unobserve = () => {}
  } as unknown as typeof global.IntersectionObserver

  return {
    mockObserve: spyOnMethods ? mockObserve : undefined,
    mockDisconnect: spyOnMethods ? mockDisconnect : undefined,
    triggerIntersection: triggerIntersectionCallback,
  }
}

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
      mockReducedMotion(true)
      render(<CounterAnimation end={1000} />)

      const counter = screen.getByLabelText('1000')
      expect(counter.textContent).toBe('1,000')
    })

    it('should format numbers without separator when disabled', () => {
      mockReducedMotion(true)
      render(<CounterAnimation end={1000} separator={false} />)

      const counter = screen.getByLabelText('1000')
      expect(counter.textContent).toBe('1000')
    })

    it('should handle decimal places correctly', () => {
      mockReducedMotion(true)
      render(<CounterAnimation end={99.99} decimals={2} prefix="$" />)

      const counter = screen.getByLabelText('$99.99')
      expect(counter.textContent).toBe('$99.99')
    })

    it('should format large numbers with separator and decimals', () => {
      mockReducedMotion(true)
      render(<CounterAnimation end={1234567.89} decimals={2} />)

      const counter = screen.getByLabelText('1234567.89')
      expect(counter.textContent).toBe('1,234,567.89')
    })
  })

  describe('Reduced Motion Support', () => {
    it('should show end value immediately when reduced motion is preferred', () => {
      mockReducedMotion(true)
      render(<CounterAnimation end={100} start={0} />)

      // Should immediately show end value without animation
      const counter = screen.getByLabelText('100')
      expect(counter.textContent).toBe('100')
    })

    it('should not trigger animation when reduced motion is preferred', () => {
      const rafSpy = vi.spyOn(window, 'requestAnimationFrame')
      mockReducedMotion(true)
      mockIntersectionObserver(true) // Trigger intersection to make element visible

      render(<CounterAnimation end={100} start={0} />)

      // requestAnimationFrame should not be called when reduced motion is preferred
      // even when element is visible
      expect(rafSpy).not.toHaveBeenCalled()
    })
  })

  describe('Animation Behavior', () => {
    it('should start animation from start value', () => {
      mockReducedMotion(false)
      mockIntersectionObserver(false) // Don't trigger immediately to check initial state

      render(<CounterAnimation end={100} start={0} />)

      // Initial value should be start value before animation starts
      const counter = screen.getByLabelText('100')
      expect(counter.textContent).toBe('0')
    })

    it('should animate to end value with custom start', () => {
      mockReducedMotion(false)
      mockIntersectionObserver(false) // Don't trigger immediately to check initial state

      render(<CounterAnimation end={100} start={50} />)

      // Initial value should be custom start value before animation starts
      const counter = screen.getByLabelText('100')
      expect(counter.textContent).toBe('50')
    })

    it('should animate through intermediate values', async () => {
      mockReducedMotion(false)
      mockIntersectionObserver(true)

      let rafCallback: FrameRequestCallback | null = null
      vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
        rafCallback = cb
        return 1
      })

      render(<CounterAnimation end={100} start={0} easing="linear" duration={1000} />)

      const counter = screen.getByLabelText('100')

      // Start: should be 0
      expect(counter.textContent).toBe('0')

      // Simulate animation frames at different timestamps
      if (rafCallback) {
        act(() => {
          rafCallback!(0) // Start time: t=0ms, progress=0, value=0
        })
        expect(counter.textContent).toBe('0')

        act(() => {
          rafCallback!(250) // t=250ms, progress=0.25, value=25
        })
        expect(counter.textContent).toBe('25')

        act(() => {
          rafCallback!(500) // t=500ms, progress=0.5, value=50
        })
        expect(counter.textContent).toBe('50')

        act(() => {
          rafCallback!(750) // t=750ms, progress=0.75, value=75
        })
        expect(counter.textContent).toBe('75')

        act(() => {
          rafCallback!(1000) // t=1000ms, progress=1, value=100
        })
        expect(counter.textContent).toBe('100')
      }
    })

    it('should cleanup requestAnimationFrame on unmount', () => {
      mockReducedMotion(false)
      mockIntersectionObserver(true)

      // Mock requestAnimationFrame and cancelAnimationFrame
      let rafCallback: FrameRequestCallback | null = null
      const frameId = 1234
      const rafSpy = vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
        rafCallback = cb
        return frameId
      })
      const cancelSpy = vi.spyOn(window, 'cancelAnimationFrame')

      const { unmount } = render(<CounterAnimation end={100} />)

      // Simulate the animation frame firing so that rafId is set
      if (rafCallback) {
        rafCallback(performance.now())
      }

      unmount()

      // cancelAnimationFrame should be called on cleanup with the correct frame id
      expect(cancelSpy).toHaveBeenCalledWith(frameId)

      // Restore mocks
      rafSpy.mockRestore()
      cancelSpy.mockRestore()
    })
  })

  describe('IntersectionObserver Integration', () => {
    it('should use IntersectionObserver with correct threshold', () => {
      // Spy on IntersectionObserver constructor to verify threshold
      let capturedOptions: IntersectionObserverInit | undefined
      const OriginalIO = global.IntersectionObserver
      global.IntersectionObserver = class IntersectionObserver {
        constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
          capturedOptions = options
          return new OriginalIO(callback, options)
        }
      } as unknown as typeof global.IntersectionObserver

      render(<CounterAnimation end={100} />)

      // Verify threshold is 0.3 (as defined in useIntersectionObserver call)
      expect(capturedOptions).toBeDefined()
      expect(capturedOptions?.threshold).toBe(0.3)
    })

    it('should only animate once when visible', async () => {
      mockReducedMotion(false)
      const { triggerIntersection } = mockIntersectionObserver(false, false)
      const rafSpy = vi.spyOn(window, 'requestAnimationFrame')

      render(<CounterAnimation end={100} start={0} />)

      // Trigger intersection first time - should start animation
      act(() => {
        triggerIntersection()
      })
      expect(rafSpy).toHaveBeenCalledTimes(1)

      // Trigger intersection again - should NOT restart animation
      act(() => {
        triggerIntersection()
      })
      expect(rafSpy).toHaveBeenCalledTimes(1) // Still only called once
    })
  })

  describe('Easing Functions', () => {
    it('should apply linear easing function', () => {
      mockReducedMotion(false)
      mockIntersectionObserver(true)

      let rafCallback: FrameRequestCallback | null = null
      vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
        rafCallback = cb
        return 1
      })

      render(<CounterAnimation end={100} start={0} easing="linear" duration={1000} />)

      const counter = screen.getByLabelText('100')

      // Simulate halfway through animation (500ms elapsed)
      if (rafCallback) {
        act(() => {
          rafCallback!(0) // Start time
        })
        act(() => {
          rafCallback!(500) // Halfway point
        })
      }

      // With linear easing at 50% progress, value should be 50
      expect(counter.textContent).toBe('50')
    })

    it('should apply easeOutQuart easing function (default)', () => {
      mockReducedMotion(false)
      mockIntersectionObserver(true)

      let rafCallback: FrameRequestCallback | null = null
      vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
        rafCallback = cb
        return 1
      })

      render(<CounterAnimation end={100} start={0} duration={1000} />)

      const counter = screen.getByLabelText('100')

      // Simulate halfway through animation (500ms elapsed)
      if (rafCallback) {
        act(() => {
          rafCallback!(0) // Start time
        })
        act(() => {
          rafCallback!(500) // Halfway point
        })
      }

      // With easeOutQuart at 50% progress: 1 - (1-0.5)^4 = 1 - 0.0625 = 0.9375
      // So value should be 93.75, but formatted to 0 decimals = 94
      expect(counter.textContent).toBe('94')
    })

    it('should apply easeOutExpo easing function', () => {
      mockReducedMotion(false)
      mockIntersectionObserver(true)

      let rafCallback: FrameRequestCallback | null = null
      vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
        rafCallback = cb
        return 1
      })

      render(<CounterAnimation end={100} start={0} easing="easeOutExpo" duration={1000} />)

      const counter = screen.getByLabelText('100')

      // Simulate halfway through animation (500ms elapsed)
      if (rafCallback) {
        act(() => {
          rafCallback!(0) // Start time
        })
        act(() => {
          rafCallback!(500) // Halfway point
        })
      }

      // With easeOutExpo at 50% progress: 1 - 2^(-10*0.5) = 1 - 2^(-5) = 1 - 0.03125 = 0.96875
      // So value should be 96.875, but formatted to 0 decimals = 97
      expect(counter.textContent).toBe('97')
    })
  })

  describe('Edge Cases', () => {
    it('should handle zero as end value', () => {
      mockReducedMotion(true)
      render(<CounterAnimation end={0} />)

      const counter = screen.getByLabelText('0')
      expect(counter.textContent).toBe('0')
    })

    it('should handle negative numbers', () => {
      mockReducedMotion(true)
      render(<CounterAnimation end={-50} />)

      const counter = screen.getByLabelText('-50')
      expect(counter.textContent).toBe('-50')
    })

    it('should handle very large numbers', () => {
      mockReducedMotion(true)
      render(<CounterAnimation end={10000000} suffix="+" />)

      const counter = screen.getByLabelText('10000000+')
      expect(counter.textContent).toBe('10,000,000+')
    })

    it('should handle custom duration', () => {
      mockReducedMotion(false)
      mockIntersectionObserver(true)

      let rafCallback: FrameRequestCallback | null = null
      vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
        rafCallback = cb
        return 1
      })

      render(<CounterAnimation end={100} start={0} duration={5000} easing="linear" />)

      const counter = screen.getByLabelText('100')

      // With 5000ms duration and linear easing
      if (rafCallback) {
        act(() => {
          rafCallback!(0) // Start time
        })
        act(() => {
          rafCallback!(2500) // Halfway through 5000ms should be at value 50
        })
      }

      expect(counter.textContent).toBe('50')
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
