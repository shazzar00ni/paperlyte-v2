import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeToggle } from './ThemeToggle'
import * as useThemeModule from '@hooks/useTheme'
import { getIconFromButton } from '@/test/iconTestHelpers'
import * as IconModule from '@components/ui/Icon/Icon'
import type { IconProps } from '@components/ui/Icon/Icon'

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

      // Icon is decorative - button's aria-label provides accessible name
      const button = screen.getByRole('button')
      const icon = getIconFromButton(button)
      expect(icon).toBeInTheDocument()
    })

    it('should render sun icon in dark mode', () => {
      mockUseTheme('dark')

      render(<ThemeToggle />)

      // Icon is decorative - button's aria-label provides accessible name
      const button = screen.getByRole('button')
      const icon = getIconFromButton(button)
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
      // Spy on Icon to track which icon name is being rendered
      const iconSpy = vi.spyOn(IconModule, 'Icon')

      // Mock useTheme to start in light mode
      mockUseTheme('light')

      const { rerender } = render(<ThemeToggle />)

      // Verify moon icon is rendered in light mode
      expect(iconSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'fa-moon',
        }),
        expect.anything()
      )

      mockUseTheme('dark')

      rerender(<ThemeToggle />)

      // Verify sun icon is rendered in dark mode
      expect(iconSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'fa-sun',
        }),
        expect.anything()
      )

      vi.restoreAllMocks()
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
    beforeEach(() => {
      // Mock the Icon component to render with test data attributes
      vi.spyOn(IconModule, 'Icon').mockImplementation(({ name, size }: IconProps) => (
        <span data-testid="mock-icon" data-name={name} data-size={size} />
      ))
    })

    afterEach(() => {
      vi.restoreAllMocks()
    })

    it.each([
      { theme: 'light', expectedIcon: 'fa-moon' },
      { theme: 'dark', expectedIcon: 'fa-sun' },
    ] as const)(
      'should pass correct icon name ($expectedIcon) in $theme mode',
      ({ theme, expectedIcon }) => {
        mockUseTheme(theme)

        render(<ThemeToggle />)

        const mockIcon = screen.getByTestId('mock-icon')
        expect(mockIcon).toHaveAttribute('data-name', expectedIcon)
      }
    )

    it('should pass size="md" to Icon component', () => {
      mockUseTheme('light')

      render(<ThemeToggle />)

      const mockIcon = screen.getByTestId('mock-icon')
      expect(mockIcon).toHaveAttribute('data-size', 'md')
    })
  })
})
