import { render, screen } from '@testing-library/react'
import { Terms } from './Terms'

describe('Terms', () => {
  describe('Rendering', () => {
    it('should render the Terms of Service page title', () => {
      render(<Terms />)
      expect(
        screen.getByRole('heading', { level: 1, name: /Terms of Service/i })
      ).toBeInTheDocument()
    })

    it('should display the last updated date', () => {
      render(<Terms />)
      expect(screen.getByText(/Last Updated:/i)).toBeInTheDocument()
    })

    it('should render the agreement to terms section', () => {
      render(<Terms />)
      expect(screen.getByText(/Agreement to Terms/i)).toBeInTheDocument()
    })

    it('should render the description of service section', () => {
      render(<Terms />)
      expect(screen.getByText(/Description of Service/i)).toBeInTheDocument()
    })

    it('should render the user accounts section', () => {
      render(<Terms />)
      expect(screen.getByText(/User Accounts/i)).toBeInTheDocument()
    })

    it('should render the acceptable use section', () => {
      render(<Terms />)
      expect(screen.getByText(/Acceptable Use/i)).toBeInTheDocument()
    })

    it('should render the content ownership section', () => {
      render(<Terms />)
      expect(screen.getByText(/Content Ownership & Rights/i)).toBeInTheDocument()
    })

    it('should render the subscriptions and payments section', () => {
      render(<Terms />)
      expect(screen.getByText(/Subscriptions & Payments/i)).toBeInTheDocument()
    })

    it('should render the data & privacy section', () => {
      render(<Terms />)
      expect(screen.getByText(/Data & Privacy/i)).toBeInTheDocument()
    })

    it('should render the service availability section', () => {
      render(<Terms />)
      expect(screen.getByText(/Service Availability/i)).toBeInTheDocument()
    })

    it('should render the termination section', () => {
      render(<Terms />)
      // "Termination" appears both as a section h2 and in sub-headings
      const headings = screen.getAllByText(/Termination/i)
      expect(headings.length).toBeGreaterThanOrEqual(1)
    })

    it('should render the limitation of liability section', () => {
      render(<Terms />)
      expect(screen.getByText(/Limitation of Liability/i)).toBeInTheDocument()
    })

    it('should render the warranty disclaimer section', () => {
      render(<Terms />)
      expect(screen.getByText(/Warranty Disclaimer/i)).toBeInTheDocument()
    })

    it('should render the indemnification section', () => {
      render(<Terms />)
      expect(screen.getByText(/Indemnification/i)).toBeInTheDocument()
    })

    it('should render the dispute resolution section', () => {
      render(<Terms />)
      expect(screen.getByText(/Dispute Resolution/i)).toBeInTheDocument()
    })

    it('should render the changes to terms section', () => {
      render(<Terms />)
      expect(screen.getByText(/Changes to Terms/i)).toBeInTheDocument()
    })

    it('should render the contact information section', () => {
      render(<Terms />)
      expect(screen.getByText(/Contact Information/i)).toBeInTheDocument()
    })
  })

  describe('Content', () => {
    it('should include legal email contact link', () => {
      render(<Terms />)
      const emailLink = screen.getByRole('link', { name: /legal@paperlyte\.app/i })
      expect(emailLink).toBeInTheDocument()
      expect(emailLink).toHaveAttribute('href', 'mailto:legal@paperlyte.app')
    })

    it('should include a link to the privacy policy', () => {
      render(<Terms />)
      const privacyLink = screen.getByRole('link', { name: /Privacy Policy/i })
      expect(privacyLink).toBeInTheDocument()
      expect(privacyLink).toHaveAttribute('href', '/privacy')
    })

    it('should mention minimum age requirement', () => {
      render(<Terms />)
      expect(screen.getByText(/13 years old/i)).toBeInTheDocument()
    })

    it('should mention governing law', () => {
      render(<Terms />)
      expect(screen.getByText(/State of Delaware/i)).toBeInTheDocument()
    })

    it('should mention "as is" warranty disclaimer', () => {
      render(<Terms />)
      expect(screen.getByText(/as is/i)).toBeInTheDocument()
    })

    it('should state users retain rights to their content', () => {
      render(<Terms />)
      expect(screen.getByText(/You retain all rights to your notes/i)).toBeInTheDocument()
    })

    it('should include development notice at the top', () => {
      render(<Terms />)
      expect(screen.getByText(/Paperlyte is currently in development/i)).toBeInTheDocument()
    })

    it('should mention 99.9% uptime target', () => {
      render(<Terms />)
      expect(screen.getByText(/99\.9%/i)).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have a single h1 heading', () => {
      render(<Terms />)
      const h1Elements = screen.getAllByRole('heading', { level: 1 })
      expect(h1Elements).toHaveLength(1)
    })

    it('should have multiple h2 section headings', () => {
      render(<Terms />)
      const h2Elements = screen.getAllByRole('heading', { level: 2 })
      expect(h2Elements.length).toBeGreaterThan(5)
    })

    it('should have accessible external links with rel attributes', () => {
      render(<Terms />)
      // The contact website link opens in a new tab
      const externalLinks = screen
        .getAllByRole('link')
        .filter((link) => link.getAttribute('target') === '_blank')
      externalLinks.forEach((link) => {
        expect(link).toHaveAttribute('rel', 'noopener noreferrer')
      })
    })
  })

  describe('Structure', () => {
    it('should render as a fragment containing multiple Section elements', () => {
      const { container } = render(<Terms />)
      const sections = container.querySelectorAll('section')
      expect(sections.length).toBeGreaterThanOrEqual(2)
    })

    it('should contain multiple inner policy sections', () => {
      const { container } = render(<Terms />)
      const innerSections = container.querySelectorAll('section section')
      expect(innerSections.length).toBeGreaterThan(8)
    })
  })
})
