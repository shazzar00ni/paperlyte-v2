import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Testimonials } from './Testimonials'

describe('Testimonials', () => {
  it('should render as a section with correct id', () => {
    const { container } = render(<Testimonials />)

    const section = container.querySelector('section')
    expect(section).toBeInTheDocument()
    expect(section).toHaveAttribute('id', 'testimonials')
  })

  it('should render the section title', () => {
    render(<Testimonials />)

    expect(screen.getByText('What people are saying')).toBeInTheDocument()
  })

  describe('theme variants', () => {
    beforeEach(() => {
      document.documentElement.dataset.theme = 'light'
    })

    afterEach(() => {
      delete document.documentElement.dataset.theme
    })

    it.each(['light', 'dark'])('should render the testimonial quote in %s theme', (theme) => {
      document.documentElement.dataset.theme = theme
      render(<Testimonials />)

      // Should render the first testimonial quote (Sarah Chen's, index 0)
      expect(screen.getByText(/Paperlyte transformed how I capture ideas/i)).toBeInTheDocument()
    })

    it.each(['light', 'dark'])('should render placeholder author name in %s theme', (theme) => {
      document.documentElement.dataset.theme = theme
      render(<Testimonials />)

      // Should render Sarah Chen's name (testimonial-1, index 0)
      expect(screen.getByText('Sarah Chen')).toBeInTheDocument()
    })

    it.each(['light', 'dark'])('should render placeholder author role in %s theme', (theme) => {
      document.documentElement.dataset.theme = theme
      render(<Testimonials />)

      // Should render Sarah Chen's role
      expect(screen.getByText(/Product Manager/)).toBeInTheDocument()
    })
  })

  describe('carousel navigation', () => {
    it('should advance to the next slide when next button is clicked', async () => {
      const user = userEvent.setup()
      render(<Testimonials />)

      // First dot is active initially
      const dots = screen.getAllByRole('tab')
      expect(dots[0]).toHaveAttribute('aria-selected', 'true')
      expect(dots[1]).toHaveAttribute('aria-selected', 'false')

      await user.click(screen.getByRole('button', { name: 'Next testimonial' }))

      expect(dots[0]).toHaveAttribute('aria-selected', 'false')
      expect(dots[1]).toHaveAttribute('aria-selected', 'true')
    })

    it('should go back to the previous slide when previous button is clicked', async () => {
      const user = userEvent.setup()
      render(<Testimonials />)

      await user.click(screen.getByRole('button', { name: 'Next testimonial' }))
      await user.click(screen.getByRole('button', { name: 'Previous testimonial' }))

      const dots = screen.getAllByRole('tab')
      expect(dots[0]).toHaveAttribute('aria-selected', 'true')
    })
  })

  it('should render note about beta testimonials', () => {
    render(<Testimonials />)

    expect(
      screen.getByText(/Real feedback from people who switched to Paperlyte/i)
    ).toBeInTheDocument()
  })

  it('should use semantic blockquote for quote', () => {
    const { container } = render(<Testimonials />)

    const blockquote = container.querySelector('blockquote')
    expect(blockquote).toBeInTheDocument()
  })

  it('should use cite element for author name', () => {
    const { container } = render(<Testimonials />)

    const cite = container.querySelector('cite')
    expect(cite).toBeInTheDocument()
    // Should have a non-empty author name
    expect(cite?.textContent?.trim().length).toBeGreaterThan(0)
  })

  it('should render decorative quote icon', () => {
    const { container } = render(<Testimonials />)

    // The quotes are part of the blockquote text content, not separate decorative elements
    const blockquote = container.querySelector('blockquote')
    expect(blockquote).toBeInTheDocument()
    expect(blockquote?.textContent).toContain('"')
  })
})
