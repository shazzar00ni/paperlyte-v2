import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Footer } from './Footer'

describe('Footer', () => {
  it('should render footer element', () => {
    const { container } = render(<Footer />)
    expect(container.querySelector('footer')).toBeInTheDocument()
  })

  it('should render Paperlyte logo with icon and text', () => {
    render(<Footer />)

    // Icon component renders SVG, check for aria-label
    expect(screen.getByLabelText('Paperlyte logo')).toBeInTheDocument()
    expect(screen.getByText('Paperlyte.')).toBeInTheDocument()
  })

  it('should render tagline', () => {
    render(<Footer />)
    expect(screen.getByText('Your thoughts, unchained.')).toBeInTheDocument()
  })

  it('should render Product link group', () => {
    render(<Footer />)

    expect(screen.getByText('Product')).toBeInTheDocument()

    const featuresLink = screen.getByRole('link', { name: 'Features' })
    expect(featuresLink).toBeInTheDocument()
    expect(featuresLink).toHaveAttribute('href', '#features')

    const pricingLink = screen.getByRole('link', { name: 'Pricing' })
    expect(pricingLink).toBeInTheDocument()
    expect(pricingLink).toHaveAttribute('href', '#pricing')
  })

  it('should render Company link group', () => {
    render(<Footer />)

    expect(screen.getByText('Company')).toBeInTheDocument()

    const contactLink = screen.getByRole('link', { name: 'Contact' })
    expect(contactLink).toBeInTheDocument()
    expect(contactLink).toHaveAttribute('href', 'mailto:hello@paperlyte.com')
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

    expect(screen.getByRole('link', { name: 'Follow us on GitHub' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Follow us on X (Twitter)' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Follow us on Instagram' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Email us' })).toBeInTheDocument()
  })

  it('should render GitHub link with proper attributes', () => {
    render(<Footer />)

    const githubLink = screen.getByRole('link', { name: 'Follow us on GitHub' })
    expect(githubLink).toBeInTheDocument()
    expect(githubLink).toHaveAttribute('href', 'https://github.com/shazzar00ni/paperlyte-v2')
    expect(githubLink).toHaveAttribute('target', '_blank')
    expect(githubLink).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('should render Twitter link with proper attributes', () => {
    render(<Footer />)

    const twitterLink = screen.getByRole('link', { name: 'Follow us on X (Twitter)' })
    expect(twitterLink).toBeInTheDocument()
    expect(twitterLink).toHaveAttribute('href', 'https://x.com/paperlyte')
    expect(twitterLink).toHaveAttribute('target', '_blank')
    expect(twitterLink).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('should render Instagram link with proper attributes', () => {
    render(<Footer />)

    const instagramLink = screen.getByRole('link', { name: 'Follow us on Instagram' })
    expect(instagramLink).toBeInTheDocument()
    expect(instagramLink).toHaveAttribute('href', 'https://instagram.com/paperlytefilms')
    expect(instagramLink).toHaveAttribute('target', '_blank')
    expect(instagramLink).toHaveAttribute('rel', 'noopener noreferrer')
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
    expect(
      screen.getByText(`© ${currentYear} Paperlyte. All rights reserved.`)
    ).toBeInTheDocument()
  })

  it('should have proper accessibility structure', () => {
    const { container } = render(<Footer />)

    // Footer has 4 sections: Product, Company, Legal, Connect
    const headings = container.querySelectorAll('h3')
    expect(headings).toHaveLength(4)

    const lists = container.querySelectorAll('ul')
    expect(lists.length).toBeGreaterThanOrEqual(3)
  })

  it('should render all navigation sections', () => {
    render(<Footer />)

    expect(screen.getByText('Product')).toBeInTheDocument()
    expect(screen.getByText('Company')).toBeInTheDocument()
    expect(screen.getByText('Legal')).toBeInTheDocument()
    expect(screen.getByText('Connect')).toBeInTheDocument()
  })
})
