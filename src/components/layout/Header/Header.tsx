import React, { useState, useRef, useEffect } from "react";
import { ThemeToggle } from "@components/ui/ThemeToggle";
import { Icon } from "@components/ui/Icon";
import { useFocusTrap } from "../../../hooks/useFocusTrap";
import styles from "./Header.module.css";

export const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Focus trap for mobile menu
  useFocusTrap({ containerRef: menuRef, isActive: mobileMenuOpen });

  // Close menu on Escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && mobileMenuOpen) {
        setMobileMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };

    if (mobileMenuOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileMenuOpen]);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleMenuLinkClick = () => {
    setMobileMenuOpen(false);
    menuButtonRef.current?.focus();
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.logo}>
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="12" cy="12" r="12" fill="black" />
            <path
              d="M15 9L9 15M9 9L15 15"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          <span>Noted.</span>
        </div>
        
        <nav className={styles.nav} id="main-menu">
          <a href="#features" onClick={handleMenuLinkClick}>Features</a>
          <a href="#methodology" onClick={handleMenuLinkClick}>Methodology</a>
          <a href="#pricing" onClick={handleMenuLinkClick}>Pricing</a>
          <a href="#login" onClick={handleMenuLinkClick}>Log in</a>
          <button className={styles.cta} onClick={handleMenuLinkClick}>Get Started</button>
        </nav>

        <div className={styles.navActions}>
          <ThemeToggle />
          <button
            ref={menuButtonRef}
            type="button"
            className={styles.mobileMenuButton}
            onClick={toggleMobileMenu}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
            aria-controls="main-menu"
          >
            <Icon name={mobileMenuOpen ? "fa-xmark" : "fa-bars"} size="lg" />
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div 
            ref={menuRef}
            className={styles.mobileMenu}
            role="dialog"
            aria-modal="true"
            aria-labelledby="mobile-menu-title"
          >
            <div className={styles.mobileMenuContent}>
              <h2 id="mobile-menu-title" className={styles.mobileMenuTitle}>
                Navigation
              </h2>
              <nav className={styles.mobileNav}>
                <a href="#features" onClick={handleMenuLinkClick}>Features</a>
                <a href="#methodology" onClick={handleMenuLinkClick}>Methodology</a>
                <a href="#pricing" onClick={handleMenuLinkClick}>Pricing</a>
                <a href="#login" onClick={handleMenuLinkClick}>Log in</a>
                <button className={styles.cta} onClick={handleMenuLinkClick}>Get Started</button>
              </nav>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
