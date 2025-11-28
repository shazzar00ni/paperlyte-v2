import { type ReactNode } from 'react';
import styles from './Button.module.css';

/**
 * Props for the Button component
 */
interface ButtonProps {
  /** Content to be displayed inside the button */
  children: ReactNode;
  /** Visual style variant (default: 'primary') */
  variant?: 'primary' | 'secondary' | 'ghost';
  /** Size of the button (default: 'medium') */
  size?: 'small' | 'medium' | 'large';
  /** If provided, renders as a link instead of a button */
  href?: string;
  /** Click handler function (only for button mode) */
  onClick?: () => void;
  /** Font Awesome icon class (e.g., 'fa-download') */
  icon?: string;
  /** Whether the button is disabled (default: false) */
  disabled?: boolean;
  /** Additional CSS class names to apply */
  className?: string;
  /** Accessible label for screen readers */
  ariaLabel?: string;
}

/**
 * Versatile button component that can render as either a button or link
 *
 * Supports multiple variants, sizes, icons, and automatically handles external links
 * with proper security attributes (noopener noreferrer).
 *
 * @example
 * ```tsx
 * // Primary button with icon
 * <Button variant="primary" icon="fa-download" onClick={handleDownload}>
 *   Download App
 * </Button>
 *
 * // Link button (external)
 * <Button href="https://example.com" variant="secondary">
 *   Learn More
 * </Button>
 *
 * // Ghost button (minimal style)
 * <Button variant="ghost" size="small">
 *   Cancel
 * </Button>
 * ```
 */
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
}: ButtonProps): React.ReactElement => {
  const classNames = [
    styles.button,
    styles[variant],
    styles[size],
    className,
  ].filter(Boolean).join(' ');

  const content = (
    <>
      {icon && <i className={`fa-solid ${icon} ${styles.icon}`} aria-hidden="true" />}
      {children}
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        className={classNames}
        aria-label={ariaLabel}
        {...(href.startsWith('http') && {
          target: '_blank',
          rel: 'noopener noreferrer',
        })}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      type="button"
      className={classNames}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
    >
      {content}
    </button>
  );
};
