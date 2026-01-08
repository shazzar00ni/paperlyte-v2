import { render } from '@testing-library/react'
import { vi } from 'vitest'
import { Privacy } from './Privacy'
import * as metaTags from '@/utils/metaTags'

// Mock the Section component to simplify testing
vi.mock('@components/layout/Section', () => ({
  Section: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <section className={className}>{children}</section>
  ),
}))

describe('Privacy', () => {
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
      render(<Privacy />)

      expect(document.title).toBe('Privacy Policy | Paperlyte')
    })

    it('should set meta description on mount', () => {
      render(<Privacy />)

      expect(setMetaDescriptionSpy).toHaveBeenCalledOnce()
      expect(setMetaDescriptionSpy).toHaveBeenCalledWith(
        'Learn how Paperlyte protects your privacy with cookie-less analytics, local-first architecture, and transparent data practices.'
      )
    })

    it('should only set metadata once on initial mount', () => {
      const { rerender } = render(<Privacy />)

      expect(setMetaDescriptionSpy).toHaveBeenCalledOnce()

      // Rerender should not call setMetaDescription again
      rerender(<Privacy />)

      expect(setMetaDescriptionSpy).toHaveBeenCalledOnce()
    })
  })

  describe('Rendering', () => {
    it('should render the privacy policy page', () => {
      const { container } = render(<Privacy />)

      expect(container).toBeInTheDocument()
    })

    it('should display page title', () => {
      const { getByText } = render(<Privacy />)

      expect(getByText('Privacy Policy')).toBeInTheDocument()
    })

    it('should display last updated date', () => {
      const { getByText } = render(<Privacy />)

      expect(getByText(/Last Updated:/)).toBeInTheDocument()
      expect(getByText(/December 13, 2024/)).toBeInTheDocument()
    })

    it('should render main content sections', () => {
      const { getByText } = render(<Privacy />)

      // Check for key section headings
      expect(getByText('Our Commitment to Privacy')).toBeInTheDocument()
      expect(getByText('Information We Collect')).toBeInTheDocument()
      expect(getByText('How We Use Your Information')).toBeInTheDocument()
      expect(getByText('Data Security & Storage')).toBeInTheDocument()
      expect(getByText('Your Rights & Choices')).toBeInTheDocument()
    })

    it('should render contact information', () => {
      const { getByText } = render(<Privacy />)

      expect(getByText('Contact Us')).toBeInTheDocument()
      expect(getByText('privacy@paperlyte.app')).toBeInTheDocument()
    })

    it('should render privacy-specific sections', () => {
      const { getByText } = render(<Privacy />)

      expect(getByText('Third-Party Services')).toBeInTheDocument()
      expect(getByText('Analytics & Tracking')).toBeInTheDocument()
      expect(getByText("Children's Privacy")).toBeInTheDocument()
    })
  })

  describe('Content', () => {
    it('should mention Plausible Analytics', () => {
      const { getAllByText } = render(<Privacy />)

      const matches = getAllByText(/Plausible Analytics/)
      expect(matches.length).toBeGreaterThan(0)
    })

    it('should mention cookie-less analytics', () => {
      const { getAllByText } = render(<Privacy />)

      const matches = getAllByText(/Cookie-less Analytics/)
      expect(matches.length).toBeGreaterThan(0)
    })

    it('should state data is not sold', () => {
      const { getByText } = render(<Privacy />)

      expect(getByText(/We do not sell your data/)).toBeInTheDocument()
    })

    it('should mention GDPR compliance', () => {
      const { getByText } = render(<Privacy />)

      expect(getByText(/GDPR Compliance/)).toBeInTheDocument()
    })

    it('should mention local-first architecture', () => {
      const { getByText } = render(<Privacy />)

      expect(getByText(/Local-First Architecture/)).toBeInTheDocument()
    })
  })

  describe('Links', () => {
    it('should have email link for privacy contact', () => {
      const { container } = render(<Privacy />)

      const emailLink = container.querySelector('a[href="mailto:privacy@paperlyte.app"]')
      expect(emailLink).toBeInTheDocument()
    })

    it('should have contact form link', () => {
      const { container } = render(<Privacy />)

      const contactLink = container.querySelector('a[href="https://paperlyte.app/contact"]')
      expect(contactLink).toBeInTheDocument()
      expect(contactLink).toHaveAttribute('target', '_blank')
      expect(contactLink).toHaveAttribute('rel', 'noopener noreferrer')
    })
  })
})
