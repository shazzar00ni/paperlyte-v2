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

  it('should render the testimonial quote', () => {
    render(<Testimonials />)

    expect(screen.getByText(/I've tried every note-taking app out there/i)).toBeInTheDocument()
  })

  it('should render author name', () => {
    render(<Testimonials />)

    expect(screen.getByText('Sarah Jenkins')).toBeInTheDocument()
  })

  it('should render author role', () => {
    render(<Testimonials />)

    expect(screen.getByText('Creative Director at Studio M')).toBeInTheDocument()
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
    expect(cite).toHaveTextContent('Sarah Jenkins')
  })

  it('should render decorative quote icon', () => {
    const { container } = render(<Testimonials />)

    const quoteIcon = container.querySelector('[aria-hidden="true"]')
    expect(quoteIcon).toBeInTheDocument()
    expect(quoteIcon).toHaveTextContent('"')
  })
})
