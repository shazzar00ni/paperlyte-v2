import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CTA as Cta } from './CTA'
import * as navigation from '@/utils/navigation'

// Mock navigation utility
vi.mock('@/utils/navigation', () => ({
  scrollToSection: vi.fn(),
}))

describe('CTA', () => {
  it('should render as a section with correct id', () => {
    const { container } = render(<Cta />)

    const section = container.querySelector('section')
    expect(section).toBeInTheDocument()
    expect(section).toHaveAttribute('id', 'download')
  })

  it('should render main heading', () => {
    render(<Cta />)
    expect(
      screen.getByText('Stop fighting your tools. Start thinking clearly.')
    ).toBeInTheDocument()
  })

  it('should render subtitle about note-taking', () => {
    render(<Cta />)
    expect(screen.getByText(/Note-taking shouldn't feel like work/i)).toBeInTheDocument()
  })

  it('should render waitlist message', () => {
    render(<Cta />)
    expect(screen.getByText(/Join the waitlist today and be among the first/i)).toBeInTheDocument()
  })

  it('should render Join the Waitlist button', () => {
    render(<Cta />)

    const button = screen.getByRole('button', { name: /Join the Waitlist/i })
    expect(button).toBeInTheDocument()
  })

  it('should render Watch the Demo Again button', () => {
    render(<Cta />)

    const button = screen.getByRole('button', { name: /Watch the Demo Again/i })
    expect(button).toBeInTheDocument()
  })

  it('should render microcopy with launch details', () => {
    render(<Cta />)

    expect(screen.getByText(/Launching Q2 2026/i)).toBeInTheDocument()
    expect(screen.getByText(/500\+ already waiting/i)).toBeInTheDocument()
    expect(screen.getByText(/No credit card required/i)).toBeInTheDocument()
  })

  it('should have proper heading hierarchy', () => {
    render(<Cta />)

    const mainHeading = screen.getByRole('heading', {
      level: 2,
      name: /Stop fighting your tools/i,
    })
    expect(mainHeading).toBeInTheDocument()
  })

  it('should render two CTA buttons', () => {
    render(<Cta />)

    const buttons = screen.getAllByRole('button')
    expect(buttons).toHaveLength(2)
  })

  it('should render without crashing', () => {
    const { container } = render(<Cta />)
    expect(container).toBeDefined()
    expect(container.querySelector('section')).toBeInTheDocument()
  })

  it('should scroll to email-capture section when Join the Waitlist is clicked', async () => {
    const user = userEvent.setup()
    render(<Cta />)

    const button = screen.getByRole('button', { name: /Join the Waitlist/i })
    await user.click(button)

    expect(navigation.scrollToSection).toHaveBeenCalledWith('email-capture')
  })

  it('should scroll to hero section when Watch the Demo Again is clicked', async () => {
    const user = userEvent.setup()
    render(<Cta />)

    const button = screen.getByRole('button', { name: /Watch the Demo Again/i })
    await user.click(button)

    expect(navigation.scrollToSection).toHaveBeenCalledWith('hero')
  })
})
