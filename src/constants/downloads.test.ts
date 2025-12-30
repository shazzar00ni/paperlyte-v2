/**
 * Downloads Constants Tests
 *
 * Tests for DOWNLOAD_URLS constant to ensure data structure correctness
 * and validate URL formats.
 */

import { describe, it, expect } from 'vitest'
import { DOWNLOAD_URLS, GITHUB_URL } from './downloads'
import { LEGAL_CONFIG } from './legal'

describe('Downloads Constants', () => {
  describe('DOWNLOAD_URLS Structure', () => {
    it('should be defined as an object', () => {
      expect(typeof DOWNLOAD_URLS).toBe('object')
      expect(DOWNLOAD_URLS).not.toBeNull()
    })

    it('should have all platform keys', () => {
      expect(DOWNLOAD_URLS).toHaveProperty('mac')
      expect(DOWNLOAD_URLS).toHaveProperty('windows')
      expect(DOWNLOAD_URLS).toHaveProperty('ios')
      expect(DOWNLOAD_URLS).toHaveProperty('android')
      expect(DOWNLOAD_URLS).toHaveProperty('linux')
    })

    it('should have exactly 5 platform entries', () => {
      expect(Object.keys(DOWNLOAD_URLS).length).toBe(5)
    })

    it('should have string values for all URLs', () => {
      Object.entries(DOWNLOAD_URLS).forEach(([platform, url]) => {
        expect(
          typeof url,
          `URL for ${platform} should be a string`
        ).toBe('string')
      })
    })

    it('should be marked as const', () => {
      // Attempting to modify should fail (TypeScript enforces this)
      // This is more of a documentation test
      expect(Object.isFrozen(DOWNLOAD_URLS)).toBe(false) // as const is compile-time only
    })
  })

  describe('DOWNLOAD_URLS Content Validation', () => {
    it('should have valid URL format for all entries', () => {
      Object.entries(DOWNLOAD_URLS).forEach(([platform, url]) => {
        // Should be either a valid URL or contain GitHub placeholder
        const isValidUrl = url.startsWith('http://') || url.startsWith('https://')
        const hasGitHubRef = url.includes('github.com') || url.includes(LEGAL_CONFIG.social.github)

        expect(
          isValidUrl || hasGitHubRef,
          `URL for ${platform} should be valid or reference GitHub`
        ).toBe(true)
      })
    })

    it('should have .dmg extension for macOS download', () => {
      expect(DOWNLOAD_URLS.mac).toContain('.dmg')
    })

    it('should have .exe extension for Windows download', () => {
      expect(DOWNLOAD_URLS.windows).toContain('.exe')
    })

    it('should reference App Store for iOS', () => {
      expect(DOWNLOAD_URLS.ios).toContain('apps.apple.com')
    })

    it('should reference Play Store for Android', () => {
      expect(DOWNLOAD_URLS.android).toContain('play.google.com')
    })

    it('should use GitHub releases for desktop platforms', () => {
      expect(DOWNLOAD_URLS.mac).toContain('releases')
      expect(DOWNLOAD_URLS.windows).toContain('releases')
      expect(DOWNLOAD_URLS.linux).toContain('releases')
    })

    it('should use consistent GitHub URL from legal config', () => {
      const githubBase = LEGAL_CONFIG.social.github

      expect(DOWNLOAD_URLS.mac).toContain(githubBase)
      expect(DOWNLOAD_URLS.windows).toContain(githubBase)
      expect(DOWNLOAD_URLS.linux).toContain(githubBase)
    })
  })

  describe('GITHUB_URL Export', () => {
    it('should export GITHUB_URL', () => {
      expect(GITHUB_URL).toBeDefined()
    })

    it('should match LEGAL_CONFIG.social.github', () => {
      expect(GITHUB_URL).toBe(LEGAL_CONFIG.social.github)
    })

    it('should be a valid URL string', () => {
      expect(typeof GITHUB_URL).toBe('string')
      expect(GITHUB_URL).toMatch(/^https?:\/\//)
    })

    it('should contain github.com', () => {
      expect(GITHUB_URL).toContain('github.com')
    })
  })

  describe('Platform-Specific URLs', () => {
    describe('macOS', () => {
      it('should point to latest release with dmg file', () => {
        expect(DOWNLOAD_URLS.mac).toContain('/releases/latest/download/')
        expect(DOWNLOAD_URLS.mac).toContain('Paperlyte-macOS.dmg')
      })
    })

    describe('Windows', () => {
      it('should point to latest release with exe file', () => {
        expect(DOWNLOAD_URLS.windows).toContain('/releases/latest/download/')
        expect(DOWNLOAD_URLS.windows).toContain('Paperlyte-Windows.exe')
      })
    })

    describe('iOS', () => {
      it('should have valid App Store URL format', () => {
        expect(DOWNLOAD_URLS.ios).toMatch(/^https:\/\/apps\.apple\.com\/app\//)
      })

      it('should include app name or ID', () => {
        expect(DOWNLOAD_URLS.ios).toContain('paperlyte')
      })
    })

    describe('Android', () => {
      it('should have valid Play Store URL format', () => {
        expect(DOWNLOAD_URLS.android).toMatch(
          /^https:\/\/play\.google\.com\/store\/apps\/details\?id=/
        )
      })

      it('should include package ID', () => {
        expect(DOWNLOAD_URLS.android).toContain('com.paperlyte.app')
      })
    })

    describe('Linux', () => {
      it('should point to releases page', () => {
        expect(DOWNLOAD_URLS.linux).toContain('/releases/latest')
      })
    })
  })

  describe('Snapshot Tests', () => {
    it('should match DOWNLOAD_URLS snapshot', () => {
      expect(DOWNLOAD_URLS).toMatchSnapshot()
    })

    it('should match GITHUB_URL snapshot', () => {
      expect(GITHUB_URL).toMatchSnapshot()
    })
  })
})
