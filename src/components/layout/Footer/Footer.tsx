import { Icon } from '@components/ui/Icon';
import { LEGAL_CONFIG } from '@/constants/legal';
import styles from './Footer.module.css';

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
            <div className={styles.socialLinks}>
              <a
                href={LEGAL_CONFIG.social.github}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialLink}
                aria-label="GitHub"
              >
                <Icon name="fa-github" size="lg" />
              </a>
              <a
                href={LEGAL_CONFIG.social.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialLink}
                aria-label="Twitter"
              >
                <Icon name="fa-twitter" size="lg" />
              </a>
              <a
                href={`mailto:${LEGAL_CONFIG.company.email}`}
                className={styles.socialLink}
                aria-label="Email"
              >
                <Icon name="fa-envelope" size="lg" />
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
