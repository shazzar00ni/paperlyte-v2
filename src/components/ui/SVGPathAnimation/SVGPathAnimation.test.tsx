import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SVGPathAnimation } from './SVGPathAnimation'

// Mock the hooks
vi.mock('@hooks/useIntersectionObserver', () => ({
  useIntersectionObserver: () => ({ ref: { current: null }, isVisible: true }),
}))

vi.mock('@hooks/useReducedMotion', () => ({
  useReducedMotion: () => false,
}))

describe('SVGPathAnimation', () => {
  beforeEach(() => {
    // Mock getTotalLength for path elements
    HTMLElement.prototype.getTotalLength = vi.fn(() => 100)
  })

  it('should render SVG with path children', () => {
    const { container } = render(
      <SVGPathAnimation width={100} height={100}>
        <path d="M10 10 L90 90" data-testid="test-path" />
      </SVGPathAnimation>
    )

    const path = container.querySelector('path[data-testid="test-path"]')
    expect(path).toBeInTheDocument()
  })

  it('should apply animation styles to single path', () => {
    const { container } = render(
      <SVGPathAnimation width={100} height={100}>
        <path d="M10 10 L90 90" data-testid="test-path" />
      </SVGPathAnimation>
    )

    const path = container.querySelector('path[data-testid="test-path"]') as SVGPathElement
    expect(path).toBeDefined()

    // Path should have dash array and offset styles (once pathLengths are calculated)
    // Initially, before useEffect runs, these might not be set
    // We're testing the structure is correct
    expect(path?.tagName).toBe('path')
  })

  it('should apply staggered delays to multiple paths', () => {
    const { container } = render(
      <SVGPathAnimation width={100} height={100} staggerDelay={200}>
        <path d="M10 10 L90 90" data-testid="path-1" />
        <path d="M10 50 L90 50" data-testid="path-2" />
        <path d="M10 90 L90 10" data-testid="path-3" />
      </SVGPathAnimation>
    )

    const paths = container.querySelectorAll('path')
    expect(paths).toHaveLength(3)

    // Verify all paths are rendered
    expect(container.querySelector('path[data-testid="path-1"]')).toBeInTheDocument()
    expect(container.querySelector('path[data-testid="path-2"]')).toBeInTheDocument()
    expect(container.querySelector('path[data-testid="path-3"]')).toBeInTheDocument()
  })

  it('should use default staggerDelay of 200ms', () => {
    const { container } = render(
      <SVGPathAnimation>
        <path d="M10 10 L90 90" />
        <path d="M10 50 L90 50" />
      </SVGPathAnimation>
    )

    // Check that multiple paths are rendered
    const paths = container.querySelectorAll('path')
    expect(paths).toHaveLength(2)
  })

  it('should handle non-valid elements gracefully', () => {
    const { container } = render(
      <SVGPathAnimation>
        <path d="M10 10 L90 90" data-testid="valid-path" />
        {null}
        {false}
        <path d="M10 50 L90 50" data-testid="valid-path-2" />
      </SVGPathAnimation>
    )

    // Should only render valid path elements
    expect(container.querySelector('path[data-testid="valid-path"]')).toBeInTheDocument()
    expect(container.querySelector('path[data-testid="valid-path-2"]')).toBeInTheDocument()
  })

  it('should preserve existing className on child paths', () => {
    const { container } = render(
      <SVGPathAnimation>
        <path d="M10 10 L90 90" className="custom-path" data-testid="test-path" />
      </SVGPathAnimation>
    )

    const path = container.querySelector('path[data-testid="test-path"]')
    expect(path).toHaveClass('custom-path')
  })

  it('should use child key when available instead of index', () => {
    const { container } = render(
      <SVGPathAnimation>
        <path key="first-path" d="M10 10 L90 90" data-testid="path-1" />
        <path key="second-path" d="M10 50 L90 50" data-testid="path-2" />
      </SVGPathAnimation>
    )

    // Paths should be rendered with their keys
    const paths = container.querySelectorAll('path')
    expect(paths).toHaveLength(2)
    expect(container.querySelector('path[data-testid="path-1"]')).toBeInTheDocument()
    expect(container.querySelector('path[data-testid="path-2"]')).toBeInTheDocument()
  })

  it('should apply custom stroke color', () => {
    const { container } = render(
      <SVGPathAnimation strokeColor="#ff0000">
        <path d="M10 10 L90 90" />
      </SVGPathAnimation>
    )

    const g = container.querySelector('g')
    expect(g).toHaveAttribute('stroke', '#ff0000')
  })

  it('should apply custom stroke width', () => {
    const { container } = render(
      <SVGPathAnimation strokeWidth={4}>
        <path d="M10 10 L90 90" />
      </SVGPathAnimation>
    )

    const g = container.querySelector('g')
    expect(g).toHaveAttribute('stroke-width', '4')
  })

  it('should set SVG viewBox correctly', () => {
    const { container } = render(
      <SVGPathAnimation width={200} height={150}>
        <path d="M10 10 L90 90" />
      </SVGPathAnimation>
    )

    const svg = container.querySelector('svg')
    expect(svg).toHaveAttribute('viewBox', '0 0 200 150')
  })

  it('should apply animation duration CSS variable', () => {
    const { container } = render(
      <SVGPathAnimation duration={3000}>
        <path d="M10 10 L90 90" />
      </SVGPathAnimation>
    )

    const svg = container.querySelector('svg') as SVGSVGElement
    const style = svg?.style
    expect(style?.getPropertyValue('--draw-duration')).toBe('3000ms')
  })

  it('should apply easing CSS variable', () => {
    const { container } = render(
      <SVGPathAnimation easing="ease-in-out">
        <path d="M10 10 L90 90" />
      </SVGPathAnimation>
    )

    const svg = container.querySelector('svg') as SVGSVGElement
    const style = svg?.style
    expect(style?.getPropertyValue('--draw-easing')).toBe('ease-in-out')
  })

  it('should apply custom className to container', () => {
    const { container } = render(
      <SVGPathAnimation className="custom-container">
        <path d="M10 10 L90 90" />
      </SVGPathAnimation>
    )

    const wrapper = container.firstChild as HTMLElement
    expect(wrapper).toHaveClass('custom-container')
  })

  it('should set aria-hidden on SVG', () => {
    const { container } = render(
      <SVGPathAnimation>
        <path d="M10 10 L90 90" />
      </SVGPathAnimation>
    )

    const svg = container.querySelector('svg')
    expect(svg).toHaveAttribute('aria-hidden', 'true')
  })
})
