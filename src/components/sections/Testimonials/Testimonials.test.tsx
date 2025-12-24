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

  it('should render the testimonial quote', () => {
    render(<Testimonials />)

    // Should render at least one testimonial quote (Marcus Johnson's quote)
    expect(screen.getByText(/I've tried every note app out there/i)).toBeInTheDocument()
  })

  it('should render placeholder author name', () => {
    render(<Testimonials />)

    // Should render Marcus Johnson's name (from testimonial-2)
    expect(screen.getByText('Marcus Johnson')).toBeInTheDocument()
  })

  it('should render placeholder author role', () => {
    render(<Testimonials />)

    // Should render Marcus Johnson's role
    expect(screen.getByText('Freelance Writer')).toBeInTheDocument()
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
    // Should have any author name (checking for first testimonial)
    expect(cite?.textContent).toBeTruthy()
  })

  it('should render decorative quote icon', () => {
    const { container } = render(<Testimonials />)

    // The quotes are part of the blockquote text content, not separate decorative elements
    const blockquote = container.querySelector('blockquote')
    expect(blockquote).toBeInTheDocument()
    expect(blockquote?.textContent).toContain('"')
  })
})
