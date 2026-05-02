import { useState, useEffect, useRef, useCallback } from 'react'
import { Button } from '@components/ui/Button'
import { Icon } from '@components/ui/Icon'
import { ThemeToggle } from '@components/ui/ThemeToggle'
import {
  getFocusableElements,
  handleArrowNavigation,
  handleHomeEndNavigation,
} from '@utils/keyboard'
import { scrollToSection as scrollToSectionUtil } from '@utils/navigation'
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
      // Use the shared utility so lazy-loaded sections (e.g. #download) are
      // observed and scrolled to once their chunk mounts.
      scrollToSectionUtil(sectionId)
      // Close the mobile menu regardless of whether the section is mounted yet —
      // otherwise the menu would stay open while waiting for a lazy chunk.
      closeMobileMenu()
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
    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [mobileMenuOpen, closeMobileMenu])

  // Focus trap for mobile menu
  useEffect(() => {
    if (!mobileMenuOpen || !menuRef.current) return

    const menu = menuRef.current
    const focusableElements = getFocusableElements(menu)
    const firstFocusable = focusableElements[0]
    const lastFocusable = focusableElements[focusableElements.length - 1]

    const handleTabKey = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return

      if (event.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstFocusable) {
          event.preventDefault()
          lastFocusable?.focus()
        }
      } else {
        // Tab
        if (document.activeElement === lastFocusable) {
          event.preventDefault()
          firstFocusable?.focus()
        }
      }
    }

    menu.addEventListener('keydown', handleTabKey)

    // Focus first element when menu opens
    firstFocusable?.focus()

    return () => {
      menu.removeEventListener('keydown', handleTabKey)
    }
  }, [mobileMenuOpen])

  // Arrow key navigation for menu items
  useEffect(() => {
    if (!menuRef.current) return

    const menu = menuRef.current

    const handleArrowKeys = (event: KeyboardEvent) => {
      const focusableElements = getFocusableElements(menu)
      if (focusableElements.length === 0) return

      // Handle Home/End keys first (these work regardless of current focus position)
      const homeEndIndex = handleHomeEndNavigation(event, focusableElements)
      if (homeEndIndex !== null) {
        event.preventDefault()
        focusableElements[homeEndIndex]?.focus()
        return
      }

      // For arrow keys, we need to know the current index
      const currentIndex = focusableElements.findIndex((el) => el === document.activeElement)
      if (currentIndex === -1) return

      // Handle Arrow keys (horizontal navigation)
      const newIndex = handleArrowNavigation(event, focusableElements, currentIndex, 'horizontal')
      if (newIndex !== null) {
        event.preventDefault()
        focusableElements[newIndex]?.focus()
      }
    }

    menu.addEventListener('keydown', handleArrowKeys)

    return () => {
      menu.removeEventListener('keydown', handleArrowKeys)
    }
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
              <Button
                variant="primary"
                size="small"
                onClick={() => {
                  scrollToSection('download')
                }}
              >
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
