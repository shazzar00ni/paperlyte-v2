/**
 * Legal and company information configuration
 *
 * Placeholder values marked with [...] and sentinel values such as '#'
 * (for temporary document/social links) must be reviewed and replaced before launch.
 */

export interface CompanyConfig {
  name: string
  legalName: string
  email: string
  supportEmail: string
  privacyEmail: string
  legalEmail: string
  securityEmail: string
  dpoEmail: string
  arbitrationOptOutEmail: string
}

export const LEGAL_CONFIG = {
  company: {
    name: 'Paperlyte',
    legalName: '[Company Legal Name]',
    email: 'hello@paperlyte.com',
    supportEmail: 'support@paperlyte.com',
    privacyEmail: 'privacy@paperlyte.com',
    legalEmail: 'legal@paperlyte.com',
    securityEmail: 'security@paperlyte.com',
    dpoEmail: 'dpo@paperlyte.com',
    arbitrationOptOutEmail: 'arbitration-opt-out@paperlyte.com',
  },
  address: {
    street: '[Street Address]',
    city: '[City]',
    state: '[State]',
    zip: '[ZIP]',
    country: '[Country]',
  },
  documents: {
    privacy: '/privacy.html',
    terms: '/terms.html',
    cookies: '#',
    security: '#',
    dmca: '#',
    accessibility: '#',
  },
  social: {
    github: 'https://github.com/shazzar00ni/paperlyte-v2',
    twitter: 'https://x.com/paperlyte',
    linkedin: '#',
    instagram: 'https://instagram.com/paperlytefilms',
    discord: '#',
  },
  metadata: {
    privacyLastUpdated: '2025-11-28',
    termsLastUpdated: '2025-11-28',
    termsVersion: '1.0',
    jurisdiction: '[State/Country]',
    governingLaw: '[State] law',
  },
} as const

const allConfigEntries = (): Array<[string, string]> => {
  const entries: Array<[string, string]> = []
  for (const [section, values] of Object.entries(LEGAL_CONFIG)) {
    for (const [key, value] of Object.entries(values)) {
      if (typeof value === 'string') {
        entries.push([`${section}.${key}`, value])
      }
    }
  }
  return entries
}

const isPlaceholder = (value: string): boolean => value.includes('[') || value === '#'

/**
 * Helper function to check if legal documents need updating
 */
export const needsLegalReview = (): boolean => {
  return allConfigEntries().some(([, value]) => isPlaceholder(value))
}

/**
 * Get all placeholder fields that need to be filled
 */
export const getPlaceholderFields = (): string[] => {
  return allConfigEntries()
    .filter(([, value]) => isPlaceholder(value))
    .map(([key]) => key)
}
