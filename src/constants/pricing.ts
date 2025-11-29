/**
 * Represents a pricing plan tier
 */
export interface PricingPlan {
  /** Unique identifier */
  id: string;
  /** Plan name */
  name: string;
  /** Price per month (null for free) */
  price: number | null;
  /** Short tagline */
  tagline: string;
  /** List of included features */
  features: string[];
  /** Whether this is the recommended/popular plan */
  isPopular?: boolean;
  /** Call-to-action button text */
  ctaText: string;
  /** Optional icon for the plan */
  icon?: string;
}

/**
 * Pricing tiers for Paperlyte
 *
 * Emphasizes the generous free tier while showing upgrade options
 */
export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'free',
    name: 'Free',
    price: null,
    tagline: 'Perfect for personal use',
    icon: 'fa-leaf',
    features: [
      'Unlimited notes',
      'Tag-based organization',
      'Offline access',
      'Real-time sync across devices',
      'Basic encryption',
      'Up to 3 devices',
    ],
    ctaText: 'Get Started Free',
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 4.99,
    tagline: 'For power users',
    icon: 'fa-rocket',
    isPopular: true,
    features: [
      'Everything in Free',
      'End-to-end encryption',
      'Unlimited devices',
      'Advanced search & filters',
      'Custom themes',
      'Priority support',
      'Export to multiple formats',
    ],
    ctaText: 'Start Free Trial',
  },
  {
    id: 'team',
    name: 'Team',
    price: 9.99,
    tagline: 'Built for collaboration',
    icon: 'fa-users',
    features: [
      'Everything in Pro',
      'Shared notebooks',
      'Team workspaces',
      'Collaboration tools',
      'Admin controls',
      'Team analytics',
      'Dedicated support',
    ],
    ctaText: 'Contact Sales',
  },
];
