import { safePropertyAccess } from '../../../utils/security'

/**
 * Custom SVG icon paths for truly custom icons that don't exist in Font Awesome
 * All standard Font Awesome icons should be imported via iconLibrary.ts
 * @see {@link ../../../utils/iconLibrary.ts} for all available Font Awesome icons
 */
export const iconPaths: Record<string, string> = {
  // Note: All icons are now imported from @fortawesome packages in iconLibrary.ts
  // This file is reserved for truly custom icons that don't exist in Font Awesome
  // See: src/utils/iconLibrary.ts for all available icons
}

/**
 * Icon viewBox configurations for custom icons
 * Currently empty as all icons use Font Awesome which manages its own viewBox
 * Add custom icon viewBox entries here if custom icons are added to iconPaths above
 * Most icons use '0 0 24 24' but some may differ
 */
export const iconViewBox: Record<string, string> = {}

/**
 * Get the viewBox value for a given icon name
 * Returns a default viewBox of "0 0 24 24" for custom icons if not specified
 *
 * @param name - The icon name to look up (after conversion by convertIconName)
 * @returns The viewBox string for the icon, or "0 0 24 24" as default
 *
 * @example
 * ```ts
 * const viewBox = getIconViewBox('custom-icon') // Returns '0 0 24 24'
 * ```
 */
export const getIconViewBox = (name: string): string => {
  return safePropertyAccess(iconViewBox, name) ?? '0 0 24 24'
}
