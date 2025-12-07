import { describe, it, expect, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import { TextReveal } from './TextReveal'

describe('TextReveal', () => {
  beforeEach(() => {
    // Reset matchMedia mock before each test
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
  })

  describe('Text splitting', () => {
    it('should split text word-by-word by default', () => {
      const { container } = render(<TextReveal>Hello World Test</TextReveal>)

      // Should have spans for each word
      const spans = container.querySelectorAll('span[aria-hidden="true"]')
      // Expecting 3 words (whitespace is handled separately)
      expect(spans.length).toBe(3)
      expect(spans[0].textContent).toBe('Hello')
      expect(spans[1].textContent).toBe('World')
      expect(spans[2].textContent).toBe('Test')
    })

    it('should split text character-by-character when type is "character"', () => {
      const { container } = render(<TextReveal type="character">Hi</TextReveal>)

      const spans = container.querySelectorAll('span[aria-hidden="true"]')
      expect(spans.length).toBe(2)
      expect(spans[0].textContent).toBe('H')
      expect(spans[1].textContent).toBe('i')
    })
  })

  describe('Whitespace preservation', () => {
    it('should preserve single spaces between words', () => {
      const { container } = render(<TextReveal>Hello World</TextReveal>)

      // Should have space elements with the space CSS module class
      const spaceSpans = Array.from(container.querySelectorAll('span')).filter(
        (span) => span.className.includes('space') && !span.hasAttribute('aria-hidden')
      )
      expect(spaceSpans.length).toBe(1)
      expect(spaceSpans[0].textContent).toBe(' ')
    })

    it('should preserve multiple spaces between words', () => {
      const { container } = render(<TextReveal>Hello  World</TextReveal>)

      const spaceSpans = Array.from(container.querySelectorAll('span')).filter(
        (span) => span.className.includes('space') && !span.hasAttribute('aria-hidden')
      )
      expect(spaceSpans.length).toBe(1)
      expect(spaceSpans[0].textContent).toBe('  ')
    })

    it('should preserve leading and trailing spaces', () => {
      const { container } = render(<TextReveal> Hello </TextReveal>)

      const spaceSpans = Array.from(container.querySelectorAll('span')).filter(
        (span) => span.className.includes('space') && !span.hasAttribute('aria-hidden')
      )
      expect(spaceSpans.length).toBe(2)
    })
  })

  describe('Animation class application', () => {
    it('should apply default fadeUp animation class', () => {
      const { container } = render(<TextReveal>Test</TextReveal>)

      const animatedSpan = container.querySelector('span[aria-hidden="true"]')
      // CSS modules hash the class names, so check if it contains the pattern
      expect(animatedSpan?.className).toMatch(/fadeUp/)
    })

    it('should apply fadeIn animation class when specified', () => {
      const { container } = render(<TextReveal animation="fadeIn">Test</TextReveal>)

      const animatedSpan = container.querySelector('span[aria-hidden="true"]')
      expect(animatedSpan?.className).toMatch(/fadeIn/)
    })

    it('should apply slideUp animation class when specified', () => {
      const { container } = render(<TextReveal animation="slideUp">Test</TextReveal>)

      const animatedSpan = container.querySelector('span[aria-hidden="true"]')
      expect(animatedSpan?.className).toMatch(/slideUp/)
    })

    it('should apply blur animation class when specified', () => {
      const { container } = render(<TextReveal animation="blur">Test</TextReveal>)

      const animatedSpan = container.querySelector('span[aria-hidden="true"]')
      expect(animatedSpan?.className).toMatch(/blur/)
    })

    it('should apply unit class to animated elements', () => {
      const { container } = render(<TextReveal>Test</TextReveal>)

      const animatedSpan = container.querySelector('span[aria-hidden="true"]')
      expect(animatedSpan?.className).toMatch(/unit/)
    })
  })

  describe('Delay class calculation and capping', () => {
    it('should apply delay0 class to first word with no base delay', () => {
      const { container } = render(<TextReveal>Test</TextReveal>)

      const firstSpan = container.querySelector('span[aria-hidden="true"]')
      expect(firstSpan?.className).toMatch(/delay0/)
    })

    it('should apply stagger delays to subsequent words', () => {
      const { container } = render(<TextReveal stagger={100}>One Two Three</TextReveal>)

      const spans = container.querySelectorAll('span[aria-hidden="true"]')
      // Index includes spaces: "One"=0, " "=1, "Two"=2, " "=3, "Three"=4
      expect(spans[0].className).toMatch(/delay0/) // index 0
      expect(spans[1].className).toMatch(/delay200/) // index 2
      expect(spans[2].className).toMatch(/delay400/) // index 4
    })

    it('should apply base delay to all words', () => {
      const { container } = render(<TextReveal delay={200} stagger={50}>One Two</TextReveal>)

      const spans = container.querySelectorAll('span[aria-hidden="true"]')
      // Index includes spaces: "One"=0, " "=1, "Two"=2
      expect(spans[0].className).toMatch(/delay200/) // 200 + 0*50
      expect(spans[1].className).toMatch(/delay300/) // 200 + 2*50
    })

    it('should round delays to nearest 50ms', () => {
      const { container } = render(<TextReveal stagger={75}>One Two</TextReveal>)

      const spans = container.querySelectorAll('span[aria-hidden="true"]')
      // Index includes spaces: "One"=0, " "=1, "Two"=2
      // 0*75 = 0ms rounds to 0
      expect(spans[0].className).toMatch(/delay0/)
      // 2*75 = 150ms rounds to 150
      expect(spans[1].className).toMatch(/delay150/)
    })

    it('should cap delays at 2000ms', () => {
      const { container } = render(<TextReveal delay={3000}>Test</TextReveal>)

      const span = container.querySelector('span[aria-hidden="true"]')
      // Should be capped at delay2000, not delay3000
      expect(span?.className).toMatch(/delay2000/)
    })

    it('should cap calculated delays at 2000ms', () => {
      const { container } = render(<TextReveal stagger={500}>A B C D E</TextReveal>)

      const spans = container.querySelectorAll('span[aria-hidden="true"]')
      // Last span would be at 2000ms which is at the cap
      expect(spans[4].className).toMatch(/delay2000/)
    })
  })

  describe('Reduced motion preference handling', () => {
    it('should render plain text when user prefers reduced motion', () => {
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

      const { container } = render(<TextReveal>Hello World</TextReveal>)

      // Should not have animated spans
      const animatedSpans = container.querySelectorAll('span[aria-hidden="true"]')
      expect(animatedSpans.length).toBe(0)

      // Should have plain text
      expect(container.textContent).toBe('Hello World')
    })

    it('should not apply animation classes when reduced motion is preferred', () => {
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

      const { container } = render(<TextReveal animation="fadeUp">Test</TextReveal>)

      const element = container.firstChild as HTMLElement
      expect(element.className).not.toContain('fadeUp')
    })
  })

  describe('IntersectionObserver triggering', () => {
    it('should not have visible class initially', () => {
      const { container } = render(<TextReveal>Test</TextReveal>)

      const span = container.querySelector('span[aria-hidden="true"]')
      expect(span?.className).not.toContain('visible')
    })

    it('should accept custom threshold value', () => {
      // This tests that the threshold prop is passed correctly
      const { container } = render(<TextReveal threshold={0.5}>Test</TextReveal>)

      // Component should render without errors
      expect(container.firstChild).toBeInTheDocument()
    })
  })

  describe('Accessibility - aria attributes', () => {
    it('should add aria-label with full text content to container', () => {
      const { container } = render(<TextReveal>Hello World</TextReveal>)

      const wrapper = container.firstChild as HTMLElement
      expect(wrapper.getAttribute('aria-label')).toBe('Hello World')
    })

    it('should add aria-hidden to animated spans', () => {
      const { container } = render(<TextReveal>Hello World</TextReveal>)

      const spans = container.querySelectorAll('span[aria-hidden="true"]')
      spans.forEach((span) => {
        expect(span.getAttribute('aria-hidden')).toBe('true')
      })
    })

    it('should not add aria-hidden to space spans', () => {
      const { container } = render(<TextReveal>Hello World</TextReveal>)

      const spaceSpans = container.querySelectorAll('span.space')
      spaceSpans.forEach((span) => {
        expect(span.getAttribute('aria-hidden')).toBeNull()
      })
    })

    it('should not add aria-label when reduced motion is preferred', () => {
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

      const { container } = render(<TextReveal>Hello</TextReveal>)

      const wrapper = container.firstChild as HTMLElement
      expect(wrapper.getAttribute('aria-label')).toBeNull()
    })
  })

  describe('Component props', () => {
    it('should render as span by default', () => {
      const { container } = render(<TextReveal>Test</TextReveal>)

      expect(container.firstChild?.nodeName).toBe('SPAN')
    })

    it('should render as specified HTML element', () => {
      const elements = ['h1', 'h2', 'h3', 'h4', 'p', 'div'] as const

      elements.forEach((el) => {
        const { container } = render(<TextReveal as={el}>Test</TextReveal>)
        expect(container.firstChild?.nodeName).toBe(el.toUpperCase())
      })
    })

    it('should apply custom className to container', () => {
      const { container } = render(<TextReveal className="custom-class">Test</TextReveal>)

      const wrapper = container.firstChild as HTMLElement
      expect(wrapper).toHaveClass('custom-class')
    })

    it('should include container class along with custom className', () => {
      const { container } = render(<TextReveal className="custom-class">Test</TextReveal>)

      const wrapper = container.firstChild as HTMLElement
      // CSS modules hash the class names, so check if it contains the pattern
      expect(wrapper.className).toMatch(/container/)
      expect(wrapper).toHaveClass('custom-class')
    })
  })

  describe('Edge cases', () => {
    it('should handle empty string', () => {
      const { container } = render(<TextReveal>{''}</TextReveal>)

      const spans = container.querySelectorAll('span[aria-hidden="true"]')
      // Empty string splits into [""], which creates one empty element
      expect(spans.length).toBe(1)
      expect(spans[0].textContent).toBe('')
    })

    it('should handle single character', () => {
      const { container } = render(<TextReveal type="character">A</TextReveal>)

      const spans = container.querySelectorAll('span[aria-hidden="true"]')
      expect(spans.length).toBe(1)
      expect(spans[0].textContent).toBe('A')
    })

    it('should handle single word', () => {
      const { container } = render(<TextReveal>Hello</TextReveal>)

      const spans = container.querySelectorAll('span[aria-hidden="true"]')
      expect(spans.length).toBe(1)
      expect(spans[0].textContent).toBe('Hello')
    })

    it('should handle special characters', () => {
      const { container } = render(<TextReveal>Hello! World?</TextReveal>)

      // Should treat "Hello!" and "World?" as two words
      const spans = container.querySelectorAll('span[aria-hidden="true"]')
      expect(spans.length).toBe(2)
      expect(spans[0].textContent).toBe('Hello!')
      expect(spans[1].textContent).toBe('World?')
    })

    it('should handle numbers', () => {
      const { container } = render(<TextReveal>123 456</TextReveal>)

      const spans = container.querySelectorAll('span[aria-hidden="true"]')
      expect(spans.length).toBe(2)
      expect(spans[0].textContent).toBe('123')
      expect(spans[1].textContent).toBe('456')
    })
  })
})
