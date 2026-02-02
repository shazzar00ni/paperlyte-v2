/**
 * Font Awesome Icon Library
 *
 * This file centralizes all Font Awesome icon imports for the application.
 *
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
  faRoute, // Offline page - route/navigation issues
  faArrowRight, // Navigation forward
} from '@fortawesome/free-solid-svg-icons'

// Add all icons to the library
library.add(
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
  faCircleQuestion,
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
  faRoute,
  faArrowRight
)

// Mapping from Font Awesome class names to icon names used in the Icon component
export const iconNameMap: Record<string, string> = {
  'fa-bolt': 'bolt',
  'fa-pen-nib': 'pen-nib',
  'fa-tags': 'tags',
  'fa-mobile-screen': 'mobile-screen',
  'fa-plane-slash': 'plane-slash',
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
  'fa-circle-question': 'circle-question',
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
  'fa-route': 'route',
  'fa-arrow-right': 'arrow-right',
}
