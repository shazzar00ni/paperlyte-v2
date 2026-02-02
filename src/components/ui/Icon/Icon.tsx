import { useMemo, useId } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { findIconDefinition } from '@fortawesome/fontawesome-svg-core'
import type { IconName, IconPrefix } from '@fortawesome/fontawesome-svg-core'
import { iconPaths, getIconViewBox } from './icons'
import { convertIconName, isBrandIcon } from '@utils/iconLibrary'
import { safePropertyAccess } from '../../../utils/security'
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

/**
 * Icon component that renders both custom SVG icons and Font Awesome icons
 * Falls back to FontAwesome if the icon is not found in custom iconPaths
 * Implements security measures to prevent prototype pollution attacks
 *
 * @param props - Icon component props
 * @param props.name - The icon name (e.g., 'fa-github', 'bolt', 'check')
 * @param props.size - The icon size (default: 'md')
 * @param props.variant - The icon variant for Font Awesome (default: 'solid')
 * @param props.className - Additional CSS classes
 * @param props.ariaLabel - Accessibility label (omit for decorative icons)
 * @param props.color - Icon color (supports hex, CSS vars, or named colors)
 * @param props.style - Additional inline styles
 * @returns A rendered icon element (SVG or FontAwesomeIcon)
 *
 * @example
 * ```tsx
 * // Decorative icon (aria-hidden)
 * <Icon name="bolt" size="lg" />
 *
 * // Meaningful icon with label
 * <Icon name="fa-github" ariaLabel="View on GitHub" variant="brands" />
 *
 * // Custom styled icon
 * <Icon name="check" color="#00ff00" size="2x" />
 * ```
 */
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
  const titleId = useId()

  // Convert icon name first to ensure consistency with Font Awesome fallback path
  const convertedName = convertIconName(name)

  // Safely check if icon exists in iconPaths to prevent prototype pollution
  // Use safePropertyAccess for safe property access to avoid object injection vulnerabilities
  const paths = safePropertyAccess(iconPaths, convertedName)
  const viewBox = getIconViewBox(convertedName)

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
  // Get the paths value directly in the memo to avoid React Compiler warning
  const pathArray = useMemo(() => {
    const iconPaths_ = safePropertyAccess(iconPaths, convertedName)
    if (!iconPaths_) return []
    return iconPaths_.split(' M ')
  }, [convertedName])

  // Fallback to Font Awesome React component if icon not found in our set
  if (!paths) {
    if (import.meta.env.DEV) {
      console.warn(`Icon "${name}" not found in icon set, using Font Awesome fallback`)
    }

    // Determine prefix based on variant or by checking if it's a brand icon
    let prefix: IconPrefix
    if (variant === 'brands' || isBrandIcon(convertedName)) {
      prefix = 'fab'
    } else if (variant === 'regular') {
      prefix = 'far'
    } else {
      prefix = 'fas'
    }

    // Try to find the icon definition in the library
    // Runtime validation: Check if convertedName is a valid IconName before assertion
    const iconDefinition = findIconDefinition({ prefix, iconName: convertedName as IconName })

    const commonIconProps = {
      className: `icon-fallback ${className}`,
      style: { fontSize: iconSize, color: normalizedColor, ...style },
      'aria-label': ariaLabel,
      'aria-hidden': ariaLabel ? ('false' as const) : ('true' as const),
      ...(ariaLabel ? { role: 'img' } : {}),
    }

    // If icon not found in library, return a placeholder
    if (!iconDefinition) {
      console.warn(
        `Icon "${name}" (converted to "${convertedName}") not found in Font Awesome library. ` +
          `Rendering empty/decorative fallback span.`
      )
      return (
        <span {...commonIconProps} title={`Icon "${name}" not found`}>
          ?
        </span>
      )
    }

    return <FontAwesomeIcon icon={iconDefinition} {...commonIconProps} />
  }

  return (
    <svg
      width={iconSize}
      height={iconSize}
      viewBox={viewBox}
      fill="none"
      stroke={normalizedColor ?? 'currentColor'}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`icon-svg ${className}`}
      style={style}
      {...(ariaLabel ? { 'aria-labelledby': titleId } : { 'aria-label': undefined })}
      aria-hidden={ariaLabel ? false : true}
      {...(ariaLabel && { role: 'img' })}
    >
      {ariaLabel && <title id={titleId}>{ariaLabel}</title>}
      {pathArray.map((pathData, index) => (
        <path
          key={index}
          d={index === 0 ? pathData : `M ${pathData}`}
          fill={convertedName.includes('circle') || convertedName.includes('shield') ? 'none' : undefined}
        />
      ))}
    </svg>
  )
}
