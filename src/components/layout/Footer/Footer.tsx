import { Link } from 'react-router-dom'
import { LEGAL_CONFIG } from '@/constants/legal'
import { SocialLink } from './SocialLink'
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
                <Link to="/#features" className={styles.link}>
                  Features
                </Link>
              </li>
              <li>
                <Link to="/#roadmap" className={styles.link}>
                  Roadmap
                </Link>
              </li>
              <li>
                <Link to="/#pricing" className={styles.link}>
                  Pricing
                </Link>
              </li>
              <li>
                <Link to="/#changelog" className={styles.link}>
                  Changelog
                </Link>
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
                <Link to={LEGAL_CONFIG.documents.privacy} className={styles.link}>
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to={LEGAL_CONFIG.documents.terms} className={styles.link}>
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
                <SocialLink
                  href={LEGAL_CONFIG.social.github}
                  iconName="fa-github"
                  ariaLabel="Follow us on GitHub"
                />
              </li>
              <li>
                <SocialLink
                  href={LEGAL_CONFIG.social.twitter}
                  iconName="fa-x-twitter"
                  ariaLabel="Follow us on X (Twitter)"
                />
              </li>
              <li>
                <SocialLink
                  href={LEGAL_CONFIG.social.instagram}
                  iconName="fa-instagram"
                  ariaLabel="Follow us on Instagram"
                />
              </li>
              <li>
                <SocialLink
                  href={`mailto:${LEGAL_CONFIG.company.email}`}
                  iconName="fa-envelope"
                  ariaLabel="Email us"
                  variant="solid"
                />
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
