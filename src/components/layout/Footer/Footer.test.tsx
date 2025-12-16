import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Footer } from './Footer'

describe('Footer', () => {
  it('should render footer element', () => {
    const { container } = render(<Footer />)
    expect(container.querySelector('footer')).toBeInTheDocument()
  })

  it('should render Paperlyte logo with icon and text', () => {
    const { container } = render(<Footer />)

    const logoIcon = container.querySelector('.fa-feather')
    expect(logoIcon).toBeInTheDocument()
    expect(logoIcon).toHaveAttribute('aria-label', 'Paperlyte logo')

    expect(screen.getByText('Paperlyte.')).toBeInTheDocument()
  })

  it('should render tagline', () => {
    render(<Footer />)
    expect(screen.getByText('Designed for clarity in a chaotic world.')).toBeInTheDocument()
  })

  it('should render Product link group', () => {
    render(<Footer />)

    expect(screen.getByText('Product')).toBeInTheDocument()

    const featuresLink = screen.getByRole('link', { name: 'Features' })
    expect(featuresLink).toBeInTheDocument()
    expect(featuresLink).toHaveAttribute('href', '#features')

    const mobileLink = screen.getByRole('link', { name: 'Mobile App' })
    expect(mobileLink).toBeInTheDocument()
    expect(mobileLink).toHaveAttribute('href', '#mobile')

    const desktopLink = screen.getByRole('link', { name: 'Desktop App' })
    expect(desktopLink).toBeInTheDocument()
    expect(desktopLink).toHaveAttribute('href', '#download')

    const testimonialsLink = screen.getByRole('link', { name: 'Testimonials' })
    expect(testimonialsLink).toBeInTheDocument()
    expect(testimonialsLink).toHaveAttribute('href', '#testimonials')
  })

  it('should render Legal link group', () => {
    render(<Footer />)

    expect(screen.getByText('Legal')).toBeInTheDocument()

    const privacyLink = screen.getByRole('link', { name: 'Privacy Policy' })
    expect(privacyLink).toBeInTheDocument()

    const termsLink = screen.getByRole('link', { name: 'Terms of Service' })
    expect(termsLink).toBeInTheDocument()
  })

  it('should render Connect link group with social links', () => {
    render(<Footer />)

    expect(screen.getByText('Connect')).toBeInTheDocument()

    expect(screen.getByRole('link', { name: 'Follow us on X (Twitter)' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Follow us on Instagram' })).toBeInTheDocument()
  })

  it('should render Twitter link with proper attributes', () => {
    render(<Footer />)

    const twitterLink = screen.getByRole('link', { name: 'Follow us on X (Twitter)' })
    expect(twitterLink).toBeInTheDocument()
    expect(twitterLink).toHaveAttribute('href', 'https://twitter.com')
    expect(twitterLink).toHaveAttribute('target', '_blank')
    expect(twitterLink).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('should render Instagram link with proper attributes', () => {
    render(<Footer />)

    const instagramLink = screen.getByRole('link', { name: 'Follow us on Instagram' })
    expect(instagramLink).toBeInTheDocument()
    expect(instagramLink).toHaveAttribute('href', 'https://instagram.com')
    expect(instagramLink).toHaveAttribute('target', '_blank')
    expect(instagramLink).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('should render LinkedIn link with proper attributes', () => {
    render(<Footer />)

    const linkedinLink = screen.getByRole('link', { name: 'Follow us on LinkedIn' })
    expect(linkedinLink).toBeInTheDocument()
    expect(linkedinLink).toHaveAttribute('href', 'https://linkedin.com')
    expect(linkedinLink).toHaveAttribute('target', '_blank')
    expect(linkedinLink).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('should render Email link with mailto', () => {
    render(<Footer />)

    const emailLink = screen.getByRole('link', { name: 'Email us' })
    expect(emailLink).toBeInTheDocument()
    expect(emailLink).toHaveAttribute('href', 'mailto:hello@paperlyte.com')
  })

  it('should render copyright with current year', () => {
    render(<Footer />)

    const currentYear = new Date().getFullYear()
    expect(screen.getByText(`© ${currentYear} All rights reserved.`)).toBeInTheDocument()
  })

  it('should have proper accessibility structure', () => {
    const { container } = render(<Footer />)

    const headings = container.querySelectorAll('h3')
    expect(headings).toHaveLength(3)

    const lists = container.querySelectorAll('ul')
    expect(lists.length).toBeGreaterThanOrEqual(2)
  })

  it('should render all navigation sections', () => {
    render(<Footer />)

    expect(screen.getByText('Product')).toBeInTheDocument()
    expect(screen.getByText('Legal')).toBeInTheDocument()
    expect(screen.getByText('Connect')).toBeInTheDocument()
  })
})
