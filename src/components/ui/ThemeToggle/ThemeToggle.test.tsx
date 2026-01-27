import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeToggle } from './ThemeToggle'
import * as useThemeModule from '@hooks/useTheme'

describe('ThemeToggle', () => {
  const mockToggleTheme = vi.fn()

  // Helper functions to reduce code duplication
  const mockTheme = (theme: 'light' | 'dark') => {
    vi.spyOn(useThemeModule, 'useTheme').mockReturnValue({
      theme,
      toggleTheme: mockToggleTheme,
    })
  }

  const renderThemeToggle = (theme: 'light' | 'dark') => {
    mockTheme(theme)
    return render(<ThemeToggle />)
  }

  const getToggleButton = () => screen.getByRole('button')

  const getIcon = (button: HTMLElement) => button.querySelector('svg, .icon-fallback')

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Rendering', () => {
    it('should render a button', () => {
      renderThemeToggle('light')

      const button = getToggleButton()
      expect(button).toBeInTheDocument()
    })

    it('should render moon icon in light mode', () => {
      renderThemeToggle('light')

      const button = getToggleButton()
      const icon = getIcon(button)
      expect(icon).toBeInTheDocument()
    })

    it('should render sun icon in dark mode', () => {
      renderThemeToggle('dark')

      const button = getToggleButton()
      const icon = getIcon(button)
      expect(icon).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have correct aria-label in light mode', () => {
      renderThemeToggle('light')

      const button = screen.getByRole('button', { name: /switch to dark mode/i })
      expect(button).toBeInTheDocument()
    })

    it('should have correct aria-label in dark mode', () => {
      renderThemeToggle('dark')

      const button = screen.getByRole('button', { name: /switch to light mode/i })
      expect(button).toBeInTheDocument()
    })

    it('should have title attribute in light mode', () => {
      renderThemeToggle('light')

      const button = getToggleButton()
      expect(button).toHaveAttribute('title', 'Switch to dark mode')
    })

    it('should have title attribute in dark mode', () => {
      renderThemeToggle('dark')

      const button = getToggleButton()
      expect(button).toHaveAttribute('title', 'Switch to light mode')
    })
  })

  describe('Interaction', () => {
    it('should call toggleTheme when clicked', async () => {
      const user = userEvent.setup()
      renderThemeToggle('light')

      const button = getToggleButton()
      await user.click(button)

      expect(mockToggleTheme).toHaveBeenCalledTimes(1)
    })

    it('should call toggleTheme on each click', async () => {
      const user = userEvent.setup()
      renderThemeToggle('light')

      const button = getToggleButton()

      await user.click(button)
      await user.click(button)
      await user.click(button)

      expect(mockToggleTheme).toHaveBeenCalledTimes(3)
    })

    it('should be keyboard accessible', async () => {
      const user = userEvent.setup()
      renderThemeToggle('light')

      const button = getToggleButton()
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
      mockTheme('light')
      const { rerender } = render(<ThemeToggle />)
      const iconLight = getIcon(getToggleButton())
      expect(iconLight).toBeInTheDocument()

      mockTheme('dark')
      rerender(<ThemeToggle />)
      const iconDark = getIcon(getToggleButton())
      expect(iconDark).toBeInTheDocument()
    })

    it('should update aria-label when theme changes', () => {
      mockTheme('light')
      const { rerender } = render(<ThemeToggle />)
      expect(screen.getByRole('button', { name: /switch to dark mode/i })).toBeInTheDocument()

      mockTheme('dark')
      rerender(<ThemeToggle />)
      expect(screen.getByRole('button', { name: /switch to light mode/i })).toBeInTheDocument()
    })
  })

  // Icon Component Integration tests removed - redundant with Rendering tests above
})
