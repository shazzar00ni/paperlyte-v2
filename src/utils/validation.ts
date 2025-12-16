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
 *
 * Pattern breakdown:
 * - Local part: alphanumeric, dots, hyphens, underscores, plus signs
 * - @ symbol required
 * - Domain: alphanumeric with dots and hyphens
 * - TLD: 2+ characters
 */
const EMAIL_REGEX = /^[a-zA-Z0-9._+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

/**
 * Common disposable email domains to block
 * Add more as needed for production use
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
 *
 * @param email - Email address to validate
 * @returns Validation result with error message if invalid
 *
 * @example
 * ```tsx
 * const result = validateEmail('user@example.com')
 * if (!result.isValid) {
 *   console.error(result.error)
 * }
 * ```
 */
export function validateEmail(email: string): EmailValidationResult {
  // Check if email is provided
  if (!email || email.trim() === '') {
    return {
      isValid: false,
      error: 'Email address is required',
    }
  }

  // Trim whitespace
  const trimmedEmail = email.trim()

  // Check basic format
  if (!EMAIL_REGEX.test(trimmedEmail)) {
    return {
      isValid: false,
      error: 'Please enter a valid email address',
    }
  }

  // Check for consecutive dots (invalid per RFC 5322)
  if (trimmedEmail.includes('..')) {
    return {
      isValid: false,
      error: 'Email address cannot contain consecutive dots',
    }
  }

  // Check length constraints
  if (trimmedEmail.length > 254) {
    return {
      isValid: false,
      error: 'Email address is too long',
    }
  }

  // Extract domain for additional validation
  const domain = trimmedEmail.split('@')[1].toLowerCase()

  // Check for disposable email domains
  if (DISPOSABLE_EMAIL_DOMAINS.includes(domain)) {
    return {
      isValid: false,
      error: 'Please use a permanent email address',
    }
  }

  return {
    isValid: true,
  }
}

/**
 * Validate email and return normalized version
 *
 * @param email - Email address to validate and normalize
 * @returns Normalized email or null if invalid
 *
 * @example
 * ```tsx
 * const email = normalizeEmail('  User@Example.COM  ')
 * // Returns: 'user@example.com'
 * ```
 */
export function normalizeEmail(email: string): string | null {
  const validation = validateEmail(email)

  if (!validation.isValid) {
    return null
  }

  // Normalize: trim, lowercase, remove unnecessary characters
  const trimmed = email.trim().toLowerCase()

  return trimmed
}

/**
 * Check if domain has valid MX records (DNS-based validation)
 * Note: This requires a backend service or API to check MX records
 * Frontend cannot directly query DNS for security reasons
 *
 * @param email - Email address to check
 * @returns Promise resolving to validation result
 *
 * @example
 * ```tsx
 * const isValid = await validateEmailDomain('user@example.com')
 * ```
 */
export async function validateEmailDomain(email: string): Promise<boolean> {
  // This is a placeholder for backend MX record validation
  // In production, call your backend API endpoint
  // Example: const response = await fetch('/api/validate-email-domain', { email })

  const validation = validateEmail(email)
  if (!validation.isValid) {
    return false
  }

  // For now, return true if basic validation passes
  // TODO: Implement backend MX record validation
  return true
}

/**
 * Debounce function for validation to avoid excessive calls
 *
 * @param func - Function to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced function
 *
 * @example
 * ```tsx
 * const debouncedValidate = debounce(validateEmail, 300)
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
 * Sanitize input to prevent XSS attacks
 * Removes HTML tags and dangerous characters
 *
 * @param input - User input to sanitize
 * @returns Sanitized string
 *
 * @example
 * ```tsx
 * const clean = sanitizeInput('<script>alert("xss")</script>')
 * // Returns: 'scriptalert("xss")/script'
 * ```
 */
export function sanitizeInput(input: string): string {
  if (!input) return ''

  let sanitized = input.trim()

  // Remove angle brackets
  sanitized = sanitized.replace(/[<>]/g, '')

  // Remove dangerous protocols iteratively to prevent bypass attacks
  // like "jajavascript:vascript:" which would become "javascript:" after one pass
  // Limit iterations to prevent DoS attacks with deeply nested payloads
  let previousValue = ''
  let iterations = 0
  const MAX_ITERATIONS = 10
  
  // Keep removing dangerous protocols until no more changes occur
  while (sanitized !== previousValue && iterations < MAX_ITERATIONS) {
    previousValue = sanitized
    sanitized = sanitized.replace(/(javascript|data|vbscript):/gi, '')
    iterations++
  }

  // Remove event handlers iteratively to prevent bypass attacks
  let prevEventValue = ''
  let eventIterations = 0
  while (sanitized !== prevEventValue && eventIterations < MAX_ITERATIONS) {
    prevEventValue = sanitized
    sanitized = sanitized.replace(/on\w+\s*=/gi, '')
    eventIterations++
  }

  // Limit length to prevent buffer overflow
  return sanitized.slice(0, 500)
}

/**
 * Validate form data with multiple fields
 *
 * @param formData - Object containing form field values
 * @returns Validation result with field-specific errors
 *
 * @example
 * ```tsx
 * const result = validateForm({
 *   email: 'user@example.com',
 *   name: 'John Doe',
 *   acceptTerms: true
 * })
 *
 * if (!result.isValid) {
 *   console.error(result.errors)
 * }
 * ```
 */
export function validateForm(formData: Record<string, unknown>): ValidationResult {
  const errors: Record<string, string> = {}

  // Validate email if present
  if ('email' in formData) {
    const emailValidation = validateEmail(formData.email as string)
    if (!emailValidation.isValid) {
      errors.email = emailValidation.error || 'Invalid email'
    }
  }

  // Validate name if present
  if ('name' in formData) {
    const name = formData.name as string
    const trimmedName = name?.trim() ?? ''
    if (trimmedName.length < 2) {
      errors.name = 'Name must be at least 2 characters'
    }
    if (trimmedName.length > 100) {
      errors.name = 'Name is too long'
    }
  }

  // Validate terms acceptance if present
  if ('acceptTerms' in formData && !formData.acceptTerms) {
    errors.acceptTerms = 'You must accept the terms and conditions'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

/**
 * Check for common typos in email domains and suggest corrections
 *
 * @param email - Email address to check
 * @returns Suggested correction or null if no typo detected
 *
 * @example
 * ```tsx
 * const suggestion = suggestEmailCorrection('user@gmial.com')
 * // Returns: 'user@gmail.com'
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
  if (suggestion) {
    const localPart = email.split('@')[0]
    return `${localPart}@${suggestion}`
  }

  return null
}
