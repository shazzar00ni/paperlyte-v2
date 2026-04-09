import { render, screen } from '@testing-library/react'
import { Privacy } from '@components/pages/Privacy/Privacy'

describe('Privacy', () => {
  describe('Rendering', () => {
    it('should render the Privacy Policy page title', () => {
      render(<Privacy />)
      expect(screen.getByRole('heading', { level: 1, name: /Privacy Policy/i })).toBeInTheDocument()
    })

    it('should display the last updated date', () => {
      render(<Privacy />)
      expect(screen.getByText(/Last Updated:/i)).toBeInTheDocument()
    })

    it('should render the commitment to privacy section', () => {
      render(<Privacy />)
      expect(screen.getByText(/Our Commitment to Privacy/i)).toBeInTheDocument()
    })

    it('should render the information we collect section', () => {
      render(<Privacy />)
      // Use getAllByText because there is also an "Information We Collect Automatically" h3
      const headings = screen.getAllByText(/Information We Collect/i)
      expect(headings.length).toBeGreaterThanOrEqual(1)
    })

    it('should render the how we use your information section', () => {
      render(<Privacy />)
      expect(screen.getByText(/How We Use Your Information/i)).toBeInTheDocument()
    })

    it('should render the data security & storage section', () => {
      render(<Privacy />)
      expect(screen.getByText(/Data Security & Storage/i)).toBeInTheDocument()
    })

    it('should render the data sharing section', () => {
      render(<Privacy />)
      expect(screen.getByText(/Data Sharing & Disclosure/i)).toBeInTheDocument()
    })

    it('should render the your rights section', () => {
      render(<Privacy />)
      expect(screen.getByText(/Your Rights & Choices/i)).toBeInTheDocument()
    })

    it('should render the cookies & tracking section', () => {
      render(<Privacy />)
      expect(screen.getByText(/Cookies & Tracking/i)).toBeInTheDocument()
    })

    it("should render the children's privacy section", () => {
      render(<Privacy />)
      expect(screen.getByText(/Children's Privacy/i)).toBeInTheDocument()
    })

    it('should render the international users section', () => {
      render(<Privacy />)
      expect(screen.getByText(/International Users/i)).toBeInTheDocument()
    })

    it('should render the changes to this policy section', () => {
      render(<Privacy />)
      expect(screen.getByText(/Changes to This Policy/i)).toBeInTheDocument()
    })

    it('should render the contact us section', () => {
      render(<Privacy />)
      // Use getAllByText because the heading may appear multiple times in the DOM
      const headings = screen.getAllByText(/Contact Us/i)
      expect(headings.length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('Content', () => {
    it('should include privacy email contact link', () => {
      render(<Privacy />)
      const emailLink = screen.getByRole('link', { name: /privacy@paperlyte\.app/i })
      expect(emailLink).toBeInTheDocument()
      expect(emailLink).toHaveAttribute('href', 'mailto:privacy@paperlyte.app')
    })

    it('should include contact form link', () => {
      render(<Privacy />)
      const contactLink = screen.getByRole('link', { name: /Contact Form/i })
      expect(contactLink).toBeInTheDocument()
    })

    it('should state we do not sell data', () => {
      render(<Privacy />)
      expect(screen.getByText(/We do not sell your data/i)).toBeInTheDocument()
    })

    it('should mention GDPR compliance', () => {
      render(<Privacy />)
      // GDPR appears in multiple places (heading and body text)
      const gdprElements = screen.getAllByText(/GDPR/i)
      expect(gdprElements.length).toBeGreaterThanOrEqual(1)
    })

    it('should mention local-first architecture', () => {
      render(<Privacy />)
      expect(screen.getByText(/Local-First Architecture/i)).toBeInTheDocument()
    })

    it('should mention children under 13', () => {
      render(<Privacy />)
      expect(screen.getByText(/children under 13/i)).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      render(<Privacy />)
      const h1 = screen.getAllByRole('heading', { level: 1 })
      expect(h1).toHaveLength(1)

      const h2s = screen.getAllByRole('heading', { level: 2 })
      expect(h2s.length).toBeGreaterThan(0)
    })

    it('should have accessible external links with rel attributes', () => {
      render(<Privacy />)
      const contactFormLink = screen.getByRole('link', { name: /Contact Form/i })
      expect(contactFormLink).toHaveAttribute('rel', 'noopener noreferrer')
      expect(contactFormLink).toHaveAttribute('target', '_blank')
    })

    it('should include aria-label on external link', () => {
      render(<Privacy />)
      const contactFormLink = screen.getByRole('link', { name: /Contact Form/i })
      expect(contactFormLink).toHaveAttribute('aria-label')
    })
  })

  describe('Structure', () => {
    it('should render as a fragment containing multiple Section elements', () => {
      const { container } = render(<Privacy />)
      // The Privacy component renders two Section wrappers
      const sections = container.querySelectorAll('section')
      expect(sections.length).toBeGreaterThanOrEqual(2)
    })

    it('should render multiple policy sections', () => {
      const { container } = render(<Privacy />)
      // Multiple inner sections for each policy area
      const innerSections = container.querySelectorAll('section section')
      expect(innerSections.length).toBeGreaterThan(5)
    })
  })
})
