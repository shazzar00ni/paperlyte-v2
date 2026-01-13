// Lightweight SVG icon paths to replace Font Awesome CDN
// Only includes icons that are NOT available in @fortawesome packages or need custom styling

export const iconPaths: Record<string, string> = {
  // Custom/Brand icons not in standard Font Awesome
  'fa-x-twitter':
    'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z',
  'fa-instagram':
    'M16 2H8a6 6 0 0 0-6 6v8a6 6 0 0 0 6 6h8a6 6 0 0 0 6-6V8a6 6 0 0 0-6-6z M12 17a5 5 0 1 1 0-10 5 5 0 0 1 0 10z M17.5 6.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z',

  // Note: All other icons should be imported from @fortawesome packages in iconLibrary.ts
  // See: src/utils/iconLibrary.ts
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
