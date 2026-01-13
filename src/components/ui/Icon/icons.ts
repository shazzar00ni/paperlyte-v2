// Lightweight SVG icon paths for truly custom icons
// All standard Font Awesome icons should be imported via iconLibrary.ts

export const iconPaths: Record<string, string> = {
  // Note: All icons are now imported from @fortawesome packages in iconLibrary.ts
  // This file is reserved for truly custom icons that don't exist in Font Awesome
  // See: src/utils/iconLibrary.ts for all available icons
}

// Icon viewBox configurations (most use 0 0 24 24, but some may differ)
export const iconViewBox: Record<string, string> = {
  'fa-apple': '0 0 24 24',
  'fa-windows': '0 0 23 24',
}

// Returns the viewBox for the given icon, defaulting to "0 0 24 24" for icons not listed above
export const getIconViewBox = (name: string): string => {
  return iconViewBox[name] || '0 0 24 24'
}
