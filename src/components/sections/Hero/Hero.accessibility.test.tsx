import { render, screen } from '@testing-library/react'
import { Hero } from './Hero'

describe('Hero - Accessibility', () => {
  describe('ARIA Labels', () => {
    it('should have accessible button labels', () => {
      render(<Hero />)

      const seeHowButton = screen.getByRole('button', { name: /see how.*works/i })
      const joinButton = screen.getByRole('button', { name: /join.*waitlist/i })

      expect(seeHowButton).toBeInTheDocument()
      expect(joinButton).toBeInTheDocument()
    })

    it('should have main heading visible to screen readers', () => {
      render(<Hero />)

      const heading = screen.getByRole('heading', { level: 1 })
      expect(heading).toHaveAccessibleName()
    })

    it('should have descriptive text visible to screen readers', () => {
      render(<Hero />)

      const subheadline = screen.getByText(/lightning-fast/i)
      expect(subheadline).toBeVisible()
    })

    it('should hide decorative mockup from screen readers', () => {
      const { container } = render(<Hero />)

      const mockup = container.querySelector('[aria-hidden="true"]')
      expect(mockup).toBeInTheDocument()
    })

    it('should have proper ARIA label for See How It Works button', () => {
      render(<Hero />)

      const button = screen.getByRole('button', { name: /see how.*works/i })
      expect(button).toHaveAccessibleName()
    })
  })

  describe('Semantic HTML', () => {
    it('should use h1 for main headline', () => {
      render(<Hero />)

      const heading = screen.getByRole('heading', { level: 1 })
      expect(heading.tagName).toBe('H1')
    })

    it('should use form element for email capture', () => {
      const { container } = render(<Hero />)

      const form = container.querySelector('form')
      expect(form).toBeInTheDocument()
      expect(form?.tagName).toBe('FORM')
    })

    it('should use button elements for CTAs', () => {
      render(<Hero />)

      const seeHowButton = screen.getByRole('button', { name: /see how.*works/i })
      const joinButton = screen.getByRole('button', { name: /join.*waitlist/i })

      expect(seeHowButton.tagName).toBe('BUTTON')
      expect(joinButton.tagName).toBe('BUTTON')
    })
  })

  describe('Keyboard Navigation', () => {
    it('should have focusable CTA buttons', () => {
      render(<Hero />)

      const button = screen.getByRole('button', { name: /see how.*works/i })
      button.focus()

      expect(button).toHaveFocus()
    })

    it('should have focusable email input', () => {
      render(<Hero />)

      const input = screen.getByPlaceholderText(/your@email.com/i)
      input.focus()

      expect(input).toHaveFocus()
    })
  })
})
