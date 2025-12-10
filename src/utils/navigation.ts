/**
 * Scrolls to a section by its ID with smooth behavior
 * @param sectionId - The ID of the section to scroll to
 */
export const scrollToSection = (sectionId: string): void => {
  const element = document.getElementById(sectionId)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' })
  }
}
