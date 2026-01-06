import { useEffect } from 'react'
import { Section } from '@components/layout/Section'
import styles from './Terms.module.css'

/**
 * Terms of Service page component
 * Displays Paperlyte's terms of service and usage agreement
 *
 * Note: Update LAST_UPDATED constant whenever terms are modified
 *
 * @returns Terms of Service page JSX
 */

// Last update date for the terms of service
// TODO: Update this date whenever the terms are revised
const LAST_UPDATED = 'December 13, 2024'

/**
 * Render the Terms of Service page for Paperlyte.
 *
 * Performs page metadata side effects on mount: sets document.title and updates the
 * meta description if a meta[name="description"] element exists.
 *
 * @returns The Terms of Service page as a JSX element
 */
export function Terms() {
  useEffect(() => {
    document.title = 'Terms of Service | Paperlyte'
    const metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription) {
      metaDescription.setAttribute(
        'content',
        'Read Paperlyte\'s Terms of Service to understand your rights and responsibilities when using our note-taking application.'
      )
    }
  }, [])

  return (
    <>
      <Section className={styles.termsHero}>
        <div className={styles.container}>
          <h1 className={styles.title}>Terms of Service</h1>
          <p className={styles.lastUpdated}>Last Updated: {LAST_UPDATED}</p>
        </div>
      </Section>

      <Section className={styles.termsContent}>
        <div className={styles.container}>
          <div className={styles.content}>
            <section className={styles.section}>
              <p className={styles.notice}>
                <em>
                  Note: Paperlyte is currently in development. The following Terms of Service
                  describe our planned policies and commitments for the full product launch. During
                  the waitlist phase, these terms apply only where relevant.
                </em>
              </p>
            </section>

            <section className={styles.section}>
              <h2>Agreement to Terms</h2>
              <p>
                By accessing or using Paperlyte ("the Service"), you agree to be bound by these
                Terms of Service ("Terms"). If you disagree with any part of these terms, you may
                not access the Service.
              </p>
            </section>

            <section className={styles.section}>
              <h2>Description of Service</h2>
              <p>
                Paperlyte is a note-taking application that provides users with tools to create,
                organize, sync, and manage notes across multiple devices. The Service includes:
              </p>
              <ul>
                <li>Web, desktop, and mobile applications</li>
                <li>Cloud synchronization and storage</li>
                <li>Offline-first functionality</li>
                <li>Tag-based organization system</li>
                <li>Cross-platform access</li>
              </ul>
            </section>

            <section className={styles.section}>
              <h2>User Accounts</h2>

              <h3>Account Creation</h3>
              <p>You must create an account to use Paperlyte. You are responsible for:</p>
              <ul>
                <li>Providing accurate and complete information</li>
                <li>Maintaining the security of your account credentials</li>
                <li>All activities that occur under your account</li>
                <li>Notifying us immediately of any unauthorized access</li>
              </ul>

              <h3>Account Requirements</h3>
              <ul>
                <li>You must be at least 13 years old to create an account</li>
                <li>You may only create one account per person</li>
                <li>You may not share your account with others</li>
                <li>Corporate/team accounts require appropriate authorization</li>
              </ul>
            </section>

            <section className={styles.section}>
              <h2>Acceptable Use</h2>

              <h3>You May:</h3>
              <ul>
                <li>Use Paperlyte for personal or commercial note-taking</li>
                <li>Sync your notes across multiple devices you own</li>
                <li>Export your data at any time</li>
                <li>Share individual notes if the feature is available</li>
              </ul>

              <h3>You May Not:</h3>
              <ul>
                <li>
                  Use the Service for any illegal purpose or violate laws in your jurisdiction
                </li>
                <li>Store or share content that infringes on others' intellectual property</li>
                <li>Upload malware, viruses, or malicious code</li>
                <li>Attempt to gain unauthorized access to our systems or other users' accounts</li>
                <li>Reverse engineer, decompile, or disassemble the Service</li>
                <li>Resell or redistribute the Service without authorization</li>
                <li>Use automated scripts to create accounts or abuse the Service</li>
                <li>Store excessive amounts of data to abuse our infrastructure</li>
              </ul>
            </section>

            <section className={styles.section}>
              <h2>Content Ownership & Rights</h2>

              <h3>Your Content</h3>
              <p>
                <strong>You retain all rights to your notes and content.</strong> By using
                Paperlyte, you grant us a limited license to:
              </p>
              <ul>
                <li>Store and transmit your content to provide the Service</li>
                <li>Create backups for data recovery purposes</li>
                <li>Display your content to you across your devices</li>
              </ul>
              <p>This license ends when you delete your content or close your account.</p>

              <h3>Our Content</h3>
              <p>
                The Paperlyte software, design, branding, and documentation are our intellectual
                property. You may not copy, modify, or distribute them without permission.
              </p>
            </section>

            <section className={styles.section}>
              <h2>Subscriptions & Payments</h2>

              <h3>Free Tier</h3>
              <p>
                Paperlyte offers a free tier with basic features. We reserve the right to modify
                free tier limitations with advance notice.
              </p>

              <h3>Paid Subscriptions</h3>
              <ul>
                <li>Subscriptions are billed monthly or annually based on your selection</li>
                <li>All fees are non-refundable except as required by law</li>
                <li>You can cancel your subscription at any time (no refund for current period)</li>
                <li>We may change pricing with 30 days' advance notice</li>
                <li>Failure to pay may result in account suspension or termination</li>
              </ul>
            </section>

            <section className={styles.section}>
              <h2>Data & Privacy</h2>
              <p>
                Your privacy is important to us. Our <a href="/privacy">Privacy Policy</a> explains
                how we collect, use, and protect your data. By using Paperlyte, you also agree to
                our Privacy Policy.
              </p>

              <h3>Data Backup & Loss</h3>
              <p>
                While we implement robust backup systems, you are responsible for maintaining your
                own backups of important data. We are not liable for data loss due to:
              </p>
              <ul>
                <li>User error or deletion</li>
                <li>Service outages or technical failures</li>
                <li>Account termination or closure</li>
                <li>Force majeure events</li>
              </ul>
            </section>

            <section className={styles.section}>
              <h2>Service Availability</h2>
              <p>
                We strive to maintain 99.9% uptime but cannot guarantee uninterrupted access. We
                may:
              </p>
              <ul>
                <li>Perform scheduled maintenance (with advance notice when possible)</li>
                <li>Experience unexpected outages or technical issues</li>
                <li>Modify or discontinue features with notice</li>
              </ul>
              <p>We are not liable for any damages resulting from service interruptions.</p>
            </section>

            <section className={styles.section}>
              <h2>Termination</h2>

              <h3>Your Right to Terminate</h3>
              <p>
                You may close your account at any time through the account settings. Upon closure:
              </p>
              <ul>
                <li>You can export your data before deletion</li>
                <li>Your data will be permanently deleted within 30 days</li>
                <li>No refunds for the current billing period</li>
              </ul>

              <h3>Our Right to Terminate</h3>
              <p>We may suspend or terminate your account if you:</p>
              <ul>
                <li>Violate these Terms of Service</li>
                <li>Engage in fraudulent activity or payment disputes</li>
                <li>Abuse the Service or harm other users</li>
                <li>Fail to pay subscription fees</li>
              </ul>
              <p>
                We will provide notice when possible, but reserve the right to immediately suspend
                accounts for serious violations.
              </p>
            </section>

            <section className={styles.section}>
              <h2>Limitation of Liability</h2>
              <p>
                <strong>
                  To the maximum extent permitted by law, Paperlyte and its affiliates are not
                  liable for:
                </strong>
              </p>
              <ul>
                <li>Indirect, incidental, or consequential damages</li>
                <li>Loss of profits, revenue, data, or use</li>
                <li>Damages resulting from service interruptions or data loss</li>
                <li>Third-party claims or actions</li>
              </ul>
              <p>
                Our total liability for any claim is limited to the amount you paid us in the 12
                months before the claim arose.
              </p>
            </section>

            <section className={styles.section}>
              <h2>Warranty Disclaimer</h2>
              <p>
                Paperlyte is provided "as is" without warranties of any kind. We do not warrant
                that:
              </p>
              <ul>
                <li>The Service will be error-free or uninterrupted</li>
                <li>Defects will be corrected</li>
                <li>The Service is free of viruses or harmful components</li>
                <li>Results obtained will be accurate or reliable</li>
              </ul>
            </section>

            <section className={styles.section}>
              <h2>Indemnification</h2>
              <p>
                You agree to indemnify and hold Paperlyte harmless from any claims, damages, or
                expenses arising from:
              </p>
              <ul>
                <li>Your use of the Service</li>
                <li>Your violation of these Terms</li>
                <li>Your violation of any third-party rights</li>
                <li>Content you store or share through the Service</li>
              </ul>
            </section>

            <section className={styles.section}>
              <h2>Dispute Resolution</h2>

              <h3>Governing Law</h3>
              <p>
                These Terms are governed by the laws of the State of Delaware, United States,
                without regard to conflict of law provisions.
              </p>

              <h3>Arbitration</h3>
              <p>
                Any disputes will be resolved through binding arbitration rather than court
                litigation, except for:
              </p>
              <ul>
                <li>Small claims court matters</li>
                <li>Intellectual property disputes</li>
                <li>Injunctive relief requests</li>
              </ul>
            </section>

            <section className={styles.section}>
              <h2>Changes to Terms</h2>
              <p>
                We may update these Terms from time to time. We will notify you of material changes
                via:
              </p>
              <ul>
                <li>Email to your registered address</li>
                <li>In-app notification</li>
                <li>Notice on our website</li>
              </ul>
              <p>
                Continued use of Paperlyte after changes constitutes acceptance of the updated
                Terms. If you disagree, you must stop using the Service.
              </p>
            </section>

            <section className={styles.section}>
              <h2>Miscellaneous</h2>

              <h3>Entire Agreement</h3>
              <p>
                These Terms, along with our Privacy Policy, constitute the entire agreement between
                you and Paperlyte.
              </p>

              <h3>Severability</h3>
              <p>
                If any provision of these Terms is found unenforceable, the remaining provisions
                will remain in effect.
              </p>

              <h3>No Waiver</h3>
              <p>
                Our failure to enforce any right or provision does not constitute a waiver of that
                right.
              </p>

              <h3>Assignment</h3>
              <p>
                You may not assign or transfer these Terms without our consent. We may assign our
                rights without restriction.
              </p>
            </section>

            <section className={styles.section}>
              <h2>Contact Information</h2>
              <p>If you have questions about these Terms, please contact us:</p>
              <ul>
                <li>
                  Email: <a href="mailto:legal@paperlyte.app">legal@paperlyte.app</a>
                </li>
                <li>
                  Website:{' '}
                  <a href="https://paperlyte.app/contact" target="_blank" rel="noopener noreferrer">
                    https://paperlyte.app/contact
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