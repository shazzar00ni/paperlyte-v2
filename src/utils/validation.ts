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

  const domain = trimmedEmail.split('@')[1].toLowerCase()
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
 * Sanitize input to prevent XSS attacks
 */
export function sanitizeInput(input: string): string {
  if (!input) return ''

  let sanitized = input.trim()
  let prevLength: number

  // Remove angle brackets
  sanitized = sanitized.replace(/[<>]/g, '')

  // Dangerous protocols
  const dangerousProtocols = [
    /javascript\s*:/gi,
    /data\s*:/gi,
    /vbscript\s*:/gi,
    /file\s*:\/*/gi,
    /about\s*:/gi,
  ]

  let iterationCount = 0
  const maxIterations = 100

  dangerousProtocols.forEach((protocol) => {
    let prev
    iterationCount = 0
    do {
      prev = sanitized
      sanitized = sanitized.replace(protocol, '')
      iterationCount++
    } while (sanitized !== prev && iterationCount < maxIterations)
  })

  // Event handler sanitization (two-stage)
  prevLength = 0
  do {
    prevLength = sanitized.length
    sanitized = sanitized.replace(/on\w+\s*=/gi, '')
  } while (sanitized.length !== prevLength)

  const eventHandlers = [
    'click', 'dblclick',
    'mousedown', 'mouseup', 'mouseover', 'mousemove', 'mouseout', 'mouseenter', 'mouseleave',
    'keydown', 'keyup', 'keypress',
    'focus', 'blur', 'change', 'input', 'submit', 'reset', 'select',
    'load', 'unload', 'beforeunload', 'error', 'abort',
    'canplay', 'canplaythrough', 'play', 'playing', 'pause',
    'seeking', 'seeked', 'stalled', 'suspend', 'timeupdate', 'volumechange',
    'waiting', 'durationchange', 'emptied', 'ended',
    'loadeddata', 'loadedmetadata', 'progress', 'ratechange',
    'drag', 'dragstart', 'dragend', 'dragenter', 'dragleave', 'dragover', 'drop',
    'touchstart', 'touchmove', 'touchend', 'touchcancel',
    'pointerdown', 'pointermove', 'pointerup', 'pointercancel',
    'pointerover', 'pointerout', 'pointerenter', 'pointerleave',
    'resize', 'scroll', 'contextmenu', 'hashchange',
    'animationstart', 'animationend', 'animationiteration', 'transitionend',
    'wheel', 'copy', 'cut', 'paste',
  ]

  const eventHandlerPattern = new RegExp(`\\bon(?:${eventHandlers.join('|')})\\b`, 'gi')
  sanitized = sanitized.replace(eventHandlerPattern, '')

  // Encode entities
  sanitized = sanitized
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')

  sanitized = sanitized.trim().slice(0, 500)
  return sanitized
}

/**
 * Encode HTML entities safely
 */
export function encodeHtmlEntities(input: string): string {
  if (!input) return ''
  const element = document.createElement('div')
  element.textContent = input
  return element.innerHTML.slice(0, 500)
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

  if ('acceptTerms' in formData && !formData.acceptTerms) {
    errors.acceptTerms = 'You must accept the terms and conditions'
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
  return `${localPart}@${suggestion}`
}
