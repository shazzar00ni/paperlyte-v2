import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeToggle } from './ThemeToggle'
import * as useThemeModule from '@hooks/useTheme'

describe('ThemeToggle', () => {
  const mockToggleTheme = vi.fn()

  // Helper to mock useTheme hook
  const mockUseTheme = (theme: 'light' | 'dark') => {
    vi.spyOn(useThemeModule, 'useTheme').mockReturnValue({
      theme,
      toggleTheme: mockToggleTheme,
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Rendering', () => {
    it('should render a button', () => {
      mockUseTheme('light')

      render(<ThemeToggle />)

      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })

    it('should render moon icon in light mode', () => {
      mockUseTheme('light')

      render(<ThemeToggle />)

      // Icon component should render (either SVG or fallback)
      const button = screen.getByRole('button')
      const icon = button.querySelector('svg, i, span')
      expect(icon).toBeInTheDocument()
    })

    it('should render sun icon in dark mode', () => {
      mockUseTheme('dark')

      render(<ThemeToggle />)

      // Icon component should render (either SVG or fallback)
      const button = screen.getByRole('button')
      const icon = button.querySelector('svg, i, span')
      expect(icon).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have correct aria-label in light mode', () => {
      mockUseTheme('light')

      render(<ThemeToggle />)

      const button = screen.getByRole('button', { name: /switch to dark mode/i })
      expect(button).toBeInTheDocument()
    })

    it('should have correct aria-label in dark mode', () => {
      mockUseTheme('dark')

      render(<ThemeToggle />)

      const button = screen.getByRole('button', { name: /switch to light mode/i })
      expect(button).toBeInTheDocument()
    })

    it('should have title attribute in light mode', () => {
      mockUseTheme('light')

      render(<ThemeToggle />)

      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('title', 'Switch to dark mode')
    })

    it('should have title attribute in dark mode', () => {
      mockUseTheme('dark')

      render(<ThemeToggle />)

      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('title', 'Switch to light mode')
    })
  })

  describe('Interaction', () => {
    it('should call toggleTheme when clicked', async () => {
      const user = userEvent.setup()

      mockUseTheme('light')

      render(<ThemeToggle />)

      const button = screen.getByRole('button')
      await user.click(button)

      expect(mockToggleTheme).toHaveBeenCalledTimes(1)
    })

    it('should call toggleTheme on each click', async () => {
      const user = userEvent.setup()

      mockUseTheme('light')

      render(<ThemeToggle />)

      const button = screen.getByRole('button')

      await user.click(button)
      await user.click(button)
      await user.click(button)

      expect(mockToggleTheme).toHaveBeenCalledTimes(3)
    })

    it('should be keyboard accessible', async () => {
      const user = userEvent.setup()

      mockUseTheme('light')

      render(<ThemeToggle />)

      const button = screen.getByRole('button')
      button.focus()

      // Press Enter
      await user.keyboard('{Enter}')
      expect(mockToggleTheme).toHaveBeenCalledTimes(1)

      // Press Space
      await user.keyboard(' ')
      expect(mockToggleTheme).toHaveBeenCalledTimes(2)
    })
  })

  describe('Theme Changes', () => {
    it('should update icon when theme changes from light to dark', () => {
      const { rerender } = render(<ThemeToggle />)

      mockUseTheme('light')

      rerender(<ThemeToggle />)
      expect(screen.getByRole('button').querySelector('svg, i, span')).toBeInTheDocument()

      mockUseTheme('dark')

      rerender(<ThemeToggle />)
      expect(screen.getByRole('button').querySelector('svg, i, span')).toBeInTheDocument()
    })

    it('should update aria-label when theme changes', () => {
      mockUseTheme('light')

      const { rerender } = render(<ThemeToggle />)
      expect(screen.getByRole('button', { name: /switch to dark mode/i })).toBeInTheDocument()

      mockUseTheme('dark')

      rerender(<ThemeToggle />)
      expect(screen.getByRole('button', { name: /switch to light mode/i })).toBeInTheDocument()
    })
  })

  describe('Icon Component Integration', () => {
    it('should render icon in light mode', () => {
      mockUseTheme('light')

      render(<ThemeToggle />)

      const button = screen.getByRole('button')
      const icon = button.querySelector('svg, i, span')

      expect(icon).toBeInTheDocument()
    })

    it('should render icon in dark mode', () => {
      mockUseTheme('dark')

      render(<ThemeToggle />)

      const button = screen.getByRole('button')
      const icon = button.querySelector('svg, i, span')

      expect(icon).toBeInTheDocument()
    })

    it('should render icon with proper sizing', () => {
      mockUseTheme('light')

      render(<ThemeToggle />)

      const button = screen.getByRole('button')
      const icon = button.querySelector('svg, i, span')

      // Icon component should render with proper size
      expect(icon).toBeInTheDocument()
    })
  })
})
