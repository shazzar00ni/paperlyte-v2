import { useState, useEffect, useRef, useCallback } from 'react'
import type { RefObject } from 'react'
import { Button } from '@components/ui/Button'
import { BrandLogo } from '@components/ui/BrandLogo'
import { Icon } from '@components/ui/Icon'
import { ThemeToggle } from '@components/ui/ThemeToggle'
import {
  getFocusableElements,
  handleArrowNavigation,
  handleHomeEndNavigation,
} from '@utils/keyboard'
import { scrollToSection as scrollToSectionUtil } from '@utils/navigation'
import styles from './Header.module.css'

interface HeaderMenuControls {
  mobileMenuOpen: boolean
  menuButtonRef: RefObject<HTMLButtonElement | null>
  menuRef: RefObject<HTMLUListElement | null>
  toggleMobileMenu: () => void
  scrollToSection: (sectionId: string) => void
}

interface HeaderNavigationProps {
  menuRef: RefObject<HTMLUListElement | null>
  mobileMenuOpen: boolean
  scrollToSection: (sectionId: string) => void
}

interface HeaderActionsProps {
  menuButtonRef: RefObject<HTMLButtonElement | null>
  mobileMenuOpen: boolean
  toggleMobileMenu: () => void
}

const useEscapeKey = (mobileMenuOpen: boolean, closeMobileMenu: () => void): void => {
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent): void => {
      if (event.key === 'Escape' && mobileMenuOpen) {
        closeMobileMenu()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [mobileMenuOpen, closeMobileMenu])
}

const useFocusTrap = (
  mobileMenuOpen: boolean,
  menuRef: RefObject<HTMLUListElement | null>
): void => {
  useEffect(() => {
    if (!mobileMenuOpen || !menuRef.current) return

    const menu = menuRef.current
    const focusableElements = getFocusableElements(menu)
    const firstFocusable = focusableElements[0]
    const lastFocusable = focusableElements[focusableElements.length - 1]

    const handleTabKey = (event: KeyboardEvent): void => {
      if (event.key !== 'Tab') return

      if (event.shiftKey && document.activeElement === firstFocusable) {
        event.preventDefault()
        lastFocusable?.focus()
        return
      }

      if (!event.shiftKey && document.activeElement === lastFocusable) {
        event.preventDefault()
        firstFocusable?.focus()
      }
    }

    menu.addEventListener('keydown', handleTabKey)
    firstFocusable?.focus()

    return () => {
      menu.removeEventListener('keydown', handleTabKey)
    }
  }, [mobileMenuOpen, menuRef])
}

const useMenuKeyboardNavigation = (menuRef: RefObject<HTMLUListElement | null>): void => {
  useEffect(() => {
    if (!menuRef.current) return

    const menu = menuRef.current
    const handleArrowKeys = (event: KeyboardEvent): void => {
      const focusableElements = getFocusableElements(menu)
      if (focusableElements.length === 0) return

      const homeEndIndex = handleHomeEndNavigation(event, focusableElements)
      if (homeEndIndex !== null) {
        event.preventDefault()
        focusableElements[homeEndIndex]?.focus()
        return
      }

      const currentIndex = focusableElements.findIndex((el) => el === document.activeElement)
      if (currentIndex === -1) return

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
  }, [menuRef])
}

const useHeaderMenu = (): HeaderMenuControls => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLUListElement>(null)

  const toggleMobileMenu = useCallback((): void => {
    setMobileMenuOpen((prev) => !prev)
  }, [])

  const closeMobileMenu = useCallback((): void => {
    if (!mobileMenuOpen) return
    setMobileMenuOpen(false)
    menuButtonRef.current?.focus({ preventScroll: true })
  }, [mobileMenuOpen])

  const scrollToSection = useCallback(
    (sectionId: string): void => {
      scrollToSectionUtil(sectionId)
      closeMobileMenu()
    },
    [closeMobileMenu]
  )

  useEscapeKey(mobileMenuOpen, closeMobileMenu)
  useFocusTrap(mobileMenuOpen, menuRef)
  useMenuKeyboardNavigation(menuRef)

  return { mobileMenuOpen, menuButtonRef, menuRef, toggleMobileMenu, scrollToSection }
}

const HeaderNavigation = ({
  menuRef,
  mobileMenuOpen,
  scrollToSection,
}: HeaderNavigationProps): React.ReactElement => {
  return (
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
            href="#email-capture"
            onClick={(e) => {
              e.preventDefault()
              scrollToSection('email-capture')
            }}
            className={styles.navLink}
          >
            Waitlist
          </a>
        </li>
        <li className={styles.navCta}>
          <Button variant="primary" size="small" onClick={() => scrollToSection('email-capture')}>
            Join Waitlist
          </Button>
        </li>
      </ul>
    </nav>
  )
}

const HeaderActions = ({
  menuButtonRef,
  mobileMenuOpen,
  toggleMobileMenu,
}: HeaderActionsProps): React.ReactElement => {
  return (
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
  )
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
  const { mobileMenuOpen, menuButtonRef, menuRef, toggleMobileMenu, scrollToSection } =
    useHeaderMenu()

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <BrandLogo
          className={styles.logo}
          imageClassName={styles.logoImage}
          textClassName={styles.logoText}
        />
        <HeaderNavigation
          menuRef={menuRef}
          mobileMenuOpen={mobileMenuOpen}
          scrollToSection={scrollToSection}
        />
        <HeaderActions
          menuButtonRef={menuButtonRef}
          mobileMenuOpen={mobileMenuOpen}
          toggleMobileMenu={toggleMobileMenu}
        />
      </div>
    </header>
  )
}
