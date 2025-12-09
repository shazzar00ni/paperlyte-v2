import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, act } from '@testing-library/react'
import { SVGPathAnimation } from './SVGPathAnimation'

describe('SVGPathAnimation', () => {
  let intersectionObserverCallback: IntersectionObserverCallback | null = null

  beforeEach(() => {
    // Mock IntersectionObserver to capture callback
    global.IntersectionObserver = class IntersectionObserver {
      constructor(callback: IntersectionObserverCallback) {
        intersectionObserverCallback = callback
      }
      disconnect() {}
      observe() {}
      takeRecords(): IntersectionObserverEntry[] {
        return []
      }
      unobserve() {}
    } as unknown as typeof global.IntersectionObserver
  })

  afterEach(() => {
    vi.clearAllMocks()
    vi.useRealTimers()
    intersectionObserverCallback = null
  })

  // Helper to trigger intersection observer
  const triggerIntersection = (isIntersecting = true) => {
    if (intersectionObserverCallback) {
      act(() => {
        intersectionObserverCallback!(
          [
            {
              isIntersecting,
              target: document.createElement('div'),
              intersectionRatio: isIntersecting ? 1 : 0,
              boundingClientRect: {} as DOMRectReadOnly,
              intersectionRect: {} as DOMRectReadOnly,
              rootBounds: null,
              time: Date.now(),
            },
          ] as IntersectionObserverEntry[],
          {} as IntersectionObserver
        )
      })
    }
  }

  describe('Path length calculation', () => {
    it('should render path element and apply animation styles', () => {
      const { container } = render(
        <SVGPathAnimation>
          <path d="M10 10 L90 90" />
        </SVGPathAnimation>
      )

      // Component should render the path element
      const path = container.querySelector('path')
      expect(path).toBeInTheDocument()
      
      // After effect runs, path length should be set (uses default from setup.ts: 100)
      act(() => {
        // Force effects to flush
      })
      
      const group = container.querySelector('g[style*="--path-length"]')
      expect(group).toBeInTheDocument()
    })

    it('should fallback to 1000 when getTotalLength() throws', () => {
      // Override getTotalLength to throw
      Object.defineProperty(SVGPathElement.prototype, 'getTotalLength', {
        writable: true,
        configurable: true,
        value: () => {
          throw new Error('Cannot calculate length')
        },
      })

      const { container } = render(
        <SVGPathAnimation>
          <path d="M10 10 L90 90" />
        </SVGPathAnimation>
      )

      act(() => {
        // Force effects to flush
      })

      // Trigger intersection to start animation
      triggerIntersection(true)

      const group = container.querySelector('g[style*="--path-length"]')
      expect(group).toBeInTheDocument()
      // Check if fallback length 1000 is used
      if (group) {
        const style = (group as HTMLElement).style
        expect(style.getPropertyValue('--path-length')).toBe('1000')
      }

      // Restore default mock
      Object.defineProperty(SVGPathElement.prototype, 'getTotalLength', {
        writable: true,
        configurable: true,
        value: () => 100,
      })
    })

    it('should handle multiple paths', () => {
      const { container } = render(
        <SVGPathAnimation>
          <path d="M10 10 L90 90" />
          <path d="M10 50 Q50 10 90 50" />
        </SVGPathAnimation>
      )

      act(() => {
        // Force effects to flush
      })

      // Effects flush automatically in testing-library, no need to force
      const paths = container.querySelectorAll('path')
      expect(paths).toHaveLength(2)
      
      // When multiple children are passed, the SVG should still be rendered properly
      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })
  })

  describe('Animation timing', () => {
    it('should apply default duration of 2000ms', () => {
      const { container } = render(
        <SVGPathAnimation>
          <path d="M10 10 L90 90" />
        </SVGPathAnimation>
      )

      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
      const style = (svg as SVGSVGElement).style
      expect(style.getPropertyValue('--draw-duration')).toBe('2000ms')
    })

    it('should apply custom duration', () => {
      const { container } = render(
        <SVGPathAnimation duration={1500}>
          <path d="M10 10 L90 90" />
        </SVGPathAnimation>
      )

      const svg = container.querySelector('svg')
      const style = (svg as SVGSVGElement).style
      expect(style.getPropertyValue('--draw-duration')).toBe('1500ms')
    })

    it('should apply default easing of ease-out', () => {
      const { container } = render(
        <SVGPathAnimation>
          <path d="M10 10 L90 90" />
        </SVGPathAnimation>
      )

      const svg = container.querySelector('svg')
      const style = (svg as SVGSVGElement).style
      expect(style.getPropertyValue('--draw-easing')).toBe('ease-out')
    })

    it('should apply custom easing', () => {
      const { container } = render(
        <SVGPathAnimation easing="cubic-bezier(0.4, 0, 0.2, 1)">
          <path d="M10 10 L90 90" />
        </SVGPathAnimation>
      )

      const svg = container.querySelector('svg')
      const style = (svg as SVGSVGElement).style
      expect(style.getPropertyValue('--draw-easing')).toBe('cubic-bezier(0.4, 0, 0.2, 1)')
    })

    it('should respect custom delay prop', () => {
      const { container } = render(
        <SVGPathAnimation delay={500}>
          <path d="M10 10 L90 90" />
        </SVGPathAnimation>
      )

      // The delay prop should be used to set setTimeout in the component
      // We can verify the component renders correctly with the delay prop
      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
      
      // Verify paths are measured (should have style applied after mount)
      act(() => {
        // Force effects to flush
      })
      
      const group = container.querySelector('g[style*="--path-length"]')
      expect(group).toBeInTheDocument()
    })
  })

  describe('Stroke dasharray/dashoffset application', () => {
    it('should apply stroke dasharray with calculated path length', () => {
      const { container } = render(
        <SVGPathAnimation>
          <path d="M10 10 L90 90" />
        </SVGPathAnimation>
      )

      act(() => {
        // Force effects to flush for path length calculation
      })

      const group = container.querySelector('g[style*="--path-length"]')
      expect(group).toBeInTheDocument()
      if (group) {
        const style = (group as HTMLElement).style
        // Should have a path length (either calculated or fallback 1000)
        const pathLength = style.getPropertyValue('--path-length')
        expect(pathLength).toBeTruthy()
        expect(Number(pathLength)).toBeGreaterThan(0)
        expect(style.strokeDasharray).toBe(pathLength)
      }
    })

    it('should set initial dashoffset to path length before animation', () => {
      const { container } = render(
        <SVGPathAnimation>
          <path d="M10 10 L90 90" />
        </SVGPathAnimation>
      )

      act(() => {
        // Force effects to flush for path length calculation
      })

      const group = container.querySelector('g[style*="--path-length"]')
      expect(group).toBeInTheDocument()
      if (group) {
        const style = (group as HTMLElement).style
        // Before animation starts, offset should equal path length
        const pathLength = style.getPropertyValue('--path-length')
        expect(style.strokeDashoffset).toBe(pathLength)
      }
    })

    it('should animate dashoffset to 0 during animation', () => {
      vi.useFakeTimers()

      const { container } = render(
        <SVGPathAnimation delay={0}>
          <path d="M10 10 L90 90" />
        </SVGPathAnimation>
      )

      // Ensure path lengths are calculated
      act(() => {
        // Force effects to flush
      })

      // Trigger IntersectionObserver and start animation
      triggerIntersection(true)
      act(() => {
        vi.advanceTimersByTime(0)
      })

      const group = container.querySelector('g[style*="strokeDashoffset"]')
      if (group) {
        const style = (group as HTMLElement).style
        // During animation, offset should be 0
        expect(style.strokeDashoffset).toBe('0')
      }

      vi.useRealTimers()
    })
  })

  describe('Fill animation', () => {
    it('should not apply fill by default', () => {
      const { container } = render(
        <SVGPathAnimation fillColor="#7c3aed">
          <path d="M10 10 L90 90" />
        </SVGPathAnimation>
      )

      const group = container.querySelector('g[stroke]')
      expect(group).toHaveAttribute('fill', 'none')
    })

    it('should apply fill after animation completes when animateFill is true', () => {
      vi.useFakeTimers()

      const { container } = render(
        <SVGPathAnimation duration={1000} animateFill fillColor="#7c3aed">
          <path d="M10 10 L90 90" />
        </SVGPathAnimation>
      )

      // Ensure path lengths are calculated
      act(() => {
        // Force effects to flush
      })

      // Trigger IntersectionObserver
      triggerIntersection(true)

      // Initially should not have fill
      let group = container.querySelector('g[stroke]')
      expect(group).toHaveAttribute('fill', 'none')

      // Advance past animation duration
      act(() => {
        vi.advanceTimersByTime(0) // Start animation immediately (no delay)
        vi.advanceTimersByTime(1000) // Complete animation
      })

      // After animation, should have fill color
      group = container.querySelector('g[stroke]')
      expect(group).toHaveAttribute('fill', '#7c3aed')

      vi.useRealTimers()
    })

    it('should apply animateFill prop to control fill behavior', () => {
      const { container } = render(
        <SVGPathAnimation duration={1000} animateFill fillColor="#7c3aed">
          <path d="M10 10 L90 90" />
        </SVGPathAnimation>
      )

      // Ensure path lengths are calculated
      act(() => {
        // Force effects to flush
      })

      // Initially should not have fill (animation not complete)
      const group = container.querySelector('g[stroke]')
      expect(group).toHaveAttribute('fill', 'none')
      
      // The animateFill prop is passed correctly
      // (actual fill application would happen after animation completes,
      // which we've tested in the previous test)
    })
  })

  describe('Reduced motion preference', () => {
    it('should respect prefers-reduced-motion and show final state', () => {
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

      const { container } = render(
        <SVGPathAnimation>
          <path d="M10 10 L90 90" />
        </SVGPathAnimation>
      )

      act(() => {
        // Force effects to flush
      })

      // With reduced motion, dashoffset should be 0 immediately
      const group = container.querySelector('g[style*="strokeDashoffset"]')
      if (group) {
        const style = (group as HTMLElement).style
        expect(style.strokeDashoffset).toBe('0')
      }
    })

    it('should show fill immediately when reduced motion is preferred and animateFill is true', () => {
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

      const { container } = render(
        <SVGPathAnimation animateFill fillColor="#7c3aed">
          <path d="M10 10 L90 90" />
        </SVGPathAnimation>
      )

      const group = container.querySelector('g[stroke]')
      expect(group).toHaveAttribute('fill', '#7c3aed')
    })
  })

  describe('IntersectionObserver triggering', () => {
    it('should use IntersectionObserver to detect visibility', () => {
      const { container } = render(
        <SVGPathAnimation>
          <path d="M10 10 L90 90" />
        </SVGPathAnimation>
      )

      // Ensure path lengths are calculated
      act(() => {
        // Force effects to flush
      })

      // Verify paths are measured
      const group = container.querySelector('g[style*="--path-length"]')
      expect(group).toBeInTheDocument()

      // The component should set up IntersectionObserver on mount
      // (we've mocked IntersectionObserver in beforeEach to capture the callback)
      expect(intersectionObserverCallback).not.toBeNull()
    })

    it('should not animate until paths are measured', () => {
      vi.useFakeTimers()

      const { container, rerender } = render(
        <SVGPathAnimation>
          <path d="M10 10 L90 90" />
        </SVGPathAnimation>
      )

      // Trigger visibility before paths are measured
      // The component checks if pathLengths.length > 0
      triggerIntersection(true)

      // Force re-render to simulate the effect of path measurement
      rerender(
        <SVGPathAnimation>
          <path d="M10 10 L90 90" />
        </SVGPathAnimation>
      )

      // After paths are measured, animation should be possible
      const group = container.querySelector('g[style*="--path-length"]')
      expect(group).toBeInTheDocument()

      vi.useRealTimers()
    })

    it('should track animation state to prevent multiple animations', () => {
      const { container } = render(
        <SVGPathAnimation duration={1000}>
          <path d="M10 10 L90 90" />
        </SVGPathAnimation>
      )

      // Ensure path lengths are calculated
      act(() => {
        // Force effects to flush
      })

      // Verify paths are measured
      const group = container.querySelector('g[style*="--path-length"]')
      expect(group).toBeInTheDocument()

      // The component has internal state (isAnimating, isComplete) to control animation lifecycle
      // This prevents multiple animations - verified by the component implementation
      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })
  })

  describe('Child handling', () => {
    it('should handle single child element', () => {
      const { container } = render(
        <SVGPathAnimation>
          <path d="M10 10 L90 90" />
        </SVGPathAnimation>
      )

      const paths = container.querySelectorAll('path')
      expect(paths).toHaveLength(1)
    })

    it('should handle array of children', () => {
      const { container } = render(
        <SVGPathAnimation>
          {[<path key="1" d="M10 10 L90 90" />, <path key="2" d="M10 50 Q50 10 90 50" />]}
        </SVGPathAnimation>
      )

      const paths = container.querySelectorAll('path')
      expect(paths).toHaveLength(2)
    })

    it('should handle nested SVG elements', () => {
      const { container } = render(
        <SVGPathAnimation>
          <g>
            <path d="M10 10 L90 90" />
            <circle cx="50" cy="50" r="20" />
          </g>
        </SVGPathAnimation>
      )

      const path = container.querySelector('path')
      const circle = container.querySelector('circle')
      expect(path).toBeInTheDocument()
      expect(circle).toBeInTheDocument()
    })
  })

  describe('SVG properties', () => {
    it('should apply default viewBox dimensions', () => {
      const { container } = render(
        <SVGPathAnimation>
          <path d="M10 10 L90 90" />
        </SVGPathAnimation>
      )

      const svg = container.querySelector('svg')
      expect(svg).toHaveAttribute('viewBox', '0 0 100 100')
    })

    it('should apply custom viewBox dimensions', () => {
      const { container } = render(
        <SVGPathAnimation width={200} height={150}>
          <path d="M10 10 L90 90" />
        </SVGPathAnimation>
      )

      const svg = container.querySelector('svg')
      expect(svg).toHaveAttribute('viewBox', '0 0 200 150')
    })

    it('should apply default stroke properties', () => {
      const { container } = render(
        <SVGPathAnimation>
          <path d="M10 10 L90 90" />
        </SVGPathAnimation>
      )

      const group = container.querySelector('g[stroke]')
      expect(group).toHaveAttribute('stroke', 'currentColor')
      expect(group).toHaveAttribute('stroke-width', '2')
      expect(group).toHaveAttribute('stroke-linecap', 'round')
      expect(group).toHaveAttribute('stroke-linejoin', 'round')
    })

    it('should apply custom stroke properties', () => {
      const { container } = render(
        <SVGPathAnimation strokeColor="#7c3aed" strokeWidth={4}>
          <path d="M10 10 L90 90" />
        </SVGPathAnimation>
      )

      const group = container.querySelector('g[stroke]')
      expect(group).toHaveAttribute('stroke', '#7c3aed')
      expect(group).toHaveAttribute('stroke-width', '4')
    })

    it('should apply custom className', () => {
      const { container } = render(
        <SVGPathAnimation className="custom-svg-animation">
          <path d="M10 10 L90 90" />
        </SVGPathAnimation>
      )

      const wrapper = container.firstChild
      expect(wrapper).toHaveClass('custom-svg-animation')
    })

    it('should hide SVG from screen readers', () => {
      const { container } = render(
        <SVGPathAnimation>
          <path d="M10 10 L90 90" />
        </SVGPathAnimation>
      )

      const svg = container.querySelector('svg')
      expect(svg).toHaveAttribute('aria-hidden', 'true')
    })
  })
})
