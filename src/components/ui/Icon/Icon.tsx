interface IconProps {
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2x' | '3x';
  className?: string;
  ariaLabel?: string;
  color?: string;
}

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
