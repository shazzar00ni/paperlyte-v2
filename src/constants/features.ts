/**
 * Represents a feature of the Paperlyte application
 */
export interface Feature {
  /** Unique identifier for the feature */
  id: string;
  /** Font Awesome icon class (e.g., 'fa-bolt') */
  icon: string;
  /** Feature title/heading */
  title: string;
  /** Detailed description of the feature */
  description: string;
}

/**
 * Core features of Paperlyte showcased on the landing page
 *
 * These features represent the main value propositions that differentiate
 * Paperlyte from competitors like Notion, Evernote, and OneNote.
 */
export const FEATURES: Feature[] = [
  {
    id: 'speed',
    icon: 'fa-bolt',
    title: 'Lightning Speed',
    description:
      'Instant startup and real-time sync. No loading spinners, no waiting. Your thoughts captured at the speed of thinking.',
  },
  {
    id: 'simplicity',
    icon: 'fa-pen-nib',
    title: 'Beautiful Simplicity',
    description:
      'Paper-inspired design that feels natural and distraction-free. Just you and your thoughts, the way it should be.',
  },
  {
    id: 'tags',
    icon: 'fa-tags',
    title: 'Tag-Based Organization',
    description:
      'Smart categorization without rigid folder structures. Organize freely with tags that adapt to how you think.',
  },
  {
    id: 'universal',
    icon: 'fa-mobile-screen',
    title: 'Universal Access',
    description:
      'Seamless experience across all devices. Start on your phone, finish on your laptop. Always in sync.',
  },
  {
    id: 'offline',
    icon: 'fa-cloud-check',
    title: 'Offline-First',
    description:
      'Full functionality without internet. Your notes work everywhere, sync automatically when online.',
  },
  {
    id: 'privacy',
    icon: 'fa-shield-halved',
    title: 'Privacy Focused',
    description:
      'Your notes are yours alone. End-to-end encryption and local-first storage keep your thoughts private.',
  },
];
