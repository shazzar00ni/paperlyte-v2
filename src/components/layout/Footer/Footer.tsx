import { Icon } from '@components/ui/Icon'
import { LEGAL_CONFIG } from '@/constants/legal'
import styles from './Footer.module.css'

/** Renders the site footer with navigation links, social links, and legal information. */
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
              Built with{' '}
              <span role="img" aria-label="love">
                💙
              </span>{' '}
              for people who think fast.
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
                  <a href="#pricing" className={styles.link}>
                    Pricing
                  </a>
                </li>
                <li>
                  <span className={styles.linkComingSoon}>
                    Roadmap
                    <span className="sr-only"> (coming soon)</span>
                  </span>
                </li>
                <li>
                  <span className={styles.linkComingSoon}>
                    Changelog
                    <span className="sr-only"> (coming soon)</span>
                  </span>
                </li>
              </ul>
            </div>

            <div className={styles.linkGroup}>
              <h3 className={styles.linkGroupTitle}>Company</h3>
              <ul className={styles.linkList}>
                <li>
                  <a href={`mailto:${LEGAL_CONFIG.company.email}`} className={styles.link}>
                    Contact
                  </a>
                </li>
                <li>
                  <span className={styles.linkComingSoon}>
                    About
                    <span className="sr-only"> (coming soon)</span>
                  </span>
                </li>
                <li>
                  <span className={styles.linkComingSoon}>
                    Blog
                    <span className="sr-only"> (coming soon)</span>
                  </span>
                </li>
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
      </div>
    </footer>
  )
}
