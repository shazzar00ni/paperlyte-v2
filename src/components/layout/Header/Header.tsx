import { useState, useEffect, useRef, useCallback } from 'react'
import { Button } from '@components/ui/Button'
import { Icon } from '@components/ui/Icon'
import { scrollToSection } from '@/utils/navigation'
import styles from './Header.module.css'

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLUListElement>(null)

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  const closeMobileMenu = useCallback(() => {
    setMobileMenuOpen(false)
    menuButtonRef.current?.focus()
  }, [])

  const handleNavClick = (sectionId: string) => {
    scrollToSection(sectionId)
    closeMobileMenu()
  }

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && mobileMenuOpen) {
        closeMobileMenu()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [mobileMenuOpen, closeMobileMenu])

  useEffect(() => {
    if (!mobileMenuOpen || !menuRef.current) return

    const menu = menuRef.current
    const focusableElements = menu.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const firstFocusable = focusableElements[0]
    const lastFocusable = focusableElements[focusableElements.length - 1]

    const handleKeyboardNavigation = (event: KeyboardEvent) => {
      const { key, shiftKey } = event

      if (key === 'Tab') {
        if (shiftKey) {
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

      if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(key)) {
        event.preventDefault()

        const currentIndex = Array.from(focusableElements).indexOf(
          document.activeElement as HTMLElement
        )

        let targetIndex: number

        switch (key) {
          case 'ArrowDown':
            targetIndex = currentIndex < focusableElements.length - 1 ? currentIndex + 1 : 0
            break
          case 'ArrowUp':
            targetIndex = currentIndex > 0 ? currentIndex - 1 : focusableElements.length - 1
            break
          case 'Home':
            targetIndex = 0
            break
          case 'End':
            targetIndex = focusableElements.length - 1
            break
          default:
            return
        }

        focusableElements[targetIndex]?.focus()
      }
    }

    menu.addEventListener('keydown', handleKeyboardNavigation)
    firstFocusable?.focus()

    return () => menu.removeEventListener('keydown', handleKeyboardNavigation)
  }, [mobileMenuOpen])

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.logo}>
          <Icon name="fa-feather" size="lg" />
          <span className={styles.logoText}>Paperlyte.</span>
        </div>

        <nav className={styles.nav} aria-label="Main navigation">
          <ul
            ref={menuRef}
            className={`${styles.navList} ${mobileMenuOpen ? styles.navListOpen : ''}`}
          >
            <li>
              <button
                type="button"
                onClick={() => handleNavClick('features')}
                className={styles.navLink}
              >
                Features
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => handleNavClick('mobile')}
                className={styles.navLink}
              >
                Mobile
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => handleNavClick('testimonials')}
                className={styles.navLink}
              >
                Testimonials
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => handleNavClick('download')}
                className={styles.navLink}
              >
                Download
              </button>
            </li>
            <li className={styles.navCta}>
              <Button variant="primary" size="small" onClick={() => handleNavClick('download')}>
                Get Started
              </Button>
            </li>
          </ul>

          <div className={styles.navActions}>
            <button
              ref={menuButtonRef}
              type="button"
              className={styles.mobileMenuButton}
              onClick={toggleMobileMenu}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
            >
              <Icon name={mobileMenuOpen ? 'fa-xmark' : 'fa-bars'} size="lg" />
            </button>
          </div>
        </nav>
      </div>
    </header>
  )
}
