import { useEffect, useState, useRef } from 'react'
import { PERSISTENCE_CONFIG } from '@constants/config'
import { logError } from '@utils/monitoring'

type Theme = 'light' | 'dark'

const isBrowser = typeof window !== 'undefined'
const THEME_STORAGE_KEY = 'paperlyte:v1:theme' // nosemgrep: generic.secrets.security.hardcoded-password-string
const USER_PREFERENCE_KEY = 'paperlyte:v1:theme-user-preference' // nosemgrep: generic.secrets.security.hardcoded-password-string

const toError = (e: unknown): Error => (e instanceof Error ? e : new Error(String(e)))

const isValidTheme = (value: string | null): value is Theme => {
  return value === 'light' || value === 'dark'
}

// One-time migration: move data from legacy unversioned keys to versioned keys.
// Safe to call in the hook body on every render because it exits immediately when
// no legacy keys exist (only 2 cheap localStorage.getItem reads on the hot path).
// Concurrent-mode safe: the backfill-only writes and subsequent removeItem calls are
// idempotent, so re-running an aborted render produces the same final storage state.
// Handles partial-state: migrates each key independently so an orphaned
// theme-user-preference key is cleaned up even when the theme key is absent.
const migrateLegacyTheme = (): void => {
  try {
    const legacyTheme = localStorage.getItem('theme')
    const legacyPref = localStorage.getItem('theme-user-preference')
    if (legacyTheme === null && legacyPref === null) return

    const currentTheme = localStorage.getItem(THEME_STORAGE_KEY)
    const currentPref = localStorage.getItem(USER_PREFERENCE_KEY)
    // Backfill only — never overwrite an already-migrated versioned key
    if (isValidTheme(legacyTheme) && currentTheme === null) {
      localStorage.setItem(THEME_STORAGE_KEY, legacyTheme)
    }
    if (legacyPref !== null && currentPref === null) {
      localStorage.setItem(USER_PREFERENCE_KEY, legacyPref)
    }
    // removeItem is a no-op when the key doesn't exist, so guards are unnecessary
    localStorage.removeItem('theme')
    localStorage.removeItem('theme-user-preference')
  } catch (err) {
    // Storage blocked (incognito/quota) — fall back silently but report for diagnostics
    logError(toError(err), {
      tags: { hook: 'useTheme', operation: 'migrateLegacyTheme' },
    })
  }
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
    try {
      return localStorage.getItem(USER_PREFERENCE_KEY) === 'true'
    } catch (err) {
      logError(toError(err), {
        tags: { hook: 'useTheme', operation: 'readUserPreferenceFlag' },
      })
      return false
    }
  }

  // useState lazy initializer runs exactly once per hook instance (not on re-renders),
  // so migration and initial storage reads happen only on mount — no repeated reads
  // or logError spam on subsequent renders even if storage is blocked.
  // useState is called before useRef so the ref is initialised from post-migration storage.
  const [theme, setTheme] = useState<Theme>(() => {
    // SSR guard: return default theme if not in browser
    if (!isBrowser) return 'light'

    // Migrate legacy unversioned keys first so the storage reads below see versioned keys.
    if (persistenceEnabled) {
      migrateLegacyTheme()
    }

    // Only check localStorage if persistence is enabled
    if (persistenceEnabled) {
      try {
        // Check if user has explicitly set a preference before
        const hasUserPreference = getInitialUserPreference()

        // Check localStorage for saved theme
        const stored = localStorage.getItem(THEME_STORAGE_KEY)
        if (stored && isValidTheme(stored) && hasUserPreference) {
          return stored
        }
      } catch (err) {
        // Storage blocked — fall through to system preference
        logError(toError(err), {
          tags: { hook: 'useTheme', operation: 'readInitialTheme' },
        })
      }
    }

    // Fall back to system preference
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark'
    }

    return 'light'
  })

  // Initialised after useState so it reads post-migration storage (USER_PREFERENCE_KEY
  // may have been written by migrateLegacyTheme inside the lazy initializer above).
  // Lazy-ref pattern: getInitialUserPreference() runs only on first render. Passing
  // it as useRef's argument would re-evaluate on every render, re-reading storage.
  const userHasExplicitPreference = useRef<boolean | null>(null)
  if (userHasExplicitPreference.current === null) {
    userHasExplicitPreference.current = getInitialUserPreference()
  }

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
      try {
        localStorage.setItem(THEME_STORAGE_KEY, theme)
        if (userHasExplicitPreference.current) {
          localStorage.setItem(USER_PREFERENCE_KEY, 'true')
        }
      } catch (err) {
        // Storage blocked — theme still applied to DOM above
        logError(toError(err), {
          tags: { hook: 'useTheme', operation: 'persistTheme' },
        })
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
    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
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
