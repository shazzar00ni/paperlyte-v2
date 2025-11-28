import { LEGAL_CONFIG } from './legal';

/**
 * Download URLs for Paperlyte across different platforms
 *
 * TODO: Update these URLs with actual download links before production release
 * These should point to:
 * - Direct download URLs for installers (.dmg, .exe, .deb, etc.)
 * - App Store / Play Store URLs for mobile platforms
 * - GitHub releases page for source/Linux builds
 */

export const DOWNLOAD_URLS = {
  mac: `${LEGAL_CONFIG.social.github}/releases/latest/download/Paperlyte-macOS.dmg`,
  windows: `${LEGAL_CONFIG.social.github}/releases/latest/download/Paperlyte-Windows.exe`,
  ios: 'https://apps.apple.com/app/paperlyte',
  android: 'https://play.google.com/store/apps/details?id=com.paperlyte.app',
  linux: `${LEGAL_CONFIG.social.github}/releases/latest`,
} as const;

// Re-export GitHub URL from legal config for consistency
export const GITHUB_URL = LEGAL_CONFIG.social.github;
