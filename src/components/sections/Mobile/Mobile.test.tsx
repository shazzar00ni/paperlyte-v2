import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Mobile } from './Mobile'

describe('Mobile', () => {
  describe('Rendering', () => {
    it('should render as a section with correct id', () => {
      const { container } = render(<Mobile />)

      const section = container.querySelector('section')
      expect(section).toBeInTheDocument()
      expect(section).toHaveAttribute('id', 'mobile')
    })

    it('should render the headline', () => {
      render(<Mobile />)

      expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument()
      expect(screen.getByText(/Capture inspiration/i)).toBeInTheDocument()
      expect(screen.getByText(/wherever you are/i)).toBeInTheDocument()
    })

    it('should render the description paragraph', () => {
      render(<Mobile />)

      expect(screen.getByText(/Our mobile app is designed for speed/i)).toBeInTheDocument()
    })
  })

  describe('Link', () => {
    it('should render Explore Mobile Features link', () => {
      render(<Mobile />)

      const link = screen.getByRole('link', { name: /Explore Mobile Features/i })
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute('href', '#mobile')
    })

    it('should render arrow icon inside the link element', () => {
      render(<Mobile />)

      const link = screen.getByRole('link', { name: /Explore Mobile Features/i })
      const arrowIcon = link.querySelector('svg, .icon-fallback')

      expect(arrowIcon).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      render(<Mobile />)

      const heading = screen.getByRole('heading', { level: 2 })
      expect(heading.tagName).toBe('H2')
    })

    it('should render with dark background section', () => {
      const { container } = render(<Mobile />)

      const section = container.querySelector('section')
      const classList = Array.from(section?.classList ?? [])
      expect(classList.some((cls) => cls.includes('mobile'))).toBe(true)
    })
  })

  describe('Content Structure', () => {
    it('should render content in correct order', () => {
      const { container } = render(<Mobile />)

      // Verify DOM order by checking parent positions
      const content = container.querySelector('[class*="content"]')
      expect(content).toBeInTheDocument()

      const children = Array.from(content?.children ?? []).map((child) => child.textContent)

      const headingIndex = children.findIndex((text) => text?.includes('Capture inspiration'))
      const descIndex = children.findIndex((text) => text?.includes('Our mobile app'))
      const linkIndex = children.findIndex((text) => text?.includes('Explore Mobile'))

      expect(headingIndex).toBeLessThan(descIndex)
      expect(descIndex).toBeLessThan(linkIndex)
    })
  })
})
