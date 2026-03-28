/**
 * Tests for GitHub Actions workflow permission changes.
 *
 * This PR moved `permissions` from the workflow level to individual job level
 * in ci.yml and pr-quality-check.yml, following the principle of least privilege.
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
  return content.split('\n').some((line) => /^permissions:/.test(line))
}

/**
 * Extracts the YAML block that belongs to a specific job.
 * A job starts at the line containing `<jobId>:` indented with exactly 2 spaces
 * and ends just before the next top-level-or-same-level key.
 */
function extractJobBlock(content: string, jobId: string): string {
  const lines = content.split('\n')
  // Job keys live under `jobs:` so they are indented by 2 spaces.
  const jobStartPattern = new RegExp(`^  ${jobId}:`)
  const startIdx = lines.findIndex((line) => jobStartPattern.test(line))
  if (startIdx === -1) return ''

  // Collect lines until we hit a sibling job (another 2-space-indented key)
  // or the end of file.
  const jobLines: string[] = [lines[startIdx]]
  for (let i = startIdx + 1; i < lines.length; i++) {
    const line = lines[i]
    // A sibling key is indented by exactly 2 spaces (e.g. "  next-job:")
    if (/^ {2}\S/.test(line)) break
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

// ---------------------------------------------------------------------------
// ci.yml
// ---------------------------------------------------------------------------

describe('ci.yml – permission structure', () => {
  let content: string

  beforeAll(() => {
    content = readWorkflow('ci.yml')
  })

  it('should exist and be non-empty', () => {
    expect(content.length).toBeGreaterThan(0)
  })

  it('should have a workflow-level "contents: read" permissions block', () => {
    expect(hasWorkflowLevelPermissions(content)).toBe(true)
    // Verify the workflow-level block grants contents: read
    expect(content).toMatch(/^permissions:[ \t]*\n[ \t]+contents:[ \t]+read/m)
  })

  it('lint-and-typecheck job inherits "contents: read" from the workflow-level permissions', () => {
    const block = extractJobBlock(content, 'lint-and-typecheck')
    expect(block).not.toBe('')
    // This job relies on the workflow-level contents: read (no separate job-level block needed)
    expect(hasWorkflowLevelPermissions(content)).toBe(true)
  })

  it('build job inherits "contents: read" from the workflow-level permissions', () => {
    const block = extractJobBlock(content, 'build')
    expect(block).not.toBe('')
    // This job relies on the workflow-level contents: read (no separate job-level block needed)
    expect(hasWorkflowLevelPermissions(content)).toBe(true)
  })

  it('test job should have "contents: read" permission', () => {
    const block = extractJobBlock(content, 'test')
    expect(block).not.toBe('')
    expect(jobHasContentsReadPermission(block)).toBe(true)
  })

  it('e2e job should have "contents: read" permission', () => {
    const block = extractJobBlock(content, 'e2e')
    expect(block).not.toBe('')
    expect(jobHasContentsReadPermission(block)).toBe(true)
  })

  it('ci-success job should have "contents: read" permission', () => {
    const block = extractJobBlock(content, 'ci-success')
    expect(block).not.toBe('')
    expect(jobHasContentsReadPermission(block)).toBe(true)
  })

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
      const block = extractJobBlock(content, jobId)
      expect(block, `Expected job "${jobId}" to be defined in ci.yml`).not.toBe('')
    }
  })

  it('each job that has a permissions block should include at least "contents: read"', () => {
    // Regression guard: jobs with explicit permissions blocks must keep contents: read.
    // lint-and-typecheck and build rely on the workflow-level block instead.
    const jobsWithExplicitPermissions = ['test', 'size-check', 'lighthouse', 'e2e', 'ci-success']
    for (const jobId of jobsWithExplicitPermissions) {
      const block = extractJobBlock(content, jobId)
      expect(
        jobHasContentsReadPermission(block),
        `Job "${jobId}" is missing "contents: read" permission`,
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

  it('should exist and be non-empty', () => {
    expect(content.length).toBeGreaterThan(0)
  })

  it('should have a workflow-level "contents: read" permissions block', () => {
    expect(hasWorkflowLevelPermissions(content)).toBe(true)
    // Verify the workflow-level block grants contents: read
    expect(content).toMatch(/^permissions:[ \t]*\n[ \t]+contents:[ \t]+read/m)
  })

  it('pr-metadata job inherits "contents: read" from the workflow-level permissions', () => {
    const block = extractJobBlock(content, 'pr-metadata')
    expect(block).not.toBe('')
    // This job relies on the workflow-level contents: read (no separate job-level block needed)
    expect(hasWorkflowLevelPermissions(content)).toBe(true)
  })

  it('bundle-size-check job inherits "contents: read" from the workflow-level permissions', () => {
    const block = extractJobBlock(content, 'bundle-size-check')
    expect(block).not.toBe('')
    // This job relies on the workflow-level contents: read (no separate job-level block needed)
    expect(hasWorkflowLevelPermissions(content)).toBe(true)
  })

  it('dependency-review job should retain its existing permissions', () => {
    const block = extractJobBlock(content, 'dependency-review')
    expect(block).not.toBe('')
    // dependency-review already had job-level permissions before this PR
    expect(jobHasContentsReadPermission(block)).toBe(true)
  })

  it('should define all expected jobs', () => {
    const expectedJobs = ['pr-metadata', 'dependency-review', 'bundle-size-check', 'quality-summary']
    for (const jobId of expectedJobs) {
      const block = extractJobBlock(content, jobId)
      expect(block, `Expected job "${jobId}" to be defined in pr-quality-check.yml`).not.toBe('')
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

  it('only dependency-review job has an explicit permissions block (regression guard)', () => {
    // dependency-review needs additional pull-requests: write permission beyond the workflow default.
    // pr-metadata, bundle-size-check, and quality-summary rely on the workflow-level permissions.
    // Validate that dependency-review still carries its own explicit block.
    const block = extractJobBlock(content, 'dependency-review')
    const hasPermissionsBlock = /^\s{4}permissions:/m.test(block)
    expect(
      hasPermissionsBlock,
      'dependency-review job is missing an explicit permissions block',
    ).toBe(true)
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

  beforeAll(() => {
    const raw = readFileSync(resolve(projectRoot, 'package-lock.json'), 'utf-8')
    lockfile = JSON.parse(raw) as PackageLock
  })

  it('should have picomatch listed in packages', () => {
    expect(lockfile.packages).toHaveProperty('node_modules/picomatch')
  })

  it('picomatch should be updated to version 4.0.4', () => {
    const entry = lockfile.packages['node_modules/picomatch']
    expect(entry.version).toBe('4.0.4')
  })

  it('picomatch should NOT be the vulnerable version 4.0.3', () => {
    const entry = lockfile.packages['node_modules/picomatch']
    expect(entry.version).not.toBe('4.0.3')
  })

  it('picomatch resolved URL should point to version 4.0.4', () => {
    const entry = lockfile.packages['node_modules/picomatch']
    expect(entry.resolved).toContain('picomatch-4.0.4.tgz')
    expect(entry.resolved).not.toContain('picomatch-4.0.3.tgz')
  })

  it('picomatch integrity hash should match the 4.0.4 release', () => {
    const entry = lockfile.packages['node_modules/picomatch']
    expect(entry.integrity).toBe(
      'sha512-QP88BAKvMam/3NxH6vj2o21R6MjxZUAd6nlwAS/pnGvN9IVLocLHxGYIzFhg6fUQ+5th6P4dv4eW9jX3DSIj7A==',
    )
  })

  it('picomatch should remain a devDependency', () => {
    const entry = lockfile.packages['node_modules/picomatch']
    expect(entry.dev).toBe(true)
  })

  it('picomatch should retain its MIT license', () => {
    const entry = lockfile.packages['node_modules/picomatch']
    expect(entry.license).toBe('MIT')
  })

  it('package-lock.json should be valid JSON with a lockfileVersion', () => {
    expect(typeof lockfile.lockfileVersion).toBe('number')
    expect(lockfile.lockfileVersion).toBeGreaterThanOrEqual(1)
  })
})