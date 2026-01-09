import { type ReactNode } from 'react'
import { Icon } from '@components/ui/Icon'
import { isSafeUrl } from '@utils/navigation'
import styles from './Button.module.css'

interface ButtonProps {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'small' | 'medium' | 'large'
  href?: string
  onClick?: () => void
  icon?: string
  disabled?: boolean
  className?: string
  ariaLabel?: string
  type?: 'button' | 'submit' | 'reset'
}

export const Button = ({
  children,
  variant = 'primary',
  size = 'medium',
  href,
  onClick,
  icon,
  disabled = false,
  className = '',
  ariaLabel,
  type = 'button',
}: ButtonProps): React.ReactElement => {
  const classNames = [
    styles.button,
    styles[variant],
    styles[size],
    disabled && styles.disabled,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const content = (
    <>
      {icon && <Icon name={icon} size="sm" className={styles.icon} />}
      {children}
    </>
  )

  const isBrowser = typeof window !== 'undefined'

  if (href) {
    // Validate URL for security - prevent javascript:, data:, and other dangerous protocols.
    // Skip this check during SSR (when window is undefined) to avoid disabling links on initial render.
    if (isBrowser && !isSafeUrl(href)) {
      // In development, log a warning to help developers catch the issue
      if (import.meta.env.DEV) {
        console.warn(
          `Button component: Unsafe URL rejected: "${href}". ` +
            'Only http://, https://, and relative URLs are allowed. ' +
            'Dangerous protocols like javascript:, data:, vbscript: are blocked for security.'
        )
      }
      // Render as disabled button instead of unsafe link
      return (
        <button
          type="button"
          className={classNames}
          disabled={true}
          aria-label={ariaLabel}
          aria-disabled="true"
        >
          {content}
        </button>
      )
    }

    return (
      <a
        href={disabled ? undefined : href}
        className={classNames}
        aria-label={ariaLabel}
        aria-disabled={disabled ? 'true' : 'false'}
        onClick={disabled ? (e) => { e.preventDefault(); } : onClick}
        {...(href.startsWith('http') && {
          target: '_blank',
          rel: 'noopener noreferrer',
        })}
      >
        {content}
      </a>
    )
  }

  return (
    <button
      type={type}
      className={classNames}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
    >
      {content}
    </button>
  )
}
