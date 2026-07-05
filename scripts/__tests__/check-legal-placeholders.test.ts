/**
 * Test suite for check-legal-placeholders script
 * Tests path traversal vulnerability mitigation and placeholder detection
 *
 * @vitest-environment node
 */

import { afterEach, describe, expect, it } from 'vitest'
import * as fs from 'fs'
import * as os from 'os'
import * as path from 'path'
import { checkFiles, findPlaceholders, validateLegalFilePath } from '../check-legal-placeholders'

const originalCwd = process.cwd()
let tempDir: string | undefined

function createTempRepo(files: Record<string, string>): string {
  tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'paperlyte-legal-check-'))

  Object.entries(files).forEach(([filePath, content]) => {
    const absolutePath = path.join(tempDir as string, filePath)
    fs.mkdirSync(path.dirname(absolutePath), { recursive: true })
    fs.writeFileSync(absolutePath, content, 'utf-8')
  })

  process.chdir(tempDir)
  return tempDir
}

afterEach(() => {
  process.chdir(originalCwd)

  if (tempDir) {
    fs.rmSync(tempDir, { recursive: true, force: true })
    tempDir = undefined
  }
})

describe('check-legal-placeholders - Path Traversal Protection', () => {
  describe('validateLegalFilePath', () => {
    it('rejects traversal paths', () => {
      const traversalPaths = [
        '../etc/passwd',
        '../../etc/passwd',
        '../../../etc/passwd',
        'docs/../../../etc/passwd',
        'src/../../etc/passwd',
      ]

      traversalPaths.forEach((filePath) => {
        expect(validateLegalFilePath(filePath).valid).toBe(false)
      })
    })

    it('rejects POSIX and Windows absolute paths on every platform', () => {
      const absolutePaths = [
        '/etc/passwd',
        '/var/log/system.log',
        '/root/.ssh/id_rsa',
        'C:\\Windows\\System32\\config\\sam',
      ]

      absolutePaths.forEach((filePath) => {
        expect(validateLegalFilePath(filePath).valid).toBe(false)
      })
    })

    it('accepts safe relative paths', () => {
      const validPaths = [
        'docs/PRIVACY-POLICY.md',
        'docs/legal/TERMS-OF-SERVICE.md',
        'README.md',
        'src/constants/legal.ts',
      ]

      validPaths.forEach((filePath) => {
        expect(validateLegalFilePath(filePath).valid).toBe(true)
      })
    })
  })

  describe('findPlaceholders', () => {
    it('reads safe relative paths and reports unresolved placeholders from the shipped implementation', () => {
      createTempRepo({
        'docs/PRIVACY-POLICY.md':
          '# Privacy\nContact [Company Email] for help.\nSee [Paperlyte](https://example.com).\n',
      })

      expect(findPlaceholders('docs/PRIVACY-POLICY.md')).toEqual([
        {
          file: 'docs/PRIVACY-POLICY.md',
          line: 2,
          content: 'Contact [Company Email] for help.',
          placeholder: '[Company Email]',
        },
      ])
    })

    it('only reports TypeScript string-literal placeholders and ignores normal syntax brackets', () => {
      createTempRepo({
        'src/constants/legal.ts': [
          'const allConfigEntries = (): Array<[string, string]> => {',
          '  const entries: Array<[string, string]> = []',
          "  for (const [section, values] of Object.entries({ company: { name: 'Paperlyte' } })) {",
          '    entries.push([`${section}.name`, values.name])',
          '  }',
          '  return entries',
          '}',
          "const legalName = '[Company Legal Name]'",
          "const cookies = '#'",
          '',
        ].join('\n'),
      })

      expect(findPlaceholders('src/constants/legal.ts')).toEqual([
        {
          file: 'src/constants/legal.ts',
          line: 8,
          content: "const legalName = '[Company Legal Name]'",
          placeholder: '[Company Legal Name]',
        },
        {
          file: 'src/constants/legal.ts',
          line: 9,
          content: "const cookies = '#'",
          placeholder: '#',
        },
      ])
    })

    it('does not read rejected paths', () => {
      createTempRepo({
        'docs/PRIVACY-POLICY.md': 'Contact [Company Email]',
      })

      expect(findPlaceholders('../PRIVACY-POLICY.md')).toEqual([])
      expect(findPlaceholders(path.join(tempDir as string, 'docs/PRIVACY-POLICY.md'))).toEqual([])
      expect(findPlaceholders('C:\\Windows\\System32\\config\\sam')).toEqual([])
    })
  })

  describe('checkFiles', () => {
    it('checks the configured legal files through the real checkFiles to find placeholders', () => {
      createTempRepo({
        'src/constants/legal.ts': [
          'const allConfigEntries = (): Array<[string, string]> => {',
          '  const entries: Array<[string, string]> = []',
          "  for (const [section, values] of Object.entries({ company: { name: 'Paperlyte' } })) {",
          '    entries.push([`${section}.name`, values.name])',
          '  }',
          '  return entries',
          '}',
          '',
        ].join('\n'),
        'docs/PRIVACY-POLICY.md': 'Privacy contact: Paperlyte\n',
        'docs/TERMS-OF-SERVICE.md': 'Terms for Paperlyte\n',
      })

      const results = checkFiles()

      expect(results).toEqual([
        {
          path: 'src/constants/legal.ts',
          exists: true,
          placeholders: [],
        },
        {
          path: 'docs/PRIVACY-POLICY.md',
          exists: true,
          placeholders: [],
        },
        {
          path: 'docs/TERMS-OF-SERVICE.md',
          exists: true,
          placeholders: [],
        },
      ])
    })
  })
})
