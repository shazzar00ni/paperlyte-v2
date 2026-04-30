/**
 * Validation utilities for form inputs
 * Provides robust email validation and form state management
 */

/**
 * Email validation result
 */
export interface EmailValidationResult {
  isValid: boolean
  error?: string
}

/**
 * Form field validation result
 */
export interface ValidationResult {
  isValid: boolean
  errors: Record<string, string>
}

/**
 * Email validation regex pattern — single canonical source used by both client and server.
 * Follows RFC 5322 simplified pattern for practical use.
 * Prevents ReDoS vulnerabilities by eliminating quantifier overlap.
 * Pattern breakdown:
 * - Local part: single alphanumeric + (alphanumeric OR separator+alphanumeric)*
 * - Domain: single alphanumeric + (alphanumeric OR separator+alphanumeric)*
 * - TLD: at least 2 letters
 * This eliminates overlapping quantifiers by making choices mutually exclusive.
 */
export const EMAIL_REGEX =
  /^[a-zA-Z0-9](?:[a-zA-Z0-9]|[._+-][a-zA-Z0-9])*@[a-zA-Z0-9](?:[a-zA-Z0-9]|[.-][a-zA-Z0-9])*\.[a-zA-Z]{2,}$/

/**
 * Predicate wrapper around validateEmail.
 * Runs the same RFC 5322–simplified regex, length, and disposable-domain
 * checks — use this when you only need a boolean rather than an error message.
 *
 * @param email - The email address to validate
 * @returns true if the email passes all validation rules
 */
export function isValidEmail(email: string): boolean {
  return validateEmail(email).isValid
}

/**
 * Common disposable email domains to block
 */
const DISPOSABLE_EMAIL_DOMAINS = [
  'tempmail.com',
  'guerrillamail.com',
  'mailinator.com',
  '10minutemail.com',
  'throwaway.email',
  'temp-mail.org',
  'fakeinbox.com',
  'yopmail.com',
]

/**
 * Validates an email address against RFC 5322 simplified pattern
 * Checks for format, length limits, and blocks disposable email domains
 *
 * @param email - The email address to validate
 * @returns Validation result with isValid boolean and optional error message
 *
 * @example
 * ```tsx
 * const result = validateEmail('user@example.com')
 * if (result.isValid) {
 *   // Email is valid
 * } else {
 *   console.error(result.error)
 * }
 * ```
 */
export function validateEmail(email: string): EmailValidationResult {
  if (!email || email.trim() === '') {
    return { isValid: false, error: 'Email address is required' }
  }

  const trimmedEmail = email.trim()

  if (!EMAIL_REGEX.test(trimmedEmail)) {
    return { isValid: false, error: 'Please enter a valid email address' }
  }

  if (trimmedEmail.length > 254) {
    return { isValid: false, error: 'Email address is too long' }
  }

  // Extract domain safely with defensive checks
  const atIndex = trimmedEmail.lastIndexOf('@')
  if (atIndex === -1 || atIndex === trimmedEmail.length - 1) {
    return { isValid: false, error: 'Please enter a valid email address' }
  }

  const domain = trimmedEmail.substring(atIndex + 1).toLowerCase()
  if (DISPOSABLE_EMAIL_DOMAINS.includes(domain)) {
    return { isValid: false, error: 'Please use a permanent email address' }
  }

  return { isValid: true }
}

/**
 * Normalizes an email address by trimming whitespace and converting to lowercase
 * Returns null if the email is invalid
 *
 * @param email - The email address to normalize
 * @returns Normalized email address or null if invalid
 *
 * @example
 * ```tsx
 * const normalized = normalizeEmail('  User@Example.COM  ')
 * // Returns: 'user@example.com'
 * ```
 */
export function normalizeEmail(email: string): string | null {
  const validation = validateEmail(email)
  if (!validation.isValid) return null
  return email.trim().toLowerCase()
}

/**
 * Validates the domain of an email address
 * Currently uses basic format validation; can be extended with MX record checks
 *
 * @param email - The email address to validate
 * @returns Promise resolving to true if domain is valid, false otherwise
 *
 * @example
 * ```tsx
 * const isValid = await validateEmailDomain('user@example.com')
 * if (isValid) {
 *   // Domain is valid
 * }
 * ```
 */
export async function validateEmailDomain(email: string): Promise<boolean> {
  const validation = validateEmail(email)
  return validation.isValid
}

/**
 * Creates a debounced function that delays invoking the provided function
 * until after the specified delay has elapsed since the last invocation
 *
 * @param func - The function to debounce
 * @param delay - The delay in milliseconds
 * @returns Debounced version of the function
 *
 * @example
 * ```tsx
 * const handleSearch = debounce((query: string) => {
 *   console.log('Searching for:', query)
 * }, 300)
 *
 * // Will only execute once after 300ms of no calls
 * handleSearch('hello')
 * handleSearch('hello world') // Previous call cancelled
 * ```
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }
}

/**
 * Encode HTML entities for safe display
 * Preserves text structure by encoding special characters instead of removing them
 *
 * @param input - Text to encode
 * @returns Encoded text with HTML entities, trimmed and limited to 500 characters
 *
 * @example
 * ```tsx
 * const safe = encodeHtmlEntities('<script>alert("xss")</script>')
 * // Returns: '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
 *
 * const safe2 = encodeHtmlEntities('Tom & Jerry')
 * // Returns: 'Tom &amp; Jerry'
 * ```
 */
export function encodeHtmlEntities(input: string): string {
  if (!input) return ''

  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim()
    .slice(0, 500)
}

/**
 * Cleanse a user-provided string of common HTML/XSS injection vectors.
 *
 * Removes angle brackets, strips dangerous URI protocols (e.g., `javascript:`, `data:`),
 * removes event-handler attributes (e.g., `onClick=`), encodes `&`, `"` and `'`,
 * trims whitespace, and truncates the result to 500 characters.
 *
 * @param input - The raw input string to sanitize; may be empty or falsy.
 * @returns The sanitized string, or an empty string if `input` is falsy.
 */
export function sanitizeInput(input: string): string {
  if (!input) return ''

  let sanitized = input.trim()

  // Remove angle brackets early
  sanitized = sanitized.replace(/[<>]/g, '')

  const MAX_ITERATIONS = 10

  // --- Remove dangerous protocols iteratively ---
  let prevProtocolValue = ''
  let protocolIterations = 0

  while (sanitized !== prevProtocolValue && protocolIterations < MAX_ITERATIONS) {
    prevProtocolValue = sanitized
    sanitized = sanitized.replace(/(javascript|data|vbscript|file|about)\s*:\/*/gi, '')
    protocolIterations++
  }

  // --- Remove event handlers iteratively ---
  let prevEventValue = ''
  let eventIterations = 0

  while (sanitized !== prevEventValue && eventIterations < MAX_ITERATIONS) {
    prevEventValue = sanitized
    sanitized = sanitized.replace(/\bon\w+\s*=/gi, '')
    eventIterations++
  }

  // --- Encode HTML entities ---
  sanitized = sanitized.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;')

  return sanitized.trim().slice(0, 500)
}

/**
 * Validates form data including email, name, and terms acceptance
 * Checks type safety and field-specific validation rules
 *
 * @param formData - Object containing form field values
 * @returns Validation result with isValid boolean and errors object
 *
 * @example
 * ```tsx
 * const result = validateForm({
 *   email: 'user@example.com',
 *   name: 'John Doe',
 *   acceptTerms: true
 * })
 * if (!result.isValid) {
 *   console.error(result.errors)
 * }
 * ```
 */
export function validateForm(formData: Record<string, unknown>): ValidationResult {
  const errors: Record<string, string> = {}

  if ('email' in formData) {
    if (typeof formData.email !== 'string') {
      errors.email = 'Email must be a string'
    } else {
      const emailValidation = validateEmail(formData.email)
      if (!emailValidation.isValid) {
        errors.email = emailValidation.error || 'Invalid email'
      }
    }
  }

  if ('name' in formData) {
    if (typeof formData.name !== 'string') {
      errors.name = 'Name must be a string'
    } else {
      const trimmedName = formData.name.trim()
      if (trimmedName.length < 2) errors.name = 'Name must be at least 2 characters'
      if (trimmedName.length > 100) errors.name = 'Name is too long'
    }
  }

  if ('acceptTerms' in formData) {
    if (typeof formData.acceptTerms !== 'boolean') {
      errors.acceptTerms = 'Accept terms must be a boolean'
    } else if (!formData.acceptTerms) {
      errors.acceptTerms = 'You must accept the terms and conditions'
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

/**
 * Suggests corrections for common email domain typos
 * Helps users fix mistakes like gmial.com → gmail.com
 *
 * @param email - The email address to check for typos
 * @returns Corrected email address or null if no correction is suggested
 *
 * @example
 * ```tsx
 * const suggestion = suggestEmailCorrection('user@gmial.com')
 * // Returns: 'user@gmail.com'
 *
 * const noSuggestion = suggestEmailCorrection('user@gmail.com')
 * // Returns: null (already correct)
 * ```
 */
export function suggestEmailCorrection(email: string): string | null {
  const commonTypos: Record<string, string> = {
    'gmial.com': 'gmail.com',
    'gmai.com': 'gmail.com',
    'gnail.com': 'gmail.com',
    'yahooo.com': 'yahoo.com',
    'yaho.com': 'yahoo.com',
    'hotmial.com': 'hotmail.com',
    'outlok.com': 'outlook.com',
    'outloook.com': 'outlook.com',
  }

  const domain = email.split('@')[1]?.toLowerCase()
  if (!domain) return null

  const suggestion = commonTypos[domain]
  if (!suggestion) return null

  const localPart = email.split('@')[0]
  if (!localPart) return null
  return `${localPart}@${suggestion}`
}

/**
 * Escapes special regex characters in a string to make it safe for use in RegExp constructor
 *
 * This function prevents ReDoS (Regular Expression Denial of Service) attacks by escaping
 * all special regex metacharacters, ensuring the string is treated as a literal pattern.
 *
 * @param str - The string to escape
 * @returns The escaped string safe for use in RegExp constructor
 *
 * @example
 * ```tsx
 * const escaped = escapeRegExp('Hello (world)')
 * // Returns: 'Hello \\(world\\)'
 * const regex = new RegExp(escaped)
 * // Creates a regex that matches the literal string "Hello (world)"
 * ```
 */
export function escapeRegExp(str: string): string {
  if (!str) return ''
  // Escape all special regex characters: \ ^ $ * + ? . ( ) [ ] { } |
  return str.replace(/[\\^$*+?.()[\]{}|]/g, '\\$&')
}
