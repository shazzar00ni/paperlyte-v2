import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Comparison } from './Comparison'
import { COMPARISON_FEATURES, COMPETITORS } from '@constants/comparison'
import { escapeRegExp } from '@/utils/test/regexHelpers'

describe('Comparison', () => {
  it('should render as a section with correct id', () => {
    const { container } = render(<Comparison />)

    const section = container.querySelector('section')
    expect(section).toBeInTheDocument()
    expect(section).toHaveAttribute('id', 'comparison')
  })

  it('should render main heading', () => {
    render(<Comparison />)
    expect(screen.getByText('How we stack up')).toBeInTheDocument()
  })

  it('should render subtitle', () => {
    render(<Comparison />)
    expect(
      screen.getByText(
        "We believe in transparency. Here's how Paperlyte stacks up against the competition."
      )
    ).toBeInTheDocument()
  })

  it('should render comparison table', () => {
    render(<Comparison />)

    const table = screen.getByRole('table')
    expect(table).toBeInTheDocument()
  })

  it('should render table headers for all competitors', () => {
    render(<Comparison />)

    // Check Feature column header
    expect(screen.getByRole('columnheader', { name: 'Feature' })).toBeInTheDocument()

    // Check all competitor headers
    COMPETITORS.forEach((competitor) => {
      // Safe: input is escaped via escapeRegExp() and comes from COMPETITORS constant, not user input
      const header = screen.getByRole('columnheader', {
        name: new RegExp(escapeRegExp(competitor.name)), // nosemgrep: javascript.lang.security.audit.detect-non-literal-regexp.detect-non-literal-regexp, javascript_dos_rule-non-literal-regexp
      })
      expect(header).toBeInTheDocument()
    })
  })

  it('should render "You" badge for Paperlyte column', () => {
    render(<Comparison />)

    const paperlyteBadge = screen.getByLabelText('Our product')
    expect(paperlyteBadge).toBeInTheDocument()
    expect(paperlyteBadge).toHaveTextContent('You')
  })

  it('should render all comparison features', () => {
    render(<Comparison />)

    COMPARISON_FEATURES.forEach((feature) => {
      expect(screen.getByRole('rowheader', { name: feature.feature })).toBeInTheDocument()
    })
  })

  it('should render checkmark icons for true boolean values', () => {
    const { container } = render(<Comparison />)

    // Find all checkmarks
    const checkmarks = container.querySelectorAll('.fa-check')
    expect(checkmarks.length).toBeGreaterThan(0)

    // Check they have proper accessibility labels
    checkmarks.forEach((checkmark) => {
      expect(checkmark).toHaveAttribute('aria-label', 'Supported')
    })
  })

  it('should render X icons for false boolean values', () => {
    const { container } = render(<Comparison />)

    // Find all X marks
    const xmarks = container.querySelectorAll('.fa-xmark')
    expect(xmarks.length).toBeGreaterThan(0)

    // Check they have proper accessibility labels
    xmarks.forEach((xmark) => {
      expect(xmark).toHaveAttribute('aria-label', 'Not supported')
    })
  })

  it('should render text values for string comparisons', () => {
    render(<Comparison />)

    // Check for specific string values from the comparison data
    const startupTimes = screen.getAllByText(/\b<1s\b|\b\d+-\d+s\b/i) // Matches "<1s", "3-5s", etc.
    expect(startupTimes.length).toBeGreaterThan(0)

    expect(screen.getByText('Paid only')).toBeInTheDocument() // Evernote offline access

    const fullAccess = screen.getAllByText('Full access') // Appears in multiple rows
    expect(fullAccess.length).toBeGreaterThan(0)
  })

  it('should render disclaimer with current date', () => {
    vi.useFakeTimers()
    const fixedDate = new Date('2025-01-15T00:00:00Z')
    vi.setSystemTime(fixedDate)

    render(<Comparison />)

    const currentDate = fixedDate.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    })

    expect(
      screen.getByText(
        new RegExp(
          `Comparison data accurate as of ${currentDate}\\.\\s*Competitor features may vary by plan and region\\.`
        )
      )
    ).toBeInTheDocument()

    vi.useRealTimers()
  })

  it('should have proper table structure with thead and tbody', () => {
    const { container } = render(<Comparison />)

    const table = container.querySelector('table')
    expect(table?.querySelector('thead')).toBeInTheDocument()
    expect(table?.querySelector('tbody')).toBeInTheDocument()
  })

  it('should render correct number of rows', () => {
    const { container } = render(<Comparison />)

    const tbody = container.querySelector('tbody')
    const rows = tbody?.querySelectorAll('tr')

    // Should have one row per comparison feature
    expect(rows).toHaveLength(COMPARISON_FEATURES.length)
  })

  it('should render correct number of columns', () => {
    const { container } = render(<Comparison />)

    const headerRow = container.querySelector('thead tr')
    const headers = headerRow?.querySelectorAll('th')

    // Should have 1 feature column + 4 competitor columns
    expect(headers).toHaveLength(5)
  })

  it('should use proper scope attributes for accessibility', () => {
    const { container } = render(<Comparison />)

    // Column headers should have scope="col"
    const columnHeaders = container.querySelectorAll('thead th')
    columnHeaders.forEach((header) => {
      expect(header).toHaveAttribute('scope', 'col')
    })

    // Row headers (feature names) should have scope="row"
    const rowHeaders = container.querySelectorAll('tbody th')
    rowHeaders.forEach((header) => {
      expect(header).toHaveAttribute('scope', 'row')
    })
  })

  it('should highlight Paperlyte column with special styling', () => {
    render(<Comparison />)

    // Find Paperlyte header
    const paperlyteTh = screen.getByRole('columnheader', {
      name: /Paperlyte/i,
    })

    // Should have color styling (inline style)
    expect(paperlyteTh).toHaveStyle({ color: 'var(--color-primary)' })
    expect(paperlyteTh).toHaveStyle({ fontWeight: '700' })
  })

  it('should render specific comparison feature: Startup Time', () => {
    render(<Comparison />)

    expect(screen.getByRole('rowheader', { name: 'Startup Time' })).toBeInTheDocument()
    expect(screen.getByText('<1s')).toBeInTheDocument() // Paperlyte
    expect(screen.getByText('3-5s')).toBeInTheDocument() // Notion
  })

  it('should render specific comparison feature: Offline Access', () => {
    render(<Comparison />)

    expect(screen.getByRole('rowheader', { name: 'Offline Access' })).toBeInTheDocument()

    // Should have checkmarks for true values
    const offlineRow = screen.getByRole('rowheader', { name: 'Offline Access' }).closest('tr')
    expect(offlineRow).toBeInTheDocument()
  })

  it('should render specific comparison feature: End-to-End Encryption', () => {
    render(<Comparison />)

    expect(screen.getByRole('rowheader', { name: 'End-to-End Encryption' })).toBeInTheDocument()
  })
})
