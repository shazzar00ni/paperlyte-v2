import { useMemo } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  findIconDefinition,
  type IconName,
  type IconPrefix,
} from '@fortawesome/fontawesome-svg-core'
import { iconPaths, getIconViewBox } from './icons'
import { safePropertyAccess } from '../../../utils/security'
import { convertIconName, isBrandIcon } from '../../../utils/iconLibrary'
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
  const paths = safePropertyAccess(iconPaths, name)
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

  // Fallback to Font Awesome React component if icon not found in our set
  if (!paths) {
    console.warn(`Icon "${name}" not found in icon set, using Font Awesome fallback`)

    // Convert icon name using library map
    const mappedName = convertIconName(name)

    // Convert icon prefix based on variant or brand detection
    const prefix: IconPrefix =
      variant === 'brands' || isBrandIcon(mappedName)
        ? 'fab'
        : variant === 'regular'
          ? 'far'
          : 'fas'

    // Class name for the variant (legacy support for tests)
    const vClass =
      variant === 'brands' ? 'fa-brands' : variant === 'regular' ? 'fa-regular' : 'fa-solid'

    // Combine classes to ensure usage is detected
    const fallbackClassName = `icon-fallback ${vClass} ${name} ${className}`

    // Convert to FontAwesome icon name format
    const iconName = mappedName as IconName

    // Try to find the icon definition in the library
    const iconDefinition = findIconDefinition({ prefix, iconName })

    // If icon not found in library, return a placeholder
    if (!iconDefinition) {
      console.warn(`Icon "${name}" not found in Font Awesome library either`)
      return (
        <span
          className={fallbackClassName}
          style={{ fontSize: iconSize, color: normalizedColor, ...style }}
          aria-label={ariaLabel}
          aria-hidden={ariaLabel ? 'false' : 'true'}
          {...(ariaLabel ? { role: 'img' } : {})}
          title={`Icon "${name}" not found`}
        >
          ?
        </span>
      )
    }

    return (
      <FontAwesomeIcon
        icon={iconDefinition}
        className={fallbackClassName}
        style={{ fontSize: iconSize, color: normalizedColor, ...style }}
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
