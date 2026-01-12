import { useMemo } from 'react'
import { iconPaths, getIconViewBox } from './icons'
import './Icon.css'

interface IconProps {
  name: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2x' | '3x'
  variant?: 'solid' | 'brands' | 'regular'
  className?: string
  ariaLabel?: string
  color?: string
  style?: React.CSSProperties
}

// Static size map - moved outside component to avoid recreation on every render
const SIZE_MAP = {
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
  '2x': 40,
  '3x': 48,
} as const

export const Icon = ({
  name,
  size = 'md',
  variant = 'solid',
  className = '',
  ariaLabel,
  color,
  style,
}: IconProps): React.ReactElement => {
  const iconSize = SIZE_MAP[size]
  const paths = iconPaths[name]
  const viewBox = getIconViewBox(name)

  // Normalize color: detect bare hex strings (3 or 6 hex digits) and prepend "#"
  const normalizedColor = useMemo(() => {
    if (!color) return undefined
    // Check if it's a bare hex string (3 or 6 hex digits)
    if (/^[0-9A-Fa-f]{3}$|^[0-9A-Fa-f]{6}$/.test(color)) {
      return `#${color}`
    }
    return color
  }, [color])

  // Memoize path array splitting for better performance
  const pathArray = useMemo(() => {
    if (!paths) return []
    return paths.split(' M ')
  }, [paths])

  // Fallback to Font Awesome <i> element if icon not found in our set
  if (!paths) {
    console.warn(`Icon "${name}" not found in icon set, using Font Awesome fallback`)

    // Convert variant to Font Awesome class
    const variantClass =
      variant === 'brands' ? 'fa-brands' : variant === 'regular' ? 'fa-regular' : 'fa-solid'

    // Build Font Awesome classes
    const faClasses = `fa ${variantClass} ${name} icon-fallback ${className}`.trim()

    console.warn(`Rendering Font Awesome fallback <i> element for icon "${name}"`)

    // Always render <i> element with Font Awesome classes
    return (
      <i
        className={faClasses}
        style={{ fontSize: `${iconSize}px`, color: normalizedColor, ...style }}
        aria-label={ariaLabel}
        aria-hidden={ariaLabel ? 'false' : 'true'}
        {...(ariaLabel ? { role: 'img' } : {})}
      />
    )
  }

  return (
    <svg
      width={iconSize}
      height={iconSize}
      viewBox={viewBox}
      fill="none"
      stroke={normalizedColor || 'currentColor'}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`icon-svg ${name} ${className}`}
      style={style}
      aria-label={ariaLabel}
      aria-hidden={ariaLabel ? 'false' : 'true'}
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
  )
}
