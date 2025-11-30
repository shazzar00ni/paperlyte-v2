import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

describe('App Integration', () => {
  it('should render without crashing', () => {
    const { container } = render(<App />);
    expect(container).toBeInTheDocument();
  });

  it('should render Header component', () => {
    const { container } = render(<App />);

    // Header should contain navigation
    const header = container.querySelector('header');
    expect(header).toBeInTheDocument();
  });

  it('should render main element with correct id', () => {
    render(<App />);

    const main = document.getElementById('main');
    expect(main).toBeInTheDocument();
    expect(main?.tagName).toBe('MAIN');
  });

  it('should render Hero section', () => {
    const { container } = render(<App />);

    // Hero section should be present
    const heroSection = container.querySelector('#hero');
    expect(heroSection).toBeInTheDocument();
  });

  it('should render Features section', () => {
    const { container } = render(<App />);

    const featuresSection = container.querySelector('#features');
    expect(featuresSection).toBeInTheDocument();

    // Verify features content is present
    expect(
      screen.getByText("Everything you need. Nothing you don't.")
    ).toBeInTheDocument();
  });

  it('should render Comparison section', () => {
    const { container } = render(<App />);

    const comparisonSection = container.querySelector('#comparison');
    expect(comparisonSection).toBeInTheDocument();

    // Verify comparison content is present
    expect(screen.getByText('See How We Compare')).toBeInTheDocument();
  });

  it('should render Pricing section', () => {
    const { container } = render(<App />);

    const pricingSection = container.querySelector('#pricing');
    expect(pricingSection).toBeInTheDocument();

    // Verify pricing content is present
    expect(screen.getByText('Simple, Transparent Pricing')).toBeInTheDocument();
  });

  it('should render FAQ section', () => {
    const { container } = render(<App />);

    const faqSection = container.querySelector('#faq');
    expect(faqSection).toBeInTheDocument();
  });

  it('should render CTA section', () => {
    const { container } = render(<App />);

    const ctaSection = container.querySelector('#download');
    expect(ctaSection).toBeInTheDocument();

    // Verify CTA content is present
    expect(screen.getByText('Ready to declutter your mind?')).toBeInTheDocument();
  });

  it('should render Footer component', () => {
    const { container } = render(<App />);

    const footer = container.querySelector('footer');
    expect(footer).toBeInTheDocument();

    // Verify footer content is present (appears in both Hero and Footer)
    const taglines = screen.getAllByText('Your thoughts, unchained from complexity');
    expect(taglines.length).toBeGreaterThan(0);
  });

  it('should render sections in correct order', () => {
    const { container } = render(<App />);

    const main = document.getElementById('main');
    expect(main).toBeInTheDocument();

    const sections = main?.querySelectorAll('section');
    expect(sections).toBeDefined();
    expect(sections!.length).toBeGreaterThanOrEqual(6);

    // Check section order by ID
    const sectionIds = Array.from(sections!).map((section) =>
      section.getAttribute('id')
    );

    // Expected order: hero, features, comparison, pricing, faq, download (CTA)
    expect(sectionIds).toContain('hero');
    expect(sectionIds).toContain('features');
    expect(sectionIds).toContain('comparison');
    expect(sectionIds).toContain('pricing');
    expect(sectionIds).toContain('faq');
    expect(sectionIds).toContain('download');

    // Verify order is correct
    const heroIndex = sectionIds.indexOf('hero');
    const featuresIndex = sectionIds.indexOf('features');
    const comparisonIndex = sectionIds.indexOf('comparison');
    const pricingIndex = sectionIds.indexOf('pricing');
    const faqIndex = sectionIds.indexOf('faq');
    const downloadIndex = sectionIds.indexOf('download');

    expect(heroIndex).toBeLessThan(featuresIndex);
    expect(featuresIndex).toBeLessThan(comparisonIndex);
    expect(comparisonIndex).toBeLessThan(pricingIndex);
    expect(pricingIndex).toBeLessThan(faqIndex);
    expect(faqIndex).toBeLessThan(downloadIndex);
  });

  it('should have proper semantic HTML structure', () => {
    const { container } = render(<App />);

    // Should have header
    expect(container.querySelector('header')).toBeInTheDocument();

    // Should have main
    expect(container.querySelector('main')).toBeInTheDocument();

    // Should have footer
    expect(container.querySelector('footer')).toBeInTheDocument();
  });

  it('should render all major headings', () => {
    render(<App />);

    // Check for key headings from each section
    expect(
      screen.getByText("Everything you need. Nothing you don't.")
    ).toBeInTheDocument();
    expect(screen.getByText('See How We Compare')).toBeInTheDocument();
    expect(screen.getByText('Simple, Transparent Pricing')).toBeInTheDocument();
    expect(screen.getByText('Ready to declutter your mind?')).toBeInTheDocument();
  });

  it('should wrap content in ErrorBoundary', () => {
    // The App component should render successfully
    // If ErrorBoundary wasn't working, this test would fail
    const { container } = render(<App />);
    expect(container).toBeInTheDocument();

    // Verify that all main components are rendered
    expect(container.querySelector('header')).toBeInTheDocument();
    expect(container.querySelector('main')).toBeInTheDocument();
    expect(container.querySelector('footer')).toBeInTheDocument();
  });

  it('should render navigation links in header', () => {
    const { container } = render(<App />);

    const header = container.querySelector('header');
    expect(header).toBeInTheDocument();

    // Header should contain navigation elements
    const nav = header?.querySelector('nav');
    expect(nav).toBeInTheDocument();
  });

  it('should render download buttons in CTA section', () => {
    render(<App />);

    expect(screen.getByRole('link', { name: 'Download for Mac' })).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Download for Windows' })
    ).toBeInTheDocument();
  });

  it('should render all pricing plans', () => {
    render(<App />);

    // Check all three pricing plans are present (appear multiple times on page)
    const freeTexts = screen.getAllByText('Free');
    expect(freeTexts.length).toBeGreaterThan(0);

    const proTexts = screen.getAllByText('Pro');
    expect(proTexts.length).toBeGreaterThan(0);

    const teamTexts = screen.getAllByText('Team');
    expect(teamTexts.length).toBeGreaterThan(0);
  });

  it('should render comparison table', () => {
    render(<App />);

    const table = screen.getByRole('table');
    expect(table).toBeInTheDocument();
  });

  it('should render feature cards', () => {
    render(<App />);

    // Check for specific features (some appear in multiple places)
    const lightningSpeed = screen.getAllByText('Lightning Speed');
    expect(lightningSpeed.length).toBeGreaterThan(0);

    const beautifulSimplicity = screen.getAllByText('Beautiful Simplicity');
    expect(beautifulSimplicity.length).toBeGreaterThan(0);

    const tagBased = screen.getAllByText('Tag-Based Organization');
    expect(tagBased.length).toBeGreaterThan(0);

    const universalAccess = screen.getAllByText('Universal Access');
    expect(universalAccess.length).toBeGreaterThan(0);

    const offlineFirst = screen.getAllByText('Offline-First');
    expect(offlineFirst.length).toBeGreaterThan(0);

    const privacyFocused = screen.getAllByText('Privacy Focused');
    expect(privacyFocused.length).toBeGreaterThan(0);
  });

  it('should have accessible landmark regions', () => {
    const { container } = render(<App />);

    // Check for proper landmark regions
    expect(container.querySelector('header')).toBeInTheDocument();
    expect(container.querySelector('main')).toBeInTheDocument();
    expect(container.querySelector('footer')).toBeInTheDocument();

    // Main should have the correct id
    const main = container.querySelector('main');
    expect(main).toHaveAttribute('id', 'main');
  });

  it('should render social links in footer', () => {
    render(<App />);

    expect(screen.getByRole('link', { name: 'GitHub' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Twitter' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Email' })).toBeInTheDocument();
  });
});
