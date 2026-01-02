import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Features } from './Features'
import { FEATURES } from '@constants/features'

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
    expect(articles).toHaveLength(FEATURES.length)

    FEATURES.forEach((feature) => {
      expect(screen.getByText(feature.title)).toBeInTheDocument()
      expect(screen.getByText(feature.description)).toBeInTheDocument()
    })
  })

  it('should render feature icons', () => {
    const { container } = render(<Features />)

    // Icons are decorative, so check for them using data-icon attribute
    FEATURES.forEach((feature) => {
      const icon = container.querySelector(`[data-icon="${feature.icon}"]`)
      expect(icon).toBeInTheDocument()
      expect(icon).toHaveAttribute('aria-hidden', 'true')
    })
  })

  it('should use semantic article elements for feature cards', () => {
    const { container } = render(<Features />)

    const articles = container.querySelectorAll('article')
    expect(articles).toHaveLength(FEATURES.length)
  })

  it('should have proper heading hierarchy with h3 for feature titles', () => {
    render(<Features />)

    // Feature titles should be h3
    FEATURES.forEach((feature) => {
      const featureHeading = screen.getByText(feature.title)
      expect(featureHeading.tagName).toBe('H3')
    })
  })

  it('should render features in correct order', () => {
    const { container } = render(<Features />)

    const articles = container.querySelectorAll('article')
    const titles = Array.from(articles).map((article) => article.querySelector('h3')?.textContent)

    const expectedTitles = FEATURES.map((f) => f.title)
    expect(titles).toEqual(expectedTitles)
  })
})
