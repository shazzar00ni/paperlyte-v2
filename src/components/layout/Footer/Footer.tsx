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
            <p className={styles.tagline}>Your thoughts, unchained.</p>
            <p className={styles.copyright}>
              © {currentYear} Paperlyte. All rights reserved.
            </p>
            <p className={styles.taglineSecondary}>
              Built with <span aria-label="love">💙</span> for people who think fast.
            </p>
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
                <a href="#pricing" className={styles.link}>
                  Pricing
                </a>
              </li>
              <li>
                <a href="#roadmap" className={styles.link}>
                  Roadmap
                </a>
              </li>
              <li>
                <a href="#changelog" className={styles.link}>
                  Changelog
                </a>
              </li>
            </ul>
          </div>

          <div className={styles.linkGroup}>
            <h3 className={styles.linkGroupTitle}>Company</h3>
            <ul className={styles.linkList}>
              <li>
                <a href="#about" className={styles.link}>
                  About
                </a>
              </li>
              <li>
                <a href="#blog" className={styles.link}>
                  Blog
                </a>
              </li>
              <li>
                <a href="mailto:hello@paperlyte.com" className={styles.link}>
                  Contact
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
                  Terms
                </a>
              </li>
              <li>
                <a href="#security" className={styles.link}>
                  Security
                </a>
              </li>
            </ul>
          </div>

          <div className={styles.linkGroup}>
            <h3 className={styles.linkGroupTitle}>Connect</h3>
            <ul className={styles.linkList}>
              <li>
                <a
                  href="https://twitter.com/paperlyte"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.link}
                >
                  Twitter
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/paperlyte"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.link}
                >
                  GitHub
                </a>
              </li>
              <li>
                <a
                  href="https://discord.gg/paperlyte"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.link}
                >
                  Discord
                </a>
              </li>
              <li>
                <a href="mailto:hello@paperlyte.com" className={styles.link}>
                  Email
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  )
}
