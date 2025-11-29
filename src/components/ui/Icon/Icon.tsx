import React, { useMemo } from 'react';
import { iconPaths, getIconViewBox } from './icons';
import './Icon.css';

interface IconProps {
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2x' | '3x';
  className?: string;
  ariaLabel?: string;
  color?: string;
}

export const Icon = React.memo<IconProps>(({
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

  // Memoize path array splitting for better performance
  const pathArray = useMemo(() => {
    if (!paths) return [];
    return paths.split(' M ');
  }, [paths]);

  // Fallback to Font Awesome class if icon not found in our set
  if (!paths) {
    console.warn(`Icon "${name}" not found in icon set, using Font Awesome fallback`);
    return (
      <i
        className={`fa-solid ${name} icon-fallback ${className}`}
        aria-label={ariaLabel}
        aria-hidden={!ariaLabel}
        {...(ariaLabel && { role: 'img' })}
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
      className={`icon-svg ${className}`}
      aria-label={ariaLabel}
      aria-hidden={!ariaLabel}
      {...(ariaLabel && { role: 'img' })}
    >
      {pathArray.map((pathData, index) => (
        <path
          key={index}
          d={index === 0 ? pathData : `M ${pathData}`}
          fill={name.includes('circle') || name.includes('shield') ? 'none' : undefined}
        />
      ))}
    </svg>
  );
});

Icon.displayName = 'Icon';
