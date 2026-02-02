import { LAUNCH_QUARTER } from './waitlist';

/**
 * Represents a frequently asked question
 */
export interface FAQItem {
  /** Unique identifier */
  id: string;
  /** The question */
  question: string;
  /** The answer (supports basic HTML) */
  answer: string;
  /** Optional category for grouping */
  category?: 'general' | 'pricing' | 'privacy' | 'features';
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
      'End-to-end encryption before anything leaves your device. We use zero-knowledge architecture—we literally cannot read your notes even if we wanted to. Your data stays yours.',
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
      "Speed. We load 7x faster than Notion. Simplicity. We removed features instead of adding them. Privacy. End-to-end encryption is built-in, not an afterthought. We're not trying to be an all-in-one workspace—we're focused on doing one thing perfectly: capturing your thoughts.",
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
];
