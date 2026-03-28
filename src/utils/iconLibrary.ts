/**
 * Icon Library
 *
 * Centralized registry for self-hosted icon names used across the application.
 * All icons are stored as inline SVG paths in `src/components/ui/Icon/icons.ts`.
 *
 * To add a new icon:
 * 1. Add the SVG path data to `src/components/ui/Icon/icons.ts`
 * 2. Use it in components via the Icon component (e.g., `<Icon name="fa-bolt" />`)
 */

/**
 * Icon name mapping for easy reference
 * Maps from CSS class-style names (fa-bolt) to canonical icon keys
 */
export const iconNameMap: Record<string, string> = {
  'fa-bolt': 'bolt',
  'fa-pen-nib': 'pen-nib',
  'fa-tags': 'tags',
  'fa-mobile-screen': 'mobile-screen',
  'fa-wifi-slash': 'wifi-slash',
  'fa-shield-halved': 'shield-halved',
  'fa-feather': 'feather',
  'fa-envelope': 'envelope',
  'fa-star': 'star',
  'fa-download': 'download',
  'fa-moon': 'moon',
  'fa-sun': 'sun',
  'fa-lock': 'lock',
  'fa-check': 'check',
  'fa-note-sticky': 'note-sticky',
  'fa-lightbulb': 'lightbulb',
  'fa-users': 'users',
  'fa-server': 'server',
  'fa-github': 'github',
  'fa-twitter': 'twitter',
  'fa-x-twitter': 'x-twitter',
  'fa-instagram': 'instagram',
  'fa-facebook': 'facebook',
  'fa-linkedin': 'linkedin',
  'fa-apple': 'apple',
  'fa-windows': 'windows',
  'fa-arrow-right': 'arrow-right',
  'fa-spinner': 'spinner',
  'fa-circle-check': 'circle-check',
  'fa-check-circle': 'check-circle',
  'fa-rotate-right': 'rotate-right',
  'fa-paper-plane': 'paper-plane',
  'fa-comment-dots': 'comment-dots',
  'fa-bug': 'bug',
  'fa-x': 'x',
  'fa-home': 'home',
  'fa-triangle-exclamation': 'triangle-exclamation',
  'fa-circle-exclamation': 'circle-exclamation',
}

/**
 * Set of brand icon names (social/platform icons)
 * Used to categorise icon types for documentation purposes
 */
export const brandIconNames = new Set<string>([
  'github',
  'twitter',
  'x-twitter',
  'instagram',
  'facebook',
  'linkedin',
  'apple',
  'windows',
])

/**
 * Set of all valid icon names in the registry
 */
export const validIconNames = new Set<string>([
  ...Object.values(iconNameMap),
  'circle-question',
])

/**
 * Helper function to convert old icon names to new format
 * @param oldName - The icon class name (e.g., 'fa-bolt')
 * @returns The canonical icon key (e.g., 'bolt')
 */
export const convertIconName = (oldName: string): string => {
  return iconNameMap[oldName] || oldName.replace(/^fa-/, '')
}

/**
 * Check if an icon name is a brand icon
 * @param iconName - The converted icon name (e.g., 'github')
 * @returns true if the icon is a brand icon, false otherwise
 */
export const isBrandIcon = (iconName: string): boolean => {
  return brandIconNames.has(iconName)
}

/**
 * Check if an icon name exists in the registry
 * @param iconName - The converted icon name (e.g., 'bolt')
 * @returns true if the icon exists in the registry, false otherwise
 */
export const isValidIcon = (iconName: string): boolean => {
  return validIconNames.has(iconName)
}

