import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Privacy } from './Privacy'

describe('Privacy', () => {
  it('should render the page title', () => {
    render(<Privacy />)
    expect(screen.getByRole('heading', { level: 1, name: 'Privacy Policy' })).toBeInTheDocument()
  })

  it('should render the last updated date', () => {
    render(<Privacy />)
    expect(screen.getByText(/Last Updated: March 7, 2026/)).toBeInTheDocument()
  })

  it('should render all major section headings', () => {
    render(<Privacy />)

    const expectedHeadings = [
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

    expectedHeadings.forEach((heading) => {
      expect(screen.getByRole('heading', { name: heading })).toBeInTheDocument()
    })
  })

  it('should render the privacy email link', () => {
    render(<Privacy />)
    const emailLink = screen.getByRole('link', { name: 'privacy@paperlyte.app' })
    expect(emailLink).toBeInTheDocument()
    expect(emailLink).toHaveAttribute('href', 'mailto:privacy@paperlyte.app')
  })

  it('should render the contact form link with correct attributes', () => {
    render(<Privacy />)
    const contactLink = screen.getByRole('link', {
      name: /Contact Form/i,
    })
    expect(contactLink).toBeInTheDocument()
    expect(contactLink).toHaveAttribute('href', 'https://paperlyte.app/contact')
    expect(contactLink).toHaveAttribute('target', '_blank')
    expect(contactLink).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('should render GDPR compliance information', () => {
    render(<Privacy />)
    expect(screen.getByText(/GDPR Compliance/)).toBeInTheDocument()
  })

  it('should use semantic HTML structure', () => {
    const { container } = render(<Privacy />)

    // Should have section elements for content grouping
    const sections = container.querySelectorAll('section')
    expect(sections.length).toBeGreaterThan(0)

    // Should have lists for data items
    const lists = container.querySelectorAll('ul')
    expect(lists.length).toBeGreaterThan(0)
  })

  it('should render without crashing', () => {
    const { container } = render(<Privacy />)
    expect(container).toBeDefined()
  })
})
