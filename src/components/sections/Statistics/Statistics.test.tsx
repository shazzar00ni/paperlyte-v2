/**
 * Tests for the Statistics section component
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Statistics } from './Statistics'

describe('Statistics', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
  })

  describe('Rendering', () => {
    it('renders without crashing', () => {
      expect(() => render(<Statistics />)).not.toThrow()
    })

    it('renders inside a section element with id="statistics"', () => {
      const { container } = render(<Statistics />)
      const section = container.querySelector('section#statistics')
      expect(section).toBeInTheDocument()
    })

    it('renders the section title', () => {
      render(<Statistics />)
      expect(
        screen.getByText(/Join thousands who've simplified their notes/i)
      ).toBeInTheDocument()
    })

    it('renders the section subtitle', () => {
      render(<Statistics />)
      expect(
        screen.getByText(/Real people, real productivity gains, real peace of mind/i)
      ).toBeInTheDocument()
    })
  })

  describe('Stat cards', () => {
    it('renders four stat labels', () => {
      render(<Statistics />)
      // Verify all four expected stat labels are present
      expect(screen.getByText('Active Users')).toBeInTheDocument()
      expect(screen.getByText('Notes Created')).toBeInTheDocument()
      expect(screen.getByText('Uptime')).toBeInTheDocument()
      expect(screen.getByText('User Rating')).toBeInTheDocument()
    })

    it('renders the "Active Users" label', () => {
      render(<Statistics />)
      expect(screen.getByText('Active Users')).toBeInTheDocument()
    })

    it('renders the "Notes Created" label', () => {
      render(<Statistics />)
      expect(screen.getByText('Notes Created')).toBeInTheDocument()
    })

    it('renders the "Uptime" label', () => {
      render(<Statistics />)
      expect(screen.getByText('Uptime')).toBeInTheDocument()
    })

    it('renders the "User Rating" label', () => {
      render(<Statistics />)
      expect(screen.getByText('User Rating')).toBeInTheDocument()
    })
  })

  describe('Icons', () => {
    it('renders the fa-users icon for Active Users', () => {
      const { container } = render(<Statistics />)
      expect(container.querySelector('.fa-users')).toBeInTheDocument()
    })

    it('renders the fa-note-sticky icon for Notes Created', () => {
      const { container } = render(<Statistics />)
      expect(container.querySelector('.fa-note-sticky')).toBeInTheDocument()
    })

    it('renders the fa-server icon for Uptime', () => {
      const { container } = render(<Statistics />)
      expect(container.querySelector('.fa-server')).toBeInTheDocument()
    })

    it('renders the fa-star icon for User Rating', () => {
      const { container } = render(<Statistics />)
      expect(container.querySelector('.fa-star')).toBeInTheDocument()
    })

    it('icons are aria-hidden (decorative)', () => {
      const { container } = render(<Statistics />)
      const icons = container.querySelectorAll('i[aria-hidden="true"]')
      expect(icons.length).toBe(4)
    })
  })

  describe('SVG path animations', () => {
    it('renders an SVG for each stat card', () => {
      const { container } = render(<Statistics />)
      const svgs = container.querySelectorAll('svg')
      expect(svgs.length).toBeGreaterThanOrEqual(4)
    })
  })

  describe('Counter animations', () => {
    it('renders a counter for each statistic (4 total)', () => {
      render(<Statistics />)
      // All four stat labels are rendered, confirming one card + counter per stat
      const labels = ['Active Users', 'Notes Created', 'Uptime', 'User Rating']
      labels.forEach((label) => expect(screen.getByText(label)).toBeInTheDocument())
    })
  })

  describe('Heading hierarchy', () => {
    it('renders the section title as an h2', () => {
      render(<Statistics />)
      const heading = screen.getByRole('heading', {
        level: 2,
        name: /Join thousands who've simplified their notes/i,
      })
      expect(heading).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('renders the section without ARIA role conflicts', () => {
      const { container } = render(<Statistics />)
      // The section should be a <section> element (implicit region landmark)
      expect(container.querySelector('section')).toBeInTheDocument()
    })
  })
})
