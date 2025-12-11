/**
 * Font Awesome Icon Library
 *
 * This file centralizes all Font Awesome icon imports for the application.
 * Only icons that are actually used are imported, enabling tree-shaking
 * and reducing bundle size by ~150-180 KB.
 *
 * To add a new icon:
 * 1. Import it from '@fortawesome/free-solid-svg-icons' or '@fortawesome/free-brands-svg-icons'
 * 2. Add it to the library.add() call
 * 3. Use it in components via the Icon component with the icon name (without 'fa-' prefix)
 */

import { library } from '@fortawesome/fontawesome-svg-core'

// Solid icons (from free-solid-svg-icons)
import {
  faBolt,           // Lightning Speed feature
  faPenNib,         // Beautiful Simplicity feature
  faTags,           // Tag-Based Organization feature
  faMobileScreen,   // Universal Access feature
  faPlaneSlash,     // Offline-First feature (airplane mode/offline indicator)
  faShieldHalved,   // Privacy Focused feature
  faFeather,        // Logo/brand icon
  faXmark,          // Close/exit (mobile menu)
  faBars,           // Menu (mobile menu open)
  faEnvelope,       // Contact/email
  faStar,           // Most popular/featured
  faCircleCheck,    // Guarantee/security check
  faHeart,          // Used in tests
  faDownload,       // Download CTA
  faMoon,           // Dark mode toggle
  faSun,            // Light mode toggle
  faLock,           // Security/privacy indicator
  faCheck,          // Checkmark/success
} from '@fortawesome/free-solid-svg-icons'

// Brand icons (from free-brands-svg-icons)
import {
  faGithub,         // GitHub social link
  faTwitter,        // Twitter/X social link
  faApple,          // Apple platform
  faWindows,        // Windows platform
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
  // Brand icons
  faGithub,
  faTwitter,
  faApple,
  faWindows,
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
  'fa-wifi-slash': 'plane-slash',      // Using plane-slash as offline indicator
  'fa-shield-halved': 'shield-halved',
  'fa-feather': 'feather',
  'fa-xmark': 'xmark',
  'fa-bars': 'bars',
  'fa-envelope': 'envelope',
  'fa-star': 'star',
  'fa-shield-check': 'circle-check',   // Using circle-check for guarantee/verification
  'fa-heart': 'heart',
  'fa-download': 'download',
  'fa-moon': 'moon',
  'fa-sun': 'sun',
  'fa-lock': 'lock',
  'fa-check': 'check',
  'fa-github': 'github',
  'fa-twitter': 'twitter',
  'fa-apple': 'apple',
  'fa-windows': 'windows',
}

/**
 * Helper function to convert old icon names to new format
 * @param oldName - The old Font Awesome class name (e.g., 'fa-bolt')
 * @returns The new icon name (e.g., 'bolt')
 */
export const convertIconName = (oldName: string): string => {
  return iconNameMap[oldName] || oldName.replace('fa-', '')
}
