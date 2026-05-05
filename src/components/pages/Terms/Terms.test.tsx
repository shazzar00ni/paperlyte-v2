import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Terms } from './Terms'

describe('Terms', () => {
  it('should render the main h1 heading', () => {
    render(<Terms />)
    expect(screen.getByRole('heading', { name: 'Terms of Service', level: 1 })).toBeInTheDocument()
  })

  it('should display the last updated date', () => {
    render(<Terms />)
    expect(screen.getByText(/Last Updated:/)).toBeInTheDocument()
  })

  it('should render all major section headings', () => {
    render(<Terms />)

    const headings = [
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

    headings.forEach((heading: string): void => {
      expect(screen.getByRole('heading', { name: heading })).toBeInTheDocument()
    })
  })

  it('should render a link to the privacy policy', () => {
    render(<Terms />)
    const privacyLink = screen.getByRole('link', { name: 'Privacy Policy' })
    expect(privacyLink).toBeInTheDocument()
    expect(privacyLink).toHaveAttribute('href', '/privacy')
  })

  it('should render the contact email link', () => {
    render(<Terms />)
    const emailLink = screen.getByRole('link', { name: 'legal@paperlyte.app' })
    expect(emailLink).toBeInTheDocument()
    expect(emailLink).toHaveAttribute('href', 'mailto:legal@paperlyte.app')
  })

  it('should state that users retain content rights', () => {
    render(<Terms />)
    expect(screen.getByText(/You retain all rights to your notes and content/)).toBeInTheDocument()
  })

  it('should list the minimum age requirement', () => {
    render(<Terms />)
    expect(screen.getByText(/at least 13 years old/)).toBeInTheDocument()
  })

  it('should describe the free tier offering', () => {
    render(<Terms />)
    expect(screen.getByText(/free tier with basic features/)).toBeInTheDocument()
  })

  it('should mention governing law', () => {
    render(<Terms />)
    expect(screen.getByText(/State of Delaware/)).toBeInTheDocument()
  })

  it('should include a note that it is pre-launch', () => {
    render(<Terms />)
    expect(screen.getByText(/currently in development/i)).toBeInTheDocument()
  })
})
