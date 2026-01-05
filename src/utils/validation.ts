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
 * Email validation regex pattern
 * Follows RFC 5322 simplified pattern for practical use
 */
const EMAIL_REGEX =
  /^[a-zA-Z0-9]+(?:[._+-][a-zA-Z0-9]+)*@[a-zA-Z0-9]+(?:[.-][a-zA-Z0-9]+)*\.[a-zA-Z]{2,}$/

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
 * Validate email address format
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
 * Normalize email
 */
export function normalizeEmail(email: string): string | null {
  const validation = validateEmail(email)
  if (!validation.isValid) return null
  return email.trim().toLowerCase()
}

/**
 * Placeholder for MX record validation
 */
export async function validateEmailDomain(email: string): Promise<boolean> {
  const validation = validateEmail(email)
  return validation.isValid
}

/**
 * Debounce utility
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
 * Maximum iterations for sanitization loops to prevent DoS attacks
 */
const MAX_SANITIZATION_ITERATIONS = 100

/**
 * Helper function to iteratively apply a replacement pattern
 * Continues until no more matches or iteration limit is reached
 *
 * Note: This function requires a global RegExp. If the pattern is not global,
 * it will be normalized by creating a new RegExp with the global flag added.
 *
 * @param input - String to sanitize
 * @param pattern - Regex pattern to replace (will be normalized to global if needed)
 * @param replacement - Replacement string (default: empty string)
 * @returns Sanitized string
 */
function iterativeReplace(input: string, pattern: RegExp, replacement = ''): string {
  // Ensure pattern has global flag for efficient replacement
  const globalPattern = pattern.global
    ? pattern
    : new RegExp(pattern.source, pattern.flags + 'g')

  // Early exit if pattern doesn't match to avoid unnecessary iteration
  if (!globalPattern.test(input)) {
    return input
  }

  let sanitized = input
  let prevValue
  let iterations = 0

  do {
    prevValue = sanitized
    sanitized = sanitized.replace(globalPattern, replacement)
    iterations++
  } while (sanitized !== prevValue && iterations < MAX_SANITIZATION_ITERATIONS)

  return sanitized
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

  // Iteratively remove dangerous protocols to prevent bypasses like 'jajavascript:vascript:'
  sanitized = iterativeReplace(
    sanitized,
    /(javascript|data|vbscript|file|about)\s*:\/*/gi
  )

  // Iteratively remove event handlers to prevent bypasses like 'ononclick='
  sanitized = iterativeReplace(sanitized, /\bon\w+\s*=/gi)

  // Encode HTML entities
  sanitized = sanitized
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')

  // Limit length to prevent buffer overflow
  return sanitized.trim().slice(0, 500)
}

/**
 * Validate form data
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
 * Suggest corrections for common email typos
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
