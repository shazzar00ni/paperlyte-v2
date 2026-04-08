/**
 * Tests for regexHelpers.ts (src/utils/test/regexHelpers.ts)
 *
 * regexHelpers.ts re-exports `escapeRegExp` from @utils/validation.
 * These tests verify that the re-export works correctly and that the
 * function behaves as documented.
 */
import { describe, it, expect } from 'vitest'
import { escapeRegExp } from './regexHelpers'

describe('regexHelpers / escapeRegExp', () => {
  // ----------------------------------------------------------------
  // Basic escaping
  // ----------------------------------------------------------------
  it('escapes backslash characters', () => {
    expect(escapeRegExp('a\\b')).toBe('a\\\\b')
  })

  it('escapes caret ^', () => {
    expect(escapeRegExp('^start')).toBe('\\^start')
  })

  it('escapes dollar sign $', () => {
    expect(escapeRegExp('end$')).toBe('end\\$')
  })

  it('escapes asterisk *', () => {
    expect(escapeRegExp('a*b')).toBe('a\\*b')
  })

  it('escapes plus +', () => {
    expect(escapeRegExp('a+b')).toBe('a\\+b')
  })

  it('escapes question mark ?', () => {
    expect(escapeRegExp('a?b')).toBe('a\\?b')
  })

  it('escapes period .', () => {
    expect(escapeRegExp('a.b')).toBe('a\\.b')
  })

  it('escapes opening parenthesis (', () => {
    expect(escapeRegExp('f(x)')).toBe('f\\(x\\)')
  })

  it('escapes closing parenthesis )', () => {
    expect(escapeRegExp('(test)')).toBe('\\(test\\)')
  })

  it('escapes opening square bracket [', () => {
    expect(escapeRegExp('[abc]')).toBe('\\[abc\\]')
  })

  it('escapes closing square bracket ]', () => {
    expect(escapeRegExp('a]b')).toBe('a\\]b')
  })

  it('escapes opening curly brace {', () => {
    expect(escapeRegExp('a{3}')).toBe('a\\{3\\}')
  })

  it('escapes closing curly brace }', () => {
    expect(escapeRegExp('a}b')).toBe('a\\}b')
  })

  it('escapes pipe |', () => {
    expect(escapeRegExp('a|b')).toBe('a\\|b')
  })

  // ----------------------------------------------------------------
  // Edge cases
  // ----------------------------------------------------------------
  it('returns empty string for empty input', () => {
    expect(escapeRegExp('')).toBe('')
  })

  it('returns empty string for falsy null-like input', () => {
    // The function guards with `if (!str) return ''`
    expect(escapeRegExp(null as unknown as string)).toBe('')
    expect(escapeRegExp(undefined as unknown as string)).toBe('')
  })

  it('does not alter alphanumeric strings', () => {
    const input = 'HelloWorld123'
    expect(escapeRegExp(input)).toBe(input)
  })

  it('does not alter strings with only whitespace', () => {
    expect(escapeRegExp('   ')).toBe('   ')
  })

  // ----------------------------------------------------------------
  // Practical use-cases – the escaped string works inside RegExp
  // ----------------------------------------------------------------
  it('allows matching literal dollar amounts in RegExp', () => {
    const userInput = 'What is $100?'
    const regex = new RegExp(escapeRegExp(userInput), 'i')
    expect(regex.test('What is $100?')).toBe(true)
    // Without escaping, '$100' has special meaning in a regex replacement context
    expect(regex.test('What is 100?')).toBe(false)
  })

  it('allows matching literal parentheses in RegExp', () => {
    const userInput = 'f(x) = x + 1'
    const regex = new RegExp(escapeRegExp(userInput))
    expect(regex.test('f(x) = x + 1')).toBe(true)
  })

  it('allows matching literal dots in RegExp', () => {
    const userInput = 'version 1.0.0'
    const regex = new RegExp(escapeRegExp(userInput))
    // Without escaping, "1.0.0" would match "1X0X0"; with escaping it should not
    expect(regex.test('version 1.0.0')).toBe(true)
    expect(regex.test('version 1X0X0')).toBe(false)
  })

  it('allows matching a URL with special characters', () => {
    const url = 'https://example.com/path?q=a+b&foo=bar'
    const regex = new RegExp(escapeRegExp(url))
    expect(regex.test('https://example.com/path?q=a+b&foo=bar')).toBe(true)
  })

  it('escapes multiple consecutive special characters', () => {
    const input = '.*+'
    expect(escapeRegExp(input)).toBe('\\.\\*\\+')
  })

  it('escapes a complex regex-like string', () => {
    const input = '(a|b){2,3}[0-9]+'
    const escaped = escapeRegExp(input)
    // The escaped version should be a valid regex that matches the literal string
    const regex = new RegExp(escaped)
    expect(regex.test('(a|b){2,3}[0-9]+')).toBe(true)
    expect(regex.test('aabb0123')).toBe(false)
  })
})
