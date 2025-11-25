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
    md: 'fa-lg',
    lg: 'fa-xl',
    xl: 'fa-2xl',
    '2x': 'fa-2x',
    '3x': 'fa-3x',
  }[size];

  return (
    <i
      className={`fa-solid ${name} ${sizeClass} ${className}`}
      aria-label={ariaLabel}
      aria-hidden={!ariaLabel}
      style={color ? { color } : undefined}
    />
  );
};
