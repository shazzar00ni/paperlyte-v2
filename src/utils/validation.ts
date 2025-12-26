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
 * Sanitize input to prevent XSS attacks
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
    sanitized = sanitized.replace(
      /(javascript|data|vbscript|file|about)\s*:\/*/gi,
      ''
    )
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
  sanitized = sanitized
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')

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
