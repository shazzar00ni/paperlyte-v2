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
 * and consistent styling. Automatically adds target="_blank" and rel attributes
 * for external links (excludes mailto: links).
 *
 * @param href - The URL to link to
 * @param iconName - The Font Awesome icon name
 * @param ariaLabel - Accessible label for screen readers
 * @param variant - Font Awesome icon variant (default: 'brands')
 */
export function SocialLink({ href, iconName, ariaLabel, variant = 'brands' }: SocialLinkProps) {
  const isExternal = !href.startsWith('mailto:')

  return (
    <a
      href={href}
      {...(isExternal && {
        target: '_blank',
        rel: 'noopener noreferrer',
      })}
      className={styles.socialLink}
      aria-label={ariaLabel}
    >
      <Icon name={iconName} variant={variant} size="xl" />
    </a>
  )
}
