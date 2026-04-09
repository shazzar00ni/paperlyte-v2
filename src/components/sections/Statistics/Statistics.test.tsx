import { render, screen } from '@testing-library/react'
import { Statistics } from './Statistics'

describe('Statistics', () => {
  describe('Rendering', () => {
    it('should render the Statistics section', () => {
      render(<Statistics />)
      expect(
        screen.getByText(/Join thousands who've simplified their notes/i)
      ).toBeInTheDocument()
    })

    it('should render the section subtitle', () => {
      render(<Statistics />)
      expect(
        screen.getByText(/Real people, real productivity gains, real peace of mind/i)
      ).toBeInTheDocument()
    })

    it('should render all four statistic cards', () => {
      render(<Statistics />)
      const statisticLabels = ['Active Users', 'Notes Created', 'Uptime', 'User Rating']

      statisticLabels.forEach((label) => {
        expect(screen.getByText(label)).toBeInTheDocument()
      })

      expect(
        screen.getAllByText(/^(Active Users|Notes Created|Uptime|User Rating)$/)
      ).toHaveLength(4)
    })

    it.each(['Active Users', 'Notes Created', 'Uptime', 'User Rating'])(
      'should render %s statistic label',
      (label) => {
        render(<Statistics />)
        expect(screen.getByText(label)).toBeInTheDocument()
      }
    )
  })

  describe('Section structure', () => {
    it('should render with the "statistics" section id', () => {
      const { container } = render(<Statistics />)
      const section = container.querySelector('#statistics')
      expect(section).toBeInTheDocument()
    })

    it('should render a grid of statistic items', () => {
      const { container } = render(<Statistics />)
      const grid = container.querySelector('[class*="grid"]')
      expect(grid).toBeInTheDocument()
    })

    it('should render a header with title and subtitle', () => {
      const { container } = render(<Statistics />)
      const header = container.querySelector('[class*="header"]')
      expect(header).toBeInTheDocument()
    })
  })

  describe('Icon rendering', () => {
    it('should render font awesome icons for each statistic', () => {
      const { container } = render(<Statistics />)
      // Each stat card has an icon wrapper
      const iconWrappers = container.querySelectorAll('[class*="iconWrapper"]')
      expect(iconWrappers.length).toBe(4)
    })

    it('should render icons with aria-hidden to hide from screen readers', () => {
      const { container } = render(<Statistics />)
      // Font awesome icons should be aria-hidden
      const icons = container.querySelectorAll('i[aria-hidden="true"]')
      expect(icons.length).toBe(4)
    })
  })

  describe('Counter animations', () => {
    it('should render a counter element for each statistic', () => {
      const { container } = render(<Statistics />)
      const counters = container.querySelectorAll('[class*="value"]')
      expect(counters.length).toBe(4)
    })
  })

  describe('Accessibility', () => {
    it('should have a section title as heading', () => {
      render(<Statistics />)
      const heading = screen.getByRole('heading', {
        name: /Join thousands who've simplified their notes/i,
      })
      expect(heading).toBeInTheDocument()
    })

    it('should render stat labels as visible text', () => {
      render(<Statistics />)
      // All label text should be visible to screen readers
      expect(screen.getByText('Active Users')).toBeVisible()
      expect(screen.getByText('Notes Created')).toBeVisible()
      expect(screen.getByText('Uptime')).toBeVisible()
      expect(screen.getByText('User Rating')).toBeVisible()
    })
  })
})
