import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { beforeAll, describe, expect, it } from 'vitest'

const projectRoot = resolve(process.cwd())

function readProjectFile(path: string): string {
  return readFileSync(resolve(projectRoot, path), 'utf-8')
}

describe('production deployment ownership', () => {
  let circleCiConfig: string
  let githubDeployWorkflow: string

  beforeAll(() => {
    circleCiConfig = readProjectFile('.circleci/config.yml')
    githubDeployWorkflow = readProjectFile('.github/workflows/deploy.yml')
  })

  it('does not expose a second production deployment path through CircleCI', () => {
    expect(circleCiConfig).not.toMatch(/^\s{2}deploy:/m)
    expect(circleCiConfig).not.toContain('netlify deploy')
    expect(circleCiConfig).not.toContain('--prod')
  })

  it('keeps the GitHub production deploy behind the security and approval gates', () => {
    expect(githubDeployWorkflow).toMatch(/^\s{2}security-gate:/m)
    expect(githubDeployWorkflow).toMatch(/^\s{4}needs: security-gate$/m)
    expect(githubDeployWorkflow).toMatch(/^\s{4}environment:\n\s{6}name: production$/m)
  })

  it('serializes production deploys with the dedicated concurrency group', () => {
    expect(githubDeployWorkflow).toMatch(
      /^concurrency:\n\s{2}group: production-deploy\n\s{2}cancel-in-progress: false/m
    )
  })
})
