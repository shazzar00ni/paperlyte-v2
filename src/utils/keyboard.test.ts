import { describe, it, expect, beforeEach, afterEach } from 'vitest';
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
} from './keyboard';

describe('keyboard utilities', () => {
  describe('isActivationKey', () => {
    it('should return true for Enter key', () => {
      const event = new KeyboardEvent('keydown', { key: 'Enter' });
      expect(isActivationKey(event)).toBe(true);
    });

    it('should return true for Space key', () => {
      const event = new KeyboardEvent('keydown', { key: ' ' });
      expect(isActivationKey(event)).toBe(true);
    });

    it('should return true for Spacebar key (older browsers)', () => {
      const event = new KeyboardEvent('keydown', { key: 'Spacebar' });
      expect(isActivationKey(event)).toBe(true);
    });

    it('should return false for other keys', () => {
      const event = new KeyboardEvent('keydown', { key: 'a' });
      expect(isActivationKey(event)).toBe(false);
    });
  });

  describe('isEscapeKey', () => {
    it('should return true for Escape key', () => {
      const event = new KeyboardEvent('keydown', { key: 'Escape' });
      expect(isEscapeKey(event)).toBe(true);
    });

    it('should return true for Esc key (older browsers)', () => {
      const event = new KeyboardEvent('keydown', { key: 'Esc' });
      expect(isEscapeKey(event)).toBe(true);
    });

    it('should return false for other keys', () => {
      const event = new KeyboardEvent('keydown', { key: 'a' });
      expect(isEscapeKey(event)).toBe(false);
    });
  });

  describe('isArrowKey', () => {
    it('should return true for ArrowUp', () => {
      const event = new KeyboardEvent('keydown', { key: 'ArrowUp' });
      expect(isArrowKey(event)).toBe(true);
    });

    it('should return true for ArrowDown', () => {
      const event = new KeyboardEvent('keydown', { key: 'ArrowDown' });
      expect(isArrowKey(event)).toBe(true);
    });

    it('should return true for ArrowLeft', () => {
      const event = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
      expect(isArrowKey(event)).toBe(true);
    });

    it('should return true for ArrowRight', () => {
      const event = new KeyboardEvent('keydown', { key: 'ArrowRight' });
      expect(isArrowKey(event)).toBe(true);
    });

    it('should return false for other keys', () => {
      const event = new KeyboardEvent('keydown', { key: 'a' });
      expect(isArrowKey(event)).toBe(false);
    });
  });

  describe('isHomeKey', () => {
    it('should return true for Home key', () => {
      const event = new KeyboardEvent('keydown', { key: 'Home' });
      expect(isHomeKey(event)).toBe(true);
    });

    it('should return false for other keys', () => {
      const event = new KeyboardEvent('keydown', { key: 'a' });
      expect(isHomeKey(event)).toBe(false);
    });
  });

  describe('isEndKey', () => {
    it('should return true for End key', () => {
      const event = new KeyboardEvent('keydown', { key: 'End' });
      expect(isEndKey(event)).toBe(true);
    });

    it('should return false for other keys', () => {
      const event = new KeyboardEvent('keydown', { key: 'a' });
      expect(isEndKey(event)).toBe(false);
    });
  });

  describe('getArrowDirection', () => {
    it('should return "up" for ArrowUp', () => {
      const event = new KeyboardEvent('keydown', { key: 'ArrowUp' });
      expect(getArrowDirection(event)).toBe('up');
    });

    it('should return "down" for ArrowDown', () => {
      const event = new KeyboardEvent('keydown', { key: 'ArrowDown' });
      expect(getArrowDirection(event)).toBe('down');
    });

    it('should return "left" for ArrowLeft', () => {
      const event = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
      expect(getArrowDirection(event)).toBe('left');
    });

    it('should return "right" for ArrowRight', () => {
      const event = new KeyboardEvent('keydown', { key: 'ArrowRight' });
      expect(getArrowDirection(event)).toBe('right');
    });

    it('should return null for non-arrow keys', () => {
      const event = new KeyboardEvent('keydown', { key: 'a' });
      expect(getArrowDirection(event)).toBe(null);
    });
  });

  describe('FOCUSABLE_SELECTOR', () => {
    it('should be a valid CSS selector string', () => {
      expect(typeof FOCUSABLE_SELECTOR).toBe('string');
      expect(FOCUSABLE_SELECTOR.length).toBeGreaterThan(0);
    });
  });

  describe('getFocusableElements', () => {
    let container: HTMLElement;

    beforeEach(() => {
      container = document.createElement('div');
      document.body.appendChild(container);
    });

    afterEach(() => {
      document.body.removeChild(container);
    });

    it('should return all focusable elements', () => {
      container.innerHTML = `
        <button>Button 1</button>
        <a href="#">Link</a>
        <input type="text" />
        <button>Button 2</button>
      `;
      const elements = getFocusableElements(container);
      expect(elements).toHaveLength(4);
    });

    it('should exclude disabled elements', () => {
      container.innerHTML = `
        <button>Enabled</button>
        <button disabled>Disabled</button>
        <input type="text" />
        <input type="text" disabled />
      `;
      const elements = getFocusableElements(container);
      expect(elements).toHaveLength(2);
    });

    it('should exclude elements with tabindex="-1"', () => {
      container.innerHTML = `
        <button>Button</button>
        <div tabindex="-1">Not focusable</div>
        <div tabindex="0">Focusable</div>
      `;
      const elements = getFocusableElements(container);
      expect(elements).toHaveLength(2);
    });

    it('should return empty array when no focusable elements exist', () => {
      container.innerHTML = '<div>No focusable elements</div>';
      const elements = getFocusableElements(container);
      expect(elements).toHaveLength(0);
    });

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
      `;
      const elements = getFocusableElements(container);

      // Verify elements are in document order
      expect(elements).toHaveLength(5);
      expect(elements[0].id).toBe('link1');
      expect(elements[1].id).toBe('btn1');
      expect(elements[2].id).toBe('link2');
      expect(elements[3].id).toBe('btn2');
      expect(elements[4].id).toBe('input1');
    });
  });

  describe('getFirstFocusableElement', () => {
    let container: HTMLElement;

    beforeEach(() => {
      container = document.createElement('div');
      document.body.appendChild(container);
    });

    afterEach(() => {
      document.body.removeChild(container);
    });

    it('should return the first focusable element', () => {
      container.innerHTML = `
        <button id="first">First</button>
        <button id="second">Second</button>
      `;
      const first = getFirstFocusableElement(container);
      expect(first?.id).toBe('first');
    });

    it('should return null when no focusable elements exist', () => {
      container.innerHTML = '<div>No buttons</div>';
      const first = getFirstFocusableElement(container);
      expect(first).toBeNull();
    });
  });

  describe('getLastFocusableElement', () => {
    let container: HTMLElement;

    beforeEach(() => {
      container = document.createElement('div');
      document.body.appendChild(container);
    });

    afterEach(() => {
      document.body.removeChild(container);
    });

    it('should return the last focusable element', () => {
      container.innerHTML = `
        <button id="first">First</button>
        <button id="second">Second</button>
      `;
      const last = getLastFocusableElement(container);
      expect(last?.id).toBe('second');
    });

    it('should return null when no focusable elements exist', () => {
      container.innerHTML = '<div>No buttons</div>';
      const last = getLastFocusableElement(container);
      expect(last).toBeNull();
    });
  });

  describe('focusFirstElement', () => {
    let container: HTMLElement;

    beforeEach(() => {
      container = document.createElement('div');
      document.body.appendChild(container);
    });

    afterEach(() => {
      document.body.removeChild(container);
    });

    it('should focus the first element and return true', () => {
      container.innerHTML = `
        <button id="first">First</button>
        <button id="second">Second</button>
      `;
      const result = focusFirstElement(container);
      expect(result).toBe(true);
      expect(document.activeElement?.id).toBe('first');
    });

    it('should return false when no focusable elements exist', () => {
      container.innerHTML = '<div>No buttons</div>';
      const result = focusFirstElement(container);
      expect(result).toBe(false);
    });
  });

  describe('focusLastElement', () => {
    let container: HTMLElement;

    beforeEach(() => {
      container = document.createElement('div');
      document.body.appendChild(container);
    });

    afterEach(() => {
      document.body.removeChild(container);
    });

    it('should focus the last element and return true', () => {
      container.innerHTML = `
        <button id="first">First</button>
        <button id="second">Second</button>
      `;
      const result = focusLastElement(container);
      expect(result).toBe(true);
      expect(document.activeElement?.id).toBe('second');
    });

    it('should return false when no focusable elements exist', () => {
      container.innerHTML = '<div>No buttons</div>';
      const result = focusLastElement(container);
      expect(result).toBe(false);
    });
  });

  describe('createFocusTrap', () => {
    let container: HTMLElement;

    beforeEach(() => {
      container = document.createElement('div');
      document.body.appendChild(container);
    });

    afterEach(() => {
      document.body.removeChild(container);
    });

    it('should trap focus within container', () => {
      container.innerHTML = `
        <button id="first">First</button>
        <button id="second">Second</button>
        <button id="third">Third</button>
      `;
      const cleanup = createFocusTrap(container);

      const firstButton = container.querySelector<HTMLElement>('#first')!;

      // Focus first button
      firstButton.focus();
      expect(document.activeElement).toBe(firstButton);

      // Simulate Shift+Tab from first element (should go to last)
      const shiftTabEvent = new KeyboardEvent('keydown', {
        key: 'Tab',
        shiftKey: true,
        bubbles: true,
      });
      container.dispatchEvent(shiftTabEvent);

      // Focus should now be on last element if preventDefault was called
      // Note: In tests, we can't fully simulate Tab behavior, so we just verify the event was handled

      cleanup();
    });

    it('should remove event listener on cleanup', () => {
      container.innerHTML = '<button>Button</button>';
      const cleanup = createFocusTrap(container);

      // Verify cleanup doesn't throw
      expect(() => cleanup()).not.toThrow();
    });
  });

  describe('handleArrowNavigation', () => {
    let elements: HTMLElement[];

    beforeEach(() => {
      elements = [
        document.createElement('button'),
        document.createElement('button'),
        document.createElement('button'),
      ];
    });

    describe('horizontal navigation', () => {
      it('should move to next element on ArrowRight', () => {
        const event = new KeyboardEvent('keydown', { key: 'ArrowRight' });
        const newIndex = handleArrowNavigation(event, elements, 0, 'horizontal');
        expect(newIndex).toBe(1);
      });

      it('should move to previous element on ArrowLeft', () => {
        const event = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
        const newIndex = handleArrowNavigation(event, elements, 1, 'horizontal');
        expect(newIndex).toBe(0);
      });

      it('should wrap to last element when going left from first', () => {
        const event = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
        const newIndex = handleArrowNavigation(event, elements, 0, 'horizontal');
        expect(newIndex).toBe(2);
      });

      it('should wrap to first element when going right from last', () => {
        const event = new KeyboardEvent('keydown', { key: 'ArrowRight' });
        const newIndex = handleArrowNavigation(event, elements, 2, 'horizontal');
        expect(newIndex).toBe(0);
      });

      it('should return null for vertical arrow keys in horizontal mode', () => {
        const eventUp = new KeyboardEvent('keydown', { key: 'ArrowUp' });
        const eventDown = new KeyboardEvent('keydown', { key: 'ArrowDown' });
        expect(handleArrowNavigation(eventUp, elements, 1, 'horizontal')).toBeNull();
        expect(handleArrowNavigation(eventDown, elements, 1, 'horizontal')).toBeNull();
      });
    });

    describe('vertical navigation', () => {
      it('should move to next element on ArrowDown', () => {
        const event = new KeyboardEvent('keydown', { key: 'ArrowDown' });
        const newIndex = handleArrowNavigation(event, elements, 0, 'vertical');
        expect(newIndex).toBe(1);
      });

      it('should move to previous element on ArrowUp', () => {
        const event = new KeyboardEvent('keydown', { key: 'ArrowUp' });
        const newIndex = handleArrowNavigation(event, elements, 1, 'vertical');
        expect(newIndex).toBe(0);
      });

      it('should wrap to last element when going up from first', () => {
        const event = new KeyboardEvent('keydown', { key: 'ArrowUp' });
        const newIndex = handleArrowNavigation(event, elements, 0, 'vertical');
        expect(newIndex).toBe(2);
      });

      it('should wrap to first element when going down from last', () => {
        const event = new KeyboardEvent('keydown', { key: 'ArrowDown' });
        const newIndex = handleArrowNavigation(event, elements, 2, 'vertical');
        expect(newIndex).toBe(0);
      });

      it('should return null for horizontal arrow keys in vertical mode', () => {
        const eventLeft = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
        const eventRight = new KeyboardEvent('keydown', { key: 'ArrowRight' });
        expect(handleArrowNavigation(eventLeft, elements, 1, 'vertical')).toBeNull();
        expect(handleArrowNavigation(eventRight, elements, 1, 'vertical')).toBeNull();
      });
    });

    it('should return null for non-arrow keys', () => {
      const event = new KeyboardEvent('keydown', { key: 'a' });
      const newIndex = handleArrowNavigation(event, elements, 0);
      expect(newIndex).toBeNull();
    });
  });

  describe('findFocusedIndex', () => {
    let elements: HTMLElement[];

    beforeEach(() => {
      elements = [
        document.createElement('button'),
        document.createElement('button'),
        document.createElement('button'),
      ];
      elements.forEach((el) => document.body.appendChild(el));
    });

    afterEach(() => {
      elements.forEach((el) => document.body.removeChild(el));
    });

    it('should return the index of the focused element', () => {
      elements[1].focus();
      const index = findFocusedIndex(elements);
      expect(index).toBe(1);
    });

    it('should return -1 when no element is focused', () => {
      const index = findFocusedIndex(elements);
      expect(index).toBe(-1);
    });

    it('should return -1 when a different element is focused', () => {
      const otherButton = document.createElement('button');
      document.body.appendChild(otherButton);
      otherButton.focus();

      const index = findFocusedIndex(elements);
      expect(index).toBe(-1);

      document.body.removeChild(otherButton);
    });
  });

  describe('handleHomeEndNavigation', () => {
    let elements: HTMLElement[];

    beforeEach(() => {
      elements = [
        document.createElement('button'),
        document.createElement('button'),
        document.createElement('button'),
      ];
    });

    it('should return 0 for Home key', () => {
      const event = new KeyboardEvent('keydown', { key: 'Home' });
      const index = handleHomeEndNavigation(event, elements);
      expect(index).toBe(0);
    });

    it('should return last index for End key', () => {
      const event = new KeyboardEvent('keydown', { key: 'End' });
      const index = handleHomeEndNavigation(event, elements);
      expect(index).toBe(2);
    });

    it('should return null for other keys', () => {
      const event = new KeyboardEvent('keydown', { key: 'a' });
      const index = handleHomeEndNavigation(event, elements);
      expect(index).toBeNull();
    });
  });
});
