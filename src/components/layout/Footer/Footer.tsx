import { Icon } from '@components/ui/Icon'
import styles from './Footer.module.css'

export const Footer = (): React.ReactElement => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.brand}>
          <div className={styles.logo}>
            <Icon name="fa-feather" size="lg" ariaLabel="Paperlyte logo" />
            <span className={styles.logoText}>Paperlyte</span>
          </div>
          <p className={styles.tagline}>Your thoughts, unchained from complexity</p>
        </div>

        <div className={styles.links}>
          <div className={styles.linkGroup}>
            <h3 className={styles.linkGroupTitle}>Product</h3>
            <ul className={styles.linkList}>
              <li>
                <a href="#features" className={styles.link}>
                  Features
                </a>
              </li>
              <li>
                <a href="#download" className={styles.link}>
                  Download
                </a>
              </li>
            </ul>
          </div>

          <div className={styles.linkGroup}>
            <h3 className={styles.linkGroupTitle}>Legal</h3>
            <ul className={styles.linkList}>
              <li>
                <a href="#privacy" className={styles.link}>
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#terms" className={styles.link}>
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>

          <div className={styles.linkGroup}>
            <h3 className={styles.linkGroupTitle}>Connect</h3>
            <div className={styles.socialLinks}>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialLink}
                aria-label="GitHub"
              >
                <Icon name="fa-github" size="lg" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialLink}
                aria-label="Twitter"
              >
                <Icon name="fa-twitter" size="lg" />
              </a>
              <a href="mailto:hello@paperlyte.com" className={styles.socialLink} aria-label="Email">
                <Icon name="fa-envelope" size="lg" />
              </a>
            </div>
          </div>
        </div>

        <div className={styles.bottom}>
          <p className={styles.copyright}>© {currentYear} Paperlyte. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
