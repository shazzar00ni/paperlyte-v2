import { useState, useEffect, useRef, useCallback } from 'react'
import { Button } from '@components/ui/Button'
import { Icon } from '@components/ui/Icon'
import { ThemeToggle } from '@components/ui/ThemeToggle'
import {
  getFocusableElements,
  handleArrowNavigation,
  handleHomeEndNavigation,
} from '@utils/keyboard'
import styles from './Header.module.css'

/**
 * Main navigation header component with responsive mobile menu
 * Features smooth scrolling to sections, keyboard navigation, focus trap, and theme toggle
 * Implements ARIA best practices for accessible navigation and menu behavior
 *
 * @returns Header element with navigation, logo, and theme toggle
 *
 * @example
 * ```tsx
 * // In your App or layout component
 * <Header />
 * <main>
 *   <section id="features">Features</section>
 *   <section id="pricing">Pricing</section>
 * </main>
 * ```
 */
export const Header = (): React.ReactElement => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLUListElement>(null)

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  const closeMobileMenu = useCallback(() => {
    setMobileMenuOpen(false)
    // Return focus to menu button when closing
    menuButtonRef.current?.focus()
  }, [])

  const scrollToSection = useCallback(
    (sectionId: string) => {
      const element = document.getElementById(sectionId)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
        closeMobileMenu()
      }
    },
    [closeMobileMenu]
  )

  // Handle Escape key to close menu
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && mobileMenuOpen) {
        closeMobileMenu()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [mobileMenuOpen, closeMobileMenu])

  // Focus trap and arrow key navigation for mobile menu – single handler to reduce
  // the number of event listeners registered and re-registered on menu toggle.
  useEffect(() => {
    if (!mobileMenuOpen || !menuRef.current) return

    const menu = menuRef.current
    const focusableElements = getFocusableElements(menu)

    const handleKeyDown = (event: KeyboardEvent) => {
      const elements = getFocusableElements(menu)
      if (elements.length === 0) return

      // Focus trap: cycle focus on Tab / Shift+Tab
      if (event.key === 'Tab') {
        const firstFocusable = elements[0]
        const lastFocusable = elements[elements.length - 1]

        if (event.shiftKey) {
          if (document.activeElement === firstFocusable) {
            event.preventDefault()
            lastFocusable?.focus()
          }
        } else {
          if (document.activeElement === lastFocusable) {
            event.preventDefault()
            firstFocusable?.focus()
          }
        }
        return
      }

      // Handle Home/End keys first (these work regardless of current focus position)
      const homeEndIndex = handleHomeEndNavigation(event, elements)
      if (homeEndIndex !== null) {
        event.preventDefault()
        elements[homeEndIndex]?.focus()
        return
      }

      // Handle Arrow keys (horizontal navigation)
      const currentIndex = elements.findIndex((el) => el === document.activeElement)
      if (currentIndex === -1) return

      const newIndex = handleArrowNavigation(event, elements, currentIndex, 'horizontal')
      if (newIndex !== null) {
        event.preventDefault()
        elements[newIndex]?.focus()
      }
    }

    menu.addEventListener('keydown', handleKeyDown)

    // Focus first element when menu opens
    focusableElements[0]?.focus()

    return () => menu.removeEventListener('keydown', handleKeyDown)
  }, [mobileMenuOpen])

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.logo}>
          <Icon name="fa-feather" size="lg" />
          <span className={styles.logoText}>Paperlyte</span>
        </div>

        <nav className={styles.nav} aria-label="Main navigation">
          <ul
            id="main-menu"
            ref={menuRef}
            className={`${styles.navList} ${mobileMenuOpen ? styles.navListOpen : ''}`}
          >
            <li>
              <a
                href="#features"
                onClick={(e) => {
                  e.preventDefault()
                  scrollToSection('features')
                }}
                className={styles.navLink}
              >
                Features
              </a>
            </li>
            <li>
              <a
                href="#download"
                onClick={(e) => {
                  e.preventDefault()
                  scrollToSection('download')
                }}
                className={styles.navLink}
              >
                Download
              </a>
            </li>
            <li className={styles.navCta}>
              <Button variant="primary" size="small" onClick={() => scrollToSection('download')}>
                Get Started
              </Button>
            </li>
          </ul>
        </nav>

        <div className={styles.navActions}>
          <ThemeToggle />
          <button
            ref={menuButtonRef}
            className={styles.mobileMenuButton}
            onClick={toggleMobileMenu}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
            aria-controls="main-menu"
          >
            <Icon name={mobileMenuOpen ? 'fa-xmark' : 'fa-bars'} size="lg" />
          </button>
        </div>
      </div>
    </header>
  )
}
