import { LEGAL_CONFIG } from './legal'

/**
 * Download URLs for Paperlyte across different platforms
 *
 * Note: Desktop download URLs are derived from the GitHub releases page.
 * Mobile platform URLs (iOS/Android) are placeholders pending App Store publication.
 */

export const DOWNLOAD_URLS = {
  mac: `${LEGAL_CONFIG.social.github}/releases/latest/download/Paperlyte-macOS.dmg`,
  windows: `${LEGAL_CONFIG.social.github}/releases/latest/download/Paperlyte-Windows.exe`,
  // Placeholder: update once published to the App Store
  ios: 'https://apps.apple.com/app/paperlyte',
  // Placeholder: update once published to Google Play
  android: 'https://play.google.com/store/apps/details?id=com.paperlyte.app',
  linux: `${LEGAL_CONFIG.social.github}/releases/latest`,
} as const

// Re-export GitHub URL from legal config for consistency
export const GITHUB_URL = LEGAL_CONFIG.social.github
