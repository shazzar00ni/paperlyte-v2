import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Features } from './Features'

const EXPECTED_FEATURES = [
  { title: 'Distraction-free Writing', description: 'An interface that disappears when you start typing.' },
  { title: 'Private by Design', description: 'Local-first architecture with optional end-to-end encrypted sync.' },
  { title: 'Seamless Workflow', description: 'Quick capture, markdown support, and keyboard shortcuts for power users.' },
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
      expect(screen.getByText(new RegExp(feature.description.slice(0, 30)))).toBeInTheDocument()
    })
  })

  it('should render feature icons with proper aria labels', () => {
    render(<Features />)

    EXPECTED_FEATURES.forEach((feature) => {
      const icon = screen.getByLabelText(`${feature.title} icon`)
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
