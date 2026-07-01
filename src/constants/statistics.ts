import { WAITLIST_COUNT_NUMERIC } from './waitlist'

/**
 * Represents a single statistic item for the counter animations.
 */
export interface StatisticItem {
  /** The numeric value to count up to */
  value: number
  /** Display label shown below the counter */
  label: string
  /** Font Awesome icon class (e.g., 'fa-users') */
  icon: string
  /** Text displayed after the number (e.g., '+', '%', 'M+') */
  suffix?: string
  /** Text displayed before the number (e.g., '$') */
  prefix?: string
  /** Number of decimal places to display */
  decimals?: number
}

/**
 * Statistics showcased on the landing page via animated counters.
 *
 * These figures highlight social proof and product reliability metrics.
 */
export const STATISTICS: StatisticItem[] = [
  {
    value: WAITLIST_COUNT_NUMERIC,
    suffix: '+',
    label: 'Waitlist Members',
    icon: 'fa-users',
  },
  {
    value: 10,
    suffix: 'M+',
    label: 'Notes Created',
    icon: 'fa-note-sticky',
  },
  {
    value: 99.9,
    suffix: '%',
    decimals: 1,
    label: 'Uptime',
    icon: 'fa-server',
  },
  {
    value: 4.9,
    suffix: '/5',
    decimals: 1,
    label: 'User Rating',
    icon: 'fa-star',
  },
]
