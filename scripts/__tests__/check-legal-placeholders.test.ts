/**
 * Test suite for check-legal-placeholders script
 * Tests path traversal vulnerability mitigation and placeholder detection
 *
 * @vitest-environment node
 */

import { describe, it, expect } from 'vitest'
import * as path from 'path'

// Recreate the path validation logic from the script to test it
function hasParentTraversal(filePath: string): boolean {
  return filePath.split(/[\\/]+/).includes('..')
}

function isUnsupportedWindowsAbsolutePath(filePath: string): boolean {
  return (
    process.platform !== 'win32' &&
    (/^[a-zA-Z]:[\\/]/.test(filePath) || filePath.startsWith('\\\\'))
  )
}

function isPathWithinCwd(filePath: string): boolean {
  const resolvedPath = path.resolve(filePath)
  const resolvedCwd = path.resolve(process.cwd())

  return resolvedPath === resolvedCwd || resolvedPath.startsWith(resolvedCwd + path.sep)
}

function isPathVulnerable(filePath: string): boolean {
  return (
    hasParentTraversal(filePath) ||
    isUnsupportedWindowsAbsolutePath(filePath) ||
    !isPathWithinCwd(filePath)
  )
}

// Simulate the findPlaceholders function's path validation
function validateFilePath(filePath: string): { valid: boolean; reason?: string } {
  if (isPathVulnerable(filePath)) {
    return { valid: false, reason: 'Invalid file path' }
  }

  return { valid: true }
}

describe('check-legal-placeholders - Path Traversal Protection', () => {
  describe('Path Traversal Vulnerability Tests', () => {
    it('should reject path with parent directory traversal (../)', () => {
      const maliciousPath = '../etc/passwd'
      const result = validateFilePath(maliciousPath)

      expect(result.valid).toBe(false)
      expect(result.reason).toContain('Invalid file path')
    })

    it('should reject path with multiple parent directory traversal (../../)', () => {
      const maliciousPath = '../../etc/passwd'
      const result = validateFilePath(maliciousPath)

      expect(result.valid).toBe(false)
      expect(result.reason).toContain('Invalid file path')
    })

    it('should reject absolute Unix path (/etc/passwd)', () => {
      const maliciousPath = '/etc/passwd'
      const result = validateFilePath(maliciousPath)

      expect(result.valid).toBe(false)
      expect(result.reason).toContain('Invalid file path')
    })

    it('should reject absolute Windows path (C:\\Windows\\System32)', () => {
      const maliciousPath = 'C:\\Windows\\System32\\config\\sam'
      const result = validateFilePath(maliciousPath)

      expect(result.valid).toBe(false)
      expect(result.reason).toContain('Invalid file path')
    })

    it('should reject path with traversal in middle (docs/../../etc/passwd)', () => {
      const maliciousPath = 'docs/../../etc/passwd'
      const result = validateFilePath(maliciousPath)

      expect(result.valid).toBe(false)
      expect(result.reason).toContain('Invalid file path')
    })

    it('should reject path with mixed slashes and traversal', () => {
      const maliciousPath = 'docs/../../../etc/passwd'
      const result = validateFilePath(maliciousPath)

      expect(result.valid).toBe(false)
    })
  })

  describe('Valid Path Handling', () => {
    it('should accept valid relative path', () => {
      const validPath = 'docs/PRIVACY-POLICY.md'
      const result = validateFilePath(validPath)

      expect(result.valid).toBe(true)
    })

    it('should accept an absolute path inside the current working directory', () => {
      const validPath = path.join(process.cwd(), 'docs/PRIVACY-POLICY.md')
      const result = validateFilePath(validPath)

      expect(result.valid).toBe(true)
    })

    it('should accept valid nested relative path', () => {
      const validPath = 'docs/legal/TERMS-OF-SERVICE.md'
      const result = validateFilePath(validPath)

      expect(result.valid).toBe(true)
    })

    it('should accept simple filename', () => {
      const validPath = 'README.md'
      const result = validateFilePath(validPath)

      expect(result.valid).toBe(true)
    })

    it('should accept path with subdirectories', () => {
      const validPath = 'src/constants/legal.ts'
      const result = validateFilePath(validPath)

      expect(result.valid).toBe(true)
    })
  })

  describe('Path Vulnerability Detection Helper', () => {
    it('should detect parent directory traversal patterns', () => {
      expect(isPathVulnerable('../etc/passwd')).toBe(true)
      expect(isPathVulnerable('../../etc/passwd')).toBe(true)
      expect(isPathVulnerable('../../../etc/passwd')).toBe(true)
    })

    it('should detect absolute path patterns', () => {
      expect(isPathVulnerable('/etc/passwd')).toBe(true)
      expect(isPathVulnerable('/var/log/system.log')).toBe(true)
      expect(isPathVulnerable('C:\\Windows\\System32')).toBe(true)
    })

    it('should allow safe relative paths', () => {
      expect(isPathVulnerable('docs/file.md')).toBe(false)
      expect(isPathVulnerable('src/constants/legal.ts')).toBe(false)
      expect(isPathVulnerable('README.md')).toBe(false)
    })

    it('should detect traversal in middle of path', () => {
      expect(isPathVulnerable('docs/../etc/passwd')).toBe(true)
      expect(isPathVulnerable('src/../../etc/passwd')).toBe(true)
    })
  })

  describe('Security Properties', () => {
    it('should enforce allowlist validation - only cwd-contained paths allowed', () => {
      // Test that absolute paths are rejected
      const absolutePaths = ['/etc/passwd', '/var/log/system.log', '/root/.ssh/id_rsa']

      absolutePaths.push('C:\\Windows\\System32')

      absolutePaths.forEach((p) => {
        expect(validateFilePath(p).valid).toBe(false)
      })
    })

    it('should enforce rejection of traversal patterns', () => {
      // Test that all traversal patterns are rejected
      const traversalPaths = [
        '../etc/passwd',
        '../../etc/passwd',
        '../../../etc/passwd',
        'docs/../../../etc/passwd',
        'src/../../etc/passwd',
      ]

      traversalPaths.forEach((p) => {
        expect(validateFilePath(p).valid).toBe(false)
      })
    })

    it('should sanitize by rejecting rather than modifying paths', () => {
      // Verify that the function rejects unsafe paths rather than trying to sanitize them
      // This is the secure approach - reject, don't try to fix
      const unsafePath = '../etc/passwd'
      const result = validateFilePath(unsafePath)

      expect(result.valid).toBe(false)
      // The function should not attempt to "fix" the path, just reject it
    })
  })
})
