import { useEffect, useState, useRef } from 'react'
import { PERSISTENCE_CONFIG } from '@constants/config'

type Theme = 'light' | 'dark'

const isBrowser = typeof window !== 'undefined'
const THEME_STORAGE_KEY = 'theme'
const USER_PREFERENCE_KEY = 'theme-user-preference'

const isValidTheme = (value: string | null): value is Theme => {
  return value === 'light' || value === 'dark'
}

/**
 * Custom hook for managing theme state (light/dark mode).
 *
 * Behavior depends on PERSISTENCE_CONFIG.ALLOW_PERSISTENT_THEME:
 * - When true: Theme preference is persisted to localStorage and restored on next visit.
 * - When false: Theme is in-memory only, falling back to system preference on each visit.
 *
 * Theme persistence is an allowed exception to the privacy-first approach because:
 * - It contains no personally identifiable information
 * - It significantly improves user experience across visits
 * - It respects system preference as fallback
 *
 * @returns {{ theme: Theme, toggleTheme: () => void }} The current theme and a function to toggle it
 */
export const useTheme = () => {
  const persistenceEnabled = PERSISTENCE_CONFIG.ALLOW_PERSISTENT_THEME

  // Get initial user preference flag from localStorage (only during init, not reactive)
  const getInitialUserPreference = (): boolean => {
    if (!isBrowser || !persistenceEnabled) return false
    return localStorage.getItem(USER_PREFERENCE_KEY) === 'true'
  }

  // Track if user has explicitly set a preference (not just from system)
  const userHasExplicitPreference = useRef(getInitialUserPreference())

  const [theme, setTheme] = useState<Theme>(() => {
    // SSR guard: return default theme if not in browser
    if (!isBrowser) return 'light'

    // Only check localStorage if persistence is enabled
    if (persistenceEnabled) {
      // Check if user has explicitly set a preference before
      const hasUserPreference = getInitialUserPreference()

      // Check localStorage for saved theme
      const stored = localStorage.getItem(THEME_STORAGE_KEY)
      if (stored && isValidTheme(stored) && hasUserPreference) {
        return stored
      }
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

    // Only persist to localStorage if persistence is enabled
    if (persistenceEnabled) {
      // Save to localStorage
      localStorage.setItem(THEME_STORAGE_KEY, theme)

      // Save user preference flag if they've explicitly chosen
      if (userHasExplicitPreference.current) {
        localStorage.setItem(USER_PREFERENCE_KEY, 'true')
      }
    }
  }, [theme, persistenceEnabled])

  // Listen for system preference changes
  useEffect(() => {
    // SSR guard: skip if not in browser
    if (!isBrowser) return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e: MediaQueryListEvent) => {
      // Only update if user hasn't explicitly set a preference
      // (or if persistence is disabled, always follow system)
      if (!userHasExplicitPreference.current || !persistenceEnabled) {
        setTheme(e.matches ? 'dark' : 'light')
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => { mediaQuery.removeEventListener('change', handleChange); }
  }, [persistenceEnabled])

  const toggleTheme = () => {
    // Mark that user has explicitly set a preference (only meaningful if persistence enabled)
    if (persistenceEnabled) {
      userHasExplicitPreference.current = true
    }
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))
  }

  return { theme, toggleTheme }
}
