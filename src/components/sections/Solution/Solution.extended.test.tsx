/**
 * Extended tests for Solution section component
 * Targets the uncovered CTA button click handler (line 110 in Solution.tsx).
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Solution } from './Solution'

// Mock navigation utility
vi.mock('@/utils/navigation', () => ({
  scrollToSection: vi.fn(),
  smoothScrollTo: vi.fn(),
  scrollToTop: vi.fn(),
  getScrollProgress: vi.fn(() => 0),
}))

describe('Solution extended', () => {
  let scrollToSectionMock: ReturnType<typeof vi.fn>

  beforeEach(async () => {
    vi.clearAllMocks()
    const nav = await import('@/utils/navigation')
    scrollToSectionMock = nav.scrollToSection as ReturnType<typeof vi.fn>
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  // ----------------------------------------------------------------
  // CTA button interaction (the uncovered line)
  // ----------------------------------------------------------------
  it('calls scrollToSection with "email-capture" when Join the Waitlist CTA is clicked', async () => {
    const user = userEvent.setup()
    render(<Solution />)

    const ctaButton = screen.getByRole('button', { name: /Join the Waitlist/i })
    await user.click(ctaButton)

    expect(scrollToSectionMock).toHaveBeenCalledWith('email-capture')
  })

  it('does not call scrollToSection before the button is clicked', () => {
    render(<Solution />)
    expect(scrollToSectionMock).not.toHaveBeenCalled()
  })

  // ----------------------------------------------------------------
  // Content / structure assertions
  // ----------------------------------------------------------------
  it('renders the section title', () => {
    render(<Solution />)
    expect(screen.getByText('Three promises. Zero compromises.')).toBeInTheDocument()
  })

  it('renders the section subtitle', () => {
    render(<Solution />)
    expect(
      screen.getByText(/Paperlyte is built on three core principles/i)
    ).toBeInTheDocument()
  })

  it('renders all three value proposition headlines', () => {
    render(<Solution />)
    expect(screen.getByText('Zero-Lag Typing')).toBeInTheDocument()
    expect(screen.getByText('Tag-Based Organization')).toBeInTheDocument()
    expect(screen.getByText('Works Everywhere, Always')).toBeInTheDocument()
  })

  it('renders body paragraphs for each value prop', () => {
    render(<Solution />)
    expect(screen.getByText(/8 milliseconds/i)).toBeInTheDocument()
    // "#tags" text may be split across elements; check it appears somewhere in the page
    expect(document.body.textContent).toMatch(/#project/)
    // "offline-first" also appears in the proof span; check page content instead
    expect(document.body.textContent).toMatch(/offline-first/i)
  })

  it('renders proof text for each value prop', () => {
    render(<Solution />)
    expect(screen.getByText(/8ms keystroke response/i)).toBeInTheDocument()
  })

  it('renders the Join the Waitlist button', () => {
    render(<Solution />)
    expect(screen.getByRole('button', { name: /Join the Waitlist/i })).toBeInTheDocument()
  })

  it('renders the CTA microcopy with waitlist count', () => {
    render(<Solution />)
    expect(screen.getByText(/people already ahead of you/i)).toBeInTheDocument()
  })

  it('renders inside a Section with id "solution"', () => {
    const { container } = render(<Solution />)
    expect(container.querySelector('#solution')).toBeInTheDocument()
  })

  it('renders articles for each value prop', () => {
    const { container } = render(<Solution />)
    const articles = container.querySelectorAll('article')
    expect(articles.length).toBe(3)
  })

  it('renders emojis for value props', () => {
    render(<Solution />)
    expect(screen.getAllByText('⚡')[0]).toBeInTheDocument()
    expect(screen.getAllByText('🏷️')[0]).toBeInTheDocument()
    expect(screen.getAllByText('📱')[0]).toBeInTheDocument()
  })
})
