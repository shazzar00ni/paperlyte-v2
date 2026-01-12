import { Section } from '@components/layout/Section'
import styles from './Privacy.module.css'

/**
 * Privacy Policy page component
 * Displays Paperlyte's privacy policy and data handling practices
 *
 * Note: Update LAST_UPDATED constant whenever policy changes are made
 *
 * @returns {JSX.Element} Privacy Policy page JSX
 */

// Last update date for the privacy policy
// TODO: Update this date whenever the policy is revised
const LAST_UPDATED = 'December 13, 2024'

export function Privacy() {
  return (
    <>
      <Section className={styles.privacyHero}>
        <div className={styles.container}>
          <h1 className={styles.title}>Privacy Policy</h1>
          <p className={styles.lastUpdated}>Last Updated: {LAST_UPDATED}</p>
        </div>
      </Section>

      <Section className={styles.privacyContent}>
        <div className={styles.container}>
          <div className={styles.content}>
            <section className={styles.section}>
              <h2>Our Commitment to Privacy</h2>
              <p>
                At Paperlyte, we believe your notes are personal. We're committed to protecting your
                privacy and giving you control over your data. This Privacy Policy explains how we
                collect, use, and protect your information.
              </p>
            </section>

            <section className={styles.section}>
              <h2>Information We Collect</h2>

              <h3>Information You Provide</h3>
              <ul>
                <li>
                  <strong>Account Information:</strong> Email address, name, and password when you
                  create an account
                </li>
                <li>
                  <strong>Content:</strong> Notes, tags, and any other content you create within
                  Paperlyte
                </li>
                <li>
                  <strong>Waitlist Information:</strong> Email address when you join our waitlist
                </li>
              </ul>

              <h3>Information We Collect Automatically</h3>
              <ul>
                <li>
                  <strong>Usage Data:</strong> How you interact with Paperlyte (features used,
                  session duration)
                </li>
                <li>
                  <strong>Device Information:</strong> Browser type, operating system, device type
                </li>
                <li>
                  <strong>Analytics:</strong> Aggregated data about app performance and feature
                  usage
                </li>
              </ul>
            </section>

            <section className={styles.section}>
              <h2>How We Use Your Information</h2>
              <ul>
                <li>
                  <strong>Provide Services:</strong> To operate and maintain your Paperlyte account
                </li>
                <li>
                  <strong>Sync Your Notes:</strong> To sync your notes across all your devices
                </li>
                <li>
                  <strong>Improve Our Product:</strong> To understand how users interact with
                  Paperlyte and make improvements
                </li>
                <li>
                  <strong>Customer Support:</strong> To respond to your questions and provide
                  assistance
                </li>
                <li>
                  <strong>Communications:</strong> To send important updates, security alerts, and
                  product announcements
                </li>
              </ul>
            </section>

            <section className={styles.section}>
              <h2>Data Security & Storage</h2>
              <p>
                <em>
                  Note: Paperlyte is currently in development. The following describes our planned
                  security architecture. Once the app launches, this policy will be updated to
                  reflect implemented features.
                </em>
              </p>
              <p>
                <strong>Planned Local-First Architecture:</strong> Your notes will be stored locally
                on your device first, giving you offline access and ownership of your data.
              </p>
              <p>
                <strong>Planned Encryption:</strong> All data will be encrypted in transit using
                TLS. For the waitlist landing page, we use HTTPS for secure data transmission.
              </p>
              <p>
                <strong>Planned Zero-Knowledge Option:</strong> We plan to offer end-to-end
                encryption where only you can decrypt your notes (roadmap feature).
              </p>
              <p>
                <strong>Data Retention:</strong> For the waitlist, we retain your email address
                until you unsubscribe or the service launches. Once launched, you will be able to
                delete your account and all associated data at any time.
              </p>
            </section>

            <section className={styles.section}>
              <h2>Data Sharing & Disclosure</h2>
              <p>
                <strong>We do not sell your data.</strong> We will never sell your personal
                information or notes to third parties.
              </p>

              <h3>We may share data in limited circumstances:</h3>
              <ul>
                <li>
                  <strong>Service Providers:</strong> With trusted partners who help us operate
                  Paperlyte (hosting, analytics)
                </li>
                <li>
                  <strong>Legal Requirements:</strong> When required by law or to protect our rights
                  and users' safety
                </li>
                <li>
                  <strong>Business Transfers:</strong> In the event of a merger or acquisition (with
                  advance notice to users)
                </li>
              </ul>
            </section>

            <section className={styles.section}>
              <h2>Your Rights & Choices</h2>
              <ul>
                <li>
                  <strong>Access Your Data:</strong> Request a copy of all data we have about you
                </li>
                <li>
                  <strong>Delete Your Data:</strong> Permanently delete your account and all
                  associated data
                </li>
                <li>
                  <strong>Export Your Notes:</strong> Download all your notes in standard formats
                  (Markdown, JSON)
                </li>
                <li>
                  <strong>Opt-Out of Analytics:</strong> Disable analytics tracking in your account
                  settings
                </li>
                <li>
                  <strong>Marketing Communications:</strong> Unsubscribe from promotional emails at
                  any time
                </li>
              </ul>
            </section>

            <section className={styles.section}>
              <h2>Cookies & Tracking</h2>
              <p>
                <strong>Current Landing Page:</strong> We use Google Analytics 4 to understand how
                visitors interact with our waitlist page. Google Analytics uses cookies and may
                collect information such as your IP address, browser type, and pages visited. You
                can opt out of Google Analytics by using browser extensions like Google Analytics
                Opt-out Browser Add-on.
              </p>
              <p>
                <strong>When App Launches:</strong> The full application will use minimal cookies to
                maintain your session and remember your preferences.
              </p>
              <p>
                You can disable cookies in your browser settings, though some features may not work
                properly without them.
              </p>
            </section>

            <section className={styles.section}>
              <h2>Children's Privacy</h2>
              <p>
                Paperlyte is not intended for children under 13. We do not knowingly collect
                personal information from children. If you believe a child has provided us with
                their information, please contact us immediately.
              </p>
            </section>

            <section className={styles.section}>
              <h2>International Users</h2>
              <p>
                Paperlyte is operated from the United States. If you're accessing Paperlyte from
                outside the US, your information may be transferred to and stored in the US.
              </p>
              <p>
                <strong>GDPR Compliance:</strong> For EU users, we comply with GDPR requirements
                including data portability, right to be forgotten, and consent management.
              </p>
            </section>

            <section className={styles.section}>
              <h2>Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. We'll notify you of significant
                changes via email or in-app notification. Continued use of Paperlyte after changes
                constitutes acceptance of the updated policy.
              </p>
            </section>

            <section className={styles.section}>
              <h2>Contact Us</h2>
              <p>
                If you have questions about this Privacy Policy or how we handle your data, please
                contact us:
              </p>
              <ul>
                <li>
                  Email: <a href="mailto:privacy@paperlyte.app">privacy@paperlyte.app</a>
                </li>
                <li>
                  Website:{' '}
                  <a
                    href="https://paperlyte.app/contact"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Contact Form (opens in new tab)"
                  >
                    Contact Form
                  </a>
                </li>
              </ul>
            </section>
          </div>
        </div>
      </Section>
    </>
  )
}
