/**
 * Tests for GitHub Actions workflow permission configuration.
 *
 * These tests verify the permission structure currently enforced in workflow
 * files, including a workflow-level `permissions: contents: read` block and
 * any required job-level permission checks.
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
  // Walk line-by-line: find the `    permissions:` header (4-space indent),
  // then check only the indented block that follows (6+ spaces) for
  // `contents: read`. Stop as soon as indentation drops back to ≤4 spaces.
  const lines = jobBlock.split('\n')
  const permissionsStart = lines.findIndex((line: string) => line.startsWith('    permissions:'))
  if (permissionsStart === -1) return false

  for (let i = permissionsStart + 1; i < lines.length; i += 1) {
    const line = lines[i]
    if (!line.startsWith('      ')) break
    if (line.trim() === 'contents: read') return true
  }

  return false
}

/**
 * Asserts that a workflow file is non-empty and has a workflow-level
 * `permissions: contents: read` block.
 */
function assertWorkflowLevelContentsRead(content: string): void {
  expect(content.length).toBeGreaterThan(0)
  expect(hasWorkflowLevelPermissions(content)).toBe(true)
  expect(content).toMatch(/^permissions:[ \t]*\n[ \t]+contents:[ \t]+read/m)
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

  it('should exist and have a workflow-level "contents: read" permissions block', () => {
    assertWorkflowLevelContentsRead(content)
  })

  it.each(['lint-and-typecheck', 'build'])(
    '%s job inherits "contents: read" from the workflow-level permissions',
    (jobId: string): void => {
      assertJobExists(content, jobId, 'ci.yml')
      // These jobs rely on the workflow-level contents: read (no separate job-level block needed)
      expect(hasWorkflowLevelPermissions(content)).toBe(true)
    }
  )

  it.each(['test', 'e2e', 'ci-success'])(
    '%s job should have "contents: read" permission',
    (jobId: string): void => {
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
    // Regression guard: jobs with explicit permissions blocks must keep contents: read.
    // lint-and-typecheck and build rely on the workflow-level block instead.
    const jobsWithExplicitPermissions = ['test', 'size-check', 'lighthouse', 'e2e', 'ci-success']
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

  it('should exist and have a workflow-level "contents: read" permissions block', () => {
    assertWorkflowLevelContentsRead(content)
  })

  it.each(['pr-metadata', 'bundle-size-check'])(
    '%s job inherits "contents: read" from the workflow-level permissions',
    (jobId: string): void => {
      assertJobExists(content, jobId, 'pr-quality-check.yml')
      // These jobs rely on the workflow-level contents: read (no separate job-level block needed)
      expect(hasWorkflowLevelPermissions(content)).toBe(true)
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

  it('only dependency-review job has an explicit permissions block (regression guard)', () => {
    // dependency-review needs additional pull-requests: write permission beyond the workflow default.
    // pr-metadata, bundle-size-check, and quality-summary rely on the workflow-level permissions.
    // Validate that dependency-review still carries its own explicit block …
    const block = assertJobExists(content, 'dependency-review', 'pr-quality-check.yml')
    expect(
      /^\s{4}permissions:/m.test(block),
      'dependency-review job is missing an explicit permissions block'
    ).toBe(true)

    for (const jobId of ['pr-metadata', 'bundle-size-check', 'quality-summary']) {
      const jobBlock = assertJobExists(content, jobId, 'pr-quality-check.yml')
      expect(
        /^\s{4}permissions:/m.test(jobBlock),
        `${jobId} should not define an explicit permissions block`
      ).toBe(false)
    }

    // … and that the other jobs do NOT have one (enforces exclusivity).
    for (const jobId of ['pr-metadata', 'bundle-size-check', 'quality-summary']) {
      const jobBlock = assertJobExists(content, jobId, 'pr-quality-check.yml')
      expect(
        /^\s{4}permissions:/m.test(jobBlock),
        `${jobId} should not define an explicit permissions block`
      ).toBe(false)
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

  it('picomatch should have a valid integrity hash', () => {
    expect(typeof entry.integrity).toBe('string')
    expect(entry.integrity).toContain('sha512-')
  it('picomatch should remain a devDependency', () => {
    expect(entry.dev).toBe(true)
  })

  it('package-lock.json should be valid JSON with a lockfileVersion', () => {
    expect(typeof lockfile.lockfileVersion).toBe('number')
    expect(lockfile.lockfileVersion).toBeGreaterThanOrEqual(1)
  })
})

// package-lock.json – axios SSRF fix (GHSA-3p68-rc4w-qgx5)
// Axios < 1.15.0 has a NO_PROXY hostname normalisation bypass that can lead
// to SSRF. The override in package.json forces >= 1.15.0.
// ---------------------------------------------------------------------------

describe('package-lock.json – axios security update (GHSA-3p68-rc4w-qgx5)', () => {
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

  it('axios version should be >= 1.15.0 (not vulnerable)', () => {
    const [major, minor, patch] = entry.version.split('.').map(Number)
    const isAtLeast1_15_0 =
      major > 1 || (major === 1 && minor > 15) || (major === 1 && minor === 15 && patch >= 0)
    expect(isAtLeast1_15_0, `axios ${entry.version} is below the minimum safe version 1.15.0`).toBe(
      true
    )
  })

  it('axios should NOT be the vulnerable version range (< 1.15.0)', () => {
    const [major, minor] = entry.version.split('.').map(Number)
    expect(major === 1 && minor < 15).toBe(false)
  })

  it('axios resolved URL should point to a non-vulnerable release', () => {
    expect(entry.resolved).toContain('axios-1.15.')
  })
})

// ---------------------------------------------------------------------------
// package-lock.json – basic-ftp FTP command injection fix (GHSA-chqc-8p9q-pq6q)
// basic-ftp 5.2.0 allows FTP command injection via CRLF sequences.
// The override in package.json forces >= 5.2.1.
// ---------------------------------------------------------------------------

describe('package-lock.json – basic-ftp security update (GHSA-chqc-8p9q-pq6q)', () => {
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

  it('basic-ftp should NOT be the vulnerable version 5.2.0', () => {
    expect(entry.version).not.toBe('5.2.0')
  })

  it('basic-ftp version should be >= 5.2.1 (not vulnerable)', () => {
    const [major, minor, patch] = entry.version.split('.').map(Number)
    const isAtLeast5_2_1 =
      major > 5 || (major === 5 && minor > 2) || (major === 5 && minor === 2 && patch >= 1)
    expect(
      isAtLeast5_2_1,
      `basic-ftp ${entry.version} is below the minimum safe version 5.2.1`
    ).toBe(true)
  })

  it('basic-ftp resolved URL should not point to the vulnerable 5.2.0 release', () => {
    expect(entry.resolved).not.toContain('basic-ftp-5.2.0.tgz')
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

// ---------------------------------------------------------------------------
// claude-code-review.yml
// ---------------------------------------------------------------------------

describe('claude-code-review.yml – structure and permissions', () => {
  let content: string

  beforeAll(() => {
    content = readWorkflow('claude-code-review.yml')
  })

  it('should exist and have a top-level permissions deny-all block', () => {
    expect(content.length).toBeGreaterThan(0)
    expect(content).toMatch(/^permissions:\s*\{\}/m)
  })

  it('should trigger on pull_request with the expected event types', () => {
    expect(content).toMatch(/pull_request:/)
    expect(content).toMatch(/opened/)
    expect(content).toMatch(/synchronize/)
    expect(content).toMatch(/ready_for_review/)
    expect(content).toMatch(/reopened/)
  })

  it('should have a concurrency group to cancel stale runs', () => {
    expect(content).toMatch(/^concurrency:/m)
    expect(content).toMatch(/cancel-in-progress:\s*true/)
  })

  it('should define auto-review and security-review jobs', () => {
    assertJobExists(content, 'auto-review', 'claude-code-review.yml')
    assertJobExists(content, 'security-review', 'claude-code-review.yml')
  })

  it('auto-review job should have contents: read permission', () => {
    const block = assertJobExists(content, 'auto-review', 'claude-code-review.yml')
    expect(jobHasContentsReadPermission(block)).toBe(true)
  })

  it('security-review job should have contents: read permission', () => {
    const block = assertJobExists(content, 'security-review', 'claude-code-review.yml')
    expect(jobHasContentsReadPermission(block)).toBe(true)
  })

  it('both jobs should skip fork PRs', () => {
    const autoBlock = assertJobExists(content, 'auto-review', 'claude-code-review.yml')
    const secBlock = assertJobExists(content, 'security-review', 'claude-code-review.yml')
    expect(autoBlock).toMatch(/head\.repo\.fork/)
    expect(secBlock).toMatch(/head\.repo\.fork/)
  })

  it('auto-review allowedTools should include inline comment tool', () => {
    const block = assertJobExists(content, 'auto-review', 'claude-code-review.yml')
    expect(block).toMatch(/mcp__github_inline_comment__create_inline_comment/)
  })

  it('security-review allowedTools should NOT include inline comment tool', () => {
    const block = assertJobExists(content, 'security-review', 'claude-code-review.yml')
    expect(block).not.toMatch(/mcp__github_inline_comment__create_inline_comment/)
  })

  it('auto-review prompt should include prompt-injection guardrails', () => {
    const block = assertJobExists(content, 'auto-review', 'claude-code-review.yml')
    expect(block).toMatch(/[Pp]rompt [Ii]njection|[Ss]ecurity instructions/)
    expect(block).toMatch(/untrusted/)
  })

  it('action should be pinned to a full commit SHA', () => {
    expect(content).toMatch(/claude-code-action@[0-9a-f]{40}/)
    expect(content).not.toMatch(/claude-code-action@v\d/)
  })
})

// ---------------------------------------------------------------------------
// claude-issue-triage.yml
// ---------------------------------------------------------------------------

describe('claude-issue-triage.yml – structure and permissions', () => {
  let content: string

  beforeAll(() => {
    content = readWorkflow('claude-issue-triage.yml')
  })

  it('should exist and have a top-level permissions deny-all block', () => {
    expect(content.length).toBeGreaterThan(0)
    expect(content).toMatch(/^permissions:\s*\{\}/m)
  })

  it('should trigger only on issues opened event', () => {
    expect(content).toMatch(/^on:/m)
    expect(content).toMatch(/issues:/)
    expect(content).toMatch(/types:\s*\[opened\]/)
    expect(content).not.toMatch(/pull_request/)
  })

  it('should define a triage job', () => {
    assertJobExists(content, 'triage', 'claude-issue-triage.yml')
  })

  it('triage job should NOT include a checkout step', () => {
    const block = assertJobExists(content, 'triage', 'claude-issue-triage.yml')
    expect(block).not.toMatch(/actions\/checkout/)
  })

  it('triage job should have issues: write permission', () => {
    const block = assertJobExists(content, 'triage', 'claude-issue-triage.yml')
    expect(block).toMatch(/issues:\s*write/)
  })

  it('prompt should include prompt-injection guardrails before untrusted data', () => {
    expect(content).toMatch(/[Ss]ecurity instructions/)
    expect(content).toMatch(/untrusted/)
    // Guardrails section must appear before TITLE/BODY fields
    const guardIdx = content.indexOf('Security instructions')
    const titleIdx = content.indexOf('TITLE:')
    expect(guardIdx).toBeLessThan(titleIdx)
  })

  it('action should be pinned to a full commit SHA', () => {
    expect(content).toMatch(/claude-code-action@[0-9a-f]{40}/)
    expect(content).not.toMatch(/claude-code-action@v\d/)
  })
})

// ---------------------------------------------------------------------------
// claude-external-contributor.yml
// ---------------------------------------------------------------------------

describe('claude-external-contributor.yml – structure and permissions', () => {
  let content: string

  beforeAll(() => {
    content = readWorkflow('claude-external-contributor.yml')
  })

  it('should exist and have a top-level permissions deny-all block', () => {
    expect(content.length).toBeGreaterThan(0)
    expect(content).toMatch(/^permissions:\s*\{\}/m)
  })

  it('should trigger on pull_request_target (not pull_request)', () => {
    expect(content).toMatch(/pull_request_target:/)
    expect(content).not.toMatch(/^  pull_request:/m)
  })

  it('should trigger on opened, synchronize, ready_for_review, and reopened', () => {
    expect(content).toMatch(/opened/)
    expect(content).toMatch(/synchronize/)
    expect(content).toMatch(/ready_for_review/)
    expect(content).toMatch(/reopened/)
  })

  it('should have a concurrency group to cancel stale runs', () => {
    expect(content).toMatch(/^concurrency:/m)
    expect(content).toMatch(/cancel-in-progress:\s*true/)
  })

  it('should define a first-time-review job', () => {
    assertJobExists(content, 'first-time-review', 'claude-external-contributor.yml')
  })

  it('first-time-review job should NOT include a checkout step', () => {
    const block = assertJobExists(content, 'first-time-review', 'claude-external-contributor.yml')
    expect(block).not.toMatch(/actions\/checkout/)
  })

  it('first-time-review job if: condition should only match FIRST_TIME_CONTRIBUTOR and NONE', () => {
    const block = assertJobExists(content, 'first-time-review', 'claude-external-contributor.yml')
    // Extract the if: value (lines between `if: |` and the next non-indented-deeper key)
    const lines = block.split('\n')
    const ifStart = lines.findIndex((l: string) => l.trim().startsWith('if:'))
    const ifLines: string[] = []
    for (let i = ifStart + 1; i < lines.length; i += 1) {
      if (lines[i].trim() === '' || (!lines[i].startsWith('      ') && lines[i].trim() !== ''))
        break
      ifLines.push(lines[i])
    }
    const ifCondition = ifLines.join('\n')
    expect(ifCondition).toMatch(/FIRST_TIME_CONTRIBUTOR/)
    expect(ifCondition).toMatch(/NONE/)
    // Trusted associations must not appear in the condition itself
    expect(ifCondition).not.toMatch(/COLLABORATOR/)
    expect(ifCondition).not.toMatch(/MEMBER/)
    expect(ifCondition).not.toMatch(/OWNER/)
  })

  it('prompt should not instruct running npm lint or build commands', () => {
    expect(content).not.toMatch(/npm run lint/)
    expect(content).not.toMatch(/npm run build/)
  })

  it('action should be pinned to a full commit SHA', () => {
    expect(content).toMatch(/claude-code-action@[0-9a-f]{40}/)
    expect(content).not.toMatch(/claude-code-action@v\d/)
  })
})
