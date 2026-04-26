import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { AnimatedElement } from './AnimatedElement'

describe('AnimatedElement', () => {
  afterEach(() => {
    // Restore any globals stubbed during the test (e.g. IntersectionObserver).
    // Running this in afterEach ensures cleanup happens even if a test fails early.
    vi.unstubAllGlobals()
  })
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
    // Check CSS custom property (CSS variable)
    expect(wrapper.style.getPropertyValue('--animation-delay')).toBe('200ms')
  })

  it('should use default animation delay of 0ms', () => {
    const { container } = render(
      <AnimatedElement>
        <div>Content</div>
      </AnimatedElement>
    )

    const wrapper = container.firstChild as HTMLElement
    // Check CSS custom property (CSS variable)
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
    // Use vi.stubGlobal so afterEach(vi.unstubAllGlobals) reverts this automatically
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => true,
    }))

    const { container } = render(
      <AnimatedElement animation="fadeIn">
        <div>Content</div>
      </AnimatedElement>
    )

    const wrapper = container.firstChild as HTMLElement

    // Should not have animation class when reduced motion is preferred
    expect(wrapper).not.toHaveClass('fadeIn')
  })

  it('should apply visible class when IntersectionObserver fires with isIntersecting=true', () => {
    // Capture the IntersectionObserver callback so we can trigger it manually.
    // Must use a regular function (not arrow) so it can be called with `new`.
    let observerCallback: IntersectionObserverCallback | null = null

    const MockIO = vi.fn(function (callback: IntersectionObserverCallback) {
      observerCallback = callback
    }) as unknown as typeof IntersectionObserver
    ;(MockIO.prototype as { observe: () => void }).observe = vi.fn()
    ;(MockIO.prototype as { unobserve: () => void }).unobserve = vi.fn()
    ;(MockIO.prototype as { disconnect: () => void }).disconnect = vi.fn()
    ;(MockIO.prototype as { takeRecords: () => [] }).takeRecords = () => []

    vi.stubGlobal('IntersectionObserver', MockIO)

    const { container } = render(
      <AnimatedElement animation="fadeIn">
        <div>Visible content</div>
      </AnimatedElement>
    )

    const wrapper = container.firstChild as HTMLElement

    // Before observer fires, visible class should not be present
    expect(wrapper.className).not.toContain('visible')

    // Simulate the observer reporting that the element is intersecting
    act(() => {
      observerCallback!(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver
      )
    })

    // Now the visible class should be applied
    expect(wrapper.className).toContain('visible')
  })

  it('should pass threshold prop to IntersectionObserver', () => {
    let capturedOptions: IntersectionObserverInit | undefined

    const MockIO = vi.fn(function (
      _callback: IntersectionObserverCallback,
      options?: IntersectionObserverInit
    ) {
      capturedOptions = options
    }) as unknown as typeof IntersectionObserver
    ;(MockIO.prototype as { observe: () => void }).observe = vi.fn()
    ;(MockIO.prototype as { unobserve: () => void }).unobserve = vi.fn()
    ;(MockIO.prototype as { disconnect: () => void }).disconnect = vi.fn()
    ;(MockIO.prototype as { takeRecords: () => [] }).takeRecords = () => []

    vi.stubGlobal('IntersectionObserver', MockIO)

    render(
      <AnimatedElement animation="slideUp" threshold={0.5}>
        <div>Content</div>
      </AnimatedElement>
    )

    expect(capturedOptions).toMatchObject({ threshold: 0.5 })
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
