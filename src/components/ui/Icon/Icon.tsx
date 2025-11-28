import { iconPaths, getIconViewBox } from './icons';

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
  const sizeMap = {
    sm: 16,
    md: 20,
    lg: 24,
    xl: 32,
    '2x': 40,
    '3x': 48,
  };

  const iconSize = sizeMap[size];
  const paths = iconPaths[name];
  const viewBox = getIconViewBox(name);

  // Fallback to Font Awesome class if icon not found in our set
  if (!paths) {
    console.warn(`Icon "${name}" not found in icon set, using Font Awesome fallback`);
    return (
      <i
        className={`fa-solid ${name} ${className}`}
        aria-label={ariaLabel}
        aria-hidden={!ariaLabel}
        {...(ariaLabel && { role: 'img' })}
        style={color ? { color } : undefined}
      />
    );
  }

  return (
    <svg
      width={iconSize}
      height={iconSize}
      viewBox={viewBox}
      fill="none"
      stroke={color || 'currentColor'}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-label={ariaLabel}
      aria-hidden={!ariaLabel}
      {...(ariaLabel && { role: 'img' })}
      style={{ display: 'inline-block', verticalAlign: 'middle' }}
    >
      {paths.split(' M ').map((pathData, index) => (
        <path
          key={index}
          d={index === 0 ? pathData : `M ${pathData}`}
          fill={name.includes('circle') || name.includes('shield') ? 'none' : undefined}
        />
      ))}
    </svg>
  );
};
