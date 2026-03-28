import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Terms } from './Terms'

describe('Terms', () => {
  it('should render the page title', () => {
    render(<Terms />)
    expect(
      screen.getByRole('heading', { level: 1, name: 'Terms of Service' })
    ).toBeInTheDocument()
  })

  it('should render the last updated date', () => {
    render(<Terms />)
    expect(screen.getByText(/Last Updated: March 7, 2026/)).toBeInTheDocument()
  })

  it('should render all major section headings', () => {
    render(<Terms />)

    const expectedHeadings = [
      'Agreement to Terms',
      'Description of Service',
      'User Accounts',
      'Acceptable Use',
      'Content Ownership & Rights',
      'Subscriptions & Payments',
      'Data & Privacy',
      'Service Availability',
      'Termination',
      'Limitation of Liability',
      'Warranty Disclaimer',
      'Indemnification',
      'Dispute Resolution',
      'Changes to Terms',
      'Miscellaneous',
      'Contact Information',
    ]

    expectedHeadings.forEach((heading) => {
      expect(screen.getByRole('heading', { name: heading })).toBeInTheDocument()
    })
  })

  it('should render the legal email link', () => {
    render(<Terms />)
    const emailLink = screen.getByRole('link', { name: 'legal@paperlyte.app' })
    expect(emailLink).toBeInTheDocument()
    expect(emailLink).toHaveAttribute('href', 'mailto:legal@paperlyte.app')
  })

  it('should render the contact website link', () => {
    render(<Terms />)
    const contactLink = screen.getByRole('link', { name: 'https://paperlyte.app/contact' })
    expect(contactLink).toBeInTheDocument()
    expect(contactLink).toHaveAttribute('target', '_blank')
    expect(contactLink).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('should render the privacy policy link', () => {
    render(<Terms />)
    const privacyLink = screen.getByRole('link', { name: 'Privacy Policy' })
    expect(privacyLink).toBeInTheDocument()
    expect(privacyLink).toHaveAttribute('href', '/privacy')
  })

  it('should render the development notice', () => {
    render(<Terms />)
    expect(screen.getByText(/Paperlyte is currently in development/)).toBeInTheDocument()
  })

  it('should use semantic HTML structure', () => {
    const { container } = render(<Terms />)

    const sections = container.querySelectorAll('section')
    expect(sections.length).toBeGreaterThan(0)

    const lists = container.querySelectorAll('ul')
    expect(lists.length).toBeGreaterThan(0)
  })

  it('should render without crashing', () => {
    const { container } = render(<Terms />)
    expect(container).toBeDefined()
  })
})
