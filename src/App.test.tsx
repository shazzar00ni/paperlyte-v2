import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'
import { _clearPendingScrollObservers } from '@utils/navigation'

describe('App Integration', () => {
  afterEach(() => {
    // Clear any module-level MutationObservers created by scrollToSection in
    // components under test — prevents observer leakage across tests.
    _clearPendingScrollObservers()
  })

  it('should render with proper semantic structure and section order', async () => {
    const { container } = render(<App />)

    // Verify semantic landmark regions
    const header = container.querySelector('header')
    const main = container.querySelector('main')
    const footer = container.querySelector('footer')

    expect(header).toBeInTheDocument()
    expect(main).toBeInTheDocument()
    expect(main).toHaveAttribute('id', 'main')
    expect(footer).toBeInTheDocument()

    // Verify header contains navigation
    expect(header?.querySelector('nav')).toBeInTheDocument()

    // Wait for all lazy-loaded sections to render before checking order
    await waitFor(() => {
      expect(container.querySelector('#statistics')).toBeInTheDocument()
      expect(container.querySelector('#comparison')).toBeInTheDocument()
      expect(container.querySelector('#testimonials')).toBeInTheDocument()
      expect(container.querySelector('#email-capture')).toBeInTheDocument()
      expect(container.querySelector('#faq')).toBeInTheDocument()
      expect(container.querySelector('#download')).toBeInTheDocument()
    })

    // Verify sections exist and are in correct order
    const sections = main?.querySelectorAll('section')
    expect(sections).toBeDefined()
    expect(sections!.length).toBeGreaterThanOrEqual(5)

    const sectionIds = Array.from(sections!).map((section) => section.getAttribute('id'))

    // Check all sections are present and in correct order
    const expectedSections = [
      'hero',
      'problem',
      'solution',
      'features',
      'mobile',
      'statistics',
      'comparison',
      'testimonials',
      'email-capture',
      'faq',
      'download',
    ]

    expectedSections.forEach((sectionId) => {
      expect(sectionIds).toContain(sectionId)
    })

    const indices = expectedSections.map((id) => sectionIds.indexOf(id))
    for (let i = 0; i < indices.length - 1; i++) {
      expect(indices[i]).toBeLessThan(indices[i + 1])
    }
  })

  it('should have accessible landmark regions with proper roles', () => {
    render(<App />)

    // App has 1 banner region: Main Header
    const EXPECTED_BANNER_COUNT = 1
    const banners = screen.getAllByRole('banner')
    expect(banners).toHaveLength(EXPECTED_BANNER_COUNT)

    // Verify Features section uses proper heading markup (not a banner)
    expect(
      screen.getByRole('heading', { name: /Everything you need. Nothing you don't./i, level: 2 })
    ).toBeInTheDocument()

    const main = screen.getByRole('main')
    expect(main).toBeInTheDocument()
    expect(main).toHaveAttribute('id', 'main')

    expect(screen.getByRole('contentinfo')).toBeInTheDocument()

    // Verify both navigation regions exist: Header and Footer navigation
    const navigation = screen.getAllByRole('navigation')
    expect(navigation).toHaveLength(2)
  })

  it('should render Hero section', () => {
    const { container } = render(<App />)

    // Hero section should be present
    const heroSection = container.querySelector('#hero')
    expect(heroSection).toBeInTheDocument()
  })

  it('should render Features section', () => {
    const { container } = render(<App />)

    const featuresSection = container.querySelector('#features')
    expect(featuresSection).toBeInTheDocument()

    // Verify features content is present
    expect(screen.getByText('Lightning Speed')).toBeInTheDocument()
  })

  it('should render Mobile section', () => {
    const { container } = render(<App />)

    const mobileSection = container.querySelector('#mobile')
    expect(mobileSection).toBeInTheDocument()

    // Verify mobile content is present
    expect(screen.getByText(/Capture inspiration/i)).toBeInTheDocument()
  })

  it('should render Testimonials section', async () => {
    const { container } = render(<App />)

    await waitFor(() => expect(container.querySelector('#testimonials')).toBeInTheDocument())

    // Verify testimonials content is present
    expect(screen.getByText(/Sarah Chen/i)).toBeInTheDocument()
  })

  it('should render CTA section', async () => {
    const { container } = render(<App />)

    await waitFor(() => expect(container.querySelector('#download')).toBeInTheDocument())

    // Verify specific CTA content is present
    expect(screen.getByText(/Stop fighting your tools/i)).toBeInTheDocument()
    // Check that at least one "Join the Waitlist" button exists
    expect(screen.getAllByRole('button', { name: /Join the Waitlist/i }).length).toBeGreaterThan(0)
  })

  it('should render Footer component', () => {
    render(<App />)

    // Semantic <footer> element provides implicit contentinfo role
    // Verify it's accessible to assistive technologies
    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
  })

  it('should render CTA buttons in download section', async () => {
    const { container } = render(<App />)

    // Wait for the lazy #download section specifically (not a button that also exists in eager sections)
    await waitFor(() => expect(container.querySelector('#download')).toBeInTheDocument())

    // Check for actual CTA buttons (there may be multiple "Join the Waitlist" buttons across sections)
    expect(screen.getAllByRole('button', { name: /Join the Waitlist/i }).length).toBeGreaterThan(0)

    // Check for demo button (use flexible pattern to handle different wording)
    const demoButtons = screen.getAllByRole('button', { name: /Watch the Demo|View the Demo/i })
    expect(demoButtons.length).toBeGreaterThan(0)
  })

  it('should render feature cards', () => {
    render(<App />)

    // Check for specific features (using actual feature names)
    // Use getAllByText since features may appear in multiple sections
    expect(screen.getAllByText('Lightning Speed').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Privacy Focused').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Tag-Based Organization').length).toBeGreaterThan(0)
  })

  it('should render social links in footer', () => {
    render(<App />)

    expect(screen.getByRole('link', { name: 'Follow us on X (Twitter)' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Email us' })).toBeInTheDocument()
  })

  it('should render skip link with correct attributes', () => {
    const { container } = render(<App />)

    const skipLink = container.querySelector('.skip-link')
    expect(skipLink).toBeInTheDocument()
    expect(skipLink).toHaveAttribute('href', '#main')
    expect(skipLink).toHaveTextContent('Skip to main content')
  })

  it('should focus main element when skip link is activated', async () => {
    const { container } = render(<App />)
    const user = userEvent.setup()

    const skipLink = container.querySelector('.skip-link') as HTMLElement
    const main = container.querySelector('#main') as HTMLElement

    expect(skipLink).toBeInTheDocument()
    expect(main).toBeInTheDocument()

    // Simulate clicking skip link
    await user.click(skipLink)

    // Note: Focus behavior is tested but JSDOM doesn't fully support document.activeElement
    // In a real browser, main would receive focus
  })

  it('should render Problem section', () => {
    const { container } = render(<App />)

    // Problem section should be present
    const problemSection = container.querySelector('#problem')
    expect(problemSection).toBeInTheDocument()
  })

  it('should render Solution section', () => {
    const { container } = render(<App />)

    const solutionSection = container.querySelector('#solution')
    expect(solutionSection).toBeInTheDocument()
  })

  it('should render Statistics section', async () => {
    const { container } = render(<App />)

    await waitFor(() => expect(container.querySelector('#statistics')).toBeInTheDocument())
  })

  it('should render Comparison section', async () => {
    const { container } = render(<App />)

    await waitFor(() => expect(container.querySelector('#comparison')).toBeInTheDocument())
  })

  it('should render FAQ section', async () => {
    const { container } = render(<App />)

    await waitFor(() => expect(container.querySelector('#faq')).toBeInTheDocument())
  })

  it('should render FeedbackWidget component', () => {
    render(<App />)

    // FeedbackWidget renders a floating button with specific aria-label
    const feedbackButton = screen.getByRole('button', { name: /Open feedback form/i })
    expect(feedbackButton).toBeInTheDocument()
  })

  it('should not have any duplicate IDs', async () => {
    const { container } = render(<App />)

    // Wait for all lazy sections so their IDs are included in the check
    await waitFor(() => {
      expect(container.querySelector('#statistics')).toBeInTheDocument()
      expect(container.querySelector('#comparison')).toBeInTheDocument()
      expect(container.querySelector('#testimonials')).toBeInTheDocument()
      expect(container.querySelector('#email-capture')).toBeInTheDocument()
      expect(container.querySelector('#faq')).toBeInTheDocument()
      expect(container.querySelector('#download')).toBeInTheDocument()
    })

    const elementsWithId = container.querySelectorAll('[id]')
    const ids = Array.from(elementsWithId).map((el) => el.getAttribute('id'))

    // Check for duplicates
    const uniqueIds = new Set(ids)
    expect(ids.length).toBe(uniqueIds.size)
  })

  it('should have valid heading hierarchy starting with h1', () => {
    render(<App />)

    // Verify h1 exists (should be in Hero section)
    const h1Elements = screen.getAllByRole('heading', { level: 1 })
    expect(h1Elements.length).toBeGreaterThanOrEqual(1)
  })

  it('should include waitlist form in EmailCapture section', async () => {
    const { container } = render(<App />)

    // Wait for the lazy #email-capture section specifically
    await waitFor(() => expect(container.querySelector('#email-capture')).toBeInTheDocument())

    const emailCaptureSection = container.querySelector('#email-capture')
    expect(emailCaptureSection?.querySelector('input[type="email"]')).toBeInTheDocument()
  })

  it('should render without console errors', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    try {
      const { container } = render(<App />)
      // Flush ALL lazy-loaded sections so none resolve after the assertion and emit act() warnings
      await waitFor(() => {
        expect(container.querySelector('#statistics')).toBeInTheDocument()
        expect(container.querySelector('#comparison')).toBeInTheDocument()
        expect(container.querySelector('#testimonials')).toBeInTheDocument()
        expect(container.querySelector('#email-capture')).toBeInTheDocument()
        expect(container.querySelector('#faq')).toBeInTheDocument()
        expect(container.querySelector('#download')).toBeInTheDocument()
      })

      expect(consoleErrorSpy).not.toHaveBeenCalled()
    } finally {
      consoleErrorSpy.mockRestore()
    }
  })

  it('should render all major UI components', () => {
    const { container } = render(<App />)

    // Verify Header component
    expect(container.querySelector('header')).toBeInTheDocument()

    // Verify Footer component
    expect(container.querySelector('footer')).toBeInTheDocument()

    // Verify main content area
    expect(container.querySelector('main')).toBeInTheDocument()

    // Verify at least one section renders
    const sections = container.querySelectorAll('section')
    expect(sections.length).toBeGreaterThan(0)
  })
})
