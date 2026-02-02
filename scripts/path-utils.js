/**
 * Path Utilities for Build Scripts
 *
 * Provides secure path handling utilities to prevent path traversal attacks
 * in build and generation scripts.
 *
 * This module re-exports the comprehensive isPathSafe function from the shared
 * filenameValidation utility to avoid code duplication.
 */

import { isPathSafe as isPathSafeImpl } from './utils/filenameValidation.js'

/**
 * Validates that a file path is within a specified base directory
 * Prevents path traversal attacks by ensuring the resolved path doesn't escape the base directory
 *
 * This is a wrapper around the shared isPathSafe utility that provides comprehensive
 * path traversal protection including URL-encoded pattern detection.
 *
 * @param {string} baseDir - The base directory that the path must be within
 * @param {string} filePath - The file path to validate
 * @returns {boolean} True if the path is safe, false if it attempts to escape the base directory
 *
 * @example
 * // Valid paths return true
 * isPathSafe('/app/public', 'favicon.png') // true
 * isPathSafe('/app/public', 'icons/favicon.png') // true
 *
 * // Path traversal attempts return false
 * isPathSafe('/app/public', '../etc/passwd') // false
 * isPathSafe('/app/public', '../../etc/passwd') // false
 * isPathSafe('/app/public', '/etc/passwd') // false
 */
export function isPathSafe(baseDir, filePath) {
  return isPathSafeImpl(baseDir, filePath)
}
