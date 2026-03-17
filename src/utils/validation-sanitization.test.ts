import { describe, it, expect } from 'vitest'
import { sanitizeInput, encodeHtmlEntities } from './validation'

describe('sanitizeInput', () => {
  it('should remove HTML tags', () => {
    // Note: quotes and ampersands are encoded as HTML entities
    expect(sanitizeInput('<script>alert("xss")</script>')).toBe(
      'scriptalert(&quot;xss&quot;)/script'
    )
    expect(sanitizeInput('<div>Hello</div>')).toBe('divHello/div')
  })

  it('should remove javascript: protocol', () => {
    expect(sanitizeInput('javascript:alert("xss")')).toBe('alert(&quot;xss&quot;)')
    expect(sanitizeInput('JAVASCRIPT:alert("xss")')).toBe('alert(&quot;xss&quot;)')
  })

  it('should remove data: protocol', () => {
    expect(sanitizeInput('data:text/html,<script>alert("xss")</script>')).toBe(
      'text/html,scriptalert(&quot;xss&quot;)/script'
    )
    expect(sanitizeInput('DATA:text/plain,test')).toBe('text/plain,test')
  })

  it('should remove vbscript: protocol', () => {
    expect(sanitizeInput('vbscript:msgbox("xss")')).toBe('msgbox(&quot;xss&quot;)')
    expect(sanitizeInput('VBSCRIPT:msgbox("xss")')).toBe('msgbox(&quot;xss&quot;)')
  })

  it('should remove file: and about: protocols', () => {
    // Note: file:/// removes protocol AND all slashes for safety
    expect(sanitizeInput('file:///etc/passwd')).toBe('etc/passwd')
    expect(sanitizeInput('about:blank')).toBe('blank')
  })

  it('should prevent bypass attacks with nested protocols', () => {
    // Test for "jajavascript:vascript:" bypass - removes all "javascript:" instances iteratively
    expect(sanitizeInput('jajavascript:vascript:alert("xss")')).toBe('alert(&quot;xss&quot;)')
    // Test for "daddata:ata:" bypass - removes all "data:" instances, leaving harmless "da" prefix
    expect(sanitizeInput('daddata:ata:text/html,malicious')).toBe('datext/html,malicious')
    // Test for "vbvbscript:script:" bypass - removes all "vbscript:" instances iteratively
    expect(sanitizeInput('vbvbscript:script:msgbox("xss")')).toBe('msgbox(&quot;xss&quot;)')
    // Test for mixed case nested bypass
    expect(sanitizeInput('jaJAVASCRIPT:vascript:alert(1)')).toBe('alert(1)')
    // Test for multiple layers of nesting (javajavascript:script: -> javascript: -> empty)
    expect(sanitizeInput('javajavascript:script:alert(1)')).toBe('alert(1)')
    // Verify the dangerous protocols are completely removed
    expect(sanitizeInput('daddata:ata:text/html')).not.toContain('data:')
    expect(sanitizeInput('jajavascript:vascript:alert')).not.toContain('javascript:')
    expect(sanitizeInput('vbvbscript:script:msgbox')).not.toContain('vbscript:')
  })

  it('should remove event handlers', () => {
    expect(sanitizeInput('onclick=alert(1)')).toBe('alert(1)')
    expect(sanitizeInput('onload=malicious()')).toBe('malicious()')
    expect(sanitizeInput('onerror=bad()')).toBe('bad()')
  })

  it('should remove event handlers with spaces', () => {
    expect(sanitizeInput('onclick = alert(1)')).toBe('alert(1)')
    expect(sanitizeInput('onload  =  malicious()')).toBe('malicious()')
  })

  it('should encode HTML entities', () => {
    expect(sanitizeInput('test & check')).toBe('test &amp; check')
    expect(sanitizeInput('say "hello"')).toBe('say &quot;hello&quot;')
    expect(sanitizeInput("it's")).toBe('it&#x27;s')
  })

  it('should handle nested/repeated attack patterns', () => {
    // Test nested onclick pattern (ononclick= becomes onclick= after first pass)
    expect(sanitizeInput('ononclick=alert(1)')).toBe('alert(1)')
    // Test multiple nested patterns
    expect(sanitizeInput('onononclick=alert(1)')).toBe('alert(1)')
    // Test nested javascript: protocol
    expect(sanitizeInput('javascript:javascript:alert(1)')).toBe('alert(1)')
    // Test mixed nested patterns
    expect(sanitizeInput('ononmouseover=javascript:javascript:alert(1)')).toBe('alert(1)')
  })

  it('should prevent bypass attacks with nested event handlers', () => {
    // Greedy regex matching prevents simple nesting bypasses
    // "ononclick=" matches as one token, leaving "click=" which is harmless
    expect(sanitizeInput('ononclick=click=alert(1)')).toBe('click=alert(1)')
    // Multiple passes still remove all valid event handlers
    expect(sanitizeInput('onload=onclick=alert(1)')).toBe('alert(1)')
    // Verify dangerous event handlers are removed
    const result = sanitizeInput('onclick=onload=test')
    expect(result).not.toContain('onclick=')
    expect(result).not.toContain('onload=')
  })

  it('should handle deeply nested patterns without hanging', () => {
    // Create a deeply nested pattern (would require many iterations)
    const deeplyNested = 'ja'.repeat(20) + 'javascript:' + 'va'.repeat(20) + 'script:alert(1)'
    const result = sanitizeInput(deeplyNested)
    // Should complete without hanging (max 10 iterations)
    expect(result).toBeDefined()
    expect(result.length).toBeGreaterThan(0)
  })

  it('should trim whitespace', () => {
    expect(sanitizeInput('  hello  ')).toBe('hello')
  })

  it('should limit input length', () => {
    const longInput = 'a'.repeat(600)
    const result = sanitizeInput(longInput)
    expect(result.length).toBe(500)
  })

  it('should handle empty input', () => {
    expect(sanitizeInput('')).toBe('')
  })

  it('should handle complex XSS attempts', () => {
    const xss = '<img src=x onerror=alert(1)>'
    const result = sanitizeInput(xss)
    // Should remove < >, encode quotes, and remove onerror
    expect(result).not.toContain('<')
    expect(result).not.toContain('>')
    expect(result).not.toContain('onerror')
  })

  it('should prevent nested event handler bypass attacks', () => {
    // ononclick= should be fully removed, not leave onclick=
    expect(sanitizeInput('ononclick=alert(1)')).toBe('alert(1)')
    expect(sanitizeInput('onononclick=alert(1)')).toBe('alert(1)')
    expect(sanitizeInput('ononload=bad()')).toBe('bad()')
  })

  it('should prevent nested protocol bypass attacks', () => {
    // javascript:javascript: should be fully removed
    expect(sanitizeInput('javascript:javascript:alert(1)')).toBe('alert(1)')
    expect(sanitizeInput('jajavascript:vascript:alert(1)')).toBe('alert(1)')
    expect(sanitizeInput('data:data:text/html,test')).toBe('text/html,test')
  })

  it('should handle deeply nested bypass attempts', () => {
    // Multiple layers of nesting
    expect(sanitizeInput('ononononclick=alert(1)')).toBe('alert(1)')
    expect(sanitizeInput('jajajavascript:vascript:vascript:alert(1)')).toBe('alert(1)')
  })

  it('should preserve legitimate words beginning with "on"', () => {
    // Common legitimate words that start with "on"
    expect(sanitizeInput('information')).toBe('information')
    expect(sanitizeInput('Online')).toBe('Online')
    expect(sanitizeInput('ongoing')).toBe('ongoing')
    expect(sanitizeInput('onboard')).toBe('onboard')
    expect(sanitizeInput('once')).toBe('once')
    expect(sanitizeInput('one')).toBe('one')
    expect(sanitizeInput('only')).toBe('only')
  })

  it('should preserve phrases containing words with "on"', () => {
    expect(sanitizeInput('based on research')).toBe('based on research')
    expect(sanitizeInput('John Online is my name')).toBe('John Online is my name')
    expect(sanitizeInput('The ongoing discussion')).toBe('The ongoing discussion')
    expect(sanitizeInput('We are onboarding new users')).toBe('We are onboarding new users')
    expect(sanitizeInput('This information is important')).toBe('This information is important')
  })

  it('should still remove event handlers while preserving legitimate text', () => {
    // Event handlers should be removed
    expect(sanitizeInput('information onclick=alert(1)')).toBe('information alert(1)')
    expect(sanitizeInput('Online onerror=bad()')).toBe('Online bad()')
    expect(sanitizeInput('Click here onclick=hack() for information')).toBe(
      'Click here hack() for information'
    )
  })
})

describe('encodeHtmlEntities', () => {
  it('should encode HTML special characters', () => {
    const result = encodeHtmlEntities('<script>alert("xss")</script>')
    expect(result).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;')
  })

  it('should preserve text content while encoding', () => {
    const result = encodeHtmlEntities('Hello <b>World</b>')
    expect(result).toBe('Hello &lt;b&gt;World&lt;/b&gt;')
  })

  it('should handle empty input', () => {
    expect(encodeHtmlEntities('')).toBe('')
  })

  it('should limit output length', () => {
    const longInput = 'a'.repeat(600)
    const result = encodeHtmlEntities(longInput)
    expect(result.length).toBe(500)
  })

  it('should encode ampersands', () => {
    const result = encodeHtmlEntities('Tom & Jerry')
    expect(result).toBe('Tom &amp; Jerry')
  })
})
