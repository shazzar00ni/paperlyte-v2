import { LAUNCH_QUARTER } from './waitlist'

/**
 * Represents a single value proposition shown in the Solution section.
 */
export interface ValueProp {
  /** Font Awesome icon class (e.g., 'fa-bolt') */
  icon: string
  /** Decorative emoji rendered alongside the headline */
  emoji: string
  /** Short headline naming the differentiator */
  headline: string
  /** Supporting title elaborating on the headline */
  title: string
  /** Body copy paragraphs describing the value proposition */
  body: string[]
  /** Single-line proof points reinforcing the claim */
  proof: string
}

/**
 * Core value propositions presented in the Solution section.
 *
 * These three promises summarize Paperlyte's primary differentiators:
 * zero-lag typing, tag-based organization, and offline-first cross-platform sync.
 */
export const SOLUTION_VALUE_PROPS: ValueProp[] = [
  {
    icon: 'fa-bolt',
    emoji: '⚡',
    headline: 'Zero-Lag Typing',
    title: 'Your thoughts move fast. So should your app.',
    body: [
      'Every keystroke responds instantly. No stuttering. No waiting. No watching the cursor lag behind your brain.',
      "We've optimized Paperlyte to respond in 8 milliseconds—faster than you can perceive. Paperlyte disappears into the background and lets you think.",
    ],
    proof: '8ms keystroke response | Instant load time | Your ideas: Captured',
  },
  {
    icon: 'fa-tags',
    emoji: '🏷️',
    headline: 'Tag-Based Organization',
    title: 'Forget folders. Organize as you write.',
    body: [
      "Rigid folder hierarchies are a relic of the 1990s. Your thoughts don't fit in neat boxes, so why should your notes?",
      'Type #project, #urgent, or #ideas anywhere in your note. Paperlyte instantly recognizes it. Search by tag. Filter by multiple tags. Let your organization emerge naturally instead of forcing it upfront.',
    ],
    proof:
      'Find any note in under 3 seconds · No folder hierarchy needed · Tags complete as you type',
  },
  {
    icon: 'fa-globe',
    emoji: '📱',
    headline: 'Works Everywhere, Always',
    title: 'Airplane mode? No problem.',
    body: [
      `Real-time sync across web, Mac, Windows, and Linux at launch. Native iOS & Android apps coming ${LAUNCH_QUARTER}. But unlike cloud-dependent apps, Paperlyte works offline-first.`,
      "On a plane? Underground subway? Spotty café WiFi? Keep writing. Everything syncs automatically when you're back online.",
    ],
    proof: `Web, Mac, Windows, Linux available now | Native iOS & Android coming ${LAUNCH_QUARTER} | Offline-first`,
  },
]
