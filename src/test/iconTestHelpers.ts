/**
 * Shared test helpers for Icon component testing
 * Used across Icon.test.tsx, ThemeToggle.test.tsx, and other icon integration tests
 */

/**
 * Assert that an icon element has the expected size
 * Handles three cases:
 * - SVG elements: checks width/height attributes
 * - SPAN fallback: checks fontSize style
 * - FontAwesomeIcon SVG: checks fontSize in style prop
 */
export function expectIconSize(icon: Element | null, expectedSize: string): void {
  expect(icon).toBeInTheDocument();

  if (icon?.tagName === 'svg' && icon.hasAttribute('width')) {
    // Custom SVG icons use width/height attributes
    expect(icon).toHaveAttribute('width', expectedSize);
    expect(icon).toHaveAttribute('height', expectedSize);
  } else if (icon?.tagName === 'svg') {
    // FontAwesomeIcon SVG with fontSize in style
    const expectedFontSize = expectedSize.endsWith('px') ? expectedSize : `${expectedSize}px`;
    expect(icon).toHaveStyle({ fontSize: expectedFontSize });
  } else if (icon?.tagName === 'SPAN') {
    // Span fallback uses fontSize style
    const expectedFontSize = expectedSize.endsWith('px') ? expectedSize : `${expectedSize}px`;
    expect((icon as HTMLElement).style.fontSize).toBe(expectedFontSize);
  } else {
    // Unexpected element type - fail with descriptive message
    expect(icon?.tagName).toMatch(/svg|SPAN/i);
  }
}

/**
 * Get icon element from a container
 * Handles both SVG and fallback (.icon-fallback) elements
 */
export function getIconElement(container: HTMLElement): Element | null {
  return container.querySelector('svg, .icon-fallback');
}

/**
 * Get icon element from a button
 * Convenience wrapper for the common pattern of getting icons from buttons
 */
export function getIconFromButton(button: HTMLElement): Element | null {
  return getIconElement(button);
}
