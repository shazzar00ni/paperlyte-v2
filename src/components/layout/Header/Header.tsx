import { useState } from 'react';
import { Button } from '@components/ui/Button';
import { Icon } from '@components/ui/Icon';
import { ThemeToggle } from '@components/ui/ThemeToggle';
import styles from './Header.module.css';

export const Header = (): React.ReactElement => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setMobileMenuOpen(false);
    }
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.logo}>
          <Icon name="fa-feather" size="lg" ariaLabel="Paperlyte logo" />
          <span className={styles.logoText}>Paperlyte</span>
        </div>

        <nav className={styles.nav} aria-label="Main navigation">
          <ul className={`${styles.navList} ${mobileMenuOpen ? styles.navListOpen : ''}`}>
            <li>
              <button
                onClick={() => scrollToSection('features')}
                className={styles.navLink}
              >
                Features
              </button>
            </li>
            <li>
              <button
                onClick={() => scrollToSection('download')}
                className={styles.navLink}
              >
                Download
              </button>
            </li>
            <li className={styles.navCta}>
              <Button
                variant="primary"
                size="small"
                onClick={() => scrollToSection('download')}
              >
                Get Started
              </Button>
            </li>
          </ul>

          <div className={styles.navActions}>
            <ThemeToggle />
            <button
              type="button"
              className={styles.mobileMenuButton}
              onClick={toggleMobileMenu}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
            >
              <Icon
                name={mobileMenuOpen ? 'fa-xmark' : 'fa-bars'}
                size="lg"
                ariaLabel={mobileMenuOpen ? 'Close icon' : 'Menu icon'}
              />
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
};
