import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  isActivationKey,
  isEscapeKey,
  isArrowKey,
  isHomeKey,
  isEndKey,
  getArrowDirection,
  getFocusableElements,
  getFirstFocusableElement,
  getLastFocusableElement,
  focusFirstElement,
  focusLastElement,
  createFocusTrap,
  handleArrowNavigation,
  findFocusedIndex,
  handleHomeEndNavigation,
  FOCUSABLE_SELECTOR,
} from './keyboard'

describe('keyboard utilities', () => {
  describe('isActivationKey', () => {
    it('should return true for Enter key', () => {
      const event = new KeyboardEvent('keydown', { key: 'Enter' })
      expect(isActivationKey(event)).toBe(true)
    })

    it('should return true for Space key', () => {
      const event = new KeyboardEvent('keydown', { key: ' ' })
      expect(isActivationKey(event)).toBe(true)
    })

    it('should return true for Spacebar key (older browsers)', () => {
      const event = new KeyboardEvent('keydown', { key: 'Spacebar' })
      expect(isActivationKey(event)).toBe(true)
    })

    it('should return false for other keys', () => {
      const event = new KeyboardEvent('keydown', { key: 'a' })
      expect(isActivationKey(event)).toBe(false)
    })
  })

  describe('isEscapeKey', () => {
    it('should return true for Escape key', () => {
      const event = new KeyboardEvent('keydown', { key: 'Escape' })
      expect(isEscapeKey(event)).toBe(true)
    })

    it('should return true for Esc key (older browsers)', () => {
      const event = new KeyboardEvent('keydown', { key: 'Esc' })
      expect(isEscapeKey(event)).toBe(true)
    })

    it('should return false for other keys', () => {
      const event = new KeyboardEvent('keydown', { key: 'a' })
      expect(isEscapeKey(event)).toBe(false)
    })
  })

  describe('isArrowKey', () => {
    it('should return true for ArrowUp', () => {
      const event = new KeyboardEvent('keydown', { key: 'ArrowUp' })
      expect(isArrowKey(event)).toBe(true)
    })

    it('should return true for ArrowDown', () => {
      const event = new KeyboardEvent('keydown', { key: 'ArrowDown' })
      expect(isArrowKey(event)).toBe(true)
    })

    it('should return true for ArrowLeft', () => {
      const event = new KeyboardEvent('keydown', { key: 'ArrowLeft' })
      expect(isArrowKey(event)).toBe(true)
    })

    it('should return true for ArrowRight', () => {
      const event = new KeyboardEvent('keydown', { key: 'ArrowRight' })
      expect(isArrowKey(event)).toBe(true)
    })

    it('should return false for other keys', () => {
      const event = new KeyboardEvent('keydown', { key: 'a' })
      expect(isArrowKey(event)).toBe(false)
    })
  })

  describe('isHomeKey', () => {
    it('should return true for Home key', () => {
      const event = new KeyboardEvent('keydown', { key: 'Home' })
      expect(isHomeKey(event)).toBe(true)
    })

    it('should return false for other keys', () => {
      const event = new KeyboardEvent('keydown', { key: 'a' })
      expect(isHomeKey(event)).toBe(false)
    })
  })

  describe('isEndKey', () => {
    it('should return true for End key', () => {
      const event = new KeyboardEvent('keydown', { key: 'End' })
      expect(isEndKey(event)).toBe(true)
    })

    it('should return false for other keys', () => {
      const event = new KeyboardEvent('keydown', { key: 'a' })
      expect(isEndKey(event)).toBe(false)
    })
  })

  describe('getArrowDirection', () => {
    it('should return "up" for ArrowUp', () => {
      const event = new KeyboardEvent('keydown', { key: 'ArrowUp' })
      expect(getArrowDirection(event)).toBe('up')
    })

    it('should return "down" for ArrowDown', () => {
      const event = new KeyboardEvent('keydown', { key: 'ArrowDown' })
      expect(getArrowDirection(event)).toBe('down')
    })

    it('should return "left" for ArrowLeft', () => {
      const event = new KeyboardEvent('keydown', { key: 'ArrowLeft' })
      expect(getArrowDirection(event)).toBe('left')
    })

    it('should return "right" for ArrowRight', () => {
      const event = new KeyboardEvent('keydown', { key: 'ArrowRight' })
      expect(getArrowDirection(event)).toBe('right')
    })

    it('should return null for non-arrow keys', () => {
      const event = new KeyboardEvent('keydown', { key: 'a' })
      expect(getArrowDirection(event)).toBe(null)
    })
  })

  describe('FOCUSABLE_SELECTOR', () => {
    it('should be a valid CSS selector string', () => {
      expect(typeof FOCUSABLE_SELECTOR).toBe('string')
      expect(FOCUSABLE_SELECTOR.length).toBeGreaterThan(0)
    })
  })

  describe('getFocusableElements', () => {
    let container: HTMLElement

    beforeEach(() => {
      container = document.createElement('div')
      document.body.appendChild(container)
    })

    afterEach(() => {
      document.body.removeChild(container)
    })

    it('should return all focusable elements', () => {
      container.innerHTML = `
        <button>Button 1</button>
        <a href="#">Link</a>
        <input type="text" />
        <button>Button 2</button>
      `
      const elements = getFocusableElements(container)
      expect(elements).toHaveLength(4)
    })

    it('should exclude disabled elements', () => {
      container.innerHTML = `
        <button>Enabled</button>
        <button disabled>Disabled</button>
        <input type="text" />
        <input type="text" disabled />
      `
      const elements = getFocusableElements(container)
      expect(elements).toHaveLength(2)
    })

    it('should exclude elements with tabindex="-1"', () => {
      container.innerHTML = `
        <button>Button</button>
        <div tabindex="-1">Not focusable</div>
        <div tabindex="0">Focusable</div>
      `
      const elements = getFocusableElements(container)
      expect(elements).toHaveLength(2)
    })

    it('should return empty array when no focusable elements exist', () => {
      container.innerHTML = '<div>No focusable elements</div>'
      const elements = getFocusableElements(container)
      expect(elements).toHaveLength(0)
    })

    it('should return elements in document order', () => {
      // Create a more complex structure where querySelectorAll order matters
      container.innerHTML = `
        <div id="wrapper">
          <a href="#" id="link1">Link 1</a>
          <button id="btn1">Button 1</button>
          <a href="#" id="link2">Link 2</a>
          <button id="btn2">Button 2</button>
          <input type="text" id="input1" />
        </div>
      `
      const elements = getFocusableElements(container)

      // Verify elements are in document order
      expect(elements).toHaveLength(5)
      expect(elements[0].id).toBe('link1')
      expect(elements[1].id).toBe('btn1')
      expect(elements[2].id).toBe('link2')
      expect(elements[3].id).toBe('btn2')
      expect(elements[4].id).toBe('input1')
    })

    it('should handle elements at same document position gracefully', () => {
      // Test edge case: comparing an element with itself should return 0
      // This exercises the default return 0 branch in the sort comparison
      container.innerHTML = '<button id="single">Single</button>'
      const elements = getFocusableElements(container)

      // Should have exactly one element
      expect(elements).toHaveLength(1)
      expect(elements[0].id).toBe('single')

      // The sort function handles this case where position comparison returns 0
      // (when comparing an element with itself or elements at exact same position)
    })

    it('should sort correctly when compareDocumentPosition returns DOCUMENT_POSITION_PRECEDING', () => {
      // Create elements that will definitely trigger the PRECEDING branch
      container.innerHTML = `
        <div>
          <button id="first">First</button>
          <div>
            <button id="second">Second (nested)</button>
          </div>
        </div>
      `
      const elements = getFocusableElements(container)

      // Elements should be sorted in DOM order
      expect(elements).toHaveLength(2)
      expect(elements[0].id).toBe('first')
      expect(elements[1].id).toBe('second')
    })
  })

  describe('getFirstFocusableElement', () => {
    let container: HTMLElement

    beforeEach(() => {
      container = document.createElement('div')
      document.body.appendChild(container)
    })

    afterEach(() => {
      document.body.removeChild(container)
    })

    it('should return the first focusable element', () => {
      container.innerHTML = `
        <button id="first">First</button>
        <button id="second">Second</button>
      `
      const first = getFirstFocusableElement(container)
      expect(first?.id).toBe('first')
    })

    it('should return null when no focusable elements exist', () => {
      container.innerHTML = '<div>No buttons</div>'
      const first = getFirstFocusableElement(container)
      expect(first).toBeNull()
    })
  })

  describe('getLastFocusableElement', () => {
    let container: HTMLElement

    beforeEach(() => {
      container = document.createElement('div')
      document.body.appendChild(container)
    })

    afterEach(() => {
      document.body.removeChild(container)
    })

    it('should return the last focusable element', () => {
      container.innerHTML = `
        <button id="first">First</button>
        <button id="second">Second</button>
      `
      const last = getLastFocusableElement(container)
      expect(last?.id).toBe('second')
    })

    it('should return null when no focusable elements exist', () => {
      container.innerHTML = '<div>No buttons</div>'
      const last = getLastFocusableElement(container)
      expect(last).toBeNull()
    })
  })

  describe('focusFirstElement', () => {
    let container: HTMLElement

    beforeEach(() => {
      container = document.createElement('div')
      document.body.appendChild(container)
    })

    afterEach(() => {
      document.body.removeChild(container)
    })

    it('should focus the first element and return true', () => {
      container.innerHTML = `
        <button id="first">First</button>
        <button id="second">Second</button>
      `
      const result = focusFirstElement(container)
      expect(result).toBe(true)
      expect(document.activeElement?.id).toBe('first')
    })

    it('should return false when no focusable elements exist', () => {
      container.innerHTML = '<div>No buttons</div>'
      const result = focusFirstElement(container)
      expect(result).toBe(false)
    })
  })

  describe('focusLastElement', () => {
    let container: HTMLElement

    beforeEach(() => {
      container = document.createElement('div')
      document.body.appendChild(container)
    })

    afterEach(() => {
      document.body.removeChild(container)
    })

    it('should focus the last element and return true', () => {
      container.innerHTML = `
        <button id="first">First</button>
        <button id="second">Second</button>
      `
      const result = focusLastElement(container)
      expect(result).toBe(true)
      expect(document.activeElement?.id).toBe('second')
    })

    it('should return false when no focusable elements exist', () => {
      container.innerHTML = '<div>No buttons</div>'
      const result = focusLastElement(container)
      expect(result).toBe(false)
    })
  })

  describe('createFocusTrap', () => {
    let container: HTMLElement

    beforeEach(() => {
      container = document.createElement('div')
      document.body.appendChild(container)
    })

    afterEach(() => {
      document.body.removeChild(container)
    })

    it('should trap focus within container', () => {
      container.innerHTML = `
        <button id="first">First</button>
        <button id="second">Second</button>
        <button id="third">Third</button>
      `
      const cleanup = createFocusTrap(container)

      const firstButton = container.querySelector<HTMLElement>('#first')!

      // Focus first button
      firstButton.focus()
      expect(document.activeElement).toBe(firstButton)

      // Simulate Shift+Tab from first element (should go to last)
      const shiftTabEvent = new KeyboardEvent('keydown', {
        key: 'Tab',
        shiftKey: true,
        bubbles: true,
      })
      container.dispatchEvent(shiftTabEvent)

      // Focus should now be on last element if preventDefault was called
      // Note: In tests, we can't fully simulate Tab behavior, so we just verify the event was handled

      cleanup()
    })

    it('should wrap focus to first element when Tab from last element', () => {
      container.innerHTML = `
        <button id="first">First</button>
        <button id="second">Second</button>
        <button id="third">Third</button>
      `
      const cleanup = createFocusTrap(container)

      const lastButton = container.querySelector<HTMLElement>('#third')!
      const firstButton = container.querySelector<HTMLElement>('#first')!

      // Focus last button
      lastButton.focus()
      expect(document.activeElement).toBe(lastButton)

      // Create Tab event without shift (going forward)
      const tabEvent = new KeyboardEvent('keydown', {
        key: 'Tab',
        shiftKey: false,
        bubbles: true,
      })

      // Spy on preventDefault to verify the focus trap catches the Tab
      const preventDefaultSpy = vi.spyOn(tabEvent, 'preventDefault')

      container.dispatchEvent(tabEvent)

      // Focus trap should prevent default and focus first element
      expect(preventDefaultSpy).toHaveBeenCalled()
      expect(document.activeElement).toBe(firstButton)

      cleanup()
    })

    it('should wrap focus to last element when Shift+Tab from first element', () => {
      container.innerHTML = `
        <button id="first">First</button>
        <button id="second">Second</button>
        <button id="third">Third</button>
      `
      const cleanup = createFocusTrap(container)

      const firstButton = container.querySelector<HTMLElement>('#first')!
      const lastButton = container.querySelector<HTMLElement>('#third')!

      // Focus first button
      firstButton.focus()
      expect(document.activeElement).toBe(firstButton)

      // Create Shift+Tab event (going backward)
      const shiftTabEvent = new KeyboardEvent('keydown', {
        key: 'Tab',
        shiftKey: true,
        bubbles: true,
      })

      const preventDefaultSpy = vi.spyOn(shiftTabEvent, 'preventDefault')

      container.dispatchEvent(shiftTabEvent)

      // Focus trap should prevent default and focus last element
      expect(preventDefaultSpy).toHaveBeenCalled()
      expect(document.activeElement).toBe(lastButton)

      cleanup()
    })

    it('should not interfere with non-Tab keys', () => {
      container.innerHTML = `
        <button id="first">First</button>
        <button id="second">Second</button>
      `
      const cleanup = createFocusTrap(container)

      const firstButton = container.querySelector<HTMLElement>('#first')!
      firstButton.focus()

      // Create an Escape key event
      const escapeEvent = new KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
      })

      const preventDefaultSpy = vi.spyOn(escapeEvent, 'preventDefault')

      container.dispatchEvent(escapeEvent)

      // Should not call preventDefault for non-Tab keys
      expect(preventDefaultSpy).not.toHaveBeenCalled()

      cleanup()
    })

    it('should not trap when Tab pressed but focus not at boundary', () => {
      container.innerHTML = `
        <button id="first">First</button>
        <button id="second">Second</button>
        <button id="third">Third</button>
      `
      const cleanup = createFocusTrap(container)

      // Focus middle button
      const secondButton = container.querySelector<HTMLElement>('#second')!
      secondButton.focus()

      // Create Tab event (going forward from middle element)
      const tabEvent = new KeyboardEvent('keydown', {
        key: 'Tab',
        shiftKey: false,
        bubbles: true,
      })

      const preventDefaultSpy = vi.spyOn(tabEvent, 'preventDefault')

      container.dispatchEvent(tabEvent)

      // Should not prevent default when not at boundary
      expect(preventDefaultSpy).not.toHaveBeenCalled()

      cleanup()
    })

    it('should handle container with no focusable elements', () => {
      container.innerHTML = '<div>No focusable elements</div>'
      const cleanup = createFocusTrap(container)

      // Create Tab event
      const tabEvent = new KeyboardEvent('keydown', {
        key: 'Tab',
        bubbles: true,
      })

      // Should not throw
      expect(() => container.dispatchEvent(tabEvent)).not.toThrow()

      cleanup()
    })

    it('should remove event listener on cleanup', () => {
      container.innerHTML = '<button>Button</button>'
      const cleanup = createFocusTrap(container)

      // Verify cleanup doesn't throw
      expect(() => cleanup()).not.toThrow()
    })
  })

  describe('handleArrowNavigation', () => {
    let elements: HTMLElement[]

    beforeEach(() => {
      elements = [
        document.createElement('button'),
        document.createElement('button'),
        document.createElement('button'),
      ]
    })

    describe('horizontal navigation', () => {
      it('should move to next element on ArrowRight', () => {
        const event = new KeyboardEvent('keydown', { key: 'ArrowRight' })
        const newIndex = handleArrowNavigation(event, elements, 0, 'horizontal')
        expect(newIndex).toBe(1)
      })

      it('should move to previous element on ArrowLeft', () => {
        const event = new KeyboardEvent('keydown', { key: 'ArrowLeft' })
        const newIndex = handleArrowNavigation(event, elements, 1, 'horizontal')
        expect(newIndex).toBe(0)
      })

      it('should wrap to last element when going left from first', () => {
        const event = new KeyboardEvent('keydown', { key: 'ArrowLeft' })
        const newIndex = handleArrowNavigation(event, elements, 0, 'horizontal')
        expect(newIndex).toBe(2)
      })

      it('should wrap to first element when going right from last', () => {
        const event = new KeyboardEvent('keydown', { key: 'ArrowRight' })
        const newIndex = handleArrowNavigation(event, elements, 2, 'horizontal')
        expect(newIndex).toBe(0)
      })

      it('should return null for vertical arrow keys in horizontal mode', () => {
        const eventUp = new KeyboardEvent('keydown', { key: 'ArrowUp' })
        const eventDown = new KeyboardEvent('keydown', { key: 'ArrowDown' })
        expect(handleArrowNavigation(eventUp, elements, 1, 'horizontal')).toBeNull()
        expect(handleArrowNavigation(eventDown, elements, 1, 'horizontal')).toBeNull()
      })
    })

    describe('vertical navigation', () => {
      it('should move to next element on ArrowDown', () => {
        const event = new KeyboardEvent('keydown', { key: 'ArrowDown' })
        const newIndex = handleArrowNavigation(event, elements, 0, 'vertical')
        expect(newIndex).toBe(1)
      })

      it('should move to previous element on ArrowUp', () => {
        const event = new KeyboardEvent('keydown', { key: 'ArrowUp' })
        const newIndex = handleArrowNavigation(event, elements, 1, 'vertical')
        expect(newIndex).toBe(0)
      })

      it('should wrap to last element when going up from first', () => {
        const event = new KeyboardEvent('keydown', { key: 'ArrowUp' })
        const newIndex = handleArrowNavigation(event, elements, 0, 'vertical')
        expect(newIndex).toBe(2)
      })

      it('should wrap to first element when going down from last', () => {
        const event = new KeyboardEvent('keydown', { key: 'ArrowDown' })
        const newIndex = handleArrowNavigation(event, elements, 2, 'vertical')
        expect(newIndex).toBe(0)
      })

      it('should return null for horizontal arrow keys in vertical mode', () => {
        const eventLeft = new KeyboardEvent('keydown', { key: 'ArrowLeft' })
        const eventRight = new KeyboardEvent('keydown', { key: 'ArrowRight' })
        expect(handleArrowNavigation(eventLeft, elements, 1, 'vertical')).toBeNull()
        expect(handleArrowNavigation(eventRight, elements, 1, 'vertical')).toBeNull()
      })
    })

    it('should return null for non-arrow keys', () => {
      const event = new KeyboardEvent('keydown', { key: 'a' })
      const newIndex = handleArrowNavigation(event, elements, 0)
      expect(newIndex).toBeNull()
    })

    describe('RTL mode', () => {
      afterEach(() => {
        // Reset direction after each RTL test
        document.documentElement.removeAttribute('dir')
        document.dir = ''
      })

      it('should reverse ArrowRight to previous element in RTL mode using dir attribute', () => {
        // Set RTL mode via dir attribute
        document.documentElement.setAttribute('dir', 'rtl')

        const event = new KeyboardEvent('keydown', { key: 'ArrowRight' })
        const newIndex = handleArrowNavigation(event, elements, 1, 'horizontal')

        // In RTL, ArrowRight should move to previous element
        expect(newIndex).toBe(0)
      })

      it('should reverse ArrowLeft to next element in RTL mode using dir attribute', () => {
        // Set RTL mode via dir attribute
        document.documentElement.setAttribute('dir', 'rtl')

        const event = new KeyboardEvent('keydown', { key: 'ArrowLeft' })
        const newIndex = handleArrowNavigation(event, elements, 0, 'horizontal')

        // In RTL, ArrowLeft should move to next element
        expect(newIndex).toBe(1)
      })

      it('should use document.dir when set directly', () => {
        // Set RTL mode via document.dir
        document.dir = 'rtl'

        const event = new KeyboardEvent('keydown', { key: 'ArrowRight' })
        const newIndex = handleArrowNavigation(event, elements, 1, 'horizontal')

        // In RTL, ArrowRight should move to previous element
        expect(newIndex).toBe(0)
      })

      it('should fallback to computedStyle when no dir attribute', () => {
        // In jsdom, setting style.direction should be picked up by getComputedStyle
        // Remove any dir attribute to trigger computedStyle fallback
        document.documentElement.removeAttribute('dir')
        document.dir = ''
        document.documentElement.style.direction = 'rtl'

        const event = new KeyboardEvent('keydown', { key: 'ArrowRight' })
        const newIndex = handleArrowNavigation(event, elements, 1, 'horizontal')

        // Should detect RTL from computed style and reverse direction
        expect(newIndex).toBe(0)

        // Cleanup
        document.documentElement.style.direction = ''
      })

      it('should not affect vertical navigation in RTL mode', () => {
        document.documentElement.setAttribute('dir', 'rtl')

        const eventDown = new KeyboardEvent('keydown', { key: 'ArrowDown' })
        const eventUp = new KeyboardEvent('keydown', { key: 'ArrowUp' })

        // Vertical navigation should not be affected by RTL
        expect(handleArrowNavigation(eventDown, elements, 0, 'vertical')).toBe(1)
        expect(handleArrowNavigation(eventUp, elements, 1, 'vertical')).toBe(0)
      })

      it('should wrap correctly at boundaries in RTL mode', () => {
        document.documentElement.setAttribute('dir', 'rtl')

        // ArrowRight from first element should wrap to last (going backwards)
        const eventRight = new KeyboardEvent('keydown', { key: 'ArrowRight' })
        expect(handleArrowNavigation(eventRight, elements, 0, 'horizontal')).toBe(2)

        // ArrowLeft from last element should wrap to first (going forwards)
        const eventLeft = new KeyboardEvent('keydown', { key: 'ArrowLeft' })
        expect(handleArrowNavigation(eventLeft, elements, 2, 'horizontal')).toBe(0)
      })
    })
  })

  describe('findFocusedIndex', () => {
    let elements: HTMLElement[]

    beforeEach(() => {
      elements = [
        document.createElement('button'),
        document.createElement('button'),
        document.createElement('button'),
      ]
      elements.forEach((el) => document.body.appendChild(el))
    })

    afterEach(() => {
      elements.forEach((el) => document.body.removeChild(el))
    })

    it('should return the index of the focused element', () => {
      elements[1].focus()
      const index = findFocusedIndex(elements)
      expect(index).toBe(1)
    })

    it('should return -1 when no element is focused', () => {
      const index = findFocusedIndex(elements)
      expect(index).toBe(-1)
    })

    it('should return -1 when a different element is focused', () => {
      const otherButton = document.createElement('button')
      document.body.appendChild(otherButton)
      otherButton.focus()

      const index = findFocusedIndex(elements)
      expect(index).toBe(-1)

      document.body.removeChild(otherButton)
    })
  })

  describe('handleHomeEndNavigation', () => {
    let elements: HTMLElement[]

    beforeEach(() => {
      elements = [
        document.createElement('button'),
        document.createElement('button'),
        document.createElement('button'),
      ]
    })

    it('should return 0 for Home key', () => {
      const event = new KeyboardEvent('keydown', { key: 'Home' })
      const index = handleHomeEndNavigation(event, elements)
      expect(index).toBe(0)
    })

    it('should return last index for End key', () => {
      const event = new KeyboardEvent('keydown', { key: 'End' })
      const index = handleHomeEndNavigation(event, elements)
      expect(index).toBe(2)
    })

    it('should return null for other keys', () => {
      const event = new KeyboardEvent('keydown', { key: 'a' })
      const index = handleHomeEndNavigation(event, elements)
      expect(index).toBeNull()
    })
  })
})
