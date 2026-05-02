/**
 * Tests for Terms of Service page component
 */
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Terms } from './Terms'

describe('Terms', () => {
  describe('Rendering', () => {
    it('renders without crashing', () => {
      expect(() => render(<Terms />)).not.toThrow()
    })

    it('renders the main page heading', () => {
      render(<Terms />)
      expect(
        screen.getByRole('heading', { level: 1, name: /Terms of Service/i })
      ).toBeInTheDocument()
    })

    it('renders the last updated date', () => {
      render(<Terms />)
      expect(document.body.textContent).toMatch(/Last Updated:/i)
    })

    it('includes the year in the last updated date', () => {
      render(<Terms />)
      expect(document.body.textContent).toMatch(/2026/)
    })

    it('renders the development notice', () => {
      render(<Terms />)
      expect(document.body.textContent).toMatch(/Paperlyte is currently in development/i)
    })
  })

  describe('Section headings', () => {
    it('renders "Agreement to Terms" heading', () => {
      render(<Terms />)
      expect(screen.getByRole('heading', { name: /Agreement to Terms/i })).toBeInTheDocument()
    })

    it('renders "Description of Service" heading', () => {
      render(<Terms />)
      expect(
        screen.getByRole('heading', { name: /Description of Service/i })
      ).toBeInTheDocument()
    })

    it('renders "User Accounts" heading', () => {
      render(<Terms />)
      expect(screen.getByRole('heading', { name: /User Accounts/i })).toBeInTheDocument()
    })

    it('renders "Acceptable Use" heading', () => {
      render(<Terms />)
      expect(screen.getByRole('heading', { name: /Acceptable Use/i })).toBeInTheDocument()
    })

    it('renders "Content Ownership & Rights" heading', () => {
      render(<Terms />)
      expect(
        screen.getByRole('heading', { name: /Content Ownership & Rights/i })
      ).toBeInTheDocument()
    })

    it('renders "Subscriptions & Payments" heading', () => {
      render(<Terms />)
      expect(
        screen.getByRole('heading', { name: /Subscriptions & Payments/i })
      ).toBeInTheDocument()
    })

    it('renders "Data & Privacy" heading', () => {
      render(<Terms />)
      expect(screen.getByRole('heading', { name: /Data & Privacy/i })).toBeInTheDocument()
    })

    it('renders "Service Availability" heading', () => {
      render(<Terms />)
      expect(screen.getByRole('heading', { name: /Service Availability/i })).toBeInTheDocument()
    })

    it('renders "Termination" heading', () => {
      render(<Terms />)
      expect(screen.getByRole('heading', { name: /Termination/i })).toBeInTheDocument()
    })

    it('renders "Limitation of Liability" heading', () => {
      render(<Terms />)
      expect(
        screen.getByRole('heading', { name: /Limitation of Liability/i })
      ).toBeInTheDocument()
    })

    it('renders "Warranty Disclaimer" heading', () => {
      render(<Terms />)
      expect(screen.getByRole('heading', { name: /Warranty Disclaimer/i })).toBeInTheDocument()
    })

    it('renders "Indemnification" heading', () => {
      render(<Terms />)
      expect(screen.getByRole('heading', { name: /Indemnification/i })).toBeInTheDocument()
    })

    it('renders "Dispute Resolution" heading', () => {
      render(<Terms />)
      expect(screen.getByRole('heading', { name: /Dispute Resolution/i })).toBeInTheDocument()
    })

    it('renders "Changes to Terms" heading', () => {
      render(<Terms />)
      expect(screen.getByRole('heading', { name: /Changes to Terms/i })).toBeInTheDocument()
    })

    it('renders "Contact Information" heading', () => {
      render(<Terms />)
      expect(screen.getByRole('heading', { name: /Contact Information/i })).toBeInTheDocument()
    })

    it('renders "Miscellaneous" heading', () => {
      render(<Terms />)
      expect(screen.getByRole('heading', { name: /Miscellaneous/i })).toBeInTheDocument()
    })
  })

  describe('Content', () => {
    it('states users retain rights to their content', () => {
      render(<Terms />)
      expect(document.body.textContent).toMatch(/You retain all rights to your notes and content/i)
    })

    it('mentions Delaware as governing law', () => {
      render(<Terms />)
      expect(document.body.textContent).toMatch(/State of Delaware/i)
    })

    it('mentions age requirement of 13', () => {
      render(<Terms />)
      expect(document.body.textContent).toMatch(/at least 13 years old/i)
    })

    it('mentions 99.9% uptime target', () => {
      render(<Terms />)
      expect(document.body.textContent).toMatch(/99\.9%/i)
    })

    it('mentions free tier', () => {
      render(<Terms />)
      // "Free Tier" appears both as a heading and in body text
      expect(document.body.textContent).toMatch(/free tier/i)
    })

    it('mentions the Privacy Policy link', () => {
      render(<Terms />)
      const privacyLink = screen.getByRole('link', { name: /Privacy Policy/i })
      expect(privacyLink).toBeInTheDocument()
      expect(privacyLink).toHaveAttribute('href', '/privacy')
    })
  })

  describe('Contact links', () => {
    it('renders a legal email link', () => {
      render(<Terms />)
      const emailLink = screen.getByRole('link', { name: /legal@paperlyte\.app/i })
      expect(emailLink).toBeInTheDocument()
      expect(emailLink).toHaveAttribute('href', 'mailto:legal@paperlyte.app')
    })

    it('renders a contact website link that opens in a new tab', () => {
      render(<Terms />)
      // Use getAllByRole because the contact site URL also appears as link text
      const contactLinks = screen.getAllByRole('link', {
        name: /https:\/\/paperlyte\.app\/contact/i,
      })
      expect(contactLinks.length).toBeGreaterThan(0)
      expect(contactLinks[0]).toHaveAttribute('target', '_blank')
      expect(contactLinks[0]).toHaveAttribute('rel', 'noopener noreferrer')
    })
  })

  describe('Sub-headings', () => {
    it('renders "Account Creation" sub-heading', () => {
      render(<Terms />)
      expect(screen.getByRole('heading', { name: /Account Creation/i })).toBeInTheDocument()
    })

    it('renders "Account Requirements" sub-heading', () => {
      render(<Terms />)
      expect(screen.getByRole('heading', { name: /Account Requirements/i })).toBeInTheDocument()
    })

    it('renders "You May:" sub-heading', () => {
      render(<Terms />)
      expect(screen.getByRole('heading', { name: /You May:/i })).toBeInTheDocument()
    })

    it('renders "You May Not:" sub-heading', () => {
      render(<Terms />)
      expect(screen.getByRole('heading', { name: /You May Not:/i })).toBeInTheDocument()
    })

    it('renders "Your Content" sub-heading', () => {
      render(<Terms />)
      expect(screen.getByRole('heading', { name: /Your Content/i })).toBeInTheDocument()
    })

    it('renders "Our Content" sub-heading', () => {
      render(<Terms />)
      expect(screen.getByRole('heading', { name: 'Our Content' })).toBeInTheDocument()
    })

    it('renders "Governing Law" sub-heading', () => {
      render(<Terms />)
      expect(screen.getByRole('heading', { name: /Governing Law/i })).toBeInTheDocument()
    })

    it('renders "Arbitration" sub-heading', () => {
      render(<Terms />)
      expect(screen.getByRole('heading', { name: /Arbitration/i })).toBeInTheDocument()
    })
  })
})
