/**
 * Icon Name Utilities
 *
 * Provides helpers for converting and validating icon names.
 * All icons are now bundled as custom SVG paths in Icon/icons.ts.
 *
 * To add a new icon:
 * 1. Add the SVG path data to src/components/ui/Icon/icons.ts
 * 2. Add the fa-* → bare-name mapping below in iconNameMap
 */

/**
 * Icon name mapping — maps fa-* class names to their bare identifiers.
 */
export const iconNameMap: Record<string, string> = {
  'fa-bolt': 'bolt',
  'fa-pen-nib': 'pen-nib',
  'fa-tags': 'tags',
  'fa-mobile-screen': 'mobile-screen',
  'fa-wifi-slash': 'wifi-slash',
  'fa-shield-halved': 'shield-halved',
  'fa-feather': 'feather',
  'fa-xmark': 'xmark',
  'fa-bars': 'bars',
  'fa-envelope': 'envelope',
  'fa-star': 'star',
  'fa-circle-check': 'circle-check',
  'fa-heart': 'heart',
  'fa-download': 'download',
  'fa-moon': 'moon',
  'fa-sun': 'sun',
  'fa-lock': 'lock',
  'fa-check': 'check',
  'fa-check-circle': 'check-circle',
  'fa-chevron-left': 'chevron-left',
  'fa-chevron-right': 'chevron-right',
  'fa-chevron-up': 'chevron-up',
  'fa-chevron-down': 'chevron-down',
  'fa-note-sticky': 'note-sticky',
  'fa-pen': 'pen',
  'fa-lightbulb': 'lightbulb',
  'fa-leaf': 'leaf',
  'fa-rocket': 'rocket',
  'fa-users': 'users',
  'fa-server': 'server',
  'fa-github': 'github',
  'fa-twitter': 'twitter',
  'fa-x-twitter': 'x-twitter',
  'fa-instagram': 'instagram',
  'fa-apple': 'apple',
  'fa-windows': 'windows',
  'fa-route': 'route',
  'fa-wifi': 'wifi',
  'fa-plane': 'plane',
  'fa-arrow-rotate-left': 'arrow-rotate-left',
  'fa-arrow-rotate-right': 'arrow-rotate-right',
  'fa-rotate-right': 'rotate-right',
  'fa-book': 'book',
  'fa-magnifying-glass': 'magnifying-glass',
  'fa-arrow-right': 'arrow-right',
  'fa-arrow-left': 'arrow-left',
  'fa-spinner': 'spinner',
  'fa-triangle-exclamation': 'triangle-exclamation',
  'fa-circle-exclamation': 'circle-exclamation',
  'fa-circle-info': 'circle-info',
  'fa-clock': 'clock',
  'fa-code': 'code',
  'fa-home': 'home',
  'fa-house': 'house',
  'fa-file-circle-question': 'file-circle-question',
  'fa-globe': 'globe',
  'fa-facebook': 'facebook',
  'fa-linkedin': 'linkedin',
}

/**
 * Set of brand icon names (social/platform icons)
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
 * Set of all valid icon names in the library
 */
export const validIconNames = new Set<string>([...Object.values(iconNameMap)])

/**
 * Convert an fa-* prefixed icon name to its bare identifier.
 * @param oldName - e.g. 'fa-bolt'
 * @returns e.g. 'bolt'
 */
export const convertIconName = (oldName: string): string => {
  return iconNameMap[oldName] || oldName.replace(/^fa-/, '')
}

/**
 * Check if an icon name is a brand icon.
 * @param iconName - bare icon name (e.g. 'github')
 */
export const isBrandIcon = (iconName: string): boolean => {
  return brandIconNames.has(iconName)
}

/**
 * Check if an icon name exists in the library.
 * @param iconName - bare icon name (e.g. 'bolt')
 */
export const isValidIcon = (iconName: string): boolean => {
  return validIconNames.has(iconName)
}
