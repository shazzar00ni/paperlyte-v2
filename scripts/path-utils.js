/**
 * Path Utilities for Build Scripts
 * 
 * Provides secure path handling utilities to prevent path traversal attacks
 * in build and generation scripts.
 */

import { resolve, sep } from 'path'

/**
 * Validates that a file path is within a specified base directory
 * Prevents path traversal attacks by ensuring the resolved path doesn't escape the base directory
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
  const resolvedBase = resolve(baseDir)
  const resolvedPath = resolve(baseDir, filePath)
  
  // Check if the resolved path starts with the base directory or equals it
  // This ensures the path cannot escape outside the base directory
  // Use path.sep for cross-platform compatibility (handles both / and \\ separators)
  return resolvedPath === resolvedBase || resolvedPath.startsWith(resolvedBase + sep)
}
