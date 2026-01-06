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
        expect(typeof url, `URL for ${platform} should be a string`).toBe('string')
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
        const isValidUrl = url.startsWith('http://') || url.startsWith('https://')

        expect(isValidUrl, `URL for ${platform} should be valid`).toBe(true)

        // Parse and validate the hostname (not just substring)
        try {
          const urlObj = new URL(url)

          // Check if it's a GitHub URL by validating the actual hostname
          const isGitHub =
            urlObj.hostname === 'github.com' || urlObj.hostname.endsWith('.github.com')
          const isAppStore = urlObj.hostname === 'apps.apple.com'
          const isPlayStore = urlObj.hostname === 'play.google.com'

          expect(
            isGitHub || isAppStore || isPlayStore,
            `URL for ${platform} should use a valid hostname (github.com, apps.apple.com, or play.google.com), got ${urlObj.hostname}`
          ).toBe(true)
        } catch {
          throw new Error(`Invalid URL for ${platform}: ${url}`)
        }
      })
    })

    it('should have .dmg extension for macOS download', () => {
      expect(DOWNLOAD_URLS.mac).toContain('.dmg')
    })

    it('should have .exe extension for Windows download', () => {
      expect(DOWNLOAD_URLS.windows).toContain('.exe')
    })

    it('should reference App Store for iOS', () => {
      const urlObj = new URL(DOWNLOAD_URLS.ios)
      expect(urlObj.hostname).toBe('apps.apple.com')
    })

    it('should reference Play Store for Android', () => {
      const urlObj = new URL(DOWNLOAD_URLS.android)
      expect(urlObj.hostname).toBe('play.google.com')
    })

    it('should use GitHub releases for desktop platforms', () => {
      expect(DOWNLOAD_URLS.mac).toContain('releases')
      expect(DOWNLOAD_URLS.windows).toContain('releases')
      expect(DOWNLOAD_URLS.linux).toContain('releases')
    })

    it('should use consistent GitHub URL from legal config', () => {
      const githubBase = LEGAL_CONFIG.social.github

      // Validate URLs start with the GitHub base (not just contain it)
      expect(DOWNLOAD_URLS.mac.startsWith(githubBase)).toBe(true)
      expect(DOWNLOAD_URLS.windows.startsWith(githubBase)).toBe(true)
      expect(DOWNLOAD_URLS.linux.startsWith(githubBase)).toBe(true)
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

    it('should have github.com as hostname', () => {
      const urlObj = new URL(GITHUB_URL)
      expect(urlObj.hostname).toBe('github.com')
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
