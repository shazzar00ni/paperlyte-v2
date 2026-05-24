import { LAUNCH_QUARTER } from './waitlist'

/**
 * Represents a frequently asked question
 */
export interface FAQItem {
  /** Unique identifier */
  id: string
  /** The question */
  question: string
  /** The answer (supports basic HTML) */
  answer: string
  /** Optional category for grouping */
  category?: 'general' | 'pricing' | 'privacy' | 'features'
}

/**
 * Frequently asked questions about Paperlyte
 *
 * Addresses common concerns and highlights key features
 */
export const FAQ_ITEMS: FAQItem[] = [
  {
    id: 'launch-date',
    category: 'general',
    question: 'When will Paperlyte launch?',
    answer: `We're targeting ${LAUNCH_QUARTER} for public launch. Waitlist members get early access 2 weeks before everyone else.`,
  },
  {
    id: 'pricing',
    category: 'pricing',
    question: 'How much will it cost?',
    answer:
      "Paperlyte will be free for personal use with unlimited notes. We'll offer a Plus plan (~$5/month) for advanced features like team collaboration and extended storage. Waitlist members get 50% off for life.",
  },
  {
    id: 'supported-platforms',
    category: 'general',
    question: 'What platforms do you support?',
    answer: `At launch: Responsive web app (works on all devices). Native iOS & Android apps coming in ${LAUNCH_QUARTER}. Works seamlessly across Mac, Windows, and Linux via web.`,
  },
  {
    id: 'data-privacy',
    category: 'privacy',
    question: 'How is my data protected?',
    answer:
      "Your notes are protected in transit with TLS and encrypted at rest on our servers. End-to-end encryption (so even we can't read your notes) is on our roadmap and will be added before public launch. Your data stays yours and is never sold or shared.",
  },
  {
    id: 'data-export',
    category: 'privacy',
    question: 'Can I export my notes?',
    answer:
      'Absolutely. Export all notes as Markdown anytime. No lock-in, ever. Your data is portable.',
  },
  {
    id: 'mobile-app',
    category: 'features',
    question: 'Will there be a mobile app?',
    answer: `Yes! The responsive web app works great on mobile browsers now. Native iOS and Android apps are planned for ${LAUNCH_QUARTER} with offline sync and system integration.`,
  },
  {
    id: 'vs-competitors',
    category: 'general',
    question: 'How is this different from Notion/Obsidian/Evernote?',
    answer:
      "Speed: Paperlyte is built to load and respond faster than tools like Notion that bundle collaboration, databases, and wikis into one page. Simplicity: we removed features instead of adding them. Privacy: privacy is a first-class design goal, not an afterthought. We're not trying to be an all-in-one workspace — we do one thing perfectly: capture your thoughts.",
  },
  {
    id: 'free-trial',
    category: 'pricing',
    question: 'Do you have a free trial?',
    answer:
      'The core app will be free forever for personal use. No trial needed—no credit card, no expiration.',
  },
  {
    id: 'more-questions',
    category: 'general',
    question: 'What if I have more questions?',
    answer:
      'Email us at hello@paperlyte.com. We read every message and typically respond within 24 hours.',
  },
]
