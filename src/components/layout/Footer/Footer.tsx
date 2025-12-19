import { Icon } from "@components/ui/Icon";
import { LEGAL_CONFIG } from "@/constants/legal";
import styles from "./Footer.module.css";

export const Footer = (): React.ReactElement => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.brand}>
          <div className={styles.logo}>
            <Icon name="fa-feather" size="lg" ariaLabel="Paperlyte logo" />
            <span className={styles.logoText}>Paperlyte</span>
          </div>
          <p className={styles.tagline}>
            Your thoughts, unchained from complexity
          </p>
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
            <div className={styles.socialIcons}>
              <a
                href="https://github.com/paperlyte"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialLink}
                aria-label="Follow us on GitHub"
              >
                <Icon name="fa-github" variant="brands" size="xl" />
              </a>
              <a
                href="https://x.com/paperlyte"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialLink}
                aria-label="Follow us on X (Twitter)"
              >
                <Icon name="fa-x-twitter" variant="brands" size="xl" />
              </a>
              <a
                href="https://instagram.com/paperlytefilms"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialLink}
                aria-label="Follow us on Instagram"
              >
                <Icon name="fa-instagram" variant="brands" size="xl" />
              </a>
              <a
                href="mailto:hello@paperlyte.com"
                className={styles.socialLink}
                aria-label="Email us"
              >
                <Icon name="fa-envelope" size="xl" />
              </a>
            </div>
          </div>
        </div>

        <div className={styles.bottom}>
          <p className={styles.copyright}>
            © {currentYear} {LEGAL_CONFIG.company.name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
