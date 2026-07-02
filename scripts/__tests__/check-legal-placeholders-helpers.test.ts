/**
 * Additional tests for helper functions introduced in check-legal-placeholders.ts
 * Covers edge cases and boundary conditions for the new path-validation helpers:
 *   hasParentTraversal, isUnsupportedWindowsAbsolutePath, isPathWithinCwd,
 *   isPathVulnerable, validateFilePath
 *
 * @vitest-environment node
 */

import { describe, it, expect } from 'vitest'
import * as path from 'path'

// Mirror the helper implementations from check-legal-placeholders.ts / the test file
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
  // Safe: this IS the security validation check under test, resolving the
  // candidate path only to verify it stays within cwd (mirrors filenameValidation.js).
  const resolvedPath = path.resolve(filePath) // nosemgrep: javascript.lang.security.audit.path-traversal.path-join-resolve-traversal.path-join-resolve-traversal
  const resolvedCwd = path.resolve(process.cwd()) // nosemgrep: javascript.lang.security.audit.path-traversal.path-join-resolve-traversal.path-join-resolve-traversal
  return resolvedPath === resolvedCwd || resolvedPath.startsWith(resolvedCwd + path.sep)
}

function isPathVulnerable(filePath: string): boolean {
  return (
    hasParentTraversal(filePath) ||
    isUnsupportedWindowsAbsolutePath(filePath) ||
    !isPathWithinCwd(filePath)
  )
}

function validateFilePath(filePath: string): { valid: boolean; reason?: string } {
  if (isPathVulnerable(filePath)) {
    return { valid: false, reason: 'Invalid file path' }
  }
  return { valid: true }
}

// ─── hasParentTraversal ──────────────────────────────────────────────────────

describe('hasParentTraversal', () => {
  describe('detects traversal segments', () => {
    it('detects leading ../', () => {
      expect(hasParentTraversal('../etc/passwd')).toBe(true)
    })

    it('detects multiple ../ segments', () => {
      expect(hasParentTraversal('../../etc/passwd')).toBe(true)
    })

    it('detects .. in the middle of a path', () => {
      expect(hasParentTraversal('docs/../secret')).toBe(true)
    })

    it('detects .. at the end of a path', () => {
      expect(hasParentTraversal('docs/subdir/..')).toBe(true)
    })

    it('detects backslash-separated traversal (..\\\\etc)', () => {
      expect(hasParentTraversal('..\\etc\\passwd')).toBe(true)
    })

    it('detects traversal with mixed slashes (docs\\\\..\\\\secret)', () => {
      expect(hasParentTraversal('docs\\..\\secret')).toBe(true)
    })

    it('detects .. when surrounded by multiple consecutive slashes', () => {
      expect(hasParentTraversal('a//../../b')).toBe(true)
    })

    it('detects standalone .. segment', () => {
      expect(hasParentTraversal('..')).toBe(true)
    })
  })

  describe('allows safe path segments', () => {
    it('allows a simple filename', () => {
      expect(hasParentTraversal('README.md')).toBe(false)
    })

    it('allows nested relative paths', () => {
      expect(hasParentTraversal('docs/legal/TERMS.md')).toBe(false)
    })

    it('allows single dot (current directory)', () => {
      expect(hasParentTraversal('.')).toBe(false)
    })

    it('allows a segment that starts with .. but is not exactly .. (e.g. ..file)', () => {
      // '..file' split on [\\/]+ is ['..file'], which does not include '..'
      expect(hasParentTraversal('..file/foo')).toBe(false)
    })

    it('allows a segment that ends with .. but is not exactly .. (e.g. file..)', () => {
      expect(hasParentTraversal('file../bar')).toBe(false)
    })

    it('allows three-dot segment (...)', () => {
      expect(hasParentTraversal('...dotfile')).toBe(false)
    })

    it('allows empty string', () => {
      // ''.split(/[\\/]+/) === [''], not ['..']
      expect(hasParentTraversal('')).toBe(false)
    })
  })
})

// ─── isUnsupportedWindowsAbsolutePath ────────────────────────────────────────

describe('isUnsupportedWindowsAbsolutePath', () => {
  // These tests are written for non-win32 platforms. On Windows, the function
  // always returns false, so we skip assertions that would be wrong there.

  if (process.platform !== 'win32') {
    describe('on non-win32 platform', () => {
      it('detects uppercase drive-letter path C:\\\\', () => {
        expect(isUnsupportedWindowsAbsolutePath('C:\\Windows\\System32')).toBe(true)
      })

      it('detects lowercase drive-letter path c:\\\\', () => {
        expect(isUnsupportedWindowsAbsolutePath('c:\\windows\\system32')).toBe(true)
      })

      it('detects drive letter with forward slash C:/', () => {
        expect(isUnsupportedWindowsAbsolutePath('C:/Users/admin')).toBe(true)
      })

      it('detects UNC path starting with \\\\\\\\', () => {
        expect(isUnsupportedWindowsAbsolutePath('\\\\server\\share')).toBe(true)
      })

      it('does NOT flag a Unix absolute path /etc/passwd', () => {
        // Unix absolute paths are caught by !isPathWithinCwd, not by this helper
        expect(isUnsupportedWindowsAbsolutePath('/etc/passwd')).toBe(false)
      })

      it('does NOT flag a plain relative path', () => {
        expect(isUnsupportedWindowsAbsolutePath('docs/file.md')).toBe(false)
      })

      it('does NOT flag a parent traversal path', () => {
        expect(isUnsupportedWindowsAbsolutePath('../etc/passwd')).toBe(false)
      })

      it('does NOT flag empty string', () => {
        expect(isUnsupportedWindowsAbsolutePath('')).toBe(false)
      })

      it('does NOT flag a path with a colon not at position 1 (e.g. foo:bar)', () => {
        // The regex requires the colon to be at index 1 (^[a-zA-Z]:)
        expect(isUnsupportedWindowsAbsolutePath('foo:bar')).toBe(false)
      })
    })
  } else {
    it('always returns false on win32 (native absolute paths are handled by isPathWithinCwd)', () => {
      expect(isUnsupportedWindowsAbsolutePath('C:\\Windows')).toBe(false)
      expect(isUnsupportedWindowsAbsolutePath('\\\\server\\share')).toBe(false)
    })
  }
})

// ─── isPathWithinCwd ─────────────────────────────────────────────────────────

describe('isPathWithinCwd', () => {
  const cwd = process.cwd()

  describe('paths that ARE within CWD', () => {
    it('accepts a relative path that resolves under CWD', () => {
      expect(isPathWithinCwd('docs/PRIVACY-POLICY.md')).toBe(true)
    })

    it('accepts an absolute path equal to CWD itself', () => {
      // The exact-match branch: resolvedPath === resolvedCwd
      expect(isPathWithinCwd(cwd)).toBe(true)
    })

    it('accepts an absolute path that is a direct child of CWD', () => {
      expect(isPathWithinCwd(path.join(cwd, 'README.md'))).toBe(true)
    })

    it('accepts an absolute path deeply nested under CWD', () => {
      expect(isPathWithinCwd(path.join(cwd, 'src', 'constants', 'legal.ts'))).toBe(true)
    })

    it('resolves single dot (.) to CWD', () => {
      // path.resolve('.') === cwd
      expect(isPathWithinCwd('.')).toBe(true)
    })

    it('resolves empty string to CWD', () => {
      // path.resolve('') === cwd
      expect(isPathWithinCwd('')).toBe(true)
    })
  })

  describe('paths that are NOT within CWD', () => {
    it('rejects a Unix absolute path outside CWD', () => {
      expect(isPathWithinCwd('/etc/passwd')).toBe(false)
    })

    it('rejects the parent of CWD', () => {
      expect(isPathWithinCwd(path.resolve(cwd, '..'))).toBe(false)
    })

    it('rejects /tmp', () => {
      expect(isPathWithinCwd('/tmp')).toBe(false)
    })

    it('rejects a sibling directory of CWD', () => {
      const sibling = path.resolve(cwd, '..', 'sibling-dir')
      expect(isPathWithinCwd(sibling)).toBe(false)
    })
  })

  describe('prefix collision guard', () => {
    it('rejects a path that starts with CWD string but is a sibling (not a child)', () => {
      // e.g. CWD = /home/jailuser/git, sibling = /home/jailuser/git-evil
      // resolvedPath.startsWith(resolvedCwd + path.sep) should be false
      const cwdWithSuffix = cwd + '-evil'
      expect(isPathWithinCwd(cwdWithSuffix)).toBe(false)
    })
  })
})

// ─── isPathVulnerable (composite) ────────────────────────────────────────────

describe('isPathVulnerable', () => {
  describe('returns true for any individual vulnerability', () => {
    it('is vulnerable when hasParentTraversal is true', () => {
      // ../foo has no Windows issue and may resolve outside CWD
      expect(isPathVulnerable('../etc/passwd')).toBe(true)
    })

    it('is vulnerable when path is outside CWD (Unix absolute path)', () => {
      expect(isPathVulnerable('/etc/passwd')).toBe(true)
    })

    if (process.platform !== 'win32') {
      it('is vulnerable when isUnsupportedWindowsAbsolutePath is true', () => {
        expect(isPathVulnerable('C:\\Windows\\System32')).toBe(true)
      })

      it('is vulnerable for UNC path on non-win32', () => {
        expect(isPathVulnerable('\\\\server\\share')).toBe(true)
      })
    }
  })

  describe('returns false for safe paths', () => {
    it('is safe for a plain relative path within CWD', () => {
      expect(isPathVulnerable('docs/file.md')).toBe(false)
    })

    it('is safe for an absolute path pointing into CWD', () => {
      expect(isPathVulnerable(path.join(process.cwd(), 'docs/PRIVACY-POLICY.md'))).toBe(false)
    })

    it('is safe for a simple filename', () => {
      expect(isPathVulnerable('README.md')).toBe(false)
    })
  })
})

// ─── validateFilePath (return-value contract) ─────────────────────────────────

describe('validateFilePath return value contract', () => {
  describe('invalid paths', () => {
    it('returns valid:false with exact reason string for traversal path', () => {
      const result = validateFilePath('../etc/passwd')
      expect(result.valid).toBe(false)
      expect(result.reason).toBe('Invalid file path')
    })

    it('returns valid:false with exact reason string for absolute Unix path', () => {
      const result = validateFilePath('/etc/passwd')
      expect(result.valid).toBe(false)
      expect(result.reason).toBe('Invalid file path')
    })

    if (process.platform !== 'win32') {
      it('returns valid:false for Windows-style absolute path on non-win32', () => {
        const result = validateFilePath('C:\\Windows\\System32')
        expect(result.valid).toBe(false)
        expect(result.reason).toBe('Invalid file path')
      })
    }
  })

  describe('valid paths', () => {
    it('returns valid:true with no reason property for a safe relative path', () => {
      const result = validateFilePath('docs/PRIVACY-POLICY.md')
      expect(result.valid).toBe(true)
      expect(result.reason).toBeUndefined()
    })

    it('returns valid:true for an absolute path inside CWD', () => {
      const result = validateFilePath(path.join(process.cwd(), 'README.md'))
      expect(result.valid).toBe(true)
      expect(result.reason).toBeUndefined()
    })
  })

  describe('edge cases', () => {
    it('rejects a path that resolves to the parent of CWD', () => {
      // Single '..' resolves to parent directory — outside CWD
      const result = validateFilePath('..')
      expect(result.valid).toBe(false)
    })

    it('accepts current directory "." (resolves to CWD itself)', () => {
      const result = validateFilePath('.')
      expect(result.valid).toBe(true)
    })

    it('rejects a deeply nested traversal that escapes CWD', () => {
      const result = validateFilePath('src/constants/../../../etc/passwd')
      expect(result.valid).toBe(false)
    })

    it('accepts a path with ".." embedded inside a filename segment (not a traversal)', () => {
      // e.g. "src/my..file.ts" — the segment is "my..file.ts", not ".."
      const result = validateFilePath('src/my..file.ts')
      expect(result.valid).toBe(true)
    })
  })
})

// ─── Regression: Windows path rejection is now cross-platform ────────────────

describe('Regression: cross-platform Windows path rejection', () => {
  // Prior to this PR, Windows paths were only tested/rejected on win32.
  // The new isUnsupportedWindowsAbsolutePath ensures they are always rejected
  // on non-win32 platforms too.
  if (process.platform !== 'win32') {
    it('rejects C:\\\\-style paths on Linux/macOS', () => {
      expect(validateFilePath('C:\\Windows\\System32\\config\\sam').valid).toBe(false)
    })

    it('rejects Z:\\\\-style paths on Linux/macOS', () => {
      expect(validateFilePath('Z:\\\\secret\\\\file.txt').valid).toBe(false)
    })

    it('rejects UNC-style paths on Linux/macOS', () => {
      expect(validateFilePath('\\\\remote\\share\\file').valid).toBe(false)
    })
  }
})

// ─── Regression: absolute path inside CWD is now accepted ────────────────────

describe('Regression: absolute CWD-contained paths are accepted', () => {
  // Prior to this PR, the validation rejected ALL absolute paths. Now an
  // absolute path that resolves within the CWD is considered valid.
  it('accepts path.join(cwd, subdir, file) as valid', () => {
    const validPath = path.join(process.cwd(), 'docs', 'PRIVACY-POLICY.md')
    const result = validateFilePath(validPath)
    expect(result.valid).toBe(true)
  })

  it('accepts process.cwd() itself as valid', () => {
    const result = validateFilePath(process.cwd())
    expect(result.valid).toBe(true)
  })

  it('still rejects an absolute path outside CWD even without .. in it', () => {
    // /tmp/foo has no traversal but is outside CWD
    const result = validateFilePath('/tmp/foo')
    expect(result.valid).toBe(false)
  })
})
