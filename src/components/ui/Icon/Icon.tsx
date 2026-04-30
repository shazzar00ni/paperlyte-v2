import { useMemo, useId } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { findIconDefinition } from '@fortawesome/fontawesome-svg-core'
import type { IconName, IconPrefix } from '@fortawesome/fontawesome-svg-core'
import { iconPaths, getIconViewBox, strokeOnlyIcons } from './icons'
import { convertIconName, isBrandIcon } from '@utils/iconLibrary'
import { safePropertyAccess } from '@utils/security'
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
 * @param props.name - The icon name (e.g., 'fa-github', 'fa-bolt'). Supports
 *   multi-token values like 'fa-spinner fa-spin' where extra tokens become
 *   additional CSS classes on the rendered element.
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
 * <Icon name="fa-bolt" size="lg" />
 *
 * // Meaningful icon with label
 * <Icon name="fa-github" ariaLabel="View on GitHub" variant="brands" />
 *
 * // Custom styled icon
 * <Icon name="fa-circle-check" color="#00ff00" size="2x" />
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

  // Parse multi-token names: "fa-spinner fa-spin" → base "fa-spinner", modifiers ["fa-spin"]
  // Extra tokens (e.g. animation classes) are appended to the rendered element's className
  const tokens = name.trim().split(/\s+/)
  const baseName = tokens[0]
  const modifierClasses = tokens.slice(1).join(' ')

  // Resolve the iconPaths lookup key, supporting both "fa-bolt" and "bolt" formats.
  // Try the base name as-is first; if not found, prepend "fa-" as a convenience fallback.
  const baseIconExists = safePropertyAccess(iconPaths, baseName) !== null
  const resolvedKey = baseIconExists ? baseName : `fa-${baseName}`

  // Safely check if icon exists in iconPaths to prevent prototype pollution
  const paths = safePropertyAccess(iconPaths, resolvedKey)
  const viewBox = getIconViewBox(resolvedKey)

  // Convert base name for Font Awesome fallback path
  const convertedName = convertIconName(baseName)

  // Normalize color: detect bare hex strings (3 or 6 hex digits) and prepend "#"
  const normalizedColor = useMemo(() => {
    if (!color) return undefined
    // Check if it's a bare hex string (3 or 6 hex digits)
    if (/^[0-9A-Fa-f]{3}$|^[0-9A-Fa-f]{6}$/.test(color)) {
      return `#${color}`
    }
    return color
  }, [color])

  // Split the path string on " M " to get individual sub-paths.
  // paths is already computed above — no need for a separate safePropertyAccess call.
  // Manual useMemo is omitted here; the React Compiler handles memoization automatically.
  const pathArray = paths ? paths.split(' M ') : []

  // Render custom SVG if icon found in our set
  if (paths) {
    const svgClassName = ['icon-svg', modifierClasses, className].filter(Boolean).join(' ')

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
        className={svgClassName}
        style={style}
        data-icon={baseName}
        aria-labelledby={ariaLabel ? titleId : undefined}
        aria-hidden={ariaLabel ? ('false' as const) : ('true' as const)}
        {...(ariaLabel && { role: 'img' })}
      >
        {ariaLabel && <title id={titleId}>{ariaLabel}</title>}
        {pathArray.map((pathData, index) => (
          <path
            key={index}
            d={index === 0 ? pathData : `M ${pathData}`}
            fill={strokeOnlyIcons.has(resolvedKey) ? 'none' : undefined}
          />
        ))}
      </svg>
    )
  }

  // Fallback to Font Awesome React component if icon not found in our set
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

  const fallbackClassName = ['icon-fallback', modifierClasses, className].filter(Boolean).join(' ')
  const commonIconProps = {
    className: fallbackClassName,
    style: { fontSize: iconSize, color: normalizedColor, ...style },
    'aria-label': ariaLabel,
    'aria-hidden': ariaLabel ? ('false' as const) : ('true' as const),
    ...(ariaLabel ? { role: 'img' } : {}),
  }

  // If icon found in library, render it with data-icon attribute
  if (iconDefinition) {
    return <FontAwesomeIcon icon={iconDefinition} data-icon={baseName} {...commonIconProps} />
  }

  // Icon not found in library — return a placeholder with data-icon attribute
  console.warn(
    `Icon "${name}" (converted to "${convertedName}") not found in Font Awesome library. ` +
      `Rendering empty/decorative fallback span.`
  )
  return (
    <span {...commonIconProps} data-icon={baseName} title={`Icon "${name}" not found`}>
      ?
    </span>
  )
}
