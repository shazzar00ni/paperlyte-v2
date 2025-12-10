import { describe, it, expect, vi, beforeEach } from 'vitest'
import { scrollToSection } from './navigation'

describe('navigation utilities', () => {
  describe('scrollToSection', () => {
    beforeEach(() => {
      // Clear any previous mocks
      vi.clearAllMocks()
    })

    it('should scroll to element when it exists', () => {
      const mockElement = document.createElement('div')
      mockElement.id = 'test-section'
      const scrollIntoViewMock = vi.fn()
      mockElement.scrollIntoView = scrollIntoViewMock

      // Add element to document
      document.body.appendChild(mockElement)

      scrollToSection('test-section')

      expect(scrollIntoViewMock).toHaveBeenCalledWith({ behavior: 'smooth' })

      // Cleanup
      document.body.removeChild(mockElement)
    })

    it('should not throw error when element does not exist', () => {
      expect(() => scrollToSection('non-existent-section')).not.toThrow()
    })

    it('should do nothing when element is null', () => {
      const getElementByIdSpy = vi.spyOn(document, 'getElementById')
      getElementByIdSpy.mockReturnValue(null)

      scrollToSection('missing-section')

      expect(getElementByIdSpy).toHaveBeenCalledWith('missing-section')

      getElementByIdSpy.mockRestore()
    })

    it('should call scrollIntoView with smooth behavior', () => {
      const mockElement = document.createElement('section')
      mockElement.id = 'features'
      const scrollIntoViewMock = vi.fn()
      mockElement.scrollIntoView = scrollIntoViewMock

      document.body.appendChild(mockElement)

      scrollToSection('features')

      expect(scrollIntoViewMock).toHaveBeenCalledTimes(1)
      expect(scrollIntoViewMock).toHaveBeenCalledWith({ behavior: 'smooth' })

      document.body.removeChild(mockElement)
    })
  })
})
