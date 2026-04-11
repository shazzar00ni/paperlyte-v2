/**
 * Tests for Privacy page component
 */
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Privacy } from './Privacy'

describe('Privacy', () => {
  describe('Rendering', () => {
    it('renders without crashing', () => {
      expect(() => render(<Privacy />)).not.toThrow()
    })

    it('renders the main page heading', () => {
      render(<Privacy />)
      expect(screen.getByRole('heading', { level: 1, name: /Privacy Policy/i })).toBeInTheDocument()
    })

    it('renders the last updated date', () => {
      render(<Privacy />)
      expect(document.body.textContent).toMatch(/Last Updated:/i)
    })

    it('includes the year in the last updated date', () => {
      render(<Privacy />)
      // The last-updated paragraph contains "2026"
      expect(document.body.textContent).toMatch(/2026/)
    })
  })

  describe('Section headings', () => {
    it('renders "Our Commitment to Privacy" heading', () => {
      render(<Privacy />)
      expect(
        screen.getByRole('heading', { name: /Our Commitment to Privacy/i })
      ).toBeInTheDocument()
    })

    it('renders "Information We Collect" heading', () => {
      render(<Privacy />)
      // Use exact match on the h2 heading text (excludes the h3 sub-heading)
      expect(screen.getByRole('heading', { level: 2, name: 'Information We Collect' })).toBeInTheDocument()
    })

    it('renders "How We Use Your Information" heading', () => {
      render(<Privacy />)
      expect(
        screen.getByRole('heading', { name: /How We Use Your Information/i })
      ).toBeInTheDocument()
    })

    it('renders "Data Security & Storage" heading', () => {
      render(<Privacy />)
      expect(
        screen.getByRole('heading', { name: /Data Security & Storage/i })
      ).toBeInTheDocument()
    })

    it('renders "Data Sharing & Disclosure" heading', () => {
      render(<Privacy />)
      expect(
        screen.getByRole('heading', { name: /Data Sharing & Disclosure/i })
      ).toBeInTheDocument()
    })

    it('renders "Your Rights & Choices" heading', () => {
      render(<Privacy />)
      expect(screen.getByRole('heading', { name: /Your Rights & Choices/i })).toBeInTheDocument()
    })

    it('renders "Cookies & Tracking" heading', () => {
      render(<Privacy />)
      expect(screen.getByRole('heading', { name: /Cookies & Tracking/i })).toBeInTheDocument()
    })

    it('renders "Children\'s Privacy" heading', () => {
      render(<Privacy />)
      expect(screen.getByRole('heading', { name: /Children's Privacy/i })).toBeInTheDocument()
    })

    it('renders "International Users" heading', () => {
      render(<Privacy />)
      expect(screen.getByRole('heading', { name: /International Users/i })).toBeInTheDocument()
    })

    it('renders "Changes to This Policy" heading', () => {
      render(<Privacy />)
      expect(
        screen.getByRole('heading', { name: /Changes to This Policy/i })
      ).toBeInTheDocument()
    })

    it('renders "Contact Us" heading', () => {
      render(<Privacy />)
      expect(screen.getByRole('heading', { name: /Contact Us/i })).toBeInTheDocument()
    })
  })

  describe('Content', () => {
    it('states that Paperlyte does not sell user data', () => {
      render(<Privacy />)
      expect(document.body.textContent).toMatch(/We do not sell your data/i)
    })

    it('mentions GDPR compliance', () => {
      render(<Privacy />)
      expect(document.body.textContent).toMatch(/GDPR/i)
    })

    it('mentions children under 13', () => {
      render(<Privacy />)
      expect(document.body.textContent).toMatch(/children under 13/i)
    })

    it('mentions local-first architecture', () => {
      render(<Privacy />)
      expect(document.body.textContent).toMatch(/Local-First Architecture/i)
    })

    it('mentions zero-knowledge option', () => {
      render(<Privacy />)
      expect(document.body.textContent).toMatch(/Zero-Knowledge/i)
    })

    it('mentions Google Analytics', () => {
      render(<Privacy />)
      expect(document.body.textContent).toMatch(/Google Analytics/i)
    })
  })

  describe('Contact links', () => {
    it('renders a privacy email link', () => {
      render(<Privacy />)
      const emailLink = screen.getByRole('link', { name: /privacy@paperlyte\.app/i })
      expect(emailLink).toBeInTheDocument()
      expect(emailLink).toHaveAttribute('href', 'mailto:privacy@paperlyte.app')
    })

    it('renders a contact form link that opens in a new tab', () => {
      render(<Privacy />)
      const contactLink = screen.getByRole('link', { name: /Contact Form/i })
      expect(contactLink).toBeInTheDocument()
      expect(contactLink).toHaveAttribute('target', '_blank')
      expect(contactLink).toHaveAttribute('rel', 'noopener noreferrer')
    })

    it('contact form link has an accessible aria-label', () => {
      render(<Privacy />)
      expect(
        screen.getByRole('link', { name: /Contact Form \(opens in new tab\)/i })
      ).toBeInTheDocument()
    })
  })

  describe('Sub-headings under Information We Collect', () => {
    it('renders "Information You Provide" sub-heading', () => {
      render(<Privacy />)
      expect(screen.getByRole('heading', { name: /Information You Provide/i })).toBeInTheDocument()
    })

    it('renders "Information We Collect Automatically" sub-heading', () => {
      render(<Privacy />)
      expect(
        screen.getByRole('heading', { name: /Information We Collect Automatically/i })
      ).toBeInTheDocument()
    })
  })

  describe('User rights list items', () => {
    it('mentions the ability to access user data', () => {
      render(<Privacy />)
      expect(document.body.textContent).toMatch(/Access Your Data/i)
    })

    it('mentions the ability to delete user data', () => {
      render(<Privacy />)
      expect(document.body.textContent).toMatch(/Delete Your Data/i)
    })

    it('mentions the ability to export notes', () => {
      render(<Privacy />)
      expect(document.body.textContent).toMatch(/Export Your Notes/i)
    })

    it('mentions the ability to opt-out of analytics', () => {
      render(<Privacy />)
      expect(document.body.textContent).toMatch(/Opt-Out of Analytics/i)
    })
  })
})
