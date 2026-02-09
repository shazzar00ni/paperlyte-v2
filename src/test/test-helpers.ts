/**
 * Test helper utilities for common DOM queries and assertions
 */

import { render, type RenderResult } from '@testing-library/react'
import type { ReactElement } from 'react'

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

/**
 * Renders a component with a specific theme applied to the document root
 * Automatically restores the previous theme on cleanup to prevent test leakage
 * @param ui - The component to render
 * @param theme - The theme to apply ('light' or 'dark')
 * @returns The render result from @testing-library/react
 *
 * @example
 * renderWithTheme(<MyComponent />, 'dark')
 * expect(screen.getByText('Hello')).toBeInTheDocument()
 */
export function renderWithTheme(
  ui: ReactElement,
  theme: 'light' | 'dark' = 'light'
): RenderResult {
  // Capture previous theme to restore on cleanup
  const previousTheme = document.documentElement.getAttribute('data-theme')

  // Set theme on document root
  document.documentElement.setAttribute('data-theme', theme)

  const result = render(ui)

  // Wrap unmount to restore previous theme
  const originalUnmount = result.unmount
  result.unmount = () => {
    originalUnmount()
    if (previousTheme !== null) {
      document.documentElement.setAttribute('data-theme', previousTheme)
    } else {
      document.documentElement.removeAttribute('data-theme')
    }
  }

  return result
}
