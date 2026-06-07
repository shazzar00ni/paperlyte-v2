/**
 * Represents a feature in the comparison table
 */
export interface ComparisonFeature {
  /** Feature name/label */
  feature: string
  /** Whether Paperlyte supports this feature */
  paperlyte: boolean | string
  /** Whether Notion supports this feature */
  notion: boolean | string
  /** Whether Evernote supports this feature */
  evernote: boolean | string
  /** Whether OneNote supports this feature */
  onenote: boolean | string
  /** Whether Obsidian supports this feature */
  obsidian: boolean | string
  /** Whether Bear supports this feature */
  bear: boolean | string
}

/**
 * Feature comparison data for Paperlyte vs. competitors
 *
 * Highlights Paperlyte's key advantages: speed, simplicity, and offline-first design
 */
export const COMPARISON_FEATURES: ComparisonFeature[] = [
  {
    feature: 'Startup Time',
    paperlyte: '<1s',
    notion: '3-5s',
    evernote: '2-4s',
    onenote: '2-3s',
    obsidian: '2-3s',
    bear: '1-2s',
  },
  {
    feature: 'Offline Access',
    paperlyte: true,
    notion: false,
    evernote: 'Paid only',
    onenote: true,
    obsidian: true,
    bear: true,
  },
  {
    feature: 'Tag-Based Organization',
    paperlyte: true,
    notion: false,
    evernote: true,
    onenote: false,
    obsidian: true,
    bear: true,
  },
  {
    feature: 'Distraction-Free UI',
    paperlyte: true,
    notion: false,
    evernote: false,
    onenote: false,
    obsidian: true,
    bear: true,
  },
  {
    feature: 'Real-Time Sync',
    paperlyte: true,
    notion: true,
    evernote: true,
    onenote: true,
    obsidian: 'Paid only',
    bear: 'Paid only',
  },
  {
    feature: 'End-to-End Encryption',
    paperlyte: true,
    notion: false,
    evernote: false,
    onenote: false,
    obsidian: 'Paid only',
    bear: 'Paid only',
  },
  {
    feature: 'Free Tier Features',
    paperlyte: 'Full access',
    notion: 'Limited',
    evernote: 'Very limited',
    onenote: 'Full access',
    obsidian: 'Full access',
    bear: 'Limited',
  },
  {
    feature: 'Mobile Performance',
    paperlyte: 'Excellent',
    notion: 'Slow',
    evernote: 'Good',
    onenote: 'Good',
    obsidian: 'Moderate',
    bear: 'Excellent',
  },
]

/**
 * Competitor information for the comparison table header
 */
export interface Competitor {
  /** Unique identifier */
  id: string
  /** Display name */
  name: string
  /** CSS color variable for branding */
  color: string
}

export const COMPETITORS: Competitor[] = [
  { id: 'paperlyte', name: 'Paperlyte', color: 'var(--color-primary)' },
  { id: 'notion', name: 'Notion', color: '#000000' },
  { id: 'evernote', name: 'Evernote', color: '#00A82D' },
  { id: 'onenote', name: 'OneNote', color: '#7719AA' },
  { id: 'obsidian', name: 'Obsidian', color: '#7C3AED' },
  { id: 'bear', name: 'Bear', color: '#D97706' },
]
