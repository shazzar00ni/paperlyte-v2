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

    it('should render moon icon in light mode', () => {
      vi.spyOn(useThemeModule, 'useTheme').mockReturnValue({
        theme: 'light',
        toggleTheme: mockToggleTheme,
      })

      const { container } = render(<ThemeToggle />)

      // Icon component should render moon icon SVG
      const button = screen.getByRole('button')
      const svg = button.querySelector('svg.icon-svg')
      expect(svg).toBeInTheDocument()

      // Verify it's the moon icon by checking its unique path data
      const path = container.querySelector('path')
      expect(path?.getAttribute('d')).toContain('21 12.79A9 9 0 1 1 11.21 3')
    })

    it('should render sun icon in dark mode', () => {
      vi.spyOn(useThemeModule, 'useTheme').mockReturnValue({
        theme: 'dark',
        toggleTheme: mockToggleTheme,
      })

      const { container } = render(<ThemeToggle />)

      // Icon component should render sun icon SVG
      const button = screen.getByRole('button')
      const svg = button.querySelector('svg.icon-svg')
      expect(svg).toBeInTheDocument()

      // Verify it's the sun icon by checking its unique path data
      const path = container.querySelector('path')
      expect(path?.getAttribute('d')).toContain('M12 7a5 5 0 1 0 0 10')
    })
  })

  describe('Accessibility', () => {
    it('should have correct aria-label in light mode', () => {
      vi.spyOn(useThemeModule, 'useTheme').mockReturnValue({
        theme: 'light',
        toggleTheme: mockToggleTheme,
      })

      render(<ThemeToggle />)

      const button = screen.getByRole('button', { name: /switch to dark mode/i })
      expect(button).toBeInTheDocument()
    })

    it('should have correct aria-label in dark mode', () => {
      vi.spyOn(useThemeModule, 'useTheme').mockReturnValue({
        theme: 'dark',
        toggleTheme: mockToggleTheme,
      })

      render(<ThemeToggle />)

      const button = screen.getByRole('button', { name: /switch to light mode/i })
      expect(button).toBeInTheDocument()
    })

    it('should have title attribute in light mode', () => {
      vi.spyOn(useThemeModule, 'useTheme').mockReturnValue({
        theme: 'light',
        toggleTheme: mockToggleTheme,
      })

      render(<ThemeToggle />)

      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('title', 'Switch to dark mode')
    })

    it('should have title attribute in dark mode', () => {
      vi.spyOn(useThemeModule, 'useTheme').mockReturnValue({
        theme: 'dark',
        toggleTheme: mockToggleTheme,
      })

      render(<ThemeToggle />)

      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('title', 'Switch to light mode')
    })
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
      const { rerender, container } = render(<ThemeToggle />)

      vi.spyOn(useThemeModule, 'useTheme').mockReturnValue({
        theme: 'light',
        toggleTheme: mockToggleTheme,
      })

      rerender(<ThemeToggle />)
      expect(screen.getByRole('button').querySelector('svg.icon-svg')).toBeInTheDocument()
      // Verify moon icon in light mode
      let path = container.querySelector('path')
      expect(path?.getAttribute('d')).toContain('21 12.79A9 9 0 1 1 11.21 3')

      vi.spyOn(useThemeModule, 'useTheme').mockReturnValue({
        theme: 'dark',
        toggleTheme: mockToggleTheme,
      })

      rerender(<ThemeToggle />)
      expect(screen.getByRole('button').querySelector('svg.icon-svg')).toBeInTheDocument()
      // Verify sun icon in dark mode
      path = container.querySelector('path')
      expect(path?.getAttribute('d')).toContain('M12 7a5 5 0 1 0 0 10')
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
    it('should pass correct icon name to Icon component in light mode', () => {
      vi.spyOn(useThemeModule, 'useTheme').mockReturnValue({
        theme: 'light',
        toggleTheme: mockToggleTheme,
      })

      const { container } = render(<ThemeToggle />)

      const button = screen.getByRole('button')
      const svg = button.querySelector('svg.icon-svg')
      expect(svg).toBeInTheDocument()

      // Verify moon icon is passed by checking path data
      const path = container.querySelector('path')
      expect(path?.getAttribute('d')).toContain('21 12.79A9 9 0 1 1 11.21 3')
    })

    it('should pass correct icon name to Icon component in dark mode', () => {
      vi.spyOn(useThemeModule, 'useTheme').mockReturnValue({
        theme: 'dark',
        toggleTheme: mockToggleTheme,
      })

      const { container } = render(<ThemeToggle />)

      const button = screen.getByRole('button')
      const svg = button.querySelector('svg.icon-svg')
      expect(svg).toBeInTheDocument()

      // Verify sun icon is passed by checking path data
      const path = container.querySelector('path')
      expect(path?.getAttribute('d')).toContain('M12 7a5 5 0 1 0 0 10')
    })

    it('should pass size="md" to Icon component', () => {
      vi.spyOn(useThemeModule, 'useTheme').mockReturnValue({
        theme: 'light',
        toggleTheme: mockToggleTheme,
      })

      render(<ThemeToggle />)

      const button = screen.getByRole('button')
      const svg = button.querySelector('svg.icon-svg')
      expect(svg).toBeInTheDocument()

      // Verify size="md" results in 20px icon (from SIZE_MAP in Icon component)
      expect(svg?.getAttribute('width')).toBe('20')
      expect(svg?.getAttribute('height')).toBe('20')
    })
  })
})
