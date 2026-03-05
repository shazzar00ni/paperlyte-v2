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

/** Focus the element at a given index using find() to avoid direct property injection */
function focusAtIndex(elements: HTMLElement[], index: number): void {
  const target = elements.find((_, i) => i === index)
  target?.focus()
}

/** Enforce a Tab-key focus trap within the provided focusable element list */
function handleTabFocusTrap(event: KeyboardEvent, elements: HTMLElement[]): void {
  const first = elements[0]
  const last = elements[elements.length - 1]
  if (event.shiftKey) {
    if (document.activeElement === first) {
      event.preventDefault()
      last?.focus()
    }
  } else {
    if (document.activeElement === last) {
      event.preventDefault()
      first?.focus()
    }
  }
}

/** Handle Home / End / Arrow key navigation within the provided focusable element list */
function handleMenuNavigation(event: KeyboardEvent, elements: HTMLElement[]): void {
  const homeEndIndex = handleHomeEndNavigation(event, elements)
  if (homeEndIndex !== null) {
    event.preventDefault()
    focusAtIndex(elements, homeEndIndex)
    return
  }

  const currentIndex = elements.findIndex((el) => el === document.activeElement)
  if (currentIndex === -1) return

  const newIndex = handleArrowNavigation(event, elements, currentIndex, 'horizontal')
  if (newIndex !== null) {
    event.preventDefault()
    focusAtIndex(elements, newIndex)
  }
}

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
    // Compute once here; reused inside handleKeyDown to avoid repeated DOM queries
    const focusableElements = getFocusableElements(menu)

    const handleKeyDown = (event: KeyboardEvent) => {
      if (focusableElements.length === 0) return

      if (event.key === 'Tab') {
        handleTabFocusTrap(event, focusableElements)
        return
      }

      handleMenuNavigation(event, focusableElements)
    }

    menu.addEventListener('keydown', handleKeyDown)

    // Focus first element when menu opens
    focusableElements[0]?.focus()

    return () => {
      menu.removeEventListener('keydown', handleKeyDown)
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
