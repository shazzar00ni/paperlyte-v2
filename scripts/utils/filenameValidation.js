/**
 * Path and Filename Validation Utilities
 *
 * Shared utilities for validating paths and filenames to prevent path traversal attacks.
 * These utilities implement defense-in-depth security checks.
 */

import { resolve, normalize, isAbsolute, sep } from 'path';

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
  // Validate input type
  if (typeof filename !== 'string') {
    throw new Error('filename must be a string');
  }

  // Empty string or whitespace-only filenames are not allowed
  if (filename.trim() === '') {
    return false;
  }

  // Normalize to lowercase for case-insensitive URL-encoded pattern checks
  const lc = filename.toLowerCase();

  // Combined check for all unsafe patterns (reduces cyclomatic complexity)
  const unsafePatterns = ['..', '/', '\\', '%2e%2e', '%2f', '%5c', '\0', '%00'];
  return !unsafePatterns.some((pattern) => lc.includes(pattern));
}

/**
 * Normalizes function arguments for overloaded isPathSafe signature.
 * Handles both isPathSafe(filePath) and isPathSafe(baseDir, filePath).
 *
 * @param {string} baseDir - First argument (baseDir or filePath)
 * @param {string} [filePath] - Second argument (filePath or undefined)
 * @returns {{baseDir: string, filePath: string}} Normalized arguments
 * @private
 */
function normalizePathSafeArgs(baseDir, filePath) {
  if (filePath === undefined) {
    // Called with one argument: isPathSafe(filePath)
    return { baseDir: process.cwd(), filePath: baseDir };
  }
  // Called with two arguments: isPathSafe(baseDir, filePath)
  return { baseDir, filePath };
}

/**
 * Validates input parameters for path safety checks.
 * Throws errors for invalid inputs, returns false for empty paths.
 *
 * @param {string} baseDir - The base directory
 * @param {string} filePath - The file path
 * @returns {boolean} True if inputs are valid, false if path is empty
 * @throws {Error} If inputs are not strings or baseDir is empty
 * @private
 */
function validatePathInputs(baseDir, filePath) {
  if (typeof baseDir !== 'string' || baseDir.trim() === '') {
    throw new Error('baseDir must be a non-empty string');
  }

  if (typeof filePath !== 'string') {
    throw new Error('filePath must be a string');
  }

  if (filePath.trim() === '') {
    return false;
  }

  return true;
}

/**
 * Checks if a file path contains URL-encoded traversal patterns.
 *
 * @param {string} filePath - The file path to check
 * @returns {boolean} True if URL-encoded patterns are found, false otherwise
 * @private
 */
function hasUrlEncodedTraversal(filePath) {
  const lc = filePath.toLowerCase();
  const urlEncodedPatterns = ['%2e%2e', '%2e%2e%2f', '%2f', '%5c'];
  return urlEncodedPatterns.some((pattern) => lc.includes(pattern));
}

/**
 * Checks if a resolved path is within the specified base directory.
 *
 * @param {string} resolvedPath - The resolved absolute path
 * @param {string} resolvedBase - The resolved absolute base directory
 * @returns {boolean} True if path is within base directory, false otherwise
 * @private
 */
function isWithinBaseDir(resolvedPath, resolvedBase) {
  // Use path.sep to prevent false positives (e.g., "/project-other" matching "/project")
  return resolvedPath === resolvedBase || resolvedPath.startsWith(resolvedBase + sep);
}

/**
 * Validates that a file path is safe and doesn't contain path traversal patterns.
 * This function performs comprehensive validation to prevent directory traversal attacks.
 *
 * Security measures:
 * - Checks for URL-encoded traversal patterns before normalization
 * - Normalizes path to handle obfuscated traversal attempts (e.g., ".//../file")
 * - Rejects absolute paths (must be relative)
 * - Ensures resolved path stays within the specified base directory (or cwd if not specified)
 * - Uses path.sep to prevent false positives (e.g., "/project" vs "/project-other")
 *
 * @param {string} baseDir - The base directory that the path must be within (or filePath if called with one argument)
 * @param {string} [filePath] - The file path to validate (optional, if omitted baseDir is treated as filePath)
 * @returns {boolean} True if the path is safe, false otherwise
 *
 * @example
 * ```javascript
 * isPathSafe('docs/file.md')                       // true - safe relative path (against cwd)
 * isPathSafe('../etc/passwd')                      // false - traversal attempt
 * isPathSafe('/etc/passwd')                        // false - absolute path
 * isPathSafe('docs/../../etc/passwd')              // false - normalized to traversal
 * isPathSafe('/app/public', 'icons/logo.png')      // true - safe within specified base
 * ```
 */
export function isPathSafe(baseDir, filePath) {
  // Handle overloaded signature: isPathSafe(filePath) or isPathSafe(baseDir, filePath)
  const args = normalizePathSafeArgs(baseDir, filePath);
  baseDir = args.baseDir;
  filePath = args.filePath;

  // Validate inputs (returns false for empty paths, throws for invalid types)
  const inputsValid = validatePathInputs(baseDir, filePath);
  if (!inputsValid) {
    return false;
  }

  // Check for URL-encoded traversal patterns before normalization
  if (hasUrlEncodedTraversal(filePath)) {
    return false;
  }

  // Normalize and resolve the path to handle obfuscated traversal attempts
  const normalizedPath = normalize(filePath);

  // After normalization, reject absolute paths
  if (isAbsolute(normalizedPath)) {
    return false;
  }

  // Safe: This IS the security validation code. We resolve the path to verify it stays within baseDir.
  const resolvedPath = resolve(baseDir, normalizedPath); // nosemgrep: javascript.lang.security.audit.path-traversal.path-join-resolve-traversal.path-join-resolve-traversal
  const resolvedBase = resolve(baseDir); // nosemgrep: javascript.lang.security.audit.path-traversal.path-join-resolve-traversal.path-join-resolve-traversal

  // Ensure the resolved path is within the base directory
  return isWithinBaseDir(resolvedPath, resolvedBase);
}