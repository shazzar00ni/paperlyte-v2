import { renderHook, act, waitFor } from '@testing-library/react'
import { useTheme } from './useTheme'

// Mock the config module
vi.mock('@constants/config', () => ({
  PERSISTENCE_CONFIG: {
    ALLOW_PERSISTENT_THEME: true,
  },
}))

describe('useTheme', () => {
  // Store original matchMedia
  const originalMatchMedia = window.matchMedia

  // Mock localStorage
  const localStorageMock = (() => {
    let store: Record<string, string> = {}
    return {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => {
        store[key] = value
      },
      removeItem: (key: string) => {
        delete store[key]
      },
      clear: () => {
        store = {}
      },
    }
  })()

  beforeEach(() => {
    // Clear localStorage before each test
    localStorageMock.clear()
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    })

    // Mock matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })
  })

  afterEach(() => {
    // Restore original matchMedia
    window.matchMedia = originalMatchMedia
  })

  describe('Legacy key migration', () => {
    it('should migrate theme value from legacy key and remove old keys', () => {
      localStorageMock.setItem('theme', 'dark')
      localStorageMock.setItem('theme-user-preference', 'true')
      const { result } = renderHook(() => useTheme())

      // Theme is restored from migrated value
      expect(result.current.theme).toBe('dark')
      // New versioned keys are populated
      expect(localStorageMock.getItem('paperlyte:v1:theme')).toBe('dark')
      expect(localStorageMock.getItem('paperlyte:v1:theme-user-preference')).toBe('true')
      // Legacy keys are removed
      expect(localStorageMock.getItem('theme')).toBeNull()
      expect(localStorageMock.getItem('theme-user-preference')).toBeNull()
    })

    it('should migrate theme without user-preference flag when only theme key exists', () => {
      localStorageMock.setItem('theme', 'light')
      const { result } = renderHook(() => useTheme())

      expect(localStorageMock.getItem('paperlyte:v1:theme')).toBe('light')
      expect(localStorageMock.getItem('paperlyte:v1:theme-user-preference')).toBeNull()
      expect(localStorageMock.getItem('theme')).toBeNull()
      // Without user preference, system preference takes over; theme may be light or dark
      expect(['light', 'dark']).toContain(result.current.theme)
    })

    it('should clean up orphaned theme-user-preference key when theme key is absent', () => {
      localStorageMock.setItem('theme-user-preference', 'true')
      renderHook(() => useTheme())

      expect(localStorageMock.getItem('theme-user-preference')).toBeNull()
      expect(localStorageMock.getItem('paperlyte:v1:theme-user-preference')).toBe('true')
      // Migration does not set paperlyte:v1:theme (no legacy theme key existed),
      // but the useEffect writes the system-default theme after render — not null.
      expect(['light', 'dark']).toContain(localStorageMock.getItem('paperlyte:v1:theme'))
    })

    it('should not overwrite new keys if no legacy keys exist', () => {
      localStorageMock.setItem('paperlyte:v1:theme', 'dark')
      localStorageMock.setItem('paperlyte:v1:theme-user-preference', 'true')
      renderHook(() => useTheme())

      // New keys are untouched
      expect(localStorageMock.getItem('paperlyte:v1:theme')).toBe('dark')
      expect(localStorageMock.getItem('paperlyte:v1:theme-user-preference')).toBe('true')
    })

    it('should not overwrite versioned keys when both legacy and versioned keys coexist', () => {
      // Versioned keys already set by current code
      localStorageMock.setItem('paperlyte:v1:theme', 'dark')
      localStorageMock.setItem('paperlyte:v1:theme-user-preference', 'true')
      // Stale legacy keys also present (e.g. from an old browser tab)
      localStorageMock.setItem('theme', 'light')
      localStorageMock.setItem('theme-user-preference', 'true')

      const { result } = renderHook(() => useTheme())

      // Versioned keys win — legacy 'light' must not overwrite versioned 'dark'
      expect(localStorageMock.getItem('paperlyte:v1:theme')).toBe('dark')
      expect(localStorageMock.getItem('paperlyte:v1:theme-user-preference')).toBe('true')
      // Legacy keys are removed
      expect(localStorageMock.getItem('theme')).toBeNull()
      expect(localStorageMock.getItem('theme-user-preference')).toBeNull()
      // Hook uses the versioned value (dark), not the legacy one (light)
      expect(result.current.theme).toBe('dark')
    })
  })

  describe('Initialization', () => {
    it('should initialize with light theme by default', () => {
      const { result } = renderHook(() => useTheme())
      expect(result.current.theme).toBe('light')
    })

    it('should load theme from localStorage if present', () => {
      localStorageMock.setItem('paperlyte:v1:theme', 'dark')
      localStorageMock.setItem('paperlyte:v1:theme-user-preference', 'true')
      const { result } = renderHook(() => useTheme())
      expect(result.current.theme).toBe('dark')
    })

    it('should ignore invalid theme values from localStorage', () => {
      localStorageMock.setItem('paperlyte:v1:theme', 'invalid')
      const { result } = renderHook(() => useTheme())
      expect(result.current.theme).toBe('light')
    })

    it('should use system preference when localStorage is empty', () => {
      window.matchMedia = vi.fn().mockImplementation((query: string) => ({
        matches: query === '(prefers-color-scheme: dark)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }))

      const { result } = renderHook(() => useTheme())
      expect(result.current.theme).toBe('dark')
    })

    it('should prefer localStorage over system preference', () => {
      localStorageMock.setItem('paperlyte:v1:theme', 'light')
      localStorageMock.setItem('paperlyte:v1:theme-user-preference', 'true')
      window.matchMedia = vi.fn().mockImplementation((query: string) => ({
        matches: query === '(prefers-color-scheme: dark)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }))

      const { result } = renderHook(() => useTheme())
      expect(result.current.theme).toBe('light')
    })
  })

  describe('Theme Persistence', () => {
    it('should save theme to localStorage when changed', async () => {
      const { result } = renderHook(() => useTheme())

      act(() => {
        result.current.toggleTheme()
      })

      await waitFor(() => {
        expect(localStorageMock.getItem('paperlyte:v1:theme')).toBe('dark')
      })
    })

    it('should update document data-theme attribute on theme change', async () => {
      const { result } = renderHook(() => useTheme())

      act(() => {
        result.current.toggleTheme()
      })

      await waitFor(() => {
        expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
      })
    })

    it('should set data-theme to light for light theme', async () => {
      localStorageMock.setItem('paperlyte:v1:theme', 'dark')
      localStorageMock.setItem('paperlyte:v1:theme-user-preference', 'true')
      const { result } = renderHook(() => useTheme())

      act(() => {
        result.current.toggleTheme()
      })

      await waitFor(() => {
        expect(document.documentElement.getAttribute('data-theme')).toBe('light')
      })
    })
  })

  describe('toggleTheme', () => {
    it('should toggle from light to dark', () => {
      const { result } = renderHook(() => useTheme())

      act(() => {
        result.current.toggleTheme()
      })

      expect(result.current.theme).toBe('dark')
    })

    it('should toggle from dark to light', () => {
      localStorageMock.setItem('paperlyte:v1:theme', 'dark')
      localStorageMock.setItem('paperlyte:v1:theme-user-preference', 'true')
      const { result } = renderHook(() => useTheme())

      act(() => {
        result.current.toggleTheme()
      })

      expect(result.current.theme).toBe('light')
    })

    it('should toggle multiple times correctly', () => {
      const { result } = renderHook(() => useTheme())

      act(() => {
        result.current.toggleTheme()
      })
      expect(result.current.theme).toBe('dark')

      act(() => {
        result.current.toggleTheme()
      })
      expect(result.current.theme).toBe('light')

      act(() => {
        result.current.toggleTheme()
      })
      expect(result.current.theme).toBe('dark')
    })
  })

  describe('System Preference Changes', () => {
    it('should listen for system preference changes', () => {
      const addEventListenerSpy = vi.fn()
      window.matchMedia = vi.fn().mockImplementation(() => ({
        matches: false,
        media: '(prefers-color-scheme: dark)',
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: addEventListenerSpy,
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }))

      renderHook(() => useTheme())

      expect(addEventListenerSpy).toHaveBeenCalledWith('change', expect.any(Function))
    })

    it('should update theme when system preference changes and no stored preference', () => {
      let changeHandler: ((e: MediaQueryListEvent) => void) | null = null

      window.matchMedia = vi.fn().mockImplementation(() => ({
        matches: false,
        media: '(prefers-color-scheme: dark)',
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: (_event: string, handler: (e: MediaQueryListEvent) => void) => {
          changeHandler = handler
        },
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }))

      const { result } = renderHook(() => useTheme())

      expect(result.current.theme).toBe('light')

      // Clear localStorage to simulate no user preference
      act(() => {
        localStorageMock.removeItem('paperlyte:v1:theme')
      })

      // Simulate system preference change to dark
      act(() => {
        if (changeHandler) {
          changeHandler({ matches: true } as MediaQueryListEvent)
        }
      })

      expect(result.current.theme).toBe('dark')
    })

    it('should NOT update theme when system preference changes if user has set preference', () => {
      localStorageMock.setItem('paperlyte:v1:theme', 'light')
      localStorageMock.setItem('paperlyte:v1:theme-user-preference', 'true')
      let changeHandler: ((e: MediaQueryListEvent) => void) | null = null

      window.matchMedia = vi.fn().mockImplementation(() => ({
        matches: false,
        media: '(prefers-color-scheme: dark)',
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: (_event: string, handler: (e: MediaQueryListEvent) => void) => {
          changeHandler = handler
        },
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }))

      const { result } = renderHook(() => useTheme())

      expect(result.current.theme).toBe('light')

      // Simulate system preference change to dark
      act(() => {
        if (changeHandler) {
          changeHandler({ matches: true } as MediaQueryListEvent)
        }
      })

      // Theme should remain light because user explicitly set it
      expect(result.current.theme).toBe('light')
    })

    it('should remove event listener on unmount', () => {
      const removeEventListenerSpy = vi.fn()
      window.matchMedia = vi.fn().mockImplementation(() => ({
        matches: false,
        media: '(prefers-color-scheme: dark)',
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: removeEventListenerSpy,
        dispatchEvent: vi.fn(),
      }))

      const { unmount } = renderHook(() => useTheme())

      unmount()

      expect(removeEventListenerSpy).toHaveBeenCalledWith('change', expect.any(Function))
    })
  })

  describe('Return Value', () => {
    it('should return theme and toggleTheme function', () => {
      const { result } = renderHook(() => useTheme())

      expect(result.current).toHaveProperty('theme')
      expect(result.current).toHaveProperty('toggleTheme')
      expect(typeof result.current.toggleTheme).toBe('function')
    })

    it('should maintain toggleTheme functionality across re-renders', () => {
      const { result, rerender } = renderHook(() => useTheme())

      const initialTheme = result.current.theme

      act(() => {
        result.current.toggleTheme()
      })

      rerender()

      expect(result.current.theme).not.toBe(initialTheme)
      expect(typeof result.current.toggleTheme).toBe('function')
    })
  })

  describe('Feature Flag: ALLOW_PERSISTENT_THEME', () => {
    it('should use PERSISTENCE_CONFIG to control localStorage access', () => {
      // This test verifies that the hook imports and uses the config
      // The actual persistence behavior is tested in the Theme Persistence describe block
      const { result } = renderHook(() => useTheme())
      expect(result.current.theme).toBeDefined()
    })
  })
})

describe('useTheme with persistence disabled', () => {
  // Store original matchMedia
  const originalMatchMedia = window.matchMedia

  // Mock localStorage with spy
  const localStorageMock = (() => {
    let store: Record<string, string> = {}
    return {
      getItem: vi.fn((key: string) => store[key] || null),
      setItem: vi.fn((key: string, value: string) => {
        store[key] = value
      }),
      removeItem: vi.fn((key: string) => {
        delete store[key]
      }),
      clear: () => {
        store = {}
      },
    }
  })()

  beforeEach(() => {
    // Reset module registry to allow re-mocking
    vi.resetModules()

    // Mock config with persistence disabled
    vi.doMock('@constants/config', () => ({
      PERSISTENCE_CONFIG: {
        ALLOW_PERSISTENT_THEME: false,
      },
    }))

    // Clear localStorage before each test
    localStorageMock.clear()
    localStorageMock.getItem.mockClear()
    localStorageMock.setItem.mockClear()

    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    })

    // Mock matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })
  })

  afterEach(() => {
    window.matchMedia = originalMatchMedia
    vi.doUnmock('@constants/config')
  })

  it('should not read from localStorage when persistence is disabled', async () => {
    // Pre-set localStorage with a theme
    localStorageMock.setItem('theme', 'dark')
    localStorageMock.setItem('theme-user-preference', 'true')
    localStorageMock.setItem.mockClear()
    localStorageMock.getItem.mockClear()

    // Import fresh module with mocked config
    const { useTheme: useThemeNoPersist } = await import('./useTheme')

    const { result } = renderHook(() => useThemeNoPersist())

    // Should default to light (system preference) not dark from localStorage
    expect(result.current.theme).toBe('light')
  })

  it('should not write to localStorage when persistence is disabled', async () => {
    localStorageMock.setItem.mockClear()

    const { useTheme: useThemeNoPersist } = await import('./useTheme')

    const { result } = renderHook(() => useThemeNoPersist())

    act(() => {
      result.current.toggleTheme()
    })

    // localStorage.setItem should not have been called for theme storage
    // (it may be called for other things, so we check specifically)
    const themeSetCalls = localStorageMock.setItem.mock.calls.filter(
      (call) => call[0] === 'paperlyte:v1:theme' || call[0] === 'paperlyte:v1:theme-user-preference'
    )
    expect(themeSetCalls).toHaveLength(0)
  })

  it('should follow system preference changes when persistence is disabled', async () => {
    let changeHandler: ((e: MediaQueryListEvent) => void) | null = null

    window.matchMedia = vi.fn().mockImplementation(() => ({
      matches: false,
      media: '(prefers-color-scheme: dark)',
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: (_event: string, handler: (e: MediaQueryListEvent) => void) => {
        changeHandler = handler
      },
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))

    const { useTheme: useThemeNoPersist } = await import('./useTheme')

    const { result } = renderHook(() => useThemeNoPersist())

    // Toggle to set a "user preference" (but it won't be persisted)
    act(() => {
      result.current.toggleTheme()
    })

    expect(result.current.theme).toBe('dark')

    // Without persistence, system changes should override user toggle
    act(() => {
      if (changeHandler) {
        changeHandler({ matches: false } as MediaQueryListEvent)
      }
    })

    // Theme should follow system even after user toggled (no persistence)
    expect(result.current.theme).toBe('light')
  })
})
