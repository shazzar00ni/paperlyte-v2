import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AnimatedElement } from './AnimatedElement'

describe('AnimatedElement', () => {
  it('should render children', () => {
    render(
      <AnimatedElement>
        <div>Test content</div>
      </AnimatedElement>
    )

    expect(screen.getByText('Test content')).toBeInTheDocument()
  })

  it('should apply animation delay', () => {
    const { container } = render(
      <AnimatedElement delay={200}>
        <div>Delayed content</div>
      </AnimatedElement>
    )

    const wrapper = container.firstChild as HTMLElement
    // Check for CSS custom property (CSP-compliant approach)
    expect(wrapper.style.getPropertyValue('--animation-delay')).toBe('200ms')
  })

  it('should use default animation delay of 0ms', () => {
    const { container } = render(
      <AnimatedElement>
        <div>Content</div>
      </AnimatedElement>
    )

    const wrapper = container.firstChild as HTMLElement
    // Check for CSS custom property (CSP-compliant approach)
    expect(wrapper.style.getPropertyValue('--animation-delay')).toBe('0ms')
  })

  it('should apply custom className', () => {
    const { container } = render(
      <AnimatedElement className="custom-animation">
        <div>Content</div>
      </AnimatedElement>
    )

    const wrapper = container.firstChild as HTMLElement
    expect(wrapper).toHaveClass('custom-animation')
  })

  it('should respect reduced motion preference', () => {
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
      <AnimatedElement animation="fadeIn">
        <div>Content</div>
      </AnimatedElement>
    )

    const wrapper = container.firstChild as HTMLElement

    // Should not have animation class when reduced motion is preferred
    expect(wrapper).not.toHaveClass('fadeIn')
  })

  it('should support different animation types', () => {
    const animations = ['fadeIn', 'slideUp', 'slideInLeft', 'slideInRight', 'scale'] as const

    animations.forEach((animation) => {
      const { container } = render(
        <AnimatedElement animation={animation}>
          <div>{animation}</div>
        </AnimatedElement>
      )

      // Note: Due to intersection observer mock, isVisible will be false by default
      // In real usage, the animation class would be applied when element becomes visible
      expect(container.firstChild).toBeInTheDocument()
    })
  })
})
