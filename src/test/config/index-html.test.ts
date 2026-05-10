import { describe, it, expect, beforeAll } from 'vitest'
import { readFileSync } from 'fs'
import { join } from 'path'

describe('index.html structure', () => {
  let content: string
  let document: Document

  beforeAll(() => {
    const filePath = join(process.cwd(), 'index.html')
    content = readFileSync(filePath, 'utf-8')
    // Use global DOMParser provided by the jsdom test environment
    document = new DOMParser().parseFromString(content, 'text/html')
  })

  describe('font preloads (added in this PR)', () => {
    it('should preload Inter variable font', () => {
      const links = document.querySelectorAll('link[rel="preload"][as="font"]')
      const interPreload = Array.from(links).find(
        (link) => link.getAttribute('href') === '/fonts/Inter-Variable.woff2'
      )
      expect(interPreload).toBeDefined()
    })

    it('should preload PlayfairDisplay variable font', () => {
      const links = document.querySelectorAll('link[rel="preload"][as="font"]')
      const playfairPreload = Array.from(links).find(
        (link) => link.getAttribute('href') === '/fonts/PlayfairDisplay-Variable.woff2'
      )
      expect(playfairPreload).toBeDefined()
    })

    it('should set font type to font/woff2 for Inter', () => {
      const links = document.querySelectorAll('link[rel="preload"][as="font"]')
      const interPreload = Array.from(links).find(
        (link) => link.getAttribute('href') === '/fonts/Inter-Variable.woff2'
      )
      expect(interPreload?.getAttribute('type')).toBe('font/woff2')
    })

    it('should set font type to font/woff2 for PlayfairDisplay', () => {
      const links = document.querySelectorAll('link[rel="preload"][as="font"]')
      const playfairPreload = Array.from(links).find(
        (link) => link.getAttribute('href') === '/fonts/PlayfairDisplay-Variable.woff2'
      )
      expect(playfairPreload?.getAttribute('type')).toBe('font/woff2')
    })

    it('should have crossorigin attribute on Inter font preload', () => {
      const links = document.querySelectorAll('link[rel="preload"][as="font"]')
      const interPreload = Array.from(links).find(
        (link) => link.getAttribute('href') === '/fonts/Inter-Variable.woff2'
      )
      expect(interPreload?.hasAttribute('crossorigin')).toBe(true)
    })

    it('should have crossorigin attribute on PlayfairDisplay font preload', () => {
      const links = document.querySelectorAll('link[rel="preload"][as="font"]')
      const playfairPreload = Array.from(links).find(
        (link) => link.getAttribute('href') === '/fonts/PlayfairDisplay-Variable.woff2'
      )
      expect(playfairPreload?.hasAttribute('crossorigin')).toBe(true)
    })
  })

  describe('responsive image preload (added in this PR)', () => {
    let imagePreload: Element | null

    beforeAll(() => {
      const links = document.querySelectorAll('link[rel="preload"][as="image"]')
      imagePreload =
        Array.from(links).find(
          (link) => link.getAttribute('href') === '/mockups/notes-list.avif'
        ) ?? null
    })

    it('should preload the LCP hero image', () => {
      expect(imagePreload).not.toBeNull()
    })

    it('should set image type to image/avif', () => {
      expect(imagePreload?.getAttribute('type')).toBe('image/avif')
    })

    it('should have imagesrcset attribute with multiple resolutions', () => {
      const imagesrcset = imagePreload?.getAttribute('imagesrcset')
      expect(imagesrcset).toBeDefined()
      expect(imagesrcset).toContain('400w')
      expect(imagesrcset).toContain('800w')
      expect(imagesrcset).toContain('1100w')
    })

    it('should reference correct image files in imagesrcset', () => {
      const imagesrcset = imagePreload?.getAttribute('imagesrcset')
      expect(imagesrcset).toContain('/mockups/notes-list-400w.avif')
      expect(imagesrcset).toContain('/mockups/notes-list-800w.avif')
      expect(imagesrcset).toContain('/mockups/notes-list.avif')
    })

    it('should have imagesizes attribute with responsive breakpoints', () => {
      const imagesizes = imagePreload?.getAttribute('imagesizes')
      expect(imagesizes).toBeDefined()
      expect(imagesizes).toContain('480px')
      expect(imagesizes).toContain('768px')
    })

    it('should reference 400px image for mobile breakpoint', () => {
      const imagesizes = imagePreload?.getAttribute('imagesizes')
      expect(imagesizes).toContain('400px')
    })

    it('should reference 800px image for tablet breakpoint', () => {
      const imagesizes = imagePreload?.getAttribute('imagesizes')
      expect(imagesizes).toContain('800px')
    })

    it('should reference 1100px image as default size', () => {
      const imagesizes = imagePreload?.getAttribute('imagesizes')
      expect(imagesizes).toContain('1100px')
    })
  })

  describe('HTML document integrity', () => {
    it('should have a valid doctype', () => {
      expect(content.toLowerCase()).toMatch(/^<!doctype html>/i)
    })

    it('should have lang attribute on html element', () => {
      const html = document.querySelector('html')
      expect(html?.getAttribute('lang')).toBe('en')
    })

    it('should have charset meta tag', () => {
      const charset = document.querySelector('meta[charset]')
      expect(charset?.getAttribute('charset')).toBe('UTF-8')
    })

    it('should have viewport meta tag', () => {
      const viewport = document.querySelector('meta[name="viewport"]')
      expect(viewport).not.toBeNull()
    })

    it('should have root div for React app', () => {
      const root = document.querySelector('#root')
      expect(root).not.toBeNull()
    })

    it('should have skip link for accessibility', () => {
      const skipLink = document.querySelector('a[href="#main"]')
      expect(skipLink).not.toBeNull()
    })
  })

  describe('no external font CDN references', () => {
    it('should not reference Google Fonts', () => {
      const fontLinks = document.querySelectorAll('link[href*="fonts.googleapis.com"]')
      expect(fontLinks.length).toBe(0)
    })

    it('should use self-hosted fonts only', () => {
      const fontPreloads = document.querySelectorAll('link[rel="preload"][as="font"]')
      fontPreloads.forEach((preload) => {
        const href = preload.getAttribute('href') ?? ''
        expect(href).toMatch(/^\/fonts\//)
      })
    })
  })
})