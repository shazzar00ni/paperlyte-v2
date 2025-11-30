import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Features } from './Features';
import { FEATURES } from '@constants/features';

describe('Features', () => {
  it('should render as a section with correct id', () => {
    const { container } = render(<Features />);

    const section = container.querySelector('section');
    expect(section).toBeInTheDocument();
    expect(section).toHaveAttribute('id', 'features');
  });

  it('should render main heading', () => {
    render(<Features />);
    expect(
      screen.getByText("Everything you need. Nothing you don't.")
    ).toBeInTheDocument();
  });

  it('should render subtitle', () => {
    render(<Features />);
    expect(
      screen.getByText(
        'Built for speed, designed for simplicity. Focus on your ideas, not the tool.'
      )
    ).toBeInTheDocument();
  });

  it('should render all feature cards', () => {
    render(<Features />);

    // Should render 6 features
    expect(FEATURES).toHaveLength(6);

    FEATURES.forEach((feature) => {
      expect(screen.getByText(feature.title)).toBeInTheDocument();
      expect(screen.getByText(feature.description)).toBeInTheDocument();
    });
  });

  it('should render feature icons with proper attributes', () => {
    render(<Features />);

    FEATURES.forEach((feature) => {
      const icon = document.querySelector(`.${feature.icon}`);
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveAttribute('aria-label', `${feature.title} icon`);
    });
  });

  it('should render Lightning Speed feature', () => {
    render(<Features />);

    expect(screen.getByText('Lightning Speed')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Instant startup and real-time sync. No loading spinners, no waiting. Your thoughts captured at the speed of thinking.'
      )
    ).toBeInTheDocument();

    const speedIcon = document.querySelector('.fa-bolt');
    expect(speedIcon).toBeInTheDocument();
  });

  it('should render Beautiful Simplicity feature', () => {
    render(<Features />);

    expect(screen.getByText('Beautiful Simplicity')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Paper-inspired design that feels natural and distraction-free. Just you and your thoughts, the way it should be.'
      )
    ).toBeInTheDocument();

    const simplicityIcon = document.querySelector('.fa-pen-nib');
    expect(simplicityIcon).toBeInTheDocument();
  });

  it('should render Tag-Based Organization feature', () => {
    render(<Features />);

    expect(screen.getByText('Tag-Based Organization')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Smart categorization without rigid folder structures. Organize freely with tags that adapt to how you think.'
      )
    ).toBeInTheDocument();

    const tagsIcon = document.querySelector('.fa-tags');
    expect(tagsIcon).toBeInTheDocument();
  });

  it('should render Universal Access feature', () => {
    render(<Features />);

    expect(screen.getByText('Universal Access')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Seamless experience across all devices. Start on your phone, finish on your laptop. Always in sync.'
      )
    ).toBeInTheDocument();

    const universalIcon = document.querySelector('.fa-mobile-screen');
    expect(universalIcon).toBeInTheDocument();
  });

  it('should render Offline-First feature', () => {
    render(<Features />);

    expect(screen.getByText('Offline-First')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Full functionality without internet. Your notes work everywhere, sync automatically when online.'
      )
    ).toBeInTheDocument();

    const offlineIcon = document.querySelector('.fa-wifi-slash');
    expect(offlineIcon).toBeInTheDocument();
  });

  it('should render Privacy Focused feature', () => {
    render(<Features />);

    expect(screen.getByText('Privacy Focused')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Your notes are yours alone. End-to-end encryption and local-first storage keep your thoughts private.'
      )
    ).toBeInTheDocument();

    const privacyIcon = document.querySelector('.fa-shield-halved');
    expect(privacyIcon).toBeInTheDocument();
  });

  it('should use semantic article elements for feature cards', () => {
    const { container } = render(<Features />);

    const articles = container.querySelectorAll('article');
    expect(articles).toHaveLength(FEATURES.length);
  });

  it('should have proper heading hierarchy', () => {
    const { container } = render(<Features />);

    // Main heading should be h2
    const mainHeading = screen.getByText(
      "Everything you need. Nothing you don't."
    );
    expect(mainHeading.tagName).toBe('H2');

    // Feature titles should be h3
    FEATURES.forEach((feature) => {
      const featureHeading = screen.getByText(feature.title);
      expect(featureHeading.tagName).toBe('H3');
    });
  });

  it('should render features in correct order', () => {
    const { container } = render(<Features />);

    const articles = container.querySelectorAll('article');
    const titles = Array.from(articles).map(
      (article) => article.querySelector('h3')?.textContent
    );

    const expectedTitles = FEATURES.map((f) => f.title);
    expect(titles).toEqual(expectedTitles);
  });
});
