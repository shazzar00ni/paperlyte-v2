/**
 * Props for the Icon component
 */
interface IconProps {
  /** Font Awesome icon name (e.g., 'fa-bolt', 'fa-pen-nib') */
  name: string;
  /** Icon size using Font Awesome size classes (default: 'md') */
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2x' | '3x';
  /** Additional CSS class names to apply */
  className?: string;
  /** Accessible label for screen readers (if not provided, icon is hidden from screen readers) */
  ariaLabel?: string;
  /** Icon color (hex value without #, e.g., 'FF5733') */
  color?: string;
}

/**
 * Icon component wrapper for Font Awesome icons with consistent sizing and accessibility
 *
 * Automatically handles aria attributes for accessibility - if no ariaLabel is provided,
 * the icon is marked as decorative (aria-hidden="true").
 *
 * @example
 * ```tsx
 * // Standard icon
 * <Icon name="fa-bolt" size="lg" />
 *
 * // Icon with accessible label
 * <Icon name="fa-shield-halved" ariaLabel="Security feature" />
 *
 * // Icon with custom color
 * <Icon name="fa-heart" color="FF0000" size="2x" />
 * ```
 */
export const Icon = ({
  name,
  size = 'md',
  className = '',
  ariaLabel,
  color,
}: IconProps): React.ReactElement => {
  const sizeClass = {
      sm: 'fa-sm',
      md: '',
      lg: 'fa-lg',
      xl: 'fa-xl',
      '2x': 'fa-2x',
      '3x': 'fa-3x',
  }[size];

  const classes = [
    'fa-solid',
    name,
    sizeClass,
    className,
    color ? `icon-color-${color.replace(/^#/, '')}` : ''
  ].filter(Boolean).join(' ');

  return (
    <i
      className={classes}
      aria-label={ariaLabel}
      aria-hidden={!ariaLabel}
    />
  );
};
