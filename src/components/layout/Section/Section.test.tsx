import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Section } from './Section'

describe('Section', () => {
  it('should render children', () => {
    render(
      <Section>
        <h1>Test Heading</h1>
      </Section>
    )

    expect(screen.getByText('Test Heading')).toBeInTheDocument()
  })

  it('should render as semantic section element', () => {
    const { container } = render(
      <Section>
        <div>Content</div>
      </Section>
    )

    expect(container.querySelector('section')).toBeInTheDocument()
  })

  it('should apply id attribute', () => {
    const { container } = render(
      <Section id="hero">
        <div>Hero content</div>
      </Section>
    )

    const section = container.querySelector('section')
    expect(section).toHaveAttribute('id', 'hero')
  })

  it('should apply background variants', () => {
    const { container, rerender } = render(
      <Section background="default">
        <div>Content</div>
      </Section>
    )

    let section = container.querySelector('section')
    // CSS Modules hashes class names, so check className contains the variant
    expect(section?.className).toContain('bg-default')

    rerender(
      <Section background="surface">
        <div>Content</div>
      </Section>
    )
    section = container.querySelector('section')
    expect(section?.className).toContain('bg-surface')

    rerender(
      <Section background="primary">
        <div>Content</div>
      </Section>
    )
    section = container.querySelector('section')
    expect(section?.className).toContain('bg-primary')
  })

  it('should apply padding variants', () => {
    const { container, rerender } = render(
      <Section padding="default">
        <div>Content</div>
      </Section>
    )

    let section = container.querySelector('section')
    // CSS Modules hashes class names, so check className contains the variant
    expect(section?.className).toContain('padding-default')

    rerender(
      <Section padding="large">
        <div>Content</div>
      </Section>
    )
    section = container.querySelector('section')
    expect(section?.className).toContain('padding-large')

    rerender(
      <Section padding="none">
        <div>Content</div>
      </Section>
    )
    section = container.querySelector('section')
    expect(section?.className).toContain('padding-none')
  })

  it('should apply custom className', () => {
    const { container } = render(
      <Section className="custom-section">
        <div>Content</div>
      </Section>
    )

    const section = container.querySelector('section')
    expect(section).toHaveClass('custom-section')
  })

  it('should have container wrapper inside section', () => {
    const { container } = render(
      <Section>
        <div>Content</div>
      </Section>
    )

    const section = container.querySelector('section')
    // CSS Modules hashes class names, so check for any div with "container" in className
    const containerDiv = section?.querySelector('div[class*="container"]')

    expect(containerDiv).toBeInTheDocument()
    expect(containerDiv).toContainHTML('<div>Content</div>')
  })
})
