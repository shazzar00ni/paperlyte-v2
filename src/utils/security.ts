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

/**
 * Safely access a property from an object, preventing prototype pollution
 * Uses Object.prototype.hasOwnProperty.call to verify property ownership
 * and blocks dangerous keys
 *
 * This function uses multiple layers of protection:
 * 1. Validates key is not a prototype pollution vector (__proto__, constructor, prototype)
 * 2. Verifies property is own property, not inherited
 * 3. Uses Object.get/defineProperty for safer access without bracket notation
 *
 * @param obj - The object to access the property from
 * @param key - The property key to access
 * @returns The property value if safe and exists, undefined otherwise
 *
 * @example
 * ```ts
 * const icons = { 'icon-name': 'path data' }
 * const iconPath = safePropertyAccess(icons, 'icon-name') // Returns 'path data'
 * const badPath = safePropertyAccess(icons, '__proto__') // Returns undefined
 * ```
 */
export function safePropertyAccess<T>(obj: Record<string, T>, key: string): T | undefined {
  // First check if the key is safe
  if (!isSafePropertyKey(key)) {
    return undefined
  }

  // Use hasOwnProperty to verify this is the object's own property, not inherited
  if (Object.prototype.hasOwnProperty.call(obj, key)) {
    // Use Object.getOwnPropertyDescriptor for safer access without bracket notation
    // This avoids the direct obj[key] access that triggers security warnings
    const descriptor = Object.getOwnPropertyDescriptor(obj, key)
    return descriptor?.value as T | undefined
  }

  return undefined
}
