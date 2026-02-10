import { useEffect, useState, useRef } from 'react'

type Theme = 'light' | 'dark'

const isBrowser = typeof window !== 'undefined'
const THEME_STORAGE_KEY = 'theme'
const USER_PREFERENCE_KEY = 'theme-user-preference'

const isValidTheme = (value: string | null): value is Theme => {
  return value === 'light' || value === 'dark'
}

/**
 * Hook for managing application theme (light/dark mode)
 * Supports system preference detection, manual toggle, and localStorage persistence
 * Automatically syncs with system dark mode preference unless user manually overrides
 *
 * @returns Object containing current theme and toggle function
 * @returns theme - Current theme value ('light' | 'dark')
 * @returns toggleTheme - Function to toggle between light and dark themes
 *
 * @example
 * ```tsx
 * const { theme, toggleTheme } = useTheme()
 *
 * return (
 *   <button onClick={toggleTheme}>
 *     Current theme: {theme}
 *   </button>
 * )
 * ```
 */
export const useTheme = () => {
  // Get initial user preference flag from localStorage (only during init, not reactive)
  const getInitialUserPreference = (): boolean => {
    if (!isBrowser) return false
    return localStorage.getItem(USER_PREFERENCE_KEY) === 'true'
  }

  // Track if user has explicitly set a preference (not just from system)
  const userHasExplicitPreference = useRef(getInitialUserPreference())

  const [theme, setTheme] = useState<Theme>(() => {
    // SSR guard: return default theme if not in browser
    if (!isBrowser) return 'light'

    // Check if user has explicitly set a preference before
    const hasUserPreference = getInitialUserPreference()

    // Check localStorage for saved theme
    const stored = localStorage.getItem(THEME_STORAGE_KEY)
    if (stored && isValidTheme(stored) && hasUserPreference) {
      return stored
    }

    // Fall back to system preference
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark'
    }

    return 'light'
  })

  useEffect(() => {
    // SSR guard: skip if not in browser
    if (!isBrowser) return

    const root = document.documentElement

    // Apply theme to document
    if (theme === 'dark') {
      root.setAttribute('data-theme', 'dark')
    } else {
      root.setAttribute('data-theme', 'light')
    }

    // Save to localStorage
    localStorage.setItem(THEME_STORAGE_KEY, theme)

    // Save user preference flag if they've explicitly chosen
    if (userHasExplicitPreference.current) {
      localStorage.setItem(USER_PREFERENCE_KEY, 'true')
    }
  }, [theme])

  // Listen for system preference changes
  useEffect(() => {
    // SSR guard: skip if not in browser
    if (!isBrowser) return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e: MediaQueryListEvent) => {
      // Only update if user hasn't explicitly set a preference
      if (!userHasExplicitPreference.current) {
        setTheme(e.matches ? 'dark' : 'light')
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  const toggleTheme = () => {
    // Mark that user has explicitly set a preference
    userHasExplicitPreference.current = true
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))
  }

  return { theme, toggleTheme }
}
