/**
 * Tests for the theme-init.js FOUC-prevention bootstrap script.
 *
 * The script is a plain IIFE that runs before React hydrates; it:
 *   1. Reads <meta name="allow-persistent-theme"> to decide whether
 *      stored preferences are honoured.
 *   2. Reads localStorage to find an explicit user preference.
 *   3. Falls back to prefers-color-scheme when no stored value exists.
 *   4. Writes the resolved theme to document.documentElement.dataset.theme.
 *
 * Strategy: read the script as a string and eval() it inside jsdom for each
 * test case so that every test gets a clean DOM and fresh mock state.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const scriptContent = readFileSync(join(import.meta.dirname, './theme-init.js'), 'utf-8')

/** Execute the IIFE inside the current jsdom context. */
function runScript() {
  // eval is the only practical way to re-execute a non-module IIFE per-test.
  // eslint-disable-next-line no-eval
  eval(scriptContent)
}

// ---------------------------------------------------------------------------
// DOM / storage helpers
// ---------------------------------------------------------------------------

function setAllowPersistentMeta(content: string) {
  document.querySelector('meta[name="allow-persistent-theme"]')?.remove()
  const meta = document.createElement('meta')
  meta.setAttribute('name', 'allow-persistent-theme')
  meta.setAttribute('content', content)
  document.head.appendChild(meta)
}

function setMatchMedia(prefersDark: boolean) {
  Object.defineProperty(globalThis, 'matchMedia', {
    writable: true,
    configurable: true,
    value: (query: string) => ({
      matches: query === '(prefers-color-scheme: dark)' ? prefersDark : false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => true,
    }),
  })
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('theme-init.js', () => {
  beforeEach(() => {
    delete document.documentElement.dataset.theme
    localStorage.clear()
    document.querySelector('meta[name="allow-persistent-theme"]')?.remove()
    setMatchMedia(false) // default: system prefers light
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  // -------------------------------------------------------------------------
  // Stored preference wins when persistence is enabled
  // -------------------------------------------------------------------------
  describe('stored preference is used when persistence is allowed', () => {
    beforeEach(() => {
      setAllowPersistentMeta('true')
      localStorage.setItem('theme-user-preference', 'true')
    })

    it('applies stored "light" theme even when OS prefers dark', () => {
      localStorage.setItem('theme', 'light')
      setMatchMedia(true)
      runScript()
      expect(document.documentElement.dataset.theme).toBe('light')
    })

    it('applies stored "dark" theme even when OS prefers light', () => {
      localStorage.setItem('theme', 'dark')
      setMatchMedia(false)
      runScript()
      expect(document.documentElement.dataset.theme).toBe('dark')
    })
  })

  // -------------------------------------------------------------------------
  // Persistence disabled — system theme is authoritative
  // -------------------------------------------------------------------------
  describe('system theme is used when meta content is "false" (opt-out)', () => {
    beforeEach(() => {
      // User has a stored preference that should be ignored
      localStorage.setItem('theme-user-preference', 'true')
      localStorage.setItem('theme', 'light')
    })

    it('resolves to dark when OS prefers dark and meta opts out', () => {
      setAllowPersistentMeta('false')
      setMatchMedia(true)
      runScript()
      expect(document.documentElement.dataset.theme).toBe('dark')
    })

    it('resolves to light when OS prefers light and meta opts out', () => {
      setAllowPersistentMeta('false')
      setMatchMedia(false)
      runScript()
      expect(document.documentElement.dataset.theme).toBe('light')
    })
  })

  // -------------------------------------------------------------------------
  // Case-insensitive / whitespace-tolerant meta parsing
  // -------------------------------------------------------------------------
  describe('meta content normalization (trim + lowercase)', () => {
    it.each(['False', 'FALSE', ' false ', '\tfalse\t'])(
      'treats content %j as opt-out → system light theme wins over stored dark',
      (content) => {
        setAllowPersistentMeta(content)
        localStorage.setItem('theme-user-preference', 'true')
        localStorage.setItem('theme', 'dark')
        setMatchMedia(false) // system light
        runScript()
        expect(document.documentElement.dataset.theme).toBe('light')
      }
    )
  })

  // -------------------------------------------------------------------------
  // No stored preference → system theme fallback
  // -------------------------------------------------------------------------
  describe('system theme fallback when no stored preference exists', () => {
    beforeEach(() => {
      setAllowPersistentMeta('true')
      // localStorage is empty
    })

    it('uses dark when OS prefers dark', () => {
      setMatchMedia(true)
      runScript()
      expect(document.documentElement.dataset.theme).toBe('dark')
    })

    it('uses light when OS prefers light', () => {
      setMatchMedia(false)
      runScript()
      expect(document.documentElement.dataset.theme).toBe('light')
    })
  })

  // -------------------------------------------------------------------------
  // No meta tag → persistence is allowed by default
  // -------------------------------------------------------------------------
  describe('missing meta tag defaults to persistence allowed', () => {
    it('uses stored theme when no meta tag is present', () => {
      localStorage.setItem('theme-user-preference', 'true')
      localStorage.setItem('theme', 'dark')
      setMatchMedia(false) // system light — stored dark wins
      runScript()
      expect(document.documentElement.dataset.theme).toBe('dark')
    })
  })

  // -------------------------------------------------------------------------
  // localStorage unavailable (private browsing / strict security settings)
  // -------------------------------------------------------------------------
  describe('localStorage unavailability', () => {
    it('falls back to system theme when getItem throws', () => {
      setAllowPersistentMeta('true')
      setMatchMedia(true) // system dark
      vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('localStorage is unavailable')
      })
      runScript()
      expect(document.documentElement.dataset.theme).toBe('dark')
    })
  })
})
