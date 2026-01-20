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
  // Validate inputs
  if (typeof baseDir !== 'string' || baseDir.trim() === '') {
    throw new Error('baseDir must be a non-empty string')
  }
  
  if (typeof filePath !== 'string') {
    throw new Error('filePath must be a string')
  }
  
  // Empty string or whitespace-only paths are not allowed
  if (filePath.trim() === '') {
    return false
  }
  
  // Security Note: The path.resolve() calls below are NOT vulnerable to path traversal.
  // They are the SECURITY VALIDATION mechanism that prevents path traversal attacks.
  // These resolve paths to absolute form so we can verify the resolved path stays within baseDir.
  // nosemgrep: javascript.lang.security.audit.path-traversal.path-join-resolve-traversal
  // codacy-disable-line path-traversal
  const resolvedBase = resolve(baseDir)
  // nosemgrep: javascript.lang.security.audit.path-traversal.path-join-resolve-traversal
  // codacy-disable-line path-traversal
  const resolvedPath = resolve(baseDir, filePath)
  
  // Check if the resolved path starts with the base directory or equals it
  // This ensures the path cannot escape outside the base directory
  // Use path.sep for cross-platform compatibility (handles both / and \\ separators)
  return resolvedPath === resolvedBase || resolvedPath.startsWith(resolvedBase + sep)
}