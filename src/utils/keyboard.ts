import type { KeyboardEvent as ReactKeyboardEvent } from 'react'

/**
 * Keyboard navigation utilities for accessibility support
 * Provides helper functions for detecting key presses and managing focus
 */

/**
 * Check if the pressed key is Enter or Space (standard activation keys)
 */
export function isActivationKey(event: KeyboardEvent | ReactKeyboardEvent): boolean {
  return event.key === 'Enter' || event.key === ' ' || event.key === 'Spacebar'
}

/**
 * Check if the pressed key is Escape
 */
export function isEscapeKey(event: KeyboardEvent | ReactKeyboardEvent): boolean {
  return event.key === 'Escape' || event.key === 'Esc'
}

/**
 * Check if the pressed key is an arrow key
 */
export function isArrowKey(event: KeyboardEvent | ReactKeyboardEvent): boolean {
  return ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)
}

/**
 * Check if the pressed key is the Home key
 */
export function isHomeKey(event: KeyboardEvent | ReactKeyboardEvent): boolean {
  return event.key === 'Home'
}

/**
 * Check if the pressed key is the End key
 */
export function isEndKey(event: KeyboardEvent | ReactKeyboardEvent): boolean {
  return event.key === 'End'
}

/**
 * Get arrow key direction
 * @returns The direction ('up', 'down', 'left', 'right') or null if not an arrow key
 */
export function getArrowDirection(
  event: KeyboardEvent | ReactKeyboardEvent
): 'up' | 'down' | 'left' | 'right' | null {
  switch (event.key) {
    case 'ArrowUp':
      return 'up'
    case 'ArrowDown':
      return 'down'
    case 'ArrowLeft':
      return 'left'
    case 'ArrowRight':
      return 'right'
    default:
      return null
  }
}

/**
 * Standard selector for all focusable elements
 */
export const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]), [contenteditable]:not([contenteditable="false"]), audio[controls], video[controls], details > summary'

/**
 * Get all focusable elements within a container
 * Returns elements sorted by their document position
 */
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const elements = container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
  const elementsArray = Array.from(elements)

  // Sort by document position to ensure correct DOM order
  // This is necessary because some browser implementations (like jsdom) may return
  // elements in selector order rather than document order
  elementsArray.sort((a, b) => {
    const position = a.compareDocumentPosition(b)
    if (position & Node.DOCUMENT_POSITION_FOLLOWING) {
      return -1 // a comes before b
    } else if (position & Node.DOCUMENT_POSITION_PRECEDING) {
      return 1 // b comes before a
    }
    return 0
  })

  return elementsArray
}

/**
 * Get the first focusable element within a container
 */
export function getFirstFocusableElement(container: HTMLElement): HTMLElement | null {
  const elements = getFocusableElements(container)
  return elements[0] || null
}

/**
 * Get the last focusable element within a container
 */
export function getLastFocusableElement(container: HTMLElement): HTMLElement | null {
  const elements = getFocusableElements(container)
  return elements[elements.length - 1] || null
}

/**
 * Focus the first focusable element within a container
 * @returns true if an element was focused, false otherwise
 */
export function focusFirstElement(container: HTMLElement): boolean {
  const firstElement = getFirstFocusableElement(container)
  if (firstElement) {
    firstElement.focus()
    return true
  }
  return false
}

/**
 * Focus the last focusable element within a container
 * @returns true if an element was focused, false otherwise
 */
export function focusLastElement(container: HTMLElement): boolean {
  const lastElement = getLastFocusableElement(container)
  if (lastElement) {
    lastElement.focus()
    return true
  }
  return false
}

/**
 * Create a focus trap for a modal or menu
 * Prevents focus from leaving the container when tabbing
 * @param container - The container element to trap focus within
 * @returns Cleanup function to remove the focus trap
 */
export function createFocusTrap(container: HTMLElement): () => void {
  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key !== 'Tab') return

    const focusableElements = getFocusableElements(container)
    if (focusableElements.length === 0) return

    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    if (event.shiftKey) {
      // Shift + Tab: going backwards
      if (document.activeElement === firstElement) {
        event.preventDefault()
        lastElement.focus()
      }
    } else {
      // Tab: going forwards
      if (document.activeElement === lastElement) {
        event.preventDefault()
        firstElement.focus()
      }
    }
  }

  container.addEventListener('keydown', handleKeyDown)

  // Return cleanup function
  return () => {
    container.removeEventListener('keydown', handleKeyDown)
  }
}

/**
 * Navigate through a list of elements using arrow keys
 * Handles both horizontal (left/right) and vertical (up/down) navigation
 * @param event - The keyboard event
 * @param elements - Array of focusable elements
 * @param currentIndex - Current focused element index
 * @param orientation - Navigation orientation ('horizontal' or 'vertical')
 * @returns New index to focus, or null if no change
 */
export function handleArrowNavigation(
  event: KeyboardEvent | ReactKeyboardEvent,
  elements: HTMLElement[],
  currentIndex: number,
  orientation: 'horizontal' | 'vertical' = 'horizontal'
): number | null {
  const direction = getArrowDirection(event)
  if (!direction) return null

  const isHorizontal = orientation === 'horizontal'
  const isVertical = orientation === 'vertical'

  // Normalize direction for RTL in horizontal navigation:
  // In RTL, ArrowRight should move to the previous element and ArrowLeft to the next.
  let effectiveDirection = direction
  if (isHorizontal) {
    let isRtl = false

    if (typeof document !== 'undefined') {
      // Prefer explicit dir attribute if present
      const docElement = document.documentElement
      const attrDir = (
        document.dir ||
        (docElement && docElement.getAttribute('dir')) ||
        ''
      ).toLowerCase()

      if (attrDir) {
        isRtl = attrDir === 'rtl'
      } else if (typeof window !== 'undefined' && docElement && window.getComputedStyle) {
        const computedDirection = window.getComputedStyle(docElement).direction
        isRtl = computedDirection === 'rtl'
      }
    }

    if (isRtl) {
      if (direction === 'left') {
        effectiveDirection = 'right'
      } else if (direction === 'right') {
        effectiveDirection = 'left'
      }
    }
  }

  let newIndex: number | null = null

  if (
    (isHorizontal && effectiveDirection === 'left') ||
    (isVertical && effectiveDirection === 'up')
  ) {
    // Move to previous element
    newIndex = currentIndex > 0 ? currentIndex - 1 : elements.length - 1
  } else if (
    (isHorizontal && effectiveDirection === 'right') ||
    (isVertical && effectiveDirection === 'down')
  ) {
    // Move to next element
    newIndex = currentIndex < elements.length - 1 ? currentIndex + 1 : 0
  }

  return newIndex
}

/**
 * Find the index of the currently focused element in an array
 * @param elements - Array of elements to search
 * @returns Index of focused element, or -1 if not found
 */
export function findFocusedIndex(elements: HTMLElement[]): number {
  const activeElement = document.activeElement
  return elements.findIndex((el) => el === activeElement)
}

/**
 * Handle Home/End key navigation
 * @param event - The keyboard event
 * @param elements - Array of focusable elements
 * @returns Index to focus (0 for Home, last for End), or null if not Home/End
 */
export function handleHomeEndNavigation(
  event: KeyboardEvent | ReactKeyboardEvent,
  elements: HTMLElement[]
): number | null {
  if (isHomeKey(event)) {
    return 0
  } else if (isEndKey(event)) {
    return elements.length - 1
  }
  return null
}
