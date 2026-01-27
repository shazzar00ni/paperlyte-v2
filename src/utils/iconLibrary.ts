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
 * Only includes non-standard mappings where the icon name differs from the fa- prefix pattern.
 * Standard mappings (e.g., fa-bolt -> bolt) are handled automatically by convertIconName().
 */
export const iconNameMap: Record<string, string> = {
  'fa-wifi-slash': 'plane-slash', // Using plane-slash as offline indicator
  'fa-shield-check': 'circle-check', // Using circle-check for guarantee/verification
}

/**
 * Set of brand icon names (derived from imported brand icons)
 * Used to determine the icon prefix (fab vs fas) dynamically
 */
export const brandIconNames = new Set<string>(['github', 'twitter', 'apple', 'windows'])

/**
 * Set of all valid icon names in the library
 * Used for runtime validation to prevent rendering invalid icons
 * Includes all imported solid and brand icons
 *
 * ⚠️ IMPORTANT: When adding new icons, you must:
 * 1. Import the icon from @fortawesome/free-solid-svg-icons or free-brands-svg-icons
 * 2. Add it to library.add()
 * 3. Add the converted name (without 'fa-' prefix) to this set
 *
 * The test suite will catch synchronization issues if you forget step 3.
 */
export const validIconNames = new Set<string>([
  // Solid icons
  'bolt',
  'pen-nib',
  'tags',
  'mobile-screen',
  'plane-slash',
  'shield-halved',
  'feather',
  'xmark',
  'bars',
  'envelope',
  'star',
  'circle-check',
  'heart',
  'download',
  'moon',
  'sun',
  'lock',
  'check',
  'circle-question', // Fallback icon
  'chevron-left',
  'chevron-right',
  'chevron-up',
  'chevron-down',
  'pause',
  'play',
  'note-sticky',
  'pen',
  'lightbulb',
  'leaf',
  'rocket',
  'users',
  'server',
  'wifi',
  'rotate-right',
  'arrow-rotate-right',
  'arrow-rotate-left',
  'book',
  'magnifying-glass',
  'plane',
  'network-wired',
  'arrow-right',
  'arrow-left',
  'spinner',
  // Brand icons
  'github',
  'twitter',
  'apple',
  'windows',
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
