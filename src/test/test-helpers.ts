/**
 * Test helper utilities for common DOM queries and assertions
 */

/**
 * Gets an icon element (SVG or fallback) from a container
 * @param container - The parent element to search within
 * @returns The icon element (SVG or fallback span), or null if not found
 *
 * @example
 * const button = screen.getByRole('button')
 * const icon = getIcon(button)
 * expect(icon).toBeInTheDocument()
 */
export function getIcon(container: Element | null): Element | null {
  if (!container) return null
  return container.querySelector('svg') ?? container.querySelector('.icon-fallback')
}
