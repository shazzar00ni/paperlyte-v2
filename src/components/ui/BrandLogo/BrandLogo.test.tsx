import { render, screen } from '@testing-library/react'
import { BrandLogo } from './BrandLogo'

describe('BrandLogo', () => {
  it('renders the optimized Paperlyte brand mark with default text', () => {
    render(<BrandLogo />)

    expect(screen.getByAltText('Paperlyte logo')).toBeInTheDocument()
    expect(screen.getByText('Paperlyte')).toBeInTheDocument()
  })

  it('allows layout components to pass class names and display text', () => {
    render(
      <BrandLogo
        className="brand"
        imageClassName="brandImage"
        textClassName="brandText"
        text="Paperlyte."
      />
    )

    const logo = screen.getByAltText('Paperlyte logo')
    expect(logo).toHaveClass('brandImage')
    expect(screen.getByText('Paperlyte.')).toHaveClass('brandText')
  })
})
