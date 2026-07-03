import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { beforeAll, describe, expect, it } from 'vitest'

interface PackageManifest {
  devDependencies?: Record<string, string>
}

interface PackageLock {
  packages: Record<
    string,
    { version?: string; resolved?: string; devDependencies?: Record<string, string> }
  >
}

describe('package manifests – eslint runtime dependencies', () => {
  let packageJson: PackageManifest
  let packageLock: PackageLock

  beforeAll(() => {
    packageJson = JSON.parse(
      readFileSync(resolve(process.cwd(), 'package.json'), 'utf-8')
    ) as PackageManifest
    packageLock = JSON.parse(
      readFileSync(resolve(process.cwd(), 'package-lock.json'), 'utf-8')
    ) as PackageLock
  })

  it('declares @eslint/js as an explicit devDependency in package.json', () => {
    expect(packageJson.devDependencies).toHaveProperty('@eslint/js')
  })

  it('keeps @eslint/js in the lockfile root package metadata', () => {
    expect(packageLock.packages[''].devDependencies).toHaveProperty('@eslint/js')
  })

  it('pins an installable @eslint/js package entry in package-lock.json', () => {
    const entry = packageLock.packages['node_modules/@eslint/js']

    expect(entry).toBeDefined()
    expect(entry?.version).toBeTruthy()
    expect(entry?.resolved).toContain(`js-${entry?.version}.tgz`)
  })
})
