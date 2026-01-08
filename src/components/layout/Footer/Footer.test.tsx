import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Footer } from './Footer'

const renderFooter = () => {
  return render(
    <MemoryRouter>
      <Footer />
    </MemoryRouter>
  )
}

describe('Footer', () => {
  it('should render footer element', () => {
    const { container } = renderFooter()
    expect(container.querySelector('footer')).toBeInTheDocument()
  })

  it('should render Product link group', () => {
    renderFooter()

    expect(screen.getByText('Product')).toBeInTheDocument()

    const featuresLink = screen.getByRole('link', { name: 'Features' })
    expect(featuresLink).toBeInTheDocument()
    expect(featuresLink.getAttribute('href')).toMatch(/#features$/)

    const roadmapLink = screen.getByRole('link', { name: 'Roadmap' })
    expect(roadmapLink).toBeInTheDocument()
    expect(roadmapLink.getAttribute('href')).toMatch(/#roadmap$/)

    const pricingLink = screen.getByRole('link', { name: 'Pricing' })
    expect(pricingLink).toBeInTheDocument()
    expect(pricingLink.getAttribute('href')).toMatch(/#pricing$/)

    const changelogLink = screen.getByRole('link', { name: 'Changelog' })
    expect(changelogLink).toBeInTheDocument()
    expect(changelogLink.getAttribute('href')).toMatch(/#changelog$/)

    const githubProductLink = screen.getAllByRole('link', { name: 'GitHub' })[0]
    expect(githubProductLink).toBeInTheDocument()
  })

  it('should render Legal link group', () => {
    renderFooter()

    expect(screen.getByText('Legal')).toBeInTheDocument()

    const privacyLink = screen.getByRole('link', { name: 'Privacy Policy' })
    expect(privacyLink).toBeInTheDocument()
    // React Router Link uses 'to' prop which gets converted to href
    expect(privacyLink).toHaveAttribute('href', '/privacy')

    const termsLink = screen.getByRole('link', { name: 'Terms of Service' })
    expect(termsLink).toBeInTheDocument()
    expect(termsLink).toHaveAttribute('href', '/terms')

    const contactLink = screen.getByRole('link', { name: 'Contact' })
    expect(contactLink).toBeInTheDocument()
    expect(contactLink).toHaveAttribute('href', 'mailto:hello@paperlyte.com')
  })

  it('should use React Router Link for internal navigation', () => {
    renderFooter()

    // Privacy and Terms should use Link component (rendered as <a> with href starting with /)
    const privacyLink = screen.getByRole('link', { name: 'Privacy Policy' })
    expect(privacyLink.getAttribute('href')).toBe('/privacy')

    const termsLink = screen.getByRole('link', { name: 'Terms of Service' })
    expect(termsLink.getAttribute('href')).toBe('/terms')

    // Verify they don't have target="_blank" (internal links)
    expect(privacyLink).not.toHaveAttribute('target')
    expect(termsLink).not.toHaveAttribute('target')
  })

  it('should render Connect link group with social links', () => {
    renderFooter()

    expect(screen.getByText('Connect')).toBeInTheDocument()

    expect(screen.getByRole('link', { name: 'Follow us on GitHub' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Follow us on X (Twitter)' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Follow us on Instagram' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Email us' })).toBeInTheDocument()
  })

  it('should render GitHub link with proper attributes', () => {
    renderFooter()

    const githubLink = screen.getByRole('link', { name: 'Follow us on GitHub' })
    expect(githubLink).toBeInTheDocument()
    expect(githubLink).toHaveAttribute('href', 'https://github.com/shazzar00ni/paperlyte-v2')
    expect(githubLink).toHaveAttribute('target', '_blank')
    expect(githubLink).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('should render Twitter link with proper attributes', () => {
    renderFooter()

    const twitterLink = screen.getByRole('link', { name: 'Follow us on X (Twitter)' })
    expect(twitterLink).toBeInTheDocument()
    expect(twitterLink).toHaveAttribute('href', 'https://x.com/paperlyte')
    expect(twitterLink).toHaveAttribute('target', '_blank')
    expect(twitterLink).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('should render Instagram link with proper attributes', () => {
    renderFooter()

    const instagramLink = screen.getByRole('link', { name: 'Follow us on Instagram' })
    expect(instagramLink).toBeInTheDocument()
    expect(instagramLink).toHaveAttribute('href', 'https://instagram.com/paperlytefilms')
    expect(instagramLink).toHaveAttribute('target', '_blank')
    expect(instagramLink).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('should render Email link with mailto', () => {
    renderFooter()

    const emailLink = screen.getByRole('link', { name: 'Email us' })
    expect(emailLink).toBeInTheDocument()
    expect(emailLink).toHaveAttribute('href', 'mailto:hello@paperlyte.com')
  })

  it('should render copyright with current year', () => {
    renderFooter()

    const currentYear = new Date().getFullYear()
    expect(screen.getByText(`© ${currentYear} Paperlyte. All rights reserved.`)).toBeInTheDocument()
  })

  it('should have proper accessibility structure', () => {
    const { container } = renderFooter()

    // Footer has 3 sections: Product, Legal, Connect
    const headings = container.querySelectorAll('h3')
    expect(headings).toHaveLength(3)

    const lists = container.querySelectorAll('ul')
    expect(lists.length).toBeGreaterThanOrEqual(3)
  })

  it('should render all navigation sections', () => {
    renderFooter()

    expect(screen.getByText('Product')).toBeInTheDocument()
    expect(screen.getByText('Legal')).toBeInTheDocument()
    expect(screen.getByText('Connect')).toBeInTheDocument()
  })
})
