import { Icon } from '@components/ui/Icon'
import { LEGAL_CONFIG } from '@/constants/legal'
import styles from './Footer.module.css'

export const Footer = (): React.ReactElement => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.grid}>
          <div className={styles.brand}>
            <div className={styles.logo}>
              <Icon name="fa-feather" size="lg" ariaLabel="Paperlyte logo" />
              <span className={styles.logoText}>Paperlyte.</span>
            </div>
            <p className={styles.tagline}>Your thoughts, unchained.</p>
            <p className={styles.taglineSecondary}>
              Built with <span role="img" aria-label="love">💙</span> for people who think fast.
            </p>
          </div>

        <nav className={styles.links} aria-label="Footer navigation">
          <div className={styles.linkGroup}>
            <h3 className={styles.linkGroupTitle}>Product</h3>
            <ul className={styles.linkList}>
              <li>
                <a href="#features" className={styles.link}>
                  Features
                </a>
              </li>
              <li>
                <a href="#faq" className={styles.link}>
                  Pricing
                </a>
              </li>
              {/* TODO: Add Roadmap link when page is available */}
              {/* TODO: Add Changelog link when page is available */}
            </ul>
          </div>

          <div className={styles.linkGroup}>
            <h3 className={styles.linkGroupTitle}>Company</h3>
            <ul className={styles.linkList}>
              <li>
                <a href="mailto:hello@paperlyte.com" className={styles.link}>
                  Contact
                </a>
              </li>
              {/* TODO: Add About link when page is available */}
              {/* TODO: Add Blog link when page is available */}
            </ul>
          </div>

          <div className={styles.linkGroup}>
            <h3 className={styles.linkGroupTitle}>Legal</h3>
            <ul className={styles.linkList}>
              <li>
                <a
                  href={LEGAL_CONFIG.documents.privacy}
                  className={styles.link}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href={LEGAL_CONFIG.documents.terms}
                  className={styles.link}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>

          <div className={styles.linkGroup}>
            <h3 className={styles.linkGroupTitle}>Connect</h3>
            <ul className={styles.socialIcons} aria-label="Social media links">
              <li>
                <a
                  href="https://github.com/paperlyte"
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
                  href="https://x.com/paperlyte"
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
                  href="https://instagram.com/paperlytefilms"
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
                  href="mailto:hello@paperlyte.com"
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
