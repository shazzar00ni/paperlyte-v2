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
    expect(screen.getByText('Ready when your thoughts are.')).toBeInTheDocument()
  })

  it('should render subtitle about note-taking', () => {
    render(<CTA />)
    expect(screen.getByText(/Paperlyte is opening early access/i)).toBeInTheDocument()
  })

  it('should render waitlist message', () => {
    render(<CTA />)
    expect(screen.getByText(/Join the waitlist for a launch invite/i)).toBeInTheDocument()
  })

  it('should render Get Early Access button', () => {
    render(<CTA />)

    const button = screen.getByRole('button', { name: /Get Early Access/i })
    expect(button).toBeInTheDocument()
  })

  it('should render Review the features button', () => {
    render(<CTA />)

    const button = screen.getByRole('button', { name: /Review the features/i })
    expect(button).toBeInTheDocument()
  })

  it('should render microcopy with launch details', () => {
    render(<CTA />)

    expect(screen.getByText(/Early access starts Q2 2026/i)).toBeInTheDocument()
    expect(screen.getByText(/500\+ already waiting/i)).toBeInTheDocument()
    expect(screen.getByText(/No credit card required/i)).toBeInTheDocument()
  })

  it('should have proper heading hierarchy', () => {
    render(<CTA />)

    const mainHeading = screen.getByRole('heading', {
      level: 2,
      name: /Ready when your thoughts are/i,
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
