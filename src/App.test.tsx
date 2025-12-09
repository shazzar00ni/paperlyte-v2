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
    expect(sections!.length).toBeGreaterThanOrEqual(7)

    const sectionIds = Array.from(sections!).map((section) => section.getAttribute('id'))

    // Check all sections are present
    expect(sectionIds).toContain('hero')
    expect(sectionIds).toContain('features')
    expect(sectionIds).toContain('comparison')
    expect(sectionIds).toContain('testimonials')
    expect(sectionIds).toContain('pricing')
    expect(sectionIds).toContain('faq')
    expect(sectionIds).toContain('download')

    // Verify correct order
    const heroIndex = sectionIds.indexOf('hero')
    const featuresIndex = sectionIds.indexOf('features')
    const comparisonIndex = sectionIds.indexOf('comparison')
    const testimonialsIndex = sectionIds.indexOf('testimonials')
    const pricingIndex = sectionIds.indexOf('pricing')
    const faqIndex = sectionIds.indexOf('faq')
    const downloadIndex = sectionIds.indexOf('download')

    expect(heroIndex).toBeLessThan(featuresIndex)
    expect(featuresIndex).toBeLessThan(comparisonIndex)
    expect(comparisonIndex).toBeLessThan(testimonialsIndex)
    expect(testimonialsIndex).toBeLessThan(pricingIndex)
    expect(pricingIndex).toBeLessThan(faqIndex)
    expect(faqIndex).toBeLessThan(downloadIndex)
  })

  it('should have accessible landmark regions with proper roles', () => {
    render(<App />)

    // Use role queries for accessibility testing
    const banner = screen.getByRole('banner') // header
    const main = screen.getByRole('main')
    const contentinfo = screen.getByRole('contentinfo') // footer

    expect(banner).toBeInTheDocument()
    expect(main).toBeInTheDocument()
    expect(main).toHaveAttribute('id', 'main')
    expect(contentinfo).toBeInTheDocument()

    // Verify navigation is accessible
    const navigation = screen.getByRole('navigation')
    expect(navigation).toBeInTheDocument()
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
    expect(screen.getByText("Everything you need. Nothing you don't.")).toBeInTheDocument()
  })

  it('should render Comparison section', () => {
    const { container } = render(<App />)

    const comparisonSection = container.querySelector('#comparison')
    expect(comparisonSection).toBeInTheDocument()

    // Verify comparison content is present
    expect(screen.getByText('See How We Compare')).toBeInTheDocument()
  })

  it('should render Testimonials section', () => {
    const { container } = render(<App />)

    const testimonialsSection = container.querySelector('#testimonials')
    expect(testimonialsSection).toBeInTheDocument()

    // Verify testimonials content is present
    expect(screen.getByText('Loved by thousands of note-takers')).toBeInTheDocument()
  })

  it('should render Pricing section', () => {
    const { container } = render(<App />)

    const pricingSection = container.querySelector('#pricing')
    expect(pricingSection).toBeInTheDocument()

    // Verify pricing content is present
    expect(screen.getByText('Simple, Transparent Pricing')).toBeInTheDocument()
  })

  it('should render FAQ section', () => {
    const { container } = render(<App />)

    const faqSection = container.querySelector('#faq')
    expect(faqSection).toBeInTheDocument()
  })

  it('should render CTA section', () => {
    const { container } = render(<App />)

    const ctaSection = container.querySelector('#download')
    expect(ctaSection).toBeInTheDocument()

    // Verify CTA content is present
    expect(screen.getByText('Ready to declutter your mind?')).toBeInTheDocument()
  })

  it('should render Footer component', () => {
    const { container } = render(<App />)

    const footer = container.querySelector('footer')
    expect(footer).toBeInTheDocument()

    // Verify footer content is present (appears in both Hero and Footer)
    const taglines = screen.getAllByText('Your thoughts, unchained from complexity')
    expect(taglines.length).toBeGreaterThan(0)
  })

  it('should render download buttons in CTA section', () => {
    render(<App />)

    expect(screen.getByRole('link', { name: 'Download for Mac' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Download for Windows' })).toBeInTheDocument()
  })

  it('should render all pricing plans', () => {
    render(<App />)

    // Check all three pricing plans are present (appear multiple times on page)
    const freeTexts = screen.getAllByText('Free')
    expect(freeTexts.length).toBeGreaterThan(0)

    const proTexts = screen.getAllByText('Pro')
    expect(proTexts.length).toBeGreaterThan(0)

    const teamTexts = screen.getAllByText('Team')
    expect(teamTexts.length).toBeGreaterThan(0)
  })

  it('should render comparison table', () => {
    render(<App />)

    const table = screen.getByRole('table')
    expect(table).toBeInTheDocument()
  })

  it('should render feature cards', () => {
    render(<App />)

    // Check for specific features (some appear in multiple places)
    const lightningSpeed = screen.getAllByText('Lightning Speed')
    expect(lightningSpeed.length).toBeGreaterThan(0)

    const beautifulSimplicity = screen.getAllByText('Beautiful Simplicity')
    expect(beautifulSimplicity.length).toBeGreaterThan(0)

    const tagBased = screen.getAllByText('Tag-Based Organization')
    expect(tagBased.length).toBeGreaterThan(0)

    const universalAccess = screen.getAllByText('Universal Access')
    expect(universalAccess.length).toBeGreaterThan(0)

    const offlineFirst = screen.getAllByText('Offline-First')
    expect(offlineFirst.length).toBeGreaterThan(0)

    const privacyFocused = screen.getAllByText('Privacy Focused')
    expect(privacyFocused.length).toBeGreaterThan(0)
  })

  it('should render social links in footer', () => {
    render(<App />)

    expect(screen.getByRole('link', { name: 'GitHub' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Twitter' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Email' })).toBeInTheDocument()
  })
})
