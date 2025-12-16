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
 * Removes HTML tags, dangerous protocols, and event handlers
 *
 * SECURITY NOTE: This provides basic sanitization for text inputs like names and non-HTML fields.
 * For rich text or HTML content, use a dedicated library like DOMPurify.
 * For critical user-generated content, always sanitize on the backend as well.
 *
 * @param input - User input to sanitize
 * @returns Sanitized string with HTML entities encoded
 *
 * @example
 * ```tsx
 * const clean = sanitizeInput('<script>alert("xss")</script>')
 * // Returns: 'scriptalert(&quot;xss&quot;)/script'
 * // Note: angle brackets removed, quotes encoded as &quot;
 *
 * const clean2 = sanitizeInput('Hello & goodbye')
 * // Returns: 'Hello &amp; goodbye'
 * ```
 */
export function sanitizeInput(input: string): string {
  if (!input) return ''

  let sanitized = input.trim()
  let prevLength: number

  // Remove all HTML tags (< and > characters)
  sanitized = sanitized.replace(/[<>]/g, '')

  // Remove dangerous URL protocols (case-insensitive) with iterative removal to handle nested patterns
  // Covers: javascript:, data:, vbscript:, file:, about:
  const dangerousProtocols = [
    /javascript\s*:/gi,
    /data\s*:/gi,
    /vbscript\s*:/gi,
    /file\s*:\/*/gi, // Matches file: followed by any number of slashes
    /about\s*:/gi,
  ]

  // Repeatedly remove each protocol until none remain (handles nested patterns like javascript:javascript:)
  dangerousProtocols.forEach((protocol) => {
    do {
      prevLength = sanitized.length
      sanitized = sanitized.replace(protocol, '')
    } while (sanitized.length !== prevLength)
  })

  // Remove all event handler attributes (e.g., onclick=, onmouseover=, etc.)
  // Use iterative removal to prevent incomplete multi-character sanitization
  do {
    prevLength = sanitized.length
    sanitized = sanitized.replace(/on\w+\s*=/gi, '')
  } while (sanitized.length !== prevLength)

  // Encode any special HTML entities that might have been missed
  sanitized = sanitized.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;')

  // Trim any extra whitespace that may have been introduced during sanitization
  sanitized = sanitized.trim()

  // Limit length to prevent buffer overflow and excessive data
  sanitized = sanitized.slice(0, 500)

  return sanitized
}

/**
 * Alternative: HTML entity encoding (safe for displaying user input in HTML)
 * Use this when you need to preserve the input but display it safely
 *
 * @param input - User input to encode
 * @returns HTML-safe encoded string
 *
 * @example
 * ```tsx
 * const encoded = encodeHtmlEntities('<script>alert("xss")</script>')
 * // Returns: '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
 * ```
 */
export function encodeHtmlEntities(input: string): string {
  if (!input) return ''

  const element = document.createElement('div')
  element.textContent = input
  return element.innerHTML.slice(0, 500)
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
