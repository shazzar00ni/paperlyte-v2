import { renderHook, act, waitFor } from '@testing-library/react'
import { useTheme } from './useTheme'

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

  describe('Initialization', () => {
    it('should initialize with light theme by default', () => {
      const { result } = renderHook(() => useTheme())
      expect(result.current.theme).toBe('light')
    })

    it('should load theme from localStorage if present', () => {
      localStorageMock.setItem('theme', 'dark')
      localStorageMock.setItem('theme-user-preference', 'true')
      const { result } = renderHook(() => useTheme())
      expect(result.current.theme).toBe('dark')
    })

    it('should ignore invalid theme values from localStorage', () => {
      localStorageMock.setItem('theme', 'invalid')
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
      localStorageMock.setItem('theme', 'light')
      localStorageMock.setItem('theme-user-preference', 'true')
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
        expect(localStorageMock.getItem('theme')).toBe('dark')
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
      localStorageMock.setItem('theme', 'dark')
      localStorageMock.setItem('theme-user-preference', 'true')
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
      localStorageMock.setItem('theme', 'dark')
      localStorageMock.setItem('theme-user-preference', 'true')
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
        localStorageMock.removeItem('theme')
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
      localStorageMock.setItem('theme', 'light')
      localStorageMock.setItem('theme-user-preference', 'true')
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
})
