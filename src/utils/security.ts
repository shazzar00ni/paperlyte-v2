/**
 * Security utilities for preventing common vulnerabilities
 * Shared utilities used across the application
 */

/**
 * Property names that can be used for prototype pollution attacks
 * These keys are blocked from dynamic property assignment
 */
const DANGEROUS_PROPERTY_KEYS = new Set(['__proto__', 'constructor', 'prototype'])

/**
 * Check if a key is safe to use for dynamic property assignment
 * Prevents prototype pollution by blocking dangerous property names
 *
 * @param key - The property key to validate
 * @returns True if the key is safe to use, false otherwise
 *
 * @example
 * ```ts
 * const obj: Record<string, unknown> = {}
 * const key = '__proto__'
 *
 * if (isSafePropertyKey(key)) {
 *   obj[key] = value // This won't execute because __proto__ is dangerous
 * }
 * ```
 */
export function isSafePropertyKey(key: string): boolean {
  return !DANGEROUS_PROPERTY_KEYS.has(key)
}
