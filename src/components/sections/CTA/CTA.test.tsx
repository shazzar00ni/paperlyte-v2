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
    expect(screen.getByText('Stop fighting your tools. Start thinking clearly.')).toBeInTheDocument()
  })

  it('should render subtitle about note-taking', () => {
    render(<CTA />)
    expect(
      screen.getByText(/Note-taking shouldn't feel like work/i)
    ).toBeInTheDocument()
  })

  it('should render waitlist message', () => {
    render(<CTA />)
    expect(
      screen.getByText(/Join the waitlist today and be among the first/i)
    ).toBeInTheDocument()
  })

  it('should render Join the Waitlist button', () => {
    render(<CTA />)

    const button = screen.getByRole('button', { name: /Join the Waitlist/i })
    expect(button).toBeInTheDocument()
  })

  it('should render Watch the Demo Again button', () => {
    render(<CTA />)

    const button = screen.getByRole('button', { name: /Watch the Demo Again/i })
    expect(button).toBeInTheDocument()
  })

  it('should render microcopy with launch details', () => {
    render(<CTA />)

    expect(screen.getByText(/Launching Q2 2026/i)).toBeInTheDocument()
    expect(screen.getByText(/500\+ already waiting/i)).toBeInTheDocument()
    expect(screen.getByText(/No credit card required/i)).toBeInTheDocument()
  })

  it('should have proper heading hierarchy', () => {
    render(<CTA />)

    const mainHeading = screen.getByRole('heading', {
      level: 2,
      name: /Stop fighting your tools/i,
    })
    expect(mainHeading).toBeInTheDocument()
  })

  it('should render two CTA buttons', () => {
    render(<CTA />)

    const buttons = screen.getAllByRole('button')
    expect(buttons).toHaveLength(2)
  })

  it('should render without crashing', () => {
    const { container} = render(<CTA />)
    expect(container).toBeDefined()
    expect(container.querySelector('section')).toBeInTheDocument()
  })
})
