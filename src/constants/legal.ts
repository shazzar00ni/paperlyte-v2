/**
 * Legal and company information configuration
 *
 * TODO: Update these values with your actual company information
 */

export const LEGAL_CONFIG = {
  // Company Information
  company: {
    name: 'Paperlyte',
    legalName: '[Company Legal Name]', // TODO: Add legal entity name
    email: 'hello@paperlyte.com',
    supportEmail: 'support@paperlyte.com',
    privacyEmail: 'privacy@paperlyte.com',
    legalEmail: 'legal@paperlyte.com',
    securityEmail: 'security@paperlyte.com',
    dpoEmail: 'dpo@paperlyte.com',
  },

  // Physical Address
  address: {
    street: '[Street Address]', // TODO: Add street address
    city: '[City]',
    state: '[State]',
    zip: '[ZIP]',
    country: '[Country]',
  },

  // Legal Document URLs
  documents: {
    privacy: '/privacy.html',
    terms: '/terms.html',
    cookies: '#', // TODO: Create cookie policy
    security: '#', // TODO: Create security practices doc
    dmca: '#', // TODO: Create DMCA policy
    accessibility: '#', // TODO: Create accessibility statement
  },

  // Social Media Links
  social: {
    github: 'https://github.com/paperlyte/paperlyte',
    twitter: 'https://twitter.com/paperlyte',
    linkedin: 'https://linkedin.com/company/paperlyte',
    discord: '#', // TODO: Add Discord server link
  },

  // Legal Metadata
  metadata: {
    privacyLastUpdated: '2025-11-28',
    termsLastUpdated: '2025-11-28',
    termsVersion: '1.0',
    jurisdiction: '[State/Country]', // TODO: Add jurisdiction
    governingLaw: '[State] law', // TODO: Add governing law
  },
} as const;

/**
 * Helper function to check if legal documents need updating
 */
export const needsLegalReview = (): boolean => {
  const hasPlaceholders =
    LEGAL_CONFIG.company.legalName.includes('[') ||
    LEGAL_CONFIG.address.street.includes('[') ||
    LEGAL_CONFIG.metadata.jurisdiction.includes('[');

  return hasPlaceholders;
};

/**
 * Get all placeholder fields that need to be filled
 */
export const getPlaceholderFields = (): string[] => {
  const placeholders: string[] = [];

  if (LEGAL_CONFIG.company.legalName.includes('[')) {
    placeholders.push('Company Legal Name');
  }
  if (LEGAL_CONFIG.address.street.includes('[')) {
    placeholders.push('Physical Address');
  }
  if (LEGAL_CONFIG.metadata.jurisdiction.includes('[')) {
    placeholders.push('Jurisdiction/Governing Law');
  }

  return placeholders;
};
