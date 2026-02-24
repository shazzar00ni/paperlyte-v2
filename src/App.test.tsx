import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from './App'

describe('App Integration', () => {
  it('should render with proper semantic structure and section order', () => {
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

    // Verify sections exist and are in correct order
    const sections = main?.querySelectorAll('section')
    expect(sections).toBeDefined()
    expect(sections?.length).toBeGreaterThanOrEqual(5)

    const sectionIds = Array.from(sections!).map((section) => section.getAttribute('id'))

    // Check all sections are present
    expect(sectionIds).toContain('hero')
    expect(sectionIds).toContain('features')
    expect(sectionIds).toContain('mobile')
    expect(sectionIds).toContain('testimonials')
    expect(sectionIds).toContain('download')

    // Verify correct order
    const heroIndex = sectionIds.indexOf('hero')
    const featuresIndex = sectionIds.indexOf('features')
    const mobileIndex = sectionIds.indexOf('mobile')
    const testimonialsIndex = sectionIds.indexOf('testimonials')
    const downloadIndex = sectionIds.indexOf('download')

    expect(heroIndex).toBeLessThan(featuresIndex)
    expect(featuresIndex).toBeLessThan(mobileIndex)
    expect(mobileIndex).toBeLessThan(testimonialsIndex)
    expect(testimonialsIndex).toBeLessThan(downloadIndex)
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

  it('should render Testimonials section', () => {
    const { container } = render(<App />)

    const testimonialsSection = container.querySelector('#testimonials')
    expect(testimonialsSection).toBeInTheDocument()

    // Verify testimonials content is present
    expect(screen.getByText(/Sarah Chen/i)).toBeInTheDocument()
  })

  it('should render CTA section', () => {
    const { container } = render(<App />)

    const ctaSection = container.querySelector('#download')
    expect(ctaSection).toBeInTheDocument()

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

  it('should render CTA buttons in download section', () => {
    render(<App />)

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
})
