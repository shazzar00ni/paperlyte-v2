import { type ReactNode, type ReactElement } from 'react'
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
  iconAriaLabel?: string
  disabled?: boolean
  className?: string
  ariaLabel?: string
  type?: 'button' | 'submit' | 'reset'
}

const EXTERNAL_URL_PATTERN = /^https?:\/\//i

function renderLink({
  href,
  disabled,
  classNames,
  ariaLabel,
  onClick,
  content,
}: {
  href: string
  disabled: boolean
  classNames: string
  ariaLabel?: string
  onClick?: () => void
  content: ReactNode
}): ReactElement {
  const isBrowser = typeof window !== 'undefined'

  // Validate URL for security - prevent javascript:, data:, and other dangerous protocols.
  // Skip this check during SSR (when window is undefined) to avoid disabling links on initial render.
  if (isBrowser && !isSafeUrl(href, { allowExternal: true })) {
    if (import.meta.env.DEV) {
      console.warn(
        `Button component: Unsafe URL rejected: "${href}". ` +
          'Only http://, https://, and relative URLs are allowed. ' +
          'Dangerous protocols like javascript:, data:, vbscript: are blocked for security.'
      )
    }
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
      onClick={disabled ? (e) => e.preventDefault() : onClick}
      {...(EXTERNAL_URL_PATTERN.test(href) && {
        target: '_blank',
        rel: 'noopener noreferrer',
      })}
    >
      {content}
    </a>
  )
}

export const Button = ({
  children,
  variant = 'primary',
  size = 'medium',
  href,
  onClick,
  icon,
  iconAriaLabel,
  disabled = false,
  className = '',
  ariaLabel,
  type = 'button',
}: ButtonProps): ReactElement => {
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
      {icon && <Icon name={icon} size="sm" className={styles.icon} ariaLabel={iconAriaLabel} />}
      {children}
    </>
  )

  if (href) {
    return renderLink({ href, disabled, classNames, ariaLabel, onClick, content })
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
