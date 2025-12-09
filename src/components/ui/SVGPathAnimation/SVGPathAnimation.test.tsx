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
const mockGetTotalLength = vi.fn(() => 100)

describe('SVGPathAnimation', () => {
  beforeEach(() => {
    Element.prototype.getTotalLength = mockGetTotalLength
    vi.mocked(useReducedMotion).mockReturnValue(false)
  })

  afterEach(() => {
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
    const { container } = render(
      <SVGPathAnimation>
        <path d="M10 10 L90 90" />
        <path d="M10 50 L90 50" />
      </SVGPathAnimation>
    )
    const svg = container.querySe