import { Link } from 'react-router-dom'
import { Icon } from '@components/ui/Icon'
import { LEGAL_CONFIG } from '@/constants/legal'
import styles from './Footer.module.css'

export const Footer = (): React.ReactElement => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <nav className={styles.grid} aria-label="Footer navigation">
          <div className={styles.linkGroup}>
            <h3 className={styles.linkGroupTitle}>Product</h3>
            <ul className={styles.linkList}>
              <li>
                <a href="#features" className={styles.link}>
                  Features
                </a>
              </li>
              <li>
                <a href="#roadmap" className={styles.link}>
                  Roadmap
                </a>
              </li>
              <li>
                <a href="#pricing" className={styles.link}>
                  Pricing
                </a>
              </li>
              <li>
                <a href="#changelog" className={styles.link}>
                  Changelog
                </a>
              </li>
              <li>
                <a
                  href={LEGAL_CONFIG.social.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.link}
                >
                  GitHub
                </a>
              </li>
            </ul>
          </div>

          <div className={styles.linkGroup}>
            <h3 className={styles.linkGroupTitle}>Legal</h3>
            <ul className={styles.linkList}>
              <li>
                <Link to="/privacy" className={styles.link}>
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className={styles.link}>
                  Terms of Service
                </Link>
              </li>
              <li>
                <a href={`mailto:${LEGAL_CONFIG.company.email}`} className={styles.link}>
                  Contact
                </a>
              </li>
            </ul>
          </div>

          <div className={styles.linkGroup}>
            <h3 className={styles.linkGroupTitle}>Connect</h3>
            <ul className={styles.socialIcons} aria-label="Social media links">
              <li>
                <a
                  href={LEGAL_CONFIG.social.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.socialLink}
                  aria-label="Follow us on GitHub"
                >
                  <Icon name="fa-github" variant="brands" size="xl" />
                </a>
              </li>
              <li>
                <a
                  href={LEGAL_CONFIG.social.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.socialLink}
                  aria-label="Follow us on X (Twitter)"
                >
                  <Icon name="fa-x-twitter" variant="brands" size="xl" />
                </a>
              </li>
              <li>
                <a
                  href={LEGAL_CONFIG.social.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.socialLink}
                  aria-label="Follow us on Instagram"
                >
                  <Icon name="fa-instagram" variant="brands" size="xl" />
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${LEGAL_CONFIG.company.email}`}
                  className={styles.socialLink}
                  aria-label="Email us"
                >
                  <Icon name="fa-envelope" size="xl" />
                </a>
              </li>
            </ul>
          </div>
        </nav>

        <div className={styles.bottom}>
          <p className={styles.copyright}>
            © {currentYear} {LEGAL_CONFIG.company.name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
