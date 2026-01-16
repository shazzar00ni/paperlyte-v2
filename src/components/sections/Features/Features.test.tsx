import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Features } from './Features'

const EXPECTED_FEATURES = [
  {
    title: 'Lightning Speed',
    description:
      'Instant startup and real-time sync. No loading spinners, no waiting. Your thoughts captured at the speed of thinking.',
  },
  {
    title: 'Beautiful Simplicity',
    description:
      'Paper-inspired design that feels natural and distraction-free. Just you and your thoughts, the way it should be.',
  },
  {
    title: 'Tag-Based Organization',
    description:
      'Smart categorization without rigid folder structures. Organize freely with tags that adapt to how you think.',
  },
  {
    title: 'Universal Access',
    description:
      'Seamless experience across all devices. Start on your phone, finish on your laptop. Always in sync.',
  },
  {
    title: 'Offline-First',
    description:
      'Full functionality without internet. Your notes work everywhere, sync automatically when online.',
  },
  {
    title: 'Privacy Focused',
    description:
      'Your notes are yours alone. End-to-end encryption and local-first storage keep your thoughts private.',
  },
]

describe('Features', () => {
  it('should render as a section with correct id', () => {
    const { container } = render(<Features />)

    const section = container.querySelector('section')
    expect(section).toBeInTheDocument()
    expect(section).toHaveAttribute('id', 'features')
  })

  it('should render all feature cards', () => {
    const { container } = render(<Features />)

    // Verify correct number of feature cards are rendered
    const articles = container.querySelectorAll('article')
    expect(articles).toHaveLength(EXPECTED_FEATURES.length)

    EXPECTED_FEATURES.forEach((feature) => {
      expect(screen.getByText(feature.title)).toBeInTheDocument()
      expect(screen.getByText(feature.description)).toBeInTheDocument()
    })
  })

  it('should render icons for each feature', () => {
    const { container } = render(<Features />)

    // Each feature card should have an icon (SVG)
    const articles = container.querySelectorAll('article')
    articles.forEach((article) => {
      const icon = article.querySelector('svg')
      expect(icon).toBeInTheDocument()
    })
  })

  it('should use semantic article elements for feature cards', () => {
    const { container } = render(<Features />)

    const articles = container.querySelectorAll('article')
    expect(articles).toHaveLength(EXPECTED_FEATURES.length)
  })

  it('should have proper heading hierarchy with h3 for feature titles', () => {
    render(<Features />)

    // Feature titles should be h3
    EXPECTED_FEATURES.forEach((feature) => {
      const featureHeading = screen.getByText(feature.title)
      expect(featureHeading.tagName).toBe('H3')
    })
  })

  it('should render features in correct order', () => {
    const { container } = render(<Features />)

    const articles = container.querySelectorAll('article')
    const titles = Array.from(articles).map((article) => article.querySelector('h3')?.textContent)

    const expectedTitles = EXPECTED_FEATURES.map((f) => f.title)
    expect(titles).toEqual(expectedTitles)
  })
})
