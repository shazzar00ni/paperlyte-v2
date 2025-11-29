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
    id: 'what-is-paperlyte',
    category: 'general',
    question: 'What is Paperlyte?',
    answer:
      'Paperlyte is a lightning-fast, distraction-free note-taking app designed for people who are tired of bloated, complex tools. We focus on speed, simplicity, and getting out of your way so you can focus on your thoughts.',
  },
  {
    id: 'offline-access',
    category: 'features',
    question: 'Can I use Paperlyte offline?',
    answer:
      'Yes! Paperlyte is offline-first, meaning all features work without an internet connection. Your notes are stored locally on your device and automatically sync across devices when you are online.',
  },
  {
    id: 'data-privacy',
    category: 'privacy',
    question: 'How secure are my notes?',
    answer:
      'Your privacy is our priority. Free users get basic encryption, while Pro users get end-to-end encryption. Your notes are stored locally first and encrypted during sync. We never read, analyze, or sell your data.',
  },
  {
    id: 'free-tier',
    category: 'pricing',
    question: 'Is the free tier really unlimited?',
    answer:
      'Yes! You can create unlimited notes and use all core features for free. The free tier includes tag-based organization, offline access, and real-time sync across up to 3 devices. No credit card required.',
  },
  {
    id: 'supported-platforms',
    category: 'general',
    question: 'What devices and platforms are supported?',
    answer:
      'Paperlyte works seamlessly across all major platforms: Web, iOS, Android, macOS, Windows, and Linux. Your notes stay in sync automatically across all devices.',
  },
  {
    id: 'import-notes',
    category: 'features',
    question: 'Can I import notes from other apps?',
    answer:
      'Yes! We support importing from Notion, Evernote, OneNote, Apple Notes, and standard formats like Markdown, plain text, and HTML. Migration guides are available in our help center.',
  },
  {
    id: 'collaboration',
    category: 'features',
    question: 'Can I share notes with others?',
    answer:
      'Shared notebooks and real-time collaboration are available on the Team plan. Free and Pro users can export notes to share as files or links.',
  },
  {
    id: 'cancel-subscription',
    category: 'pricing',
    question: 'Can I cancel my subscription anytime?',
    answer:
      'Absolutely. You can cancel your Pro or Team subscription at any time with one click. Your data remains accessible, and you can downgrade to the free tier without losing your notes.',
  },
  {
    id: 'data-export',
    category: 'privacy',
    question: 'Can I export my data?',
    answer:
      'Yes! You own your data. You can export all your notes anytime in multiple formats: Markdown, PDF, HTML, or plain text. No lock-in, no hidden fees.',
  },
  {
    id: 'speed-secret',
    category: 'features',
    question: 'How is Paperlyte so fast?',
    answer:
      'We obsess over performance. Paperlyte uses cutting-edge web technologies, aggressive caching, and local-first architecture. Every millisecond counts, and we optimize ruthlessly to keep you in flow.',
  },
];
