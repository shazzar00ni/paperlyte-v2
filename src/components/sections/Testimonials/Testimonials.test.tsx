import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
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

  it.each(['light', 'dark'])('should render the testimonial quote in %s theme', (theme) => {
    document.documentElement.dataset.theme = theme
    render(<Testimonials />)

    // Should render the first testimonial quote (Sarah Chen's, index 0)
    expect(screen.getByText(/Paperlyte transformed how I capture ideas/i)).toBeInTheDocument()

    delete document.documentElement.dataset.theme
  })

  it.each(['light', 'dark'])('should render placeholder author name in %s theme', (theme) => {
    document.documentElement.dataset.theme = theme
    render(<Testimonials />)

    // Should render Sarah Chen's name (testimonial-1, index 0)
    expect(screen.getByText('Sarah Chen')).toBeInTheDocument()

    delete document.documentElement.dataset.theme
  })

  it.each(['light', 'dark'])('should render placeholder author role in %s theme', (theme) => {
    document.documentElement.dataset.theme = theme
    render(<Testimonials />)

    // Should render Sarah Chen's role (displayed as "Product Manager • TechCorp")
    expect(screen.getByText(/Product Manager/)).toBeInTheDocument()

    delete document.documentElement.dataset.theme
  })

  it('should render note about beta testimonials', () => {
    render(<Testimonials />)

    // Should render the subtitle about real feedback
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
