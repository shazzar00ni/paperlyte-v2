import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Privacy } from './Privacy'

describe('Privacy', () => {
  it('should render the main h1 heading', () => {
    render(<Privacy />)
    expect(screen.getByRole('heading', { name: 'Privacy Policy', level: 1 })).toBeInTheDocument()
  })

  it('should display the last updated date', () => {
    render(<Privacy />)
    expect(screen.getByText(/Last Updated:/)).toBeInTheDocument()
  })

  it('should render all major section headings', () => {
    render(<Privacy />)

    const headings = [
      'Our Commitment to Privacy',
      'Information We Collect',
      'How We Use Your Information',
      'Data Security & Storage',
      'Data Sharing & Disclosure',
      'Your Rights & Choices',
      'Cookies & Tracking',
      "Children's Privacy",
      'International Users',
      'Changes to This Policy',
      'Contact Us',
    ]

    headings.forEach((heading: string): void => {
      expect(screen.getByRole('heading', { name: heading })).toBeInTheDocument()
    })
  })

  it('should render a contact email link', () => {
    render(<Privacy />)
    const emailLink = screen.getByRole('link', { name: 'privacy@paperlyte.app' })
    expect(emailLink).toBeInTheDocument()
    expect(emailLink).toHaveAttribute('href', 'mailto:privacy@paperlyte.app')
  })

  it('should render the contact form link with correct security attributes', () => {
    render(<Privacy />)
    const contactLink = screen.getByRole('link', { name: /Contact Form/i })
    expect(contactLink).toHaveAttribute('target', '_blank')
    expect(contactLink).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('should state that user data is not sold', () => {
    render(<Privacy />)
    expect(screen.getByText(/We do not sell your data/)).toBeInTheDocument()
  })

  it('should mention GDPR compliance for EU users', () => {
    render(<Privacy />)
    // "GDPR Compliance:" appears as a <strong> element inside a paragraph
    expect(screen.getByText(/GDPR Compliance:/)).toBeInTheDocument()
  })

  it('should list data rights including delete and export', () => {
    render(<Privacy />)
    expect(screen.getByText(/Delete Your Data/)).toBeInTheDocument()
    expect(screen.getByText(/Export Your Notes/)).toBeInTheDocument()
  })
})
