import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Solution } from './Solution'
import { WAITLIST_COUNT } from '@/constants/waitlist'
import * as navigation from '@/utils/navigation'

// Mock navigation
vi.mock('@/utils/navigation', () => ({
  scrollToSection: vi.fn(),
}))

describe('Solution Section', () => {
  it('renders the section title', () => {
    render(<Solution />)
    expect(screen.getByText('Three promises. Zero compromises.')).toBeInTheDocument()
  })

  it('renders the section subtitle', () => {
    render(<Solution />)
    expect(
      screen.getByText(
        /Paperlyte is built on three core principles that make note-taking feel effortless again/
      )
    ).toBeInTheDocument()
  })

  it('renders all three value propositions', () => {
    render(<Solution />)
    expect(screen.getByText('Zero-Lag Typing')).toBeInTheDocument()
    expect(screen.getByText('Tag-Based Organization')).toBeInTheDocument()
    expect(screen.getByText('Works Everywhere, Always')).toBeInTheDocument()
  })

  it('renders CTA button', () => {
    render(<Solution />)
    expect(screen.getByRole('button', { name: /Join the Waitlist/i })).toBeInTheDocument()
  })

  it('renders CTA microcopy', () => {
    render(<Solution />)
    const escapedCount = WAITLIST_COUNT.replace('+', '\\+')
    expect(
      screen.getByText(new RegExp(`${escapedCount} people already ahead of you`))
    ).toBeInTheDocument()
  })

  it('should scroll to email-capture section when CTA button is clicked', async () => {
    const user = userEvent.setup()
    render(<Solution />)

    const button = screen.getByRole('button', { name: /Join the Waitlist/i })
    await user.click(button)

    expect(navigation.scrollToSection).toHaveBeenCalledWith('email-capture')
  })

  it('renders value proposition titles', () => {
    render(<Solution />)
    expect(
      screen.getByText('Your thoughts move fast. So should your app.')
    ).toBeInTheDocument()
    expect(screen.getByText('Forget folders. Organize as you write.')).toBeInTheDocument()
    expect(screen.getByText('Plane mode? No problem.')).toBeInTheDocument()
  })

  it('renders section with correct id', () => {
    const { container } = render(<Solution />)
    const section = container.querySelector('section')
    expect(section).toHaveAttribute('id', 'solution')
  })

  it('renders article elements for each value proposition', () => {
    const { container } = render(<Solution />)
    const articles = container.querySelectorAll('article')
    expect(articles).toHaveLength(3)
  })
})
