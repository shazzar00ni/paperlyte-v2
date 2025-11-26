interface IconProps {
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2x' | '3x';
  className?: string;
  ariaLabel?: string;
  color?: string;
}

export const Icon: React.FC<IconProps> = ({
  name,
  size = 'md',
  className = '',
  ariaLabel,
  color,
}) => {
  const sizeClass = {
      sm: 'fa-sm',
      md: 'fa-lg', // or '' if you want md as default (no class)
      lg: 'fa-lg',
      xl: 'fa-xl',
      '2x': 'fa-2x',
      '3x': 'fa-3x',
  }[size];

  return (
    <i
      className={`fa-solid ${name} ${sizeClass} ${className}${color ? ` icon-color-${color.replace('#', '')}` : ''}`}
      aria-label={ariaLabel}
      aria-hidden={ariaLabel ? 'false' : 'true'}
    />
  );
};
