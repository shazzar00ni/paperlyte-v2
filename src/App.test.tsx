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
    expect(sections!.length).toBeGreaterThanOrEqual(5)

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

    // Verify CTA content is present (checking for section title or button)
    expect(screen.getAllByRole('button').length).toBeGreaterThan(0)
  })

  it('should render Footer component', () => {
    const { container } = render(<App />)

    const footer = container.querySelector('footer')
    expect(footer).toBeInTheDocument()

    // Verify footer is present with role contentinfo
    expect(footer).toHaveAttribute('role', 'contentinfo')
  })

  it('should render CTA buttons in download section', () => {
    render(<App />)

    expect(screen.getByRole('button', { name: /Get Started for Free/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Learn More/i })).toBeInTheDocument()
  })

  it('should render feature cards', () => {
    render(<App />)

    // Check for specific features (using actual feature names)
    expect(screen.getByText('Lightning Speed')).toBeInTheDocument()
    expect(screen.getByText('Privacy Focused')).toBeInTheDocument()
    expect(screen.getByText('Tag-Based Organization')).toBeInTheDocument()
  })

  it('should render social links in footer', () => {
    render(<App />)

    expect(screen.getByRole('link', { name: 'Follow us on X (Twitter)' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Email us' })).toBeInTheDocument()
  })
})
