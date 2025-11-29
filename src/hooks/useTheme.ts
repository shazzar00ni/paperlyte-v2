import { useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

const isBrowser = typeof window !== 'undefined'

const isValidTheme = (value: string | null): value is Theme => {
  return value === 'light' || value === 'dark'
}

export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>(() => {
    // SSR guard: return default theme if not in browser
    if (!isBrowser) return 'light'

    // Check localStorage first
    const stored = localStorage.getItem('theme')
    if (stored && isValidTheme(stored)) {
      return stored
    }

    // Check system preference
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
    localStorage.setItem('theme', theme)
  }, [theme])

  // Listen for system preference changes
  useEffect(() => {
    // SSR guard: skip if not in browser
    if (!isBrowser) return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e: MediaQueryListEvent) => {
      // Only update if user hasn't manually set a preference
      const stored = localStorage.getItem('theme')
      if (!stored || !isValidTheme(stored)) {
        setTheme(e.matches ? 'dark' : 'light')
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))
  }

  return { theme, toggleTheme }
}
