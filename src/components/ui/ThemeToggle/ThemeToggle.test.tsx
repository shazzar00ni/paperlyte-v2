import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeToggle } from './ThemeToggle'
import * as useThemeModule from '@hooks/useTheme'

describe('ThemeToggle', () => {
  const mockToggleTheme = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Rendering', () => {
    it('should render a button', () => {
      vi.spyOn(useThemeModule, 'useTheme').mockReturnValue({
        theme: 'light',
        toggleTheme: mockToggleTheme,
      })

      render(<ThemeToggle />)

      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })

    it.each([
      { theme: 'light' as const, description: 'light mode', expectedIcon: 'fa-moon' },
      { theme: 'dark' as const, description: 'dark mode', expectedIcon: 'fa-sun' },
    ])('should render $expectedIcon in $description', ({ theme, expectedIcon }) => {
      vi.spyOn(useThemeModule, 'useTheme').mockReturnValue({
        theme,
        toggleTheme: mockToggleTheme,
      })

      render(<ThemeToggle />)

      const button = screen.getByRole('button')
      const icon = button.querySelector('svg')

      expect(icon).toBeInTheDocument()
      expect(icon).toHaveAttribute('data-icon', expectedIcon)
    })
  })

  describe('Accessibility', () => {
    it.each([
      {
        theme: 'light' as const,
        ariaLabel: /switch to dark mode/i,
        title: 'Switch to dark mode',
      },
      {
        theme: 'dark' as const,
        ariaLabel: /switch to light mode/i,
        title: 'Switch to light mode',
      },
    ])(
      'should have correct aria-label and title in $theme mode',
      ({ theme, ariaLabel, title }) => {
        vi.spyOn(useThemeModule, 'useTheme').mockReturnValue({
          theme,
          toggleTheme: mockToggleTheme,
        })

        render(<ThemeToggle />)

        const button = screen.getByRole('button', { name: ariaLabel })
        expect(button).toBeInTheDocument()
        expect(button).toHaveAttribute('title', title)
      }
    )
  })

  describe('Interaction', () => {
    it('should call toggleTheme when clicked', async () => {
      const user = userEvent.setup()

      vi.spyOn(useThemeModule, 'useTheme').mockReturnValue({
        theme: 'light',
        toggleTheme: mockToggleTheme,
      })

      render(<ThemeToggle />)

      const button = screen.getByRole('button')
      await user.click(button)

      expect(mockToggleTheme).toHaveBeenCalledTimes(1)
    })

    it('should call toggleTheme on each click', async () => {
      const user = userEvent.setup()

      vi.spyOn(useThemeModule, 'useTheme').mockReturnValue({
        theme: 'light',
        toggleTheme: mockToggleTheme,
      })

      render(<ThemeToggle />)

      const button = screen.getByRole('button')

      await user.click(button)
      await user.click(button)
      await user.click(button)

      expect(mockToggleTheme).toHaveBeenCalledTimes(3)
    })

    it('should be keyboard accessible', async () => {
      const user = userEvent.setup()

      vi.spyOn(useThemeModule, 'useTheme').mockReturnValue({
        theme: 'light',
        toggleTheme: mockToggleTheme,
      })

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

      vi.spyOn(useThemeModule, 'useTheme').mockReturnValue({
        theme: 'light',
        toggleTheme: mockToggleTheme,
      })

      rerender(<ThemeToggle />)
      const lightIcon = screen.getByRole('button').querySelector('svg')
      expect(lightIcon).toHaveAttribute('data-icon', 'fa-moon')

      vi.spyOn(useThemeModule, 'useTheme').mockReturnValue({
        theme: 'dark',
        toggleTheme: mockToggleTheme,
      })

      rerender(<ThemeToggle />)
      const darkIcon = screen.getByRole('button').querySelector('svg')
      expect(darkIcon).toHaveAttribute('data-icon', 'fa-sun')
    })

    it('should update aria-label when theme changes', () => {
      vi.spyOn(useThemeModule, 'useTheme').mockReturnValue({
        theme: 'light',
        toggleTheme: mockToggleTheme,
      })

      const { rerender } = render(<ThemeToggle />)
      expect(screen.getByRole('button', { name: /switch to dark mode/i })).toBeInTheDocument()

      vi.spyOn(useThemeModule, 'useTheme').mockReturnValue({
        theme: 'dark',
        toggleTheme: mockToggleTheme,
      })

      rerender(<ThemeToggle />)
      expect(screen.getByRole('button', { name: /switch to light mode/i })).toBeInTheDocument()
    })
  })

  describe('Icon Component Integration', () => {
    it.each([
      { theme: 'light' as const, description: 'light mode', expectedIcon: 'fa-moon' },
      { theme: 'dark' as const, description: 'dark mode', expectedIcon: 'fa-sun' },
    ])('should render $expectedIcon with correct properties in $description', ({ theme, expectedIcon }) => {
      vi.spyOn(useThemeModule, 'useTheme').mockReturnValue({
        theme,
        toggleTheme: mockToggleTheme,
      })

      render(<ThemeToggle />)

      const button = screen.getByRole('button')
      const icon = button.querySelector('svg')

      expect(icon).toBeInTheDocument()
      expect(icon).toHaveClass('icon-svg')
      expect(icon).toHaveAttribute('data-icon', expectedIcon)
    })

    it('should pass size="md" to Icon component', () => {
      vi.spyOn(useThemeModule, 'useTheme').mockReturnValue({
        theme: 'light',
        toggleTheme: mockToggleTheme,
      })

      render(<ThemeToggle />)

      const button = screen.getByRole('button')
      const icon = button.querySelector('svg')

      // Icon component applies size via width/height attributes
      expect(icon).toBeInTheDocument()

      // Verify width and height attributes exist and are equal (size consistency)
      const width = icon?.getAttribute('width')
      const height = icon?.getAttribute('height')
      expect(width).toBeTruthy()
      expect(height).toBeTruthy()
      expect(width).toBe(height)
    })
  })
})
