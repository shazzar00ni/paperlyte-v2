import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SVGPathAnimation } from './SVGPathAnimation'
import { useReducedMotion } from '@hooks/useReducedMotion'

// Extend Element interface to include getTotalLength for testing
declare global {
  interface Element {
    getTotalLength?: () => number
  }
}

// Mock the hooks
vi.mock('@hooks/useReducedMotion')
vi.mock('@hooks/useIntersectionObserver', () => ({
  useIntersectionObserver: () => ({
    ref: { current: null },
    isVisible: true,
  }),
}))

// Mock getTotalLength on Element prototype
// This works in jsdom where SVGPathElement may not be fully defined
const mockGetTotalLength = vi.fn(() => 100)

describe('SVGPathAnimation', () => {
  beforeEach(() => {
    // Mock getTotalLength on any path element by extending Element prototype
    // This is necessary because jsdom doesn't fully implement SVG methods
    Element.prototype.getTotalLength = mockGetTotalLength

    // Default: no reduced motion
    vi.mocked(useReducedMotion).mockReturnValue(false)
  })

  afterEach(() => {
    // Clean up the prototype extension
    delete Element.prototype.getTotalLength
    vi.clearAllMocks()
    mockGetTotalLength.mockClear()
  })

  it('should render SVG with path children', () => {
    render(
      <SVGPathAnimation width={100} height={100}>
        <path d="M10 10 L90 90" data-testid="test-path" />
      </SVGPathAnimation>
    )

    expect(screen.getByTestId('test-path')).toBeInTheDocument()
  })

  it('should set aria-hidden on the SVG element', () => {
    render(
      <SVGPathAnimation>
        <path d="M10 10 L90 90" />
      </SVGPathAnimation>
    )

    const svg = document.querySelector('svg')
    expect(svg).toHaveAttribute('aria-hidden', 'true')
  })

  it('should apply custom viewBox dimensions', () => {
    render(
      <SVGPathAnimation width={200} height={150}>
        <path d="M10 10 L90 90" />
      </SVGPathAnimation>
    )

    const svg = document.querySelector('svg')
    expect(svg).toHaveAttribute('viewBox', '0 0 200 150')
  })

  it('should apply stroke color and width to the group', () => {
    render(
      <SVGPathAnimation strokeColor="#ff0000" strokeWidth={3}>
        <path d="M10 10 L90 90" />
      </SVGPathAnimation>
    )

    const group = document.querySelector('g')
    expect(group).toHaveAttribute('stroke', '#ff0000')
    expect(group).toHaveAttribute('stroke-width', '3')
  })

  it('should apply animation duration CSS variable', () => {
    render(
      <SVGPathAnimation duration={3000}>
        <path d="M10 10 L90 90" />
      </SVGPathAnimation>
    )

    const svg = document.querySelector('svg')
    expect(svg).toHaveStyle({ '--draw-duration': '3000ms' })
  })

  it('should apply easing CSS variable', () => {
    render(
      <SVGPathAnimation easing="ease-in-out">
        <path d="M10 10 L90 90" />
      </SVGPathAnimation>
    )

    const svg = document.querySelector('svg')
    expect(svg).toHaveStyle({ '--draw-easing': 'ease-in-out' })
  })

  it('should apply custom className to container', () => {
    render(
      <SVGPathAnimation className="custom-container">
        <path d="M10 10 L90 90" />
      </SVGPathAnimation>
    )

    const container = document.querySelector('.custom-container')
    expect(container).toBeInTheDocument()
  })

  describe('reduced motion behavior', () => {
    it('should render final state immediately when user prefers reduced motion', () => {
      // Mock reduced motion preference
      vi.mocked(useReducedMotion).mockReturnValue(true)

      render(
        <SVGPathAnimation>
          <path data-testid="test-path" d="M10 10 L90 90" />
        </SVGPathAnimation>
      )

      const path = screen.getByTestId('test-path')

      // When reduced motion is preferred, strokeDashoffset should be 0 (final state)
      // The showFinalState flag should be true, so strokeDashoffset = 0
      expect(path).toHaveStyle({ strokeDashoffset: '0' })
    })

    it('should not start animation timers when user prefers reduced motion', () => {
      vi.mocked(useReducedMotion).mockReturnValue(true)

      const setTimeoutSpy = vi.spyOn(global, 'setTimeout')

      render(
        <SVGPathAnimation delay={100} duration={2000}>
          <path data-testid="test-path" d="M10 10 L90 90" />
        </SVGPathAnimation>
      )

      // No timers should be set for animation when reduced motion is preferred
      // The effect early-returns when prefersReducedMotion is true
      expect(setTimeoutSpy).not.toHaveBeenCalled()

      setTimeoutSpy.mockRestore()
    })

    it('should apply fill immediately when reduced motion and animateFill is true', () => {
      vi.mocked(useReducedMotion).mockReturnValue(true)

      render(
        <SVGPathAnimation fillColor="#7c3aed" animateFill>
          <path data-testid="test-path" d="M10 10 L90 90" />
        </SVGPathAnimation>
      )

      const group = document.querySelector('g')
      expect(group).toHaveAttribute('fill', '#7c3aed')
    })
  })

  describe('animation state', () => {
    it('should apply strokeDasharray based on path length', () => {
      render(
        <SVGPathAnimation>
          <path data-testid="test-path" d="M10 10 L90 90" />
        </SVGPathAnimation>
      )

      const path = screen.getByTestId('test-path')
      // The mock returns 100 for getTotalLength
      expect(path).toHaveStyle({ strokeDasharray: '100' })
    })

    it('should set strokeDashoffset to path length initially when not in final state', () => {
      // When not in final state (not complete, no reduced motion),
      // strokeDashoffset should equal pathLength
      render(
        <SVGPathAnimation>
          <path data-testid="test-path" d="M10 10 L90 90" />
        </SVGPathAnimation>
      )

      const path = screen.getByTestId('test-path')
      // showFinalState is false initially (isComplete=false, prefersReducedMotion=false)
      // So strokeDashoffset should be pathLength (100)
      expect(path).toHaveStyle({ strokeDashoffset: '100' })
    })
  })

  describe('multiple paths', () => {
    it('should apply animation styles to each path individually', () => {
      render(
        <SVGPathAnimation>
          <path data-testid="path-1" d="M10 10 L90 90" />
          <path data-testid="path-2" d="M10 90 L90 10" />
        </SVGPathAnimation>
      )

      const path1 = screen.getByTestId('path-1')
      const path2 = screen.getByTestId('path-2')

      expect(path1).toHaveStyle({ strokeDasharray: '100' })
      expect(path2).toHaveStyle({ strokeDasharray: '100' })
    })

    it('should handle non-element children gracefully', () => {
      render(
        <SVGPathAnimation>
          <path data-testid="test-path" d="M10 10 L90 90" />
          {null}
          {undefined}
          {'text content'}
        </SVGPathAnimation>
      )

      expect(screen.getByTestId('test-path')).toBeInTheDocument()
    })

    it('should preserve existing className on path elements', () => {
      render(
        <SVGPathAnimation>
          <path d="M10 10 L90 90" className="custom-path" data-testid="test-path" />
        </SVGPathAnimation>
      )

      const path = screen.getByTestId('test-path')
      expect(path).toHaveClass('custom-path')
    })
  })
})
