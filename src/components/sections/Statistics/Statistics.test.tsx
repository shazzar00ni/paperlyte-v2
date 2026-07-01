import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Statistics } from './Statistics'
import { WAITLIST_COUNT, WAITLIST_COUNT_NUMERIC } from '@constants/waitlist'

describe('Statistics', () => {
  it('should render as a section with correct id', () => {
    const { container } = render(<Statistics />)
    const section = container.querySelector('section')
    expect(section).toBeInTheDocument()
    expect(section).toHaveAttribute('id', 'statistics')
  })

  it('should render the heading with waitlist count', () => {
    render(<Statistics />)
    expect(
      screen.getByText(`Join ${WAITLIST_COUNT} professionals writing without friction`)
    ).toBeInTheDocument()
  })

  it('should render the subtitle', () => {
    render(<Statistics />)
    expect(
      screen.getByText('Trusted by writers, developers, and thinkers who value their time.')
    ).toBeInTheDocument()
  })

  it('should use an h2 for the section heading', () => {
    render(<Statistics />)
    const heading = screen.getByRole('heading', { level: 2 })
    expect(heading).toBeInTheDocument()
    expect(heading.textContent).toContain(WAITLIST_COUNT)
  })

  it('should render all four stat labels', () => {
    render(<Statistics />)
    expect(screen.getByText('Waitlist Members')).toBeInTheDocument()
    expect(screen.getByText('Notes Created')).toBeInTheDocument()
    expect(screen.getByText('Uptime')).toBeInTheDocument()
    expect(screen.getByText('User Rating')).toBeInTheDocument()
  })

  it('should render counter animations with accessible labels', () => {
    render(<Statistics />)
    // aria-label on each CounterAnimation output element is always the end value
    expect(screen.getByLabelText(`${WAITLIST_COUNT_NUMERIC}+`)).toBeInTheDocument()
    expect(screen.getByLabelText('10M+')).toBeInTheDocument()
    expect(screen.getByLabelText('99.9%')).toBeInTheDocument()
    expect(screen.getByLabelText('4.9/5')).toBeInTheDocument()
  })

  it('should render decorative icons with aria-hidden', () => {
    const { container } = render(<Statistics />)
    const icons = container.querySelectorAll('i[aria-hidden="true"]')
    expect(icons).toHaveLength(4)
  })

  it('should render the correct icon for each stat', () => {
    const { container } = render(<Statistics />)
    expect(container.querySelector('.fa-users')).toBeInTheDocument()
    expect(container.querySelector('.fa-note-sticky')).toBeInTheDocument()
    expect(container.querySelector('.fa-server')).toBeInTheDocument()
    expect(container.querySelector('.fa-star')).toBeInTheDocument()
  })

  it('should render without crashing', () => {
    const { container } = render(<Statistics />)
    expect(container).toBeDefined()
    expect(container.querySelector('section')).toBeInTheDocument()
  })
})
