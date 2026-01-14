/**
 * Filename Validation Utilities
 *
 * Shared utilities for validating filenames to prevent path traversal attacks
 */

/**
 * Validates that a filename is safe and doesn't contain path traversal patterns.
 *
 * Checks for:
 * - Path traversal patterns (.., /, \)
 * - URL-encoded traversal patterns (%2e%2e, %2f, %5c)
 * - Null bytes (\0, %00)
 *
 * @param {string} filename - The filename to validate
 * @returns {boolean} True if the filename is safe, false otherwise
 */
export function isFilenameSafe(filename) {
  // Check for path traversal patterns
  if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    return false
  }

  // Check for URL-encoded traversal patterns
  if (filename.includes('%2e%2e') || filename.includes('%2f') || filename.includes('%5c')) {
    return false
  }

  // Check for null bytes (can cause issues on some systems)
  if (filename.includes('\0') || filename.includes('%00')) {
    return false
  }

  return true
}
