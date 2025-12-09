import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CTA } from './CTA'

describe('CTA', () => {
  it('should render as a section with correct id', () => {
    const { container } = render(<CTA />)

    const section = container.querySelector('section')
    expect(section).toBeInTheDocument()
    expect(section).toHaveAttribute('id', 'download')
  })

  it('should render main heading', () => {
    render(<CTA />)
    expect(screen.getByText('Ready to declutter your mind?')).toBeInTheDocument()
  })

  it('should render subtitle', () => {
    render(<CTA />)
    expect(
      screen.getByText(/Join 20,000\+ professionals organizing their life with Paperlyte/i)
    ).toBeInTheDocument()
  })

  it('should render Get Started for Free button', () => {
    render(<CTA />)

    const button = screen.getByRole('button', { name: /Get Started for Free/i })
    expect(button).toBeInTheDocument()
  })

  it('should render Compare Plans button', () => {
    render(<CTA />)

    const button = screen.getByRole('button', { name: /Compare Plans/i })
    expect(button).toBeInTheDocument()
  })

  it('should have proper heading hierarchy', () => {
    render(<CTA />)

    const mainHeading = screen.getByRole('heading', {
      level: 2,
      name: /Ready to declutter your mind\?/i,
    })
    expect(mainHeading).toBeInTheDocument()
  })

  it('should render two CTA buttons', () => {
    render(<CTA />)

    const buttons = screen.getAllByRole('button')
    expect(buttons).toHaveLength(2)
  })

  it('should render without crashing', () => {
    const { container } = render(<CTA />)
    expect(container).toBeDefined()
    expect(container.querySelector('section')).toBeInTheDocument()
  })
})
