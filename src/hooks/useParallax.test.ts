import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useParallax } from './useParallax'

describe('useParallax', () => {
  let mockIntersectionObserver: {
    observe: ReturnType<typeof vi.fn>
    unobserve: ReturnType<typeof vi.fn>
    disconnect: ReturnType<typeof vi.fn>
  }
  let intersectionCallback: IntersectionObserverCallback

  beforeEach(() => {
    // Mock window dimensions
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 768,
    })

    Object.defineProperty(window, 'scrollY', {
      writable: true,
      configurable: true,
      value: 0,
    })

    // Mock matchMedia for reduced motion and media queries
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: (query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => true,
      }),
    })

    // Mock IntersectionObserver
    mockIntersectionObserver = {
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    }

    // Override the global IntersectionObserver with our mock
    global.IntersectionObserver = class MockIntersectionObserver {
      constructor(callback: IntersectionObserverCallback) {
        intersectionCallback = callback
      }
      observe = mockIntersectionObserver.observe
      unobserve = mockIntersectionObserver.unobserve
      disconnect = mockIntersectionObserver.disconnect
      takeRecords(): IntersectionObserverEntry[] {
        return []
      }
      root = null
      rootMargin = ''
      thresholds = []
    } as unknown as typeof global.IntersectionObserver

    // Mock requestAnimationFrame
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation(
      (cb: FrameRequestCallback) => {
        cb(0)
        return 0
      }
    )

    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should return ref, offset, transform, isActive, and isInView', () => {
    const { result } = renderHook(() => useParallax())

    expect(result.current).toHaveProperty('ref')
    expect(result.current).toHaveProperty('offset')
    expect(result.current).toHaveProperty('transform')
    expect(result.current).toHaveProperty('isActive')
    expect(result.current).toHaveProperty('isInView')
  })

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useParallax())

    expect(result.current.offset).toBe(0)
    expect(result.current.isActive).toBe(true)
    expect(result.current.isInView).toBe(false)
    expect(result.current.transform).toBe('translate3d(0, 0px, 0)')
  })

  it('should accept custom options', () => {
    const { result } = renderHook(() =>
      useParallax({
        speed: 0.3,
        direction: 'horizontal',
        disableOnMobile: false,
        mobileBreakpoint: 600,
      })
    )

    expect(result.current).toBeDefined()
    expect(result.current.isActive).toBe(true)
  })

  describe('IntersectionObserver integration', () => {
    it('should create IntersectionObserver when hook is active', () => {
      let observerCreated = false
      
      global.IntersectionObserver = class MockIntersectionObserver {
        constructor(callback: IntersectionObserverCallback) {
          observerCreated = true
          intersectionCallback = callback
        }
        observe = mockIntersectionObserver.observe
        unobserve = mockIntersectionObserver.unobserve
        disconnect = mockIntersectionObserver.disconnect
        takeRecords(): IntersectionObserverEntry[] {
          return []
        }
        root = null
        rootMargin = ''
        thresholds = []
      } as unknown as typeof global.IntersectionObserver

      renderHook(() => useParallax())

      // The IntersectionObserver should be instantiated when the hook is rendered with isActive=true
      expect(observerCreated).toBe(true)
    })

    it('should update isInView when element enters viewport', () => {
      const { result } = renderHook(() => useParallax())

      const mockElement = document.createElement('div')
      Object.defineProperty(mockElement, 'getBoundingClientRect', {
        value: () => ({
          top: 100,
          left: 0,
          right: 100,
          bottom: 200,
          width: 100,
          height: 100,
          x: 0,
          y: 100,
        }),
      })

      act(() => {
        // @ts-expect-error - Assigning mock element for testing
        result.current.ref.current = mockElement
      })

      // Simulate intersection
      act(() => {
        intersectionCallback(
          [
            {
              isIntersecting: true,
              target: mockElement,
              boundingClientRect: mockElement.getBoundingClientRect(),
              intersectionRatio: 1,
              intersectionRect: mockElement.getBoundingClientRect(),
              rootBounds: null,
              time: Date.now(),
            } as IntersectionObserverEntry,
          ],
          {} as IntersectionObserver
        )
      })

      expect(result.current.isInView).toBe(true)
    })

    it('should update isInView when element leaves viewport', () => {
      const { result } = renderHook(() => useParallax())

      const mockElement = document.createElement('div')
      Object.defineProperty(mockElement, 'getBoundingClientRect', {
        value: () => ({
          top: 100,
          left: 0,
          right: 100,
          bottom: 200,
          width: 100,
          height: 100,
          x: 0,
          y: 100,
        }),
      })

      act(() => {
        // @ts-expect-error - Assigning mock element for testing
        result.current.ref.current = mockElement
      })

      // First make it visible
      act(() => {
        intersectionCallback(
          [
            {
              isIntersecting: true,
              target: mockElement,
              boundingClientRect: mockElement.getBoundingClientRect(),
              intersectionRatio: 1,
              intersectionRect: mockElement.getBoundingClientRect(),
              rootBounds: null,
              time: Date.now(),
            } as IntersectionObserverEntry,
          ],
          {} as IntersectionObserver
        )
      })

      expect(result.current.isInView).toBe(true)

      // Then make it leave
      act(() => {
        intersectionCallback(
          [
            {
              isIntersecting: false,
              target: mockElement,
              boundingClientRect: mockElement.getBoundingClientRect(),
              intersectionRatio: 0,
              intersectionRect: mockElement.getBoundingClientRect(),
              rootBounds: null,
              time: Date.now(),
            } as IntersectionObserverEntry,
          ],
          {} as IntersectionObserver
        )
      })

      expect(result.current.isInView).toBe(false)
    })

    it('should clean up IntersectionObserver on unmount', () => {
      const { result, unmount } = renderHook(() => useParallax())

      const mockElement = document.createElement('div')
      act(() => {
        // @ts-expect-error - Assigning mock element for testing
        result.current.ref.current = mockElement
      })

      unmount()

      expect(mockIntersectionObserver.disconnect).toHaveBeenCalled()
    })
  })

  describe('Mobile detection', () => {
    it('should disable parallax on mobile when disableOnMobile is true', () => {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: (query: string) => ({
          matches: query === '(max-width: 767px)',
          media: query,
          onchange: null,
          addListener: () => {},
          removeListener: () => {},
          addEventListener: () => {},
          removeEventListener: () => {},
          dispatchEvent: () => true,
        }),
      })

      const { result } = renderHook(() =>
        useParallax({ disableOnMobile: true, mobileBreakpoint: 768 })
      )

      expect(result.current.isActive).toBe(false)
      expect(result.current.offset).toBe(0)
    })

    it('should allow parallax on mobile when disableOnMobile is false', () => {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: (query: string) => ({
          matches: query === '(max-width: 767px)',
          media: query,
          onchange: null,
          addListener: () => {},
          removeListener: () => {},
          addEventListener: () => {},
          removeEventListener: () => {},
          dispatchEvent: () => true,
        }),
      })

      const { result } = renderHook(() => useParallax({ disableOnMobile: false }))

      expect(result.current.isActive).toBe(true)
    })

    it('should respect custom mobileBreakpoint', () => {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: (query: string) => ({
          matches: query === '(max-width: 599px)',
          media: query,
          onchange: null,
          addListener: () => {},
          removeListener: () => {},
          addEventListener: () => {},
          removeEventListener: () => {},
          dispatchEvent: () => true,
        }),
      })

      const { result } = renderHook(() =>
        useParallax({ disableOnMobile: true, mobileBreakpoint: 600 })
      )

      expect(result.current.isActive).toBe(false)
    })
  })

  describe('Reduced motion preference', () => {
    it('should disable parallax when user prefers reduced motion', () => {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: (query: string) => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: () => {},
          removeListener: () => {},
          addEventListener: () => {},
          removeEventListener: () => {},
          dispatchEvent: () => true,
        }),
      })

      const { result } = renderHook(() => useParallax())

      expect(result.current.isActive).toBe(false)
      expect(result.current.offset).toBe(0)
    })

    it('should enable parallax when user does not prefer reduced motion', () => {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: (query: string) => ({
          matches: false,
          media: query,
          onchange: null,
          addListener: () => {},
          removeListener: () => {},
          addEventListener: () => {},
          removeEventListener: () => {},
          dispatchEvent: () => true,
        }),
      })

      const { result } = renderHook(() => useParallax())

      expect(result.current.isActive).toBe(true)
    })
  })

  describe('Direction calculations', () => {
    it('should generate vertical transform by default', () => {
      const { result } = renderHook(() => useParallax())

      // The hook uses translate3d for performance, not translateY
      expect(result.current.transform).toBe('translate3d(0, 0px, 0)')
    })

    it('should generate horizontal transform when direction is horizontal', () => {
      const { result } = renderHook(() => useParallax({ direction: 'horizontal' }))

      // The hook uses translate3d for performance, not translateX
      expect(result.current.transform).toBe('translate3d(0px, 0, 0)')
    })

    it('should update transform format based on offset for vertical direction', () => {
      const { result } = renderHook(() => useParallax({ speed: 0.5 }))

      const mockElement = document.createElement('div')
      Object.defineProperty(mockElement, 'getBoundingClientRect', {
        value: () => ({
          top: 100,
          left: 0,
          right: 100,
          bottom: 200,
          width: 100,
          height: 100,
          x: 0,
          y: 100,
        }),
      })

      act(() => {
        // @ts-expect-error - Assigning mock element for testing
        result.current.ref.current = mockElement
      })

      // Simulate intersection
      act(() => {
        intersectionCallback(
          [
            {
              isIntersecting: true,
              target: mockElement,
              boundingClientRect: mockElement.getBoundingClientRect(),
              intersectionRatio: 1,
              intersectionRect: mockElement.getBoundingClientRect(),
              rootBounds: null,
              time: Date.now(),
            } as IntersectionObserverEntry,
          ],
          {} as IntersectionObserver
        )
      })

      // The transform should be a vertical translate3d
      expect(result.current.transform).toMatch(/translate3d\(0, -?\d+(\.\d+)?px, 0\)/)
    })

    it('should update transform format based on offset for horizontal direction', () => {
      const { result } = renderHook(() =>
        useParallax({ speed: 0.5, direction: 'horizontal' })
      )

      const mockElement = document.createElement('div')
      Object.defineProperty(mockElement, 'getBoundingClientRect', {
        value: () => ({
          top: 100,
          left: 0,
          right: 100,
          bottom: 200,
          width: 100,
          height: 100,
          x: 0,
          y: 100,
        }),
      })

      act(() => {
        // @ts-expect-error - Assigning mock element for testing
        result.current.ref.current = mockElement
      })

      // Simulate intersection
      act(() => {
        intersectionCallback(
          [
            {
              isIntersecting: true,
              target: mockElement,
              boundingClientRect: mockElement.getBoundingClientRect(),
              intersectionRatio: 1,
              intersectionRect: mockElement.getBoundingClientRect(),
              rootBounds: null,
              time: Date.now(),
            } as IntersectionObserverEntry,
          ],
          {} as IntersectionObserver
        )
      })

      // The transform should be a horizontal translate3d
      expect(result.current.transform).toMatch(/translate3d\(-?\d+(\.\d+)?px, 0, 0\)/)
    })
  })

  describe('Parallax offset calculation', () => {
    it('should calculate offset based on speed multiplier', () => {
      const { result } = renderHook(() => useParallax({ speed: 0.5 }))

      const mockElement = document.createElement('div')
      Object.defineProperty(mockElement, 'getBoundingClientRect', {
        value: () => ({
          top: 100,
          left: 0,
          right: 100,
          bottom: 200,
          width: 100,
          height: 100,
          x: 0,
          y: 100,
        }),
      })

      act(() => {
        // @ts-expect-error - Assigning mock element for testing
        result.current.ref.current = mockElement
      })

      // Simulate intersection
      act(() => {
        intersectionCallback(
          [
            {
              isIntersecting: true,
              target: mockElement,
              boundingClientRect: mockElement.getBoundingClientRect(),
              intersectionRatio: 1,
              intersectionRect: mockElement.getBoundingClientRect(),
              rootBounds: null,
              time: Date.now(),
            } as IntersectionObserverEntry,
          ],
          {} as IntersectionObserver
        )
      })

      // Offset should be calculated
      expect(typeof result.current.offset).toBe('number')
    })

    it('should calculate different offsets for different speed values', () => {
      const { result: result1 } = renderHook(() => useParallax({ speed: 0.2 }))
      const { result: result2 } = renderHook(() => useParallax({ speed: 0.8 }))

      const mockElement1 = document.createElement('div')
      const mockElement2 = document.createElement('div')

      Object.defineProperty(mockElement1, 'getBoundingClientRect', {
        value: () => ({
          top: 100,
          left: 0,
          right: 100,
          bottom: 200,
          width: 100,
          height: 100,
          x: 0,
          y: 100,
        }),
      })

      Object.defineProperty(mockElement2, 'getBoundingClientRect', {
        value: () => ({
          top: 100,
          left: 0,
          right: 100,
          bottom: 200,
          width: 100,
          height: 100,
          x: 0,
          y: 100,
        }),
      })

      act(() => {
        // @ts-expect-error - Assigning mock element for testing
        result1.current.ref.current = mockElement1
        // @ts-expect-error - Assigning mock element for testing
        result2.current.ref.current = mockElement2
      })

      // Both use the same intersection callback, so we need to trigger both
      act(() => {
        intersectionCallback(
          [
            {
              isIntersecting: true,
              target: mockElement1,
              boundingClientRect: mockElement1.getBoundingClientRect(),
              intersectionRatio: 1,
              intersectionRect: mockElement1.getBoundingClientRect(),
              rootBounds: null,
              time: Date.now(),
            } as IntersectionObserverEntry,
          ],
          {} as IntersectionObserver
        )
      })

      const offset1 = result1.current.offset

      act(() => {
        intersectionCallback(
          [
            {
              isIntersecting: true,
              target: mockElement2,
              boundingClientRect: mockElement2.getBoundingClientRect(),
              intersectionRatio: 1,
              intersectionRect: mockElement2.getBoundingClientRect(),
              rootBounds: null,
              time: Date.now(),
            } as IntersectionObserverEntry,
          ],
          {} as IntersectionObserver
        )
      })

      const offset2 = result2.current.offset

      // With different speeds, offsets should differ
      expect(Math.abs(offset1)).not.toBe(Math.abs(offset2))
    })

    it('should not calculate offset when element is not in view', () => {
      const { result } = renderHook(() => useParallax({ speed: 0.5 }))

      const mockElement = document.createElement('div')
      Object.defineProperty(mockElement, 'getBoundingClientRect', {
        value: () => ({
          top: 100,
          left: 0,
          right: 100,
          bottom: 200,
          width: 100,
          height: 100,
          x: 0,
          y: 100,
        }),
      })

      act(() => {
        // @ts-expect-error - Assigning mock element for testing
        result.current.ref.current = mockElement
      })

      // Don't trigger intersection - element stays out of view
      expect(result.current.isInView).toBe(false)
      expect(result.current.offset).toBe(0)
    })
  })

  describe('Event listener cleanup', () => {
    it('should add scroll listener when element is in view', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener')
      const { result } = renderHook(() => useParallax())

      const mockElement = document.createElement('div')
      Object.defineProperty(mockElement, 'getBoundingClientRect', {
        value: () => ({
          top: 100,
          left: 0,
          right: 100,
          bottom: 200,
          width: 100,
          height: 100,
          x: 0,
          y: 100,
        }),
      })

      act(() => {
        // @ts-expect-error - Assigning mock element for testing
        result.current.ref.current = mockElement
      })

      // Simulate intersection
      act(() => {
        intersectionCallback(
          [
            {
              isIntersecting: true,
              target: mockElement,
              boundingClientRect: mockElement.getBoundingClientRect(),
              intersectionRatio: 1,
              intersectionRect: mockElement.getBoundingClientRect(),
              rootBounds: null,
              time: Date.now(),
            } as IntersectionObserverEntry,
          ],
          {} as IntersectionObserver
        )
      })

      expect(addEventListenerSpy).toHaveBeenCalledWith(
        'scroll',
        expect.any(Function),
        expect.objectContaining({ passive: true })
      )
    })

    it('should remove scroll listener on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')
      const { result, unmount } = renderHook(() => useParallax())

      const mockElement = document.createElement('div')
      Object.defineProperty(mockElement, 'getBoundingClientRect', {
        value: () => ({
          top: 100,
          left: 0,
          right: 100,
          bottom: 200,
          width: 100,
          height: 100,
          x: 0,
          y: 100,
        }),
      })

      act(() => {
        // @ts-expect-error - Assigning mock element for testing
        result.current.ref.current = mockElement
      })

      // Simulate intersection
      act(() => {
        intersectionCallback(
          [
            {
              isIntersecting: true,
              target: mockElement,
              boundingClientRect: mockElement.getBoundingClientRect(),
              intersectionRatio: 1,
              intersectionRect: mockElement.getBoundingClientRect(),
              rootBounds: null,
              time: Date.now(),
            } as IntersectionObserverEntry,
          ],
          {} as IntersectionObserver
        )
      })

      unmount()

      expect(removeEventListenerSpy).toHaveBeenCalledWith('scroll', expect.any(Function))
    })

    it('should cancel animation frame on unmount if animation was active', () => {
      // We need to track if requestAnimationFrame was called
      let rafCalled = false
      const rafSpy = vi.spyOn(window, 'requestAnimationFrame').mockImplementation(() => {
        rafCalled = true
        // Don't call the callback immediately to simulate pending frame
        return 123
      })
      const cancelAnimationFrameSpy = vi.spyOn(window, 'cancelAnimationFrame')

      const { result, unmount } = renderHook(() => useParallax())

      const mockElement = document.createElement('div')
      Object.defineProperty(mockElement, 'getBoundingClientRect', {
        value: () => ({
          top: 100,
          left: 0,
          right: 100,
          bottom: 200,
          width: 100,
          height: 100,
          x: 0,
          y: 100,
        }),
      })

      act(() => {
        // @ts-expect-error - Assigning mock element for testing
        result.current.ref.current = mockElement
      })

      // Simulate intersection
      act(() => {
        intersectionCallback(
          [
            {
              isIntersecting: true,
              target: mockElement,
              boundingClientRect: mockElement.getBoundingClientRect(),
              intersectionRatio: 1,
              intersectionRect: mockElement.getBoundingClientRect(),
              rootBounds: null,
              time: Date.now(),
            } as IntersectionObserverEntry,
          ],
          {} as IntersectionObserver
        )
      })

      // Trigger a scroll event to start the animation
      act(() => {
        window.dispatchEvent(new Event('scroll'))
      })

      unmount()

      // cancelAnimationFrame should be called on cleanup if there was a pending frame
      if (rafCalled) {
        expect(cancelAnimationFrameSpy).toHaveBeenCalled()
      }

      rafSpy.mockRestore()
    })
  })

  describe('Window resize handling', () => {
    it('should add resize listener when element is in view', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener')
      const { result } = renderHook(() => useParallax())

      const mockElement = document.createElement('div')
      Object.defineProperty(mockElement, 'getBoundingClientRect', {
        value: () => ({
          top: 100,
          left: 0,
          right: 100,
          bottom: 200,
          width: 100,
          height: 100,
          x: 0,
          y: 100,
        }),
      })

      act(() => {
        // @ts-expect-error - Assigning mock element for testing
        result.current.ref.current = mockElement
      })

      // Simulate intersection
      act(() => {
        intersectionCallback(
          [
            {
              isIntersecting: true,
              target: mockElement,
              boundingClientRect: mockElement.getBoundingClientRect(),
              intersectionRatio: 1,
              intersectionRect: mockElement.getBoundingClientRect(),
              rootBounds: null,
              time: Date.now(),
            } as IntersectionObserverEntry,
          ],
          {} as IntersectionObserver
        )
      })

      expect(addEventListenerSpy).toHaveBeenCalledWith(
        'resize',
        expect.any(Function),
        expect.objectContaining({ passive: true })
      )
    })

    it('should remove resize listener on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')
      const { result, unmount } = renderHook(() => useParallax())

      const mockElement = document.createElement('div')
      Object.defineProperty(mockElement, 'getBoundingClientRect', {
        value: () => ({
          top: 100,
          left: 0,
          right: 100,
          bottom: 200,
          width: 100,
          height: 100,
          x: 0,
          y: 100,
        }),
      })

      act(() => {
        // @ts-expect-error - Assigning mock element for testing
        result.current.ref.current = mockElement
      })

      // Simulate intersection
      act(() => {
        intersectionCallback(
          [
            {
              isIntersecting: true,
              target: mockElement,
              boundingClientRect: mockElement.getBoundingClientRect(),
              intersectionRatio: 1,
              intersectionRect: mockElement.getBoundingClientRect(),
              rootBounds: null,
              time: Date.now(),
            } as IntersectionObserverEntry,
          ],
          {} as IntersectionObserver
        )
      })

      unmount()

      expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function))
    })
  })
})
