/**
 * Font Awesome Icon Library
 *
 * This file centralizes all Font Awesome icon imports for the application.
 * Only icons that are actually used are imported, enabling tree-shaking.
 * Note: While CSS for unused icons is eliminated, the SVG icon data increases the JavaScript bundle size.
 * This approach enables better tree-shaking for unused icons and removes the need for separate CSS icon files.
 *
 * To add a new icon:
 * 1. Import it from '@fortawesome/free-solid-svg-icons' or '@fortawesome/free-brands-svg-icons'
 * 2. Add it to the library.add() call
 * 3. Use it in components via the Icon component with the icon name (without 'fa-' prefix)
 */

import { library } from '@fortawesome/fontawesome-svg-core'

// Solid icons (from free-solid-svg-icons)
import {
  faBolt, // Lightning Speed feature
  faPenNib, // Beautiful Simplicity feature
  faTags, // Tag-Based Organization feature
  faMobileScreen, // Universal Access feature
  faPlaneSlash, // Offline-First feature (airplane mode/offline indicator)
  faShieldHalved, // Privacy Focused feature
  faFeather, // Logo/brand icon
  faXmark, // Close/exit (mobile menu)
  faBars, // Menu (mobile menu open)
  faEnvelope, // Contact/email
  faStar, // Most popular/featured
  faCircleCheck, // Guarantee/security check
  faHeart, // Used in tests
  faDownload, // Download CTA
  faMoon, // Dark mode toggle
  faSun, // Light mode toggle
  faLock, // Security/privacy indicator
  faCheck, // Checkmark/success
  faCircleQuestion, // Fallback icon for missing/invalid icons
  faChevronLeft, // Testimonials carousel navigation
  faChevronRight, // Testimonials carousel navigation
  faChevronUp, // FAQ accordion
  faChevronDown, // FAQ accordion
  faPause, // Testimonials autoplay control
  faPlay, // Testimonials autoplay control
  faNoteSticky, // Hero section features, Statistics
  faPen, // Hero section features
  faLightbulb, // Hero section features
  faLeaf, // Pricing plans (eco-friendly)
  faRocket, // Pricing plans (premium features)
  faUsers, // Pricing plans, Statistics (team/community)
  faServer, // Statistics (infrastructure)
  faWifi, // Offline page - connection status
  faRotateRight, // Retry/reload actions
  faArrowRotateRight, // Retry/reload actions (alternative)
  faArrowRotateLeft, // Undo/back actions
  faBook, // Documentation/help
  faMagnifyingGlass, // Search
  faPlane, // Offline page - airplane mode
  faNetworkWired, // Offline page - network issues
  faArrowRight, // Navigation forward
  faArrowLeft, // Navigation back
  faSpinner, // Loading states
} from '@fortawesome/free-solid-svg-icons'

// Brand icons (from free-brands-svg-icons)
import {
  faGithub, // GitHub social link
  faTwitter, // Twitter/X social link
  faApple, // Apple platform
  faWindows, // Windows platform
} from '@fortawesome/free-brands-svg-icons'

// Add all icons to the library
library.add(
  // Solid icons
  faBolt,
  faPenNib,
  faTags,
  faMobileScreen,
  faPlaneSlash,
  faShieldHalved,
  faFeather,
  faXmark,
  faBars,
  faEnvelope,
  faStar,
  faCircleCheck,
  faHeart,
  faDownload,
  faMoon,
  faSun,
  faLock,
  faCheck,
  faCircleQuestion, // Fallback icon (not exposed via iconNameMap)
  faChevronLeft,
  faChevronRight,
  faChevronUp,
  faChevronDown,
  faPause,
  faPlay,
  faNoteSticky,
  faPen,
  faLightbulb,
  faLeaf,
  faRocket,
  faUsers,
  faServer,
  faWifi,
  faRotateRight,
  faArrowRotateRight,
  faArrowRotateLeft,
  faBook,
  faMagnifyingGlass,
  faPlane,
  faNetworkWired,
  faArrowRight,
  faArrowLeft,
  faSpinner,
  // Brand icons
  faGithub,
  faTwitter,
  faApple,
  faWindows
)

/**
 * Icon name mapping for easy reference
 * Maps from old CSS class names (fa-bolt) to new icon names (bolt)
 */
export const iconNameMap: Record<string, string> = {
  'fa-bolt': 'bolt',
  'fa-pen-nib': 'pen-nib',
  'fa-tags': 'tags',
  'fa-mobile-screen': 'mobile-screen',
  'fa-wifi-slash': 'plane-slash', // Using plane-slash as offline indicator
  'fa-shield-halved': 'shield-halved',
  'fa-feather': 'feather',
  'fa-xmark': 'xmark',
  'fa-bars': 'bars',
  'fa-envelope': 'envelope',
  'fa-star': 'star',
  'fa-shield-check': 'circle-check', // Using circle-check for guarantee/verification
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
  'fa-wifi': 'wifi',
  'fa-rotate-right': 'rotate-right',
  'fa-arrow-rotate-right': 'arrow-rotate-right',
  'fa-arrow-rotate-left': 'arrow-rotate-left',
  'fa-book': 'book',
  'fa-magnifying-glass': 'magnifying-glass',
  'fa-plane': 'plane',
  'fa-network-wired': 'network-wired',
  'fa-router': 'network-wired', // Using network-wired for router/network issues
  'fa-arrow-right': 'arrow-right',
  'fa-arrow-left': 'arrow-left',
  'fa-spinner': 'spinner',
  'fa-github': 'github',
  'fa-twitter': 'twitter',
  'fa-apple': 'apple',
  'fa-windows': 'windows',
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
