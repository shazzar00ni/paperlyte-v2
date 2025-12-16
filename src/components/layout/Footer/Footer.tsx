import { Icon } from '@components/ui/Icon'
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
            <p className={styles.tagline}>Designed for clarity in a chaotic world.</p>
            <p className={styles.copyright}>© {currentYear} All rights reserved.</p>
          </div>

          <div className={styles.linkGroup}>
            <h3 className={styles.linkGroupTitle}>Product</h3>
            <ul className={styles.linkList}>
              <li>
                <a href="#features" className={styles.link}>
                  Features
                </a>
              </li>
              <li>
                <a href="#mobile" className={styles.link}>
                  Mobile App
                </a>
              </li>
              <li>
                <a href="#download" className={styles.link}>
                  Desktop App
                </a>
              </li>
              <li>
                <a href="#testimonials" className={styles.link}>
                  Testimonials
                </a>
              </li>
            </ul>
          </div>

          <div className={styles.linkGroup}>
            <h3 className={styles.linkGroupTitle}>Legal</h3>
            <ul className={styles.linkList}>
              <li>
                <a href="#" className={styles.link}>
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className={styles.link}>
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>

          <div className={styles.linkGroup}>
            <h3 className={styles.linkGroupTitle}>Connect</h3>
            <div className={styles.socialIcons}>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialLink}
                aria-label="Follow us on GitHub"
              >
                <Icon name="fa-github" variant="brands" size="xl" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialLink}
                aria-label="Follow us on X (Twitter)"
              >
                <Icon name="fa-x-twitter" variant="brands" size="xl" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialLink}
                aria-label="Follow us on Facebook"
              >
                <Icon name="fa-facebook" variant="brands" size="xl" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialLink}
                aria-label="Follow us on Instagram"
              >
                <Icon name="fa-instagram" variant="brands" size="xl" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialLink}
                aria-label="Follow us on LinkedIn"
              >
                <Icon name="fa-linkedin" variant="brands" size="xl" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
