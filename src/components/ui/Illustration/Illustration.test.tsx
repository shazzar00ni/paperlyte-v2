import { render, screen } from '@testing-library/react'
import { Illustration } from './Illustration'

describe('Illustration', () => {
  it('renders with default props', () => {
    render(<Illustration name="test-illustration" ariaLabel="Test illustration" />)
    const container = screen.getByRole('img', { name: 'Test illustration' })
    expect(container).toBeInTheDocument()
  })

  it('renders image with correct src', () => {
    render(<Illustration name="rocket-launch" ariaLabel="Rocket" />)
    const img = screen.getByRole('img', { name: 'Rocket' }).querySelector('img')
    expect(img).toHaveAttribute('src', '/illustrations/rocket-launch.svg')
  })

  it('applies size classes correctly', () => {
    const { container } = render(<Illustration name="test" size="lg" />)
    const illustrationDiv = container.firstChild as HTMLElement
    expect(illustrationDiv.className).toContain('lg')
  })

  it('applies custom className', () => {
    const { container } = render(<Illustration name="test" className="custom-class" />)
    const illustrationDiv = container.firstChild as HTMLElement
    expect(illustrationDiv.className).toContain('custom-class')
  })

  it('applies custom colors via CSS variables', () => {
    const { container } = render(
      <Illustration name="test" primaryColor="#000000" secondaryColor="#ffffff" />
    )
    const illustrationDiv = container.firstChild as HTMLElement
    expect(illustrationDiv.style.getPropertyValue('--illustration-primary')).toBe('#000000')
    expect(illustrationDiv.style.getPropertyValue('--illustration-secondary')).toBe('#ffffff')
  })

  it('sets aria-hidden when no ariaLabel provided', () => {
    const { container } = render(<Illustration name="test" />)
    const illustrationDiv = container.firstChild as HTMLElement
    expect(illustrationDiv).toHaveAttribute('aria-hidden', 'true')
  })

  it('sets aria-label when provided', () => {
    render(<Illustration name="test" ariaLabel="Descriptive label" />)
    const illustrationDiv = screen.getByRole('img', { name: 'Descriptive label' })
    expect(illustrationDiv).toHaveAttribute('aria-label', 'Descriptive label')
    expect(illustrationDiv.getAttribute('aria-hidden')).toBeNull()
  })
})
