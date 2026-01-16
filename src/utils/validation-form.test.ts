import { describe, it, expect } from 'vitest'
import { validateForm } from './validation'

describe('validateForm', () => {
  it('should validate form with all valid fields', () => {
    const formData = {
      email: 'user@example.com',
      name: 'John Doe',
      acceptTerms: true,
    }

    const result = validateForm(formData)
    expect(result.isValid).toBe(true)
    expect(Object.keys(result.errors).length).toBe(0)
  })

  it('should return errors for invalid email', () => {
    const formData = {
      email: 'invalid-email',
      name: 'John Doe',
      acceptTerms: true,
    }

    const result = validateForm(formData)
    expect(result.isValid).toBe(false)
    expect(result.errors.email).toBeDefined()
  })

  it('should return errors for invalid name', () => {
    const formData = {
      email: 'user@example.com',
      name: 'J',
      acceptTerms: true,
    }

    const result = validateForm(formData)
    expect(result.isValid).toBe(false)
    expect(result.errors.name).toContain('at least 2 characters')
  })

  it('should return errors for name that is too long', () => {
    const formData = {
      email: 'user@example.com',
      name: 'a'.repeat(101),
      acceptTerms: true,
    }

    const result = validateForm(formData)
    expect(result.isValid).toBe(false)
    expect(result.errors.name).toContain('too long')
  })

  it('should return errors when terms are not accepted', () => {
    const formData = {
      email: 'user@example.com',
      name: 'John Doe',
      acceptTerms: false,
    }

    const result = validateForm(formData)
    expect(result.isValid).toBe(false)
    expect(result.errors.acceptTerms).toContain('accept the terms')
  })

  it('should return multiple errors when multiple fields are invalid', () => {
    const formData = {
      email: 'invalid',
      name: 'J',
      acceptTerms: false,
    }

    const result = validateForm(formData)
    expect(result.isValid).toBe(false)
    expect(Object.keys(result.errors).length).toBeGreaterThan(1)
  })

  it('should handle non-string email with type guard error', () => {
    // Intentionally pass wrong type to test runtime type guard
    const formData = {
      email: 12345 as unknown as string, // Type cast to bypass TS checking
      name: 'John Doe',
      acceptTerms: true,
    }

    const result = validateForm(formData)
    expect(result.isValid).toBe(false)
    expect(result.errors.email).toBe('Email must be a string')
  })

  it('should handle non-string name with type guard error', () => {
    // Intentionally pass wrong type to test runtime type guard
    const formData = {
      email: 'user@example.com',
      name: { firstName: 'John', lastName: 'Doe' } as unknown as string, // Type cast to bypass TS checking
      acceptTerms: true,
    }

    const result = validateForm(formData)
    expect(result.isValid).toBe(false)
    expect(result.errors.name).toBe('Name must be a string')
  })

  it('should handle multiple type guard violations', () => {
    const formData = {
      email: ['test@example.com'] as unknown as string, // Array instead of string
      name: 123 as unknown as string, // Number instead of string
      acceptTerms: true,
    }

    const result = validateForm(formData)
    expect(result.isValid).toBe(false)
    expect(result.errors.email).toBe('Email must be a string')
    expect(result.errors.name).toBe('Name must be a string')
    expect(Object.keys(result.errors).length).toBe(2)
  })
})
