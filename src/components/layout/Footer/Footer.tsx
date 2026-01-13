import React from "react";
import styles from "./Footer.module.css";

export const Footer: React.FC = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.top}>
          <div className={styles.brand}>
            <div className={styles.logo}>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="12" cy="12" r="12" fill="black" />
                <path
                  d="M15 9L9 15M9 9L15 15"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              <span>Noted.</span>
            </div>
            <p className={styles.tagline}>
              Designed for clarity in a chaotic world.
            </p>
            <p className={styles.copyright}>© 2024 All rights reserved.</p>
          </div>

          <div className={styles.links}>
            <div className={styles.column}>
              <h4 className={styles.heading}>Product</h4>
              <ul>
                <li>
                  <a href="#features">Features</a>
                </li>
                <li>
                  <a href="#mobile">Mobile App</a>
                </li>
                <li>
                  <a href="#desktop">Desktop App</a>
                </li>
                <li>
                  <a href="#pricing">Pricing</a>
                </li>
              </ul>
            </div>
            <div className={styles.column}>
              <h4 className={styles.heading}>Company</h4>
              <ul>
                <li>
                  <a href="#about">About</a>
                </li>
                <li>
                  <a href="#blog">Blog</a>
                </li>
                <li>
                  <a href="#careers">Careers</a>
                </li>
                <li>
                  <a href="#contact">Contact</a>
                </li>
              </ul>
            </div>
            <div className={styles.column}>
              <h4 className={styles.heading}>Connect</h4>
              <ul>
                <li>
                  <a
                    href="https://twitter.com/shazzar00ni"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Twitter"
                  >
                    Twitter
                  </a>
                </li>
                <li>
                  <a href="#instagram">Instagram</a>
                </li>
                <li>
                  <a
                    href="https://github.com/shazzar00ni/paperlyte-v2"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="GitHub"
                  >
                    GitHub
                  </a>
                </li>
                <li>
                  <a href="#email">Email</a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className={styles.bottom}>
          <div className={styles.trustLabel}>TRUSTED BY TEAMS AT</div>
          <div className={styles.logos}>
            <span className={styles.companyLogo}>Acme Corp</span>
            <span className={styles.companyLogo}>Global</span>
            <span className={styles.companyLogo}>Nebula</span>
            <span className={styles.companyLogo}>Vertex</span>
            <span className={styles.companyLogo}>Horizon</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
