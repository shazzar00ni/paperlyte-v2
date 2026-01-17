/**
 * Path and Filename Validation Utilities
 *
 * Shared utilities for validating paths and filenames to prevent path traversal attacks.
 * These utilities implement defense-in-depth security checks.
 */

import { resolve, normalize, isAbsolute, sep } from 'path'

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
  // Combined check for all unsafe patterns (reduces cyclomatic complexity)
  const unsafePatterns = ['..', '/', '\\', '%2e%2e', '%2f', '%5c', '\0', '%00']
  return !unsafePatterns.some((pattern) => filename.includes(pattern))
}

/**
 * Validates that a file path is safe and doesn't contain path traversal patterns.
 * This function performs comprehensive validation to prevent directory traversal attacks.
 *
 * Security measures:
 * - Checks for URL-encoded traversal patterns before normalization
 * - Normalizes path to handle obfuscated traversal attempts (e.g., ".//../file")
 * - Rejects absolute paths (must be relative)
 * - Ensures resolved path stays within the current working directory
 * - Uses path.sep to prevent false positives (e.g., "/project" vs "/project-other")
 *
 * @param {string} filePath - The file path to validate
 * @returns {boolean} True if the path is safe, false otherwise
 *
 * @example
 * ```javascript
 * isPathSafe('docs/file.md')         // true - safe relative path
 * isPathSafe('../etc/passwd')        // false - traversal attempt
 * isPathSafe('/etc/passwd')          // false - absolute path
 * isPathSafe('docs/../../etc/passwd') // false - normalized to traversal
 * ```
 */
export function isPathSafe(filePath) {
  // Check for URL-encoded traversal patterns before normalization
  if (filePath.includes('%2e%2e') || filePath.includes('%2e%2e%2f')) {
    return false
  }

  // Normalize and resolve the path first to handle obfuscated traversal attempts
  const normalizedPath = normalize(filePath)

  // After normalization, reject absolute paths
  if (isAbsolute(normalizedPath)) {
    return false
  }

  // Safe: This IS the security validation code. We resolve the path to verify it stays within cwd.
  const resolvedPath = resolve(process.cwd(), normalizedPath) // nosemgrep: javascript.lang.security.audit.path-traversal.path-join-resolve-traversal.path-join-resolve-traversal
  const cwdPath = resolve(process.cwd())

  // Ensure the resolved path is within the project directory
  // Use path.sep to prevent false positives (e.g., "/project-other" matching "/project")
  return resolvedPath === cwdPath || resolvedPath.startsWith(cwdPath + sep)
}
