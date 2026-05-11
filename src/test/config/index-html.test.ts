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

  describe('font preloads', () => {
    it('should not preload fonts in index.html', () => {
      const links = document.querySelectorAll('link[rel="preload"][as="font"]')
      expect(links.length).toBe(0)
    })
  })

  describe('critical image preload', () => {
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

    it('should not define imagesrcset on the preload link', () => {
      const imagesrcset = imagePreload?.getAttribute('imagesrcset')
      expect(imagesrcset).toBeNull()
    })

    it('should not define imagesizes on the preload link', () => {
      const imagesizes = imagePreload?.getAttribute('imagesizes')
      expect(imagesizes).toBeNull()
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
