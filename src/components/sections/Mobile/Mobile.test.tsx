import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Mobile } from './Mobile'

describe('Mobile', () => {
  it('should render as a section with correct id', () => {
    const { container } = render(<Mobile />)

    const section = container.querySelector('section')
    expect(section).toBeInTheDocument()
    expect(section).toHaveAttribute('id', 'mobile')
  })

  it('should render the headline', () => {
    render(<Mobile />)

    expect(screen.getByText(/Capture inspiration/i)).toBeInTheDocument()
    expect(screen.getByText(/wherever you are/i)).toBeInTheDocument()
  })

  it('should render the description text', () => {
    render(<Mobile />)

    expect(
      screen.getByText(/Our mobile app is designed for speed/i)
    ).toBeInTheDocument()
  })

  it('should render the link to mobile features', () => {
    render(<Mobile />)

    const link = screen.getByRole('link', { name: /explore mobile features/i })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '#mobile')
  })

  it('should render arrow icon in the link', () => {
    const { container } = render(<Mobile />)

    const arrowIcon = container.querySelector('.fa-arrow-right')
    expect(arrowIcon).toBeInTheDocument()
  })

  it('should use semantic h2 for headline', () => {
    const { container } = render(<Mobile />)

    const headline = container.querySelector('h2')
    expect(headline).toBeInTheDocument()
    expect(headline).toHaveTextContent(/Capture inspiration/i)
  })

  it('should have proper text hierarchy', () => {
    const { container } = render(<Mobile />)

    const headline = container.querySelector('h2')
    const description = container.querySelector('p')

    expect(headline).toBeInTheDocument()
    expect(description).toBeInTheDocument()
  })

  it('should render with dark background styling', () => {
    const { container } = render(<Mobile />)

    const section = container.querySelector('section')
    expect(section?.className).toContain('mobile')
  })
})
