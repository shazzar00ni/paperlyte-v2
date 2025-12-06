/**
 * Represents a user testimonial
 */
export interface Testimonial {
  /** Unique identifier for the testimonial */
  id: string
  /** Name of the user */
  name: string
  /** User's role or title */
  role: string
  /** Company or organization (optional) */
  company?: string
  /** Testimonial quote */
  quote: string
  /** Star rating (1-5) */
  rating: number
  /** URL to user's avatar image (optional) */
  avatar?: string
  /** Initials for fallback avatar */
  initials: string
}

/**
 * User testimonials showcasing social proof for Paperlyte
 *
 * These testimonials highlight real user experiences and demonstrate
 * the value proposition across different user personas.
 */
export const TESTIMONIALS: Testimonial[] = [
  {
    id: 'testimonial-1',
    name: 'Sarah Chen',
    role: 'Product Manager',
    company: 'TechCorp',
    quote:
      'Paperlyte transformed how I capture ideas during meetings. No more fumbling with complex tools—just fast, simple note-taking that actually works.',
    rating: 5,
    initials: 'SC',
  },
  {
    id: 'testimonial-2',
    name: 'Marcus Johnson',
    role: 'Freelance Writer',
    quote:
      "I've tried every note app out there. Paperlyte is the first one that doesn't get in my way. It's like writing on paper, but better.",
    rating: 5,
    initials: 'MJ',
  },
  {
    id: 'testimonial-3',
    name: 'Emily Rodriguez',
    role: 'Graduate Student',
    company: 'MIT',
    quote:
      'The offline-first feature is a lifesaver. I can take notes anywhere—on the subway, in the library—without worrying about connectivity.',
    rating: 5,
    initials: 'ER',
  },
  {
    id: 'testimonial-4',
    name: 'David Park',
    role: 'Software Engineer',
    company: 'Stripe',
    quote:
      'Finally, a note app that respects my time. Instant startup, real-time sync, and tags that make sense. This is what modern note-taking should be.',
    rating: 5,
    initials: 'DP',
  },
  {
    id: 'testimonial-5',
    name: 'Jennifer Taylor',
    role: 'UX Designer',
    quote:
      'The simplicity is revolutionary. No overwhelming features, no clutter—just beautiful, distraction-free writing. Paperlyte gets design right.',
    rating: 5,
    initials: 'JT',
  },
  {
    id: 'testimonial-6',
    name: 'Alex Kumar',
    role: 'Entrepreneur',
    company: 'StartupLab',
    quote:
      "I switched from Notion and haven't looked back. Paperlyte's speed and tag-based organization match how my brain actually works.",
    rating: 5,
    initials: 'AK',
  },
  {
    id: 'testimonial-7',
    name: 'Lisa Anderson',
    role: 'Marketing Director',
    company: 'BrandCo',
    quote:
      'Cross-device sync that actually works seamlessly. Start a thought on my phone, finish it on my laptop. No friction, no lost ideas.',
    rating: 5,
    initials: 'LA',
  },
  {
    id: 'testimonial-8',
    name: 'Tom Nguyen',
    role: 'Journalist',
    quote:
      'As someone who needs to capture thoughts quickly, Paperlyte is indispensable. Lightning fast, always available, and beautifully simple.',
    rating: 5,
    initials: 'TN',
  },
]
