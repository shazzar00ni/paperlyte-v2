import { safePropertyAccess } from '../../../utils/security'

// Lightweight SVG icon paths for truly custom icons
// All standard Font Awesome icons should be imported via iconLibrary.ts

export const iconPaths: Record<string, string> = {
  // Note: All icons are now imported from @fortawesome packages in iconLibrary.ts
  // This file is reserved for truly custom icons that don't exist in Font Awesome
  // See: src/utils/iconLibrary.ts for all available icons
}

// Icon viewBox configurations (most use 0 0 24 24, but some may differ)
// Note: Currently empty as all icons use Font Awesome which manages its own viewBox
// Add custom icon viewBox entries here if custom icons are added to iconPaths above
export const iconViewBox: Record<string, string> = {}

// Returns the viewBox for the given icon, defaulting to "0 0 24 24" for custom icons
export const getIconViewBox = (name: string): string => {
  return safePropertyAccess(iconViewBox, name) ?? '0 0 24 24'
}
