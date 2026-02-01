/**
 * Test suite for path traversal protection utilities
 * Ensures that malicious path inputs are properly blocked
 */

import { describe, it, expect } from 'vitest'
import { isPathSafe } from '../path-utils.js'

describe('Path Traversal Protection', () => {
  describe('Valid paths (should be allowed)', () => {
    it('should allow simple filename', () => {
      expect(isPathSafe('/tmp/test', 'favicon.png')).toBe(true)
    })

    it('should allow file in subdirectory', () => {
      expect(isPathSafe('/tmp/test', 'subdir/favicon.png')).toBe(true)
    })

    it('should allow file in nested subdirectory', () => {
      expect(isPathSafe('/tmp/test', 'icons/16x16/favicon.png')).toBe(true)
    })

    it('should allow current directory reference', () => {
      expect(isPathSafe('/tmp/test', '.')).toBe(true)
    })

    it('should allow real-world icon filename', () => {
      expect(isPathSafe('/app/public', 'favicon-16x16.png')).toBe(true)
    })

    it('should allow real-world icon with format extension', () => {
      expect(isPathSafe('/app/public', 'android-chrome-512x512.webp')).toBe(true)
    })
  })

  describe('Malicious paths (should be blocked)', () => {
    it('should block parent directory traversal', () => {
      expect(isPathSafe('/tmp/test', '../favicon.png')).toBe(false)
    })

    it('should block multiple parent directory traversal', () => {
      expect(isPathSafe('/tmp/test', '../../etc/passwd')).toBe(false)
    })

    it('should block absolute path', () => {
      expect(isPathSafe('/tmp/test', '/etc/passwd')).toBe(false)
    })

    it('should block deep traversal attempt', () => {
      expect(isPathSafe('/tmp/test', '../../../etc/passwd')).toBe(false)
    })

    it('should block traversal with subdirectory prefix', () => {
      expect(isPathSafe('/tmp/test', 'subdir/../../etc/passwd')).toBe(false)
    })
  })

  describe('Edge cases and invalid inputs', () => {
    it('should reject empty string path', () => {
      expect(isPathSafe('/tmp/test', '')).toBe(false)
    })

    it('should reject whitespace-only path', () => {
      expect(isPathSafe('/tmp/test', '   ')).toBe(false)
    })

    it('should throw error for empty baseDir', () => {
      expect(() => isPathSafe('', 'test.txt')).toThrow('baseDir must be a non-empty string')
    })

    it('should throw error for non-string filePath', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(() => isPathSafe('/tmp/test', null as any)).toThrow('filePath must be a string')
    })

    it('should throw error for undefined filePath', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(() => isPathSafe('/tmp/test', undefined as any)).toThrow('filePath must be a string')
    })
  })
})
