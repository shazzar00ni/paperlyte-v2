import { render } from '@testing-library/react'
import { vi } from 'vitest'
import { Terms } from './Terms'
import * as metaTags from '@/utils/metaTags'

// Mock the Section component to simplify testing
vi.mock('@components/layout/Section', () => ({
  Section: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <section className={className}>{children}</section>
  ),
}))

describe('Terms', () => {
  let setMetaDescriptionSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    // Reset document.title before each test
    document.title = ''

    // Spy on setMetaDescription
    setMetaDescriptionSpy = vi.spyOn(metaTags, 'setMetaDescription').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Page Metadata', () => {
    it('should set document title on mount', () => {
      render(<Terms />)

      expect(document.title).toBe('Terms of Service | Paperlyte')
    })

    it('should set meta description on mount', () => {
      render(<Terms />)

      expect(setMetaDescriptionSpy).toHaveBeenCalledOnce()
      expect(setMetaDescriptionSpy).toHaveBeenCalledWith(
        "Read Paperlyte's Terms of Service to understand your rights and responsibilities when using our note-taking application."
      )
    })

    it('should only set metadata once on initial mount', () => {
      const { rerender } = render(<Terms />)

      expect(setMetaDescriptionSpy).toHaveBeenCalledOnce()

      // Rerender should not call setMetaDescription again
      rerender(<Terms />)

      expect(setMetaDescriptionSpy).toHaveBeenCalledOnce()
    })
  })

  describe('Rendering', () => {
    it('should render the terms of service page', () => {
      const { container } = render(<Terms />)

      expect(container).toBeInTheDocument()
    })

    it('should display page title', () => {
      const { getByText } = render(<Terms />)

      expect(getByText('Terms of Service')).toBeInTheDocument()
    })

    it('should display last updated date', () => {
      const { getByText } = render(<Terms />)

      expect(getByText(/Last Updated:/)).toBeInTheDocument()
      expect(getByText(/December 13, 2024/)).toBeInTheDocument()
    })

    it('should render development notice', () => {
      const { getByText } = render(<Terms />)

      expect(getByText(/Paperlyte is currently in development/)).toBeInTheDocument()
    })

    it('should render main content sections', () => {
      const { getByText } = render(<Terms />)

      // Check for key section headings
      expect(getByText('Agreement to Terms')).toBeInTheDocument()
      expect(getByText('Description of Service')).toBeInTheDocument()
      expect(getByText('User Accounts')).toBeInTheDocument()
      expect(getByText('Acceptable Use')).toBeInTheDocument()
      expect(getByText('Content Ownership & Rights')).toBeInTheDocument()
    })

    it('should render contact information', () => {
      const { getByText } = render(<Terms />)

      expect(getByText('Contact Information')).toBeInTheDocument()
      expect(getByText('legal@paperlyte.app')).toBeInTheDocument()
    })

    it('should render terms-specific sections', () => {
      const { getByText } = render(<Terms />)

      expect(getByText('Subscriptions & Payments')).toBeInTheDocument()
      expect(getByText('Limitation of Liability')).toBeInTheDocument()
      expect(getByText('Warranty Disclaimer')).toBeInTheDocument()
      expect(getByText('Dispute Resolution')).toBeInTheDocument()
    })
  })

  describe('Content', () => {
    it('should mention user data ownership', () => {
      const { getByText } = render(<Terms />)

      expect(getByText(/You retain all rights to your notes and content/)).toBeInTheDocument()
    })

    it('should mention acceptable use policy', () => {
      const { getByText } = render(<Terms />)

      expect(getByText('You May:')).toBeInTheDocument()
      expect(getByText('You May Not:')).toBeInTheDocument()
    })

    it('should mention free tier availability', () => {
      const { getByText } = render(<Terms />)

      expect(getByText(/Free Tier/)).toBeInTheDocument()
    })

    it('should link to privacy policy', () => {
      const { container } = render(<Terms />)

      const privacyLink = container.querySelector('a[href="/privacy"]')
      expect(privacyLink).toBeInTheDocument()
      expect(privacyLink).toHaveTextContent('Privacy Policy')
    })

    it('should mention arbitration', () => {
      const { getByText } = render(<Terms />)

      expect(getByText(/Arbitration/)).toBeInTheDocument()
    })

    it('should mention governing law', () => {
      const { getByText } = render(<Terms />)

      expect(getByText(/Governing Law/)).toBeInTheDocument()
      expect(getByText(/Delaware, United States/)).toBeInTheDocument()
    })
  })

  describe('Links', () => {
    it('should have email link for legal contact', () => {
      const { container } = render(<Terms />)

      const emailLink = container.querySelector('a[href="mailto:legal@paperlyte.app"]')
      expect(emailLink).toBeInTheDocument()
    })

    it('should have contact form link', () => {
      const { container } = render(<Terms />)

      const contactLink = container.querySelector('a[href="https://paperlyte.app/contact"]')
      expect(contactLink).toBeInTheDocument()
      expect(contactLink).toHaveAttribute('target', '_blank')
      expect(contactLink).toHaveAttribute('rel', 'noopener noreferrer')
    })
  })

  describe('Legal Sections', () => {
    it('should render indemnification section', () => {
      const { getByText } = render(<Terms />)

      expect(getByText('Indemnification')).toBeInTheDocument()
    })

    it('should render termination section', () => {
      const { getByText } = render(<Terms />)

      expect(getByText('Termination')).toBeInTheDocument()
      expect(getByText('Your Right to Terminate')).toBeInTheDocument()
      expect(getByText('Our Right to Terminate')).toBeInTheDocument()
    })

    it('should render miscellaneous section', () => {
      const { getByText } = render(<Terms />)

      expect(getByText('Miscellaneous')).toBeInTheDocument()
      expect(getByText('Entire Agreement')).toBeInTheDocument()
      expect(getByText('Severability')).toBeInTheDocument()
    })
  })
})
