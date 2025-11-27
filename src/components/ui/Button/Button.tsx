import { type ReactNode } from 'react';
import styles from './Button.module.css';

interface ButtonProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  href?: string;
  onClick?: () => void;
  icon?: string;
  disabled?: boolean;
  className?: string;
  ariaLabel?: string;
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
