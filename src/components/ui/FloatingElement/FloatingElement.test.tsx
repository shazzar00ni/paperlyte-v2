import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { FloatingElement } from './FloatingElement'

describe('FloatingElement', () => {
  // Reset mocks before each test
  beforeEach(() => {
    // Reset matchMedia to default (no reduced motion)
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: (query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => true,
      }),
    })

    // Reset IntersectionObserver to default mock
    global.IntersectionObserver = class IntersectionObserver {
      constructor() {}
      disconnect() {}
      observe() {}
      takeRecords(): IntersectionObserverEntry[] {
        return []
      }
      unobserve() {}
    } as unknown as typeof global.IntersectionObserver
  })

  describe('Basic Rendering', () => {
    it('should render children', () => {
      render(
        <FloatingElement>
          <div>Test content</div>
        </FloatingElement>
      )

      expect(screen.getByText('Test content')).toBeInTheDocument()
    })

    it('should apply custom className', () => {
      const { container } = render(
        <FloatingElement className="custom-class">
          <div>Content</div>
        </FloatingElement>
      )

      const floatingElement = container.querySelector('.custom-class')
      expect(floatingElement).toBeInTheDocument()
    })
  })

  describe('Animation Direction Classes', () => {
    it('should apply vertical float class by default', () => {
      const { container } = render(
        <FloatingElement>
          <div>Content</div>
        </FloatingElement>
      )

      const floatingElement = container.querySelector('[class*="floatVertical"]')
      expect(floatingElement).toBeInTheDocument()
    })

    it('should apply vertical float class when direction is vertical', () => {
      const { container } = render(
        <FloatingElement direction="vertical">
          <div>Content</div>
        </FloatingElement>
      )

      const floatingElement = container.querySelector('[class*="floatVertical"]')
      expect(floatingElement).toBeInTheDocument()
    })

    it('should apply horizontal float class when direction is horizontal', () => {
      const { container } = render(
        <FloatingElement direction="horizontal">
          <div>Content</div>
        </FloatingElement>
      )

      const floatingElement = container.querySelector('[class*="floatHorizontal"]')
      expect(floatingElement).toBeInTheDocument()
    })

    it('should apply circular float class when direction is circular', () => {
      const { container } = render(
        <FloatingElement direction="circular">
          <div>Content</div>
        </FloatingElement>
      )

      const floatingElement = container.querySelector('[class*="floatCircular"]')
      expect(floatingElement).toBeInTheDocument()
    })
  })

  describe('CSS Custom Properties', () => {
    it('should apply default CSS custom properties', () => {
      const { container } = render(
        <FloatingElement>
          <div>Content</div>
        </FloatingElement>
      )

      const floatingElement = container.querySelector('[class*="floating"]') as HTMLElement
      expect(floatingElement).toBeInTheDocument()

      // Check default values
      expect(floatingElement.style.getPropertyValue('--float-duration')).toBe('3s')
      expect(floatingElement.style.getPropertyValue('--float-delay')).toBe('0s')
      expect(floatingElement.style.getPropertyValue('--float-distance')).toBe('20px')
    })

    it('should apply custom duration', () => {
      const { container } = render(
        <FloatingElement duration={5}>
          <div>Content</div>
        </FloatingElement>
      )

      const floatingElement = container.querySelector('[class*="floating"]') as HTMLElement
      expect(floatingElement.style.getPropertyValue('--float-duration')).toBe('5s')
    })

    it('should apply custom delay', () => {
      const { container } = render(
        <FloatingElement delay={1.5}>
          <div>Content</div>
        </FloatingElement>
      )

      const floatingElement = container.querySelector('[class*="floating"]') as HTMLElement
      expect(floatingElement.style.getPropertyValue('--float-delay')).toBe('1.5s')
    })

    it('should apply custom distance', () => {
      const { container } = render(
        <FloatingElement distance={50}>
          <div>Content</div>
        </FloatingElement>
      )

      const floatingElement = container.querySelector('[class*="floating"]') as HTMLElement
      expect(floatingElement.style.getPropertyValue('--float-distance')).toBe('50px')
    })

    it('should apply all custom properties together', () => {
      const { container } = render(
        <FloatingElement duration={4} delay={0.5} distance={30}>
          <div>Content</div>
        </FloatingElement>
      )

      const floatingElement = container.querySelector('[class*="floating"]') as HTMLElement
      expect(floatingElement.style.getPropertyValue('--float-duration')).toBe('4s')
      expect(floatingElement.style.getPropertyValue('--float-delay')).toBe('0.5s')
      expect(floatingElement.style.getPropertyValue('--float-distance')).toBe('30px')
    })
  })

  describe('Pause State When Hidden', () => {
    it('should apply paused class when out of viewport with pauseWhenHidden=true', () => {
      const { container } = render(
        <FloatingElement pauseWhenHidden={true}>
          <div>Content</div>
        </FloatingElement>
      )

      // In the component, isPaused is derived from isVisible which starts as false
      // due to the default IntersectionObserver mock behavior
      const floatingElement = container.querySelector('[class*="floating"]')
      expect(floatingElement).toBeInTheDocument()

      // The paused class should be applied initially since isVisible defaults to false
      expect(floatingElement?.className).toContain('paused')
    })

    it('should not apply paused class when pauseWhenHidden=false', () => {
      const { container } = render(
        <FloatingElement pauseWhenHidden={false}>
          <div>Content</div>
        </FloatingElement>
      )

      const floatingElement = container.querySelector('[class*="floating"]')
      expect(floatingElement).toBeInTheDocument()

      // Even though element is not visible, paused should not be applied
      expect(floatingElement?.className).not.toContain('paused')
    })

    it('should default to pauseWhenHidden=true', () => {
      const { container } = render(
        <FloatingElement>
          <div>Content</div>
        </FloatingElement>
      )

      const floatingElement = container.querySelector('[class*="floating"]')
      expect(floatingElement).toBeInTheDocument()

      // Default behavior should pause when hidden
      expect(floatingElement?.className).toContain('paused')
    })
  })

  describe('Reduced Motion Preference', () => {
    it('should render static content when prefers-reduced-motion is set', () => {
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
        <FloatingElement direction="vertical" duration={5}>
          <div>Content</div>
        </FloatingElement>
      )

      // Should not have floating animation classes
      const floatingElement = container.querySelector('[class*="floating"]')
      expect(floatingElement).not.toBeInTheDocument()

      // Should still render children
      expect(screen.getByText('Content')).toBeInTheDocument()
    })

    it('should apply custom className even with reduced motion', () => {
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
        <FloatingElement className="custom-class">
          <div>Content</div>
        </FloatingElement>
      )

      // Custom className should still be applied
      const element = container.querySelector('.custom-class')
      expect(element).toBeInTheDocument()
      expect(screen.getByText('Content')).toBeInTheDocument()
    })
  })

  describe('IntersectionObserver Integration', () => {
    it('should use IntersectionObserver with correct configuration', () => {
      const observeMock = vi.fn()
      let instanceCount = 0

      class MockIntersectionObserver {
        constructor() {
          instanceCount++
        }
        observe = observeMock
        unobserve = vi.fn()
        disconnect = vi.fn()
        takeRecords = vi.fn(() => [])
      }

      global.IntersectionObserver =
        MockIntersectionObserver as unknown as typeof IntersectionObserver

      render(
        <FloatingElement>
          <div>Content</div>
        </FloatingElement>
      )

      // IntersectionObserver should be instantiated
      expect(instanceCount).toBeGreaterThan(0)

      // observe should be called on the ref element
      expect(observeMock).toHaveBeenCalled()
    })

    it('should handle multiple FloatingElements independently', () => {
      render(
        <>
          <FloatingElement direction="vertical">
            <div>Element 1</div>
          </FloatingElement>
          <FloatingElement direction="horizontal">
            <div>Element 2</div>
          </FloatingElement>
          <FloatingElement direction="circular">
            <div>Element 3</div>
          </FloatingElement>
        </>
      )

      expect(screen.getByText('Element 1')).toBeInTheDocument()
      expect(screen.getByText('Element 2')).toBeInTheDocument()
      expect(screen.getByText('Element 3')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle zero duration', () => {
      const { container } = render(
        <FloatingElement duration={0}>
          <div>Content</div>
        </FloatingElement>
      )

      const floatingElement = container.querySelector('[class*="floating"]') as HTMLElement
      expect(floatingElement.style.getPropertyValue('--float-duration')).toBe('0s')
    })

    it('should handle zero distance', () => {
      const { container } = render(
        <FloatingElement distance={0}>
          <div>Content</div>
        </FloatingElement>
      )

      const floatingElement = container.querySelector('[class*="floating"]') as HTMLElement
      expect(floatingElement.style.getPropertyValue('--float-distance')).toBe('0px')
    })

    it('should handle negative delay', () => {
      const { container } = render(
        <FloatingElement delay={-1}>
          <div>Content</div>
        </FloatingElement>
      )

      const floatingElement = container.querySelector('[class*="floating"]') as HTMLElement
      expect(floatingElement.style.getPropertyValue('--float-delay')).toBe('-1s')
    })

    it('should handle very large values', () => {
      const { container } = render(
        <FloatingElement duration={999} delay={100} distance={1000}>
          <div>Content</div>
        </FloatingElement>
      )

      const floatingElement = container.querySelector('[class*="floating"]') as HTMLElement
      expect(floatingElement.style.getPropertyValue('--float-duration')).toBe('999s')
      expect(floatingElement.style.getPropertyValue('--float-delay')).toBe('100s')
      expect(floatingElement.style.getPropertyValue('--float-distance')).toBe('1000px')
    })

    it('should handle empty className', () => {
      const { container } = render(
        <FloatingElement className="">
          <div>Content</div>
        </FloatingElement>
      )

      const floatingElement = container.querySelector('[class*="floating"]')
      expect(floatingElement).toBeInTheDocument()
      expect(screen.getByText('Content')).toBeInTheDocument()
    })

    it('should handle complex children structures', () => {
      render(
        <FloatingElement>
          <div>
            <span>Nested</span>
            <div>
              <button type="button">Button</button>
            </div>
          </div>
        </FloatingElement>
      )

      expect(screen.getByText('Nested')).toBeInTheDocument()
      expect(screen.getByText('Button')).toBeInTheDocument()
    })
  })
})
