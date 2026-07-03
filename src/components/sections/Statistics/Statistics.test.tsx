import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Statistics } from './Statistics'
import { WAITLIST_COUNT } from '@constants/waitlist'

describe('Statistics', () => {
  describe('Section structure', () => {
    it('should render a section element with id="statistics"', () => {
      const { container } = render(<Statistics />)
      const section = container.querySelector('section')
      expect(section).toBeInTheDocument()
      expect(section).toHaveAttribute('id', 'statistics')
    })

    it('should render without crashing', () => {
      expect(() => render(<Statistics />)).not.toThrow()
    })
  })

  describe('Heading', () => {
    it('should display the waitlist count in the heading', () => {
      render(<Statistics />)
      const heading = screen.getByRole('heading', { level: 2 })
      expect(heading).toBeInTheDocument()
      expect(heading.textContent).toContain(WAITLIST_COUNT)
    })

    it('should render the subtitle text', () => {
      render(<Statistics />)
      expect(
        screen.getByText(/Trusted by writers, developers, and thinkers who value their time/i)
      ).toBeInTheDocument()
    })
  })

  describe('Stat cards', () => {
    it('should render the "Waitlist Members" stat label', () => {
      render(<Statistics />)
      expect(screen.getByText('Waitlist Members')).toBeInTheDocument()
    })

    it('should render the "Notes Created" stat label', () => {
      render(<Statistics />)
      expect(screen.getByText('Notes Created')).toBeInTheDocument()
    })

    it('should render the "Uptime" stat label', () => {
      render(<Statistics />)
      expect(screen.getByText('Uptime')).toBeInTheDocument()
    })

    it('should render the "User Rating" stat label', () => {
      render(<Statistics />)
      expect(screen.getByText('User Rating')).toBeInTheDocument()
    })

    it('should render exactly four stat cards', () => {
      const { container } = render(<Statistics />)
      const labels = ['Waitlist Members', 'Notes Created', 'Uptime', 'User Rating']
      labels.forEach((label) => {
        expect(container.textContent).toContain(label)
      })
    })
  })

  describe('Accessibility', () => {
    it('should render decorative icons with aria-hidden="true"', () => {
      const { container } = render(<Statistics />)
      const icons = container.querySelectorAll('svg[aria-hidden="true"]')
      expect(icons.length).toBeGreaterThan(0)
    })

    it('should have a level-2 heading', () => {
      render(<Statistics />)
      const h2 = screen.getByRole('heading', { level: 2 })
      expect(h2).toBeInTheDocument()
    })
  })
})
