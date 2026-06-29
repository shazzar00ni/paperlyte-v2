import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { LEGAL_CONFIG } from '@/constants/legal'
import { Footer } from './Footer'
import styles from './Footer.module.css'

describe('Footer', () => {
  it('should render footer element', () => {
    const { container } = render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    )
    expect(container.querySelector('footer')).toBeInTheDocument()
  })

  it('should render Paperlyte logo with icon and text', () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    )

    expect(screen.getByRole('img', { name: 'Paperlyte logo' })).toBeInTheDocument()
    expect(screen.getByText('Paperlyte.')).toBeInTheDocument()
  })

  it('should render tagline', () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    )
    expect(screen.getByText('Your thoughts, unchained.')).toBeInTheDocument()
  })

  it('should render Product link group', () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    )

    expect(screen.getByRole('heading', { name: 'Product', level: 3 })).toBeInTheDocument()

    const featuresLink = screen.getByRole('link', { name: 'Features' })
    expect(featuresLink).toHaveAttribute('href', '#features')

    expect(screen.getByRole('link', { name: 'Roadmap' })).toBeInTheDocument()

    const pricingLink = screen.getByRole('link', { name: 'Pricing' })
    expect(pricingLink).toHaveAttribute('href', '#pricing')

    expect(screen.getByRole('link', { name: 'Changelog' })).toBeInTheDocument()

    const githubLink = screen.getByRole('link', { name: 'GitHub' })
    expect(githubLink).toHaveAttribute('href', LEGAL_CONFIG.social.github)
  })

  it('should render Legal link group', () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    )

    expect(screen.getByRole('heading', { name: 'Legal', level: 3 })).toBeInTheDocument()

    const privacyLink = screen.getByRole('link', { name: 'Privacy Policy' })
    expect(privacyLink).toHaveAttribute('href', '/privacy')
    expect(privacyLink).not.toHaveAttribute('target', '_blank')

    const termsLink = screen.getByRole('link', { name: 'Terms of Service' })
    expect(termsLink).toHaveAttribute('href', '/terms')
    expect(termsLink).not.toHaveAttribute('target', '_blank')

    const contactLink = screen.getByRole('link', { name: 'Contact' })
    expect(contactLink).toHaveAttribute('href', `mailto:${LEGAL_CONFIG.company.email}`)
  })

  it('should render Connect link group with social links', () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    )

    expect(screen.getByRole('heading', { name: 'Connect', level: 3 })).toBeInTheDocument()

    const twitterLink = screen.getByRole('link', { name: 'Follow us on X (Twitter)' })
    const instagramLink = screen.getByRole('link', { name: 'Follow us on Instagram' })
    const emailLink = screen.getByRole('link', { name: 'Email us' })

    expect(twitterLink).toHaveClass(styles.socialLink)
    expect(instagramLink).toHaveClass(styles.socialLink)
    expect(emailLink).toHaveClass(styles.socialLink)
    expect(screen.queryByRole('link', { name: 'Follow us on GitHub' })).not.toBeInTheDocument()
  })

  it('should render GitHub link with proper attributes in the Product group', () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    )

    const githubLink = screen.getByRole('link', { name: 'GitHub' })
    expect(githubLink).toHaveAttribute('href', LEGAL_CONFIG.social.github)
    expect(githubLink).toHaveAttribute('target', '_blank')
    expect(githubLink).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('should render Twitter link with proper attributes', () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    )

    const twitterLink = screen.getByRole('link', { name: 'Follow us on X (Twitter)' })
    expect(twitterLink).toHaveAttribute('href', LEGAL_CONFIG.social.twitter)
    expect(twitterLink).toHaveAttribute('target', '_blank')
    expect(twitterLink).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('should render Instagram link with proper attributes', () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    )

    const instagramLink = screen.getByRole('link', { name: 'Follow us on Instagram' })
    expect(instagramLink).toHaveAttribute('href', LEGAL_CONFIG.social.instagram)
    expect(instagramLink).toHaveAttribute('target', '_blank')
    expect(instagramLink).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('should render Email link with mailto', () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    )

    const emailLink = screen.getByRole('link', { name: 'Email us' })
    expect(emailLink).toHaveAttribute('href', `mailto:${LEGAL_CONFIG.company.email}`)
  })

  it('should render copyright with current year', () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    )

    const currentYear = new Date().getFullYear()
    expect(screen.getByText(`© ${currentYear} Paperlyte. All rights reserved.`)).toBeInTheDocument()
  })

  it('should have proper accessibility structure', () => {
    const { container } = render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    )

    const headings = container.querySelectorAll('h3')
    expect(headings).toHaveLength(3)

    const lists = container.querySelectorAll('ul')
    expect(lists).toHaveLength(3)
  })

  it('should render all navigation sections', () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    )

    expect(screen.getByRole('heading', { name: 'Product', level: 3 })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Legal', level: 3 })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Connect', level: 3 })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Company', level: 3 })).not.toBeInTheDocument()
  })
})
