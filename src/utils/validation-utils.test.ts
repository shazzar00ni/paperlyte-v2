import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { debounce, escapeRegExp } from './validation'

describe('debounce', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should delay function execution', () => {
    const mockFn = vi.fn()
    const debouncedFn = debounce(mockFn, 300)

    debouncedFn('test')
    expect(mockFn).not.toHaveBeenCalled()

    vi.advanceTimersByTime(300)
    expect(mockFn).toHaveBeenCalledWith('test')
    expect(mockFn).toHaveBeenCalledTimes(1)
  })

  it('should cancel previous execution on rapid calls', () => {
    const mockFn = vi.fn()
    const debouncedFn = debounce(mockFn, 300)

    debouncedFn('call1')
    vi.advanceTimersByTime(100)

    debouncedFn('call2')
    vi.advanceTimersByTime(100)

    debouncedFn('call3')
    vi.advanceTimersByTime(300)

    // Should only be called once with the last value
    expect(mockFn).toHaveBeenCalledTimes(1)
    expect(mockFn).toHaveBeenCalledWith('call3')
  })

  it('should execute multiple times if delay elapses between calls', () => {
    const mockFn = vi.fn()
    const debouncedFn = debounce(mockFn, 300)

    debouncedFn('call1')
    vi.advanceTimersByTime(300)
    expect(mockFn).toHaveBeenCalledWith('call1')

    debouncedFn('call2')
    vi.advanceTimersByTime(300)
    expect(mockFn).toHaveBeenCalledWith('call2')

    expect(mockFn).toHaveBeenCalledTimes(2)
  })

  it('should preserve function arguments', () => {
    const mockFn = vi.fn()
    const debouncedFn = debounce(mockFn, 300)

    debouncedFn('arg1', 'arg2', 123)
    vi.advanceTimersByTime(300)

    expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2', 123)
  })

  it('should handle zero delay', () => {
    const mockFn = vi.fn()
    const debouncedFn = debounce(mockFn, 0)

    debouncedFn('test')
    vi.advanceTimersByTime(0)

    expect(mockFn).toHaveBeenCalledWith('test')
  })
})

describe('escapeRegExp', () => {
  it('should escape all special regex characters', () => {
    const specialChars = '\\^$*+?.()|[]{}'
    const escaped = escapeRegExp(specialChars)
    expect(escaped).toBe('\\\\\\^\\$\\*\\+\\?\\.\\(\\)\\|\\[\\]\\{\\}')
  })

  it('should handle empty strings', () => {
    expect(escapeRegExp('')).toBe('')
  })

  it('should not modify strings without special characters', () => {
    const str = 'HelloWorld123'
    expect(escapeRegExp(str)).toBe(str)
  })

  it('should escape parentheses correctly', () => {
    const str = 'Hello (world)'
    const escaped = escapeRegExp(str)
    expect(escaped).toBe('Hello \\(world\\)')

    // Verify it works in a RegExp
    const regex = new RegExp(escaped)
    expect(regex.test('Hello (world)')).toBe(true)
    expect(regex.test('Hello world')).toBe(false)
  })

  it('should escape dots correctly', () => {
    const str = 'test.example.com'
    const escaped = escapeRegExp(str)
    expect(escaped).toBe('test\\.example\\.com')

    // Verify it matches literally
    const regex = new RegExp(escaped)
    expect(regex.test('test.example.com')).toBe(true)
    expect(regex.test('testXexampleXcom')).toBe(false)
  })

  it('should handle literal strings with repeated characters', () => {
    // Test that repeated characters are treated as literals
    const str = 'a'.repeat(50) + 'b'
    const escaped = escapeRegExp(str)

    // Should still be safe and usable
    const regex = new RegExp(escaped)
    expect(regex.test(str)).toBe(true)

    // Should not match similar but different strings
    const almostMatch = 'a'.repeat(49) + 'b'
    expect(regex.test(almostMatch)).toBe(false)
  })

  it('should escape square brackets correctly', () => {
    const str = 'array[0]'
    const escaped = escapeRegExp(str)
    expect(escaped).toBe('array\\[0\\]')

    const regex = new RegExp(escaped)
    expect(regex.test('array[0]')).toBe(true)
  })

  it('should escape curly braces correctly', () => {
    const str = 'object{key}'
    const escaped = escapeRegExp(str)
    expect(escaped).toBe('object\\{key\\}')

    const regex = new RegExp(escaped)
    expect(regex.test('object{key}')).toBe(true)
  })

  it('should escape pipe character correctly', () => {
    const str = 'option1|option2'
    const escaped = escapeRegExp(str)
    expect(escaped).toBe('option1\\|option2')

    const regex = new RegExp(escaped)
    expect(regex.test('option1|option2')).toBe(true)
    expect(regex.test('option1')).toBe(false)
  })

  it('should escape asterisk and plus correctly', () => {
    const str = 'C++ and C*'
    const escaped = escapeRegExp(str)
    expect(escaped).toBe('C\\+\\+ and C\\*')

    const regex = new RegExp(escaped)
    expect(regex.test('C++ and C*')).toBe(true)
  })

  it('should escape question mark correctly', () => {
    const str = 'Is this working?'
    const escaped = escapeRegExp(str)
    expect(escaped).toBe('Is this working\\?')

    const regex = new RegExp(escaped)
    expect(regex.test('Is this working?')).toBe(true)
  })

  it('should handle competitor names from COMPETITORS constant', () => {
    // Test with actual competitor names
    const competitors = ['Paperlyte', 'Notion', 'Evernote', 'OneNote']

    competitors.forEach((name) => {
      const escaped = escapeRegExp(name)
      const regex = new RegExp(escaped)
      expect(regex.test(name)).toBe(true)
    })
  })

  it('should escape patterns that would cause ReDoS if unescaped', () => {
    // Test various patterns that could cause ReDoS if used as regex without escaping
    const dangerousPatterns = ['(a+)+b', '(a|a)*b', '(a|ab)*c', 'a{50}b', '.*.*.*.*.*.*x']

    dangerousPatterns.forEach((pattern) => {
      const escaped = escapeRegExp(pattern)
      // Should escape the pattern and make it safe
      expect(escaped).toContain('\\')

      // Should match the literal string
      const regex = new RegExp(escaped)
      expect(regex.test(pattern)).toBe(true)
    })
  })
})
