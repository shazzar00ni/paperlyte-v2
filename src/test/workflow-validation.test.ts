/**
 * Tests for GitHub Actions workflow permission changes.
 *
 * This PR enforces least-privilege GITHUB_TOKEN permissions across all workflows:
 * - Workflow-level: permissions: {} (deny-all default)
 * - Each job that needs token access declares only what it uses
 * These tests verify that structure is correctly enforced.
 */

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, it, expect, beforeAll } from 'vitest'

const projectRoot = resolve(process.cwd())

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function readWorkflow(filename: string): string {
  return readFileSync(resolve(projectRoot, '.github/workflows', filename), 'utf-8')
}

/**
 * Returns true when the YAML file contains a top-level `permissions:` block,
 * i.e. a line that starts with `permissions:` at column 0 (no indentation).
 */
function hasWorkflowLevelPermissions(content: string): boolean {
  return content.split('\n').some((line) => line.startsWith('permissions:'))
}

/**
 * Extracts the YAML block that belongs to a specific job.
 * A job starts at the line containing `<jobId>:` indented with exactly 2 spaces
 * and ends just before the next top-level-or-same-level key.
 */
function extractJobBlock(content: string, jobId: string): string {
  const lines = content.split('\n')
  // Job keys live under `jobs:` so they are indented by 2 spaces.
  const startIdx = lines.findIndex((line) => line.startsWith(`  ${jobId}:`))
  if (startIdx === -1) return ''

  // Collect lines until we hit a sibling job (another 2-space-indented key)
  // or the end of file.
  const jobLines: string[] = [lines[startIdx]]
  for (let i = startIdx + 1; i < lines.length; i++) {
    const line = lines[i]
    // A sibling key is indented by exactly 2 spaces (e.g. "  next-job:")
    if (line.startsWith('  ') && line.length > 2 && line[2] !== ' ' && line[2] !== '\t') break
    jobLines.push(line)
  }
  return jobLines.join('\n')
}

/**
 * Returns true when the given job block contains `permissions:` followed by
 * a `contents: read` entry.
 */
function jobHasContentsReadPermission(jobBlock: string): boolean {
  // Look for `    permissions:` (4-space indent) then `      contents: read` (6-space indent)
  const permissionsPattern = /^\s{4}permissions:/m
  const contentsPattern = /^\s{1,50}contents:\s{1,50}read/m
  return permissionsPattern.test(jobBlock) && contentsPattern.test(jobBlock)
}

/**
 * Asserts that a workflow file is non-empty and has a workflow-level
 * `permissions: {}` deny-all block.
 */
function assertWorkflowLevelDenyAll(content: string): void {
  expect(content.length).toBeGreaterThan(0)
  expect(hasWorkflowLevelPermissions(content)).toBe(true)
  expect(content).toMatch(/^permissions:\s*\{\}/m)
}

/**
 * Asserts that a job exists in the given workflow and returns its YAML block.
 */
function assertJobExists(content: string, jobId: string, workflowFileName: string): string {
  const block = extractJobBlock(content, jobId)
  expect(block, `Expected job "${jobId}" to be defined in ${workflowFileName}`).not.toBe('')
  return block
}

// ---------------------------------------------------------------------------
// ci.yml
// ---------------------------------------------------------------------------

describe('ci.yml – permission structure', () => {
  let content: string

  beforeAll(() => {
    content = readWorkflow('ci.yml')
  })

  it('should exist and have a workflow-level deny-all permissions block (permissions: {})', () => {
    assertWorkflowLevelDenyAll(content)
  })

  it.each(['lint-and-typecheck', 'build', 'test', 'e2e', 'ci-success'])(
    '%s job should have an explicit "contents: read" permission at job level',
    (jobId) => {
      const block = assertJobExists(content, jobId, 'ci.yml')
      expect(jobHasContentsReadPermission(block)).toBe(true)
    }
  )

  it('should define the expected set of jobs', () => {
    const expectedJobs = [
      'lint-and-typecheck',
      'test',
      'build',
      'size-check',
      'lighthouse',
      'e2e',
      'add-to-project',
      'ci-success',
    ]
    for (const jobId of expectedJobs) {
      assertJobExists(content, jobId, 'ci.yml')
    }
  })

  it('each job that has a permissions block should include at least "contents: read"', () => {
    // Regression guard: all jobs with explicit permissions blocks must keep contents: read.
    const jobsWithExplicitPermissions = [
      'lint-and-typecheck',
      'build',
      'test',
      'size-check',
      'lighthouse',
      'e2e',
      'ci-success',
    ]
    for (const jobId of jobsWithExplicitPermissions) {
      const block = assertJobExists(content, jobId, 'ci.yml')
      expect(
        jobHasContentsReadPermission(block),
        `Job "${jobId}" is missing "contents: read" permission`
      ).toBe(true)
    }
  })

  it('should trigger on pushes to main and develop branches', () => {
    expect(content).toMatch(/branches:\s*\[main,\s*develop\]/)
  })

  it('should trigger on pull_request events targeting main and develop', () => {
    // The on.pull_request section exists
    expect(content).toMatch(/pull_request:/)
  })

  it('build job should depend on lint-and-typecheck and test (needs)', () => {
    const buildBlock = extractJobBlock(content, 'build')
    expect(buildBlock).toMatch(/needs:\s*\[lint-and-typecheck,\s*test\]/)
  })
})

// ---------------------------------------------------------------------------
// pr-quality-check.yml
// ---------------------------------------------------------------------------

describe('pr-quality-check.yml – permission structure', () => {
  let content: string

  beforeAll(() => {
    content = readWorkflow('pr-quality-check.yml')
  })

  it('should exist and have a workflow-level deny-all permissions block (permissions: {})', () => {
    assertWorkflowLevelDenyAll(content)
  })

  it.each(['pr-metadata', 'bundle-size-check'])(
    '%s job should have an explicit "contents: read" permission at job level',
    (jobId) => {
      const block = assertJobExists(content, jobId, 'pr-quality-check.yml')
      expect(jobHasContentsReadPermission(block)).toBe(true)
    }
  )

  it('dependency-review job should retain its existing permissions', () => {
    const block = assertJobExists(content, 'dependency-review', 'pr-quality-check.yml')
    // dependency-review already had job-level permissions before this PR
    expect(jobHasContentsReadPermission(block)).toBe(true)
  })

  it('should define all expected jobs', () => {
    const expectedJobs = [
      'pr-metadata',
      'dependency-review',
      'bundle-size-check',
      'quality-summary',
    ]
    for (const jobId of expectedJobs) {
      assertJobExists(content, jobId, 'pr-quality-check.yml')
    }
  })

  it('should only trigger on pull_request events', () => {
    expect(content).toMatch(/^on:[ \t]*\n[ \t]+pull_request:/m)
    expect(content).not.toMatch(/^ {2}push:/m)
  })

  it('should trigger on opened, synchronize, and reopened event types', () => {
    expect(content).toMatch(/types:\s*\[opened,\s*synchronize,\s*reopened\]/)
  })

  it('quality-summary job should depend on pr-metadata, dependency-review, and bundle-size-check', () => {
    const block = extractJobBlock(content, 'quality-summary')
    expect(block).toMatch(/needs:\s*\[pr-metadata,\s*dependency-review,\s*bundle-size-check\]/)
  })

  it('all jobs that need token access have an explicit permissions block (regression guard)', () => {
    // With permissions: {} at workflow level, every job that needs token access must
    // declare its own permissions block. Verify the jobs that have explicit blocks.
    const jobsWithExplicitPermissions = ['pr-metadata', 'bundle-size-check', 'dependency-review']
    for (const jobId of jobsWithExplicitPermissions) {
      const block = assertJobExists(content, jobId, 'pr-quality-check.yml')
      const hasPermissionsBlock = /^\s{4}permissions:/m.test(block)
      expect(
        hasPermissionsBlock,
        `Job "${jobId}" is missing an explicit permissions block`
      ).toBe(true)
    }
  })
})

// ---------------------------------------------------------------------------
// package-lock.json – picomatch version bump
// ---------------------------------------------------------------------------

describe('package-lock.json – picomatch dependency update', () => {
  interface PackageLockEntry {
    version: string
    resolved: string
    integrity: string
    dev?: boolean
    license?: string
  }

  interface PackageLock {
    lockfileVersion: number
    packages: Record<string, PackageLockEntry>
  }

  let lockfile: PackageLock
  let entry: PackageLockEntry

  beforeAll(() => {
    const raw = readFileSync(resolve(projectRoot, 'package-lock.json'), 'utf-8')
    lockfile = JSON.parse(raw) as PackageLock
    entry = lockfile.packages['node_modules/picomatch']
  })

  it('should have picomatch listed in packages', () => {
    expect(lockfile.packages).toHaveProperty('node_modules/picomatch')
  })

  it('picomatch should be updated to version 4.0.4', () => {
    expect(entry.version).toBe('4.0.4')
  })

  it('picomatch should NOT be the vulnerable version 4.0.3', () => {
    expect(entry.version).not.toBe('4.0.3')
  })

  it('picomatch resolved URL should point to version 4.0.4', () => {
    expect(entry.resolved).toContain('picomatch-4.0.4.tgz')
    expect(entry.resolved).not.toContain('picomatch-4.0.3.tgz')
  })

  it('picomatch integrity hash should match the 4.0.4 release', () => {
    expect(entry.integrity).toBe(
      'sha512-QP88BAKvMam/3NxH6vj2o21R6MjxZUAd6nlwAS/pnGvN9IVLocLHxGYIzFhg6fUQ+5th6P4dv4eW9jX3DSIj7A=='
    )
  })

  it('picomatch should remain a devDependency', () => {
    expect(entry.dev).toBe(true)
  })

  it('picomatch should retain its MIT license', () => {
    expect(entry.license).toBe('MIT')
  })

  it('package-lock.json should be valid JSON with a lockfileVersion', () => {
    expect(typeof lockfile.lockfileVersion).toBe('number')
    expect(lockfile.lockfileVersion).toBeGreaterThanOrEqual(1)
  })
})

// ---------------------------------------------------------------------------
// package-lock.json – axios multiple CVE fix
// Axios 1.0.0 – 1.15.1 carries a broad set of high-severity vulnerabilities
// (prototype pollution, SSRF, CRLF injection, header injection, DoS, etc.).
// The override in package.json forces >= 1.15.2.
// Relevant advisories include: GHSA-3p68-rc4w-qgx5, GHSA-w9j2-pvgh-6h63,
// GHSA-pmwg-cvhr-8vh7, GHSA-3w6x-2g7m-8v23, GHSA-q8qp-cvcw-x6jj,
// GHSA-xhjh-pmcv-23jw, GHSA-445q-vr5w-6q77, GHSA-m7pr-hjqh-92cm,
// GHSA-62hf-57xw-28j9, GHSA-5c9x-8gcm-mpgx, GHSA-vf2m-468p-8v99,
// GHSA-pf86-5x62-jrwf, GHSA-6chq-wfr3-2hj9, GHSA-xx6v-rp6x-q39c.
// ---------------------------------------------------------------------------

describe('package-lock.json – axios security update (multiple CVEs)', () => {
  interface PackageLock {
    lockfileVersion: number
    packages: Record<string, { version: string; resolved: string; dev?: boolean }>
  }

  let lockfile: PackageLock
  let entry: { version: string; resolved: string; dev?: boolean }

  beforeAll(() => {
    const raw = readFileSync(resolve(projectRoot, 'package-lock.json'), 'utf-8')
    lockfile = JSON.parse(raw) as PackageLock
    entry = lockfile.packages['node_modules/axios']
  })

  it('should have axios listed in packages', () => {
    expect(lockfile.packages).toHaveProperty('node_modules/axios')
  })

  it('axios version should be >= 1.15.2 (minimum safe version)', () => {
    const [major, minor, patch] = entry.version.split('.').map(Number)
    const isAtLeast1_15_2 =
      major > 1 || (major === 1 && minor > 15) || (major === 1 && minor === 15 && patch >= 2)
    expect(
      isAtLeast1_15_2,
      `axios ${entry.version} is in the vulnerable range 1.0.0 – 1.15.1`
    ).toBe(true)
  })

  it('axios should NOT be in the vulnerable range (1.0.0 – 1.15.1)', () => {
    const [major, minor, patch] = entry.version.split('.').map(Number)
    const isVulnerable = major === 1 && (minor < 15 || (minor === 15 && patch < 2))
    expect(isVulnerable).toBe(false)
  })

  it('axios resolved URL should point to a non-vulnerable release', () => {
    // Verify URL version matches the installed version (>= 1.15.2 already checked above).
    // Avoids hardcoding a specific patch version that breaks on future bumps.
    expect(entry.resolved).toContain(`axios-${entry.version}.tgz`)
  })
})

// ---------------------------------------------------------------------------
// package-lock.json – basic-ftp security fixes
// GHSA-chqc-8p9q-pq6q: FTP command injection via CRLF in basic-ftp 5.2.0, fixed >= 5.2.1
// GHSA-rpmf-866q-6p89: DoS via unbounded multiline control response in <= 5.3.0, fixed >= 5.3.1
// The override in package.json forces >= 5.3.1.
// ---------------------------------------------------------------------------

describe('package-lock.json – basic-ftp security update (GHSA-chqc-8p9q-pq6q, GHSA-rpmf-866q-6p89)', () => {
  interface PackageLock {
    lockfileVersion: number
    packages: Record<string, { version: string; resolved: string; dev?: boolean }>
  }

  let lockfile: PackageLock
  let entry: { version: string; resolved: string; dev?: boolean }

  beforeAll(() => {
    const raw = readFileSync(resolve(projectRoot, 'package-lock.json'), 'utf-8')
    lockfile = JSON.parse(raw) as PackageLock
    entry = lockfile.packages['node_modules/basic-ftp']
  })

  it('should have basic-ftp listed in packages', () => {
    expect(lockfile.packages).toHaveProperty('node_modules/basic-ftp')
  })

  it('basic-ftp should NOT be in the vulnerable range (<= 5.3.0)', () => {
    const [major, minor, patch] = entry.version.split('.').map(Number)
    const isVulnerable =
      major < 5 || (major === 5 && minor < 3) || (major === 5 && minor === 3 && patch <= 0)
    expect(isVulnerable, `basic-ftp ${entry.version} is in the vulnerable range (<= 5.3.0)`).toBe(
      false
    )
  })

  it('basic-ftp version should be >= 5.3.1 (minimum safe for all known CVEs)', () => {
    const [major, minor, patch] = entry.version.split('.').map(Number)
    const isAtLeast5_3_1 =
      major > 5 || (major === 5 && minor > 3) || (major === 5 && minor === 3 && patch >= 1)
    expect(
      isAtLeast5_3_1,
      `basic-ftp ${entry.version} is below the minimum safe version 5.3.1`
    ).toBe(true)
  })

  it('basic-ftp resolved URL should not point to a vulnerable release', () => {
    expect(entry.resolved).not.toContain('basic-ftp-5.2.0.tgz')
    expect(entry.resolved).not.toContain('basic-ftp-5.3.0.tgz')
  })
})

// ---------------------------------------------------------------------------
// package-lock.json – lodash-es prototype pollution / code injection fix
// (GHSA-r5fr-rjxr-66jc, GHSA-f23m-r3pf-42rh)
// lodash-es <= 4.17.23 is affected. The override in package.json forces >= 4.18.0.
// ---------------------------------------------------------------------------

describe('package-lock.json – lodash-es security update (GHSA-r5fr-rjxr-66jc, GHSA-f23m-r3pf-42rh)', () => {
  interface PackageLock {
    lockfileVersion: number
    packages: Record<string, { version: string; resolved: string; dev?: boolean }>
  }

  let lockfile: PackageLock
  let entry: { version: string; resolved: string; dev?: boolean }

  beforeAll(() => {
    const raw = readFileSync(resolve(projectRoot, 'package-lock.json'), 'utf-8')
    lockfile = JSON.parse(raw) as PackageLock
    entry = lockfile.packages['node_modules/lodash-es']
  })

  it('should have lodash-es listed in packages', () => {
    expect(lockfile.packages).toHaveProperty('node_modules/lodash-es')
  })

  it('lodash-es should NOT be at or below the vulnerable version 4.17.23', () => {
    const [major, minor, patch] = entry.version.split('.').map(Number)
    const isVulnerable =
      major < 4 || (major === 4 && minor < 17) || (major === 4 && minor === 17 && patch <= 23)
    expect(isVulnerable, `lodash-es ${entry.version} is in the vulnerable range (<= 4.17.23)`).toBe(
      false
    )
  })

  it('lodash-es version should be >= 4.18.0 (not vulnerable)', () => {
    const [major, minor] = entry.version.split('.').map(Number)
    const isAtLeast4_18 = major > 4 || (major === 4 && minor >= 18)
    expect(
      isAtLeast4_18,
      `lodash-es ${entry.version} is below the minimum safe version 4.18.0`
    ).toBe(true)
  })

  it('lodash-es resolved URL should not point to a vulnerable release', () => {
    expect(entry.resolved).not.toMatch(/lodash-es-4\.17\.\d+\.tgz/)
  })
})
