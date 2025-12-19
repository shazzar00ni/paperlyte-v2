import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Solution } from './Solution'
import { WAITLIST_COUNT } from '@/constants/waitlist'

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
    expect(screen.getByText(new RegExp(`${escapedCount} people already ahead of you`))).toBeInTheDocument()
  })
})
