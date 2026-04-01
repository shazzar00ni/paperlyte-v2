/**
 * Font Awesome Icon Library
 *
 * Most icons are now served as lightweight inline SVGs via src/components/ui/Icon/icons.ts,
 * which avoids the Font Awesome runtime entirely for those icons.
 *
 * Only icons that require the FA filled/solid rendering style (and are not in the custom
 * inline SVG set) are registered here. Keeping this list minimal reduces the fontawesome
 * JS chunk by ~80%.
 *
 * Icons in the custom set (icons.ts) do NOT need to be registered here.
 */

import { library } from '@fortawesome/fontawesome-svg-core'

// Only faStar remains — it needs the filled/solid style for ratings and popular badges.
// All other previously-FA icons (heart, leaf, rocket, chevrons, etc.) are now served
// by the custom SVG set in icons.ts and no longer require the FA library.
import {
  faStar, // Testimonial star ratings & popular badge (filled solid style required)
} from '@fortawesome/free-solid-svg-icons'

library.add(faStar)

/**
 * Icon name mapping for easy reference
 * Maps from old CSS class names (fa-bolt) to new icon names (bolt)
 */
export const iconNameMap: Record<string, string> = {
  'fa-bolt': 'bolt',
  'fa-pen-nib': 'pen-nib',
  'fa-tags': 'tags',
  'fa-mobile-screen': 'mobile-screen',
  'fa-wifi-slash': 'plane-slash', // Using plane-slash as offline indicator.
  'fa-shield-halved': 'shield-halved',
  'fa-feather': 'feather',
  'fa-xmark': 'xmark',
  'fa-bars': 'bars',
  'fa-envelope': 'envelope',
  'fa-star': 'star',
  'fa-heart': 'heart',
  'fa-download': 'download',
  'fa-moon': 'moon',
  'fa-sun': 'sun',
  'fa-lock': 'lock',
  'fa-check': 'check',
  'fa-chevron-left': 'chevron-left',
  'fa-chevron-right': 'chevron-right',
  'fa-chevron-up': 'chevron-up',
  'fa-chevron-down': 'chevron-down',
  'fa-pause': 'pause',
  'fa-play': 'play',
  'fa-note-sticky': 'note-sticky',
  'fa-pen': 'pen',
  'fa-lightbulb': 'lightbulb',
  'fa-leaf': 'leaf',
  'fa-rocket': 'rocket',
  'fa-users': 'users',
  'fa-server': 'server',
  'fa-github': 'github',
  'fa-twitter': 'twitter',
  'fa-apple': 'apple',
  'fa-windows': 'windows',
  'fa-route': 'route', // Offline page - route/navigation issues.
  'fa-wifi': 'wifi', // Offline page - connection status.
  'fa-plane': 'plane', // Offline page - airplane mode.
  'fa-arrow-rotate-left': 'arrow-rotate-left', // Undo/back actions.
  'fa-arrow-rotate-right': 'arrow-rotate-right', // Retry/reload actions (alternative).
  'fa-rotate-right': 'rotate-right', // Retry/reload actions.
  'fa-book': 'book', // Documentation/help.
  'fa-magnifying-glass': 'magnifying-glass', // Search.
  'fa-arrow-right': 'arrow-right', // Navigation forward.
  'fa-arrow-left': 'arrow-left', // Navigation back.
  'fa-spinner': 'spinner', // Loading states.
  'fa-circle-check': 'circle-check', // Checkmark/success indicator.
}

/**
 * Set of brand icon names (derived from imported brand icons)
 * Used to determine the icon prefix (fab vs fas) dynamically
 */
export const brandIconNames = new Set<string>(['github', 'twitter', 'apple', 'windows'])

/**
 * Set of all valid icon names in the library
 * Used for runtime validation to prevent rendering invalid icons
 */
export const validIconNames = new Set<string>([
  ...Object.values(iconNameMap),
  'circle-question', // Fallback icon
])
/**
 * Helper function to convert old icon names to new format
 * @param oldName - The old Font Awesome class name (e.g., 'fa-bolt')
 * @returns The new icon name (e.g., 'bolt')
 */
export const convertIconName = (oldName: string): string => {
  // Returns mapped name if found, otherwise strips 'fa-' prefix.
  // Note: Unmapped icons will fail isValidIcon() and render a fallback.
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
 * Check if an icon name exists in the library
 * @param iconName - The converted icon name (e.g., 'bolt')
 * @returns true if the icon exists in the library, false otherwise
 */
export const isValidIcon = (iconName: string): boolean => {
  return validIconNames.has(iconName)
}
