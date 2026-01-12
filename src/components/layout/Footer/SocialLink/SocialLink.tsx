import { Icon } from '@components/ui/Icon'
import styles from './SocialLink.module.css'

interface SocialLinkProps {
  href: string
  iconName: string
  ariaLabel: string
  variant?: 'brands' | 'solid' | 'regular'
}

/**
 * Reusable social media link component for the Footer.
 *
 * Renders a social media icon link with proper accessibility attributes
 * and consistent styling.
 *
 * @param href - The URL to link to
 * @param iconName - The Font Awesome icon name
 * @param ariaLabel - Accessible label for screen readers
 * @param variant - Font Awesome icon variant (default: 'brands')
 */
export function SocialLink({ href, iconName, ariaLabel, variant = 'brands' }: SocialLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.socialLink}
      aria-label={ariaLabel}
    >
      <Icon name={iconName} variant={variant} size="xl" />
    </a>
  )
}
