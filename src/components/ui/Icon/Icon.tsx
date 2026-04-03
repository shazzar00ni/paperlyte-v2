import { useMemo, useId } from 'react'
import { iconPaths, getIconViewBox, strokeOnlyIcons } from './icons'
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
 * Icon component that renders custom SVG icons from the bundled icon set.
 * Implements security measures to prevent prototype pollution attacks.
 *
 * @param props - Icon component props
 * @param props.name - The icon name (e.g., 'fa-github', 'fa-bolt'). Supports
 *   multi-token values like 'fa-spinner fa-spin' where extra tokens become
 *   additional CSS classes on the rendered element.
 * @param props.size - The icon size (default: 'md')
 * @param props.variant - Accepted for backwards compatibility, unused.
 * @param props.className - Additional CSS classes
 * @param props.ariaLabel - Accessibility label (omit for decorative icons)
 * @param props.color - Icon color (supports hex, CSS vars, or named colors)
 * @param props.style - Additional inline styles
 * @returns A rendered SVG icon element
 *
 * @example
 * ```tsx
 * // Decorative icon (aria-hidden)
 * <Icon name="fa-bolt" size="lg" />
 *
 * // Meaningful icon with label
 * <Icon name="fa-github" ariaLabel="View on GitHub" />
 *
 * // Custom styled icon
 * <Icon name="fa-circle-check" color="#00ff00" size="2x" />
 * ```
 */
export const Icon = ({
  name,
  size = 'md',
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

  // Icon not found in our set — return a decorative placeholder
  if (import.meta.env.DEV) {
    console.warn(`Icon "${name}" not found in icon set. Add it to icons.ts.`)
  }
  const fallbackClassName = ['icon-fallback', modifierClasses, className].filter(Boolean).join(' ')
  return (
    <span
      className={fallbackClassName}
      style={{ fontSize: iconSize, color: normalizedColor, ...style }}
      aria-label={ariaLabel}
      aria-hidden={ariaLabel ? ('false' as const) : ('true' as const)}
      {...(ariaLabel ? { role: 'img' } : {})}
      title={`Icon "${name}" not found`}
    >
      ?
    </span>
  )
}
