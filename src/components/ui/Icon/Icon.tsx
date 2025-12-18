import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import type { SizeProp } from '@fortawesome/fontawesome-svg-core'
import { faCircleQuestion } from '@fortawesome/free-solid-svg-icons'
import { convertIconName, isBrandIcon, isValidIcon } from '../../../utils/iconLibrary'

interface IconProps {
  name: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2x' | '3x'
  variant?: 'solid' | 'brands' | 'regular'
  className?: string
  ariaLabel?: string
  color?: string
  style?: React.CSSProperties
}

export const Icon: React.FC<IconProps> = ({
  name,
  size = 'md',
  variant = 'solid',
  className = '',
  ariaLabel,
  color,
  style,
}) => {
  // Convert old icon name format (fa-bolt) to new format (bolt)
  const iconName = convertIconName(name)

  // Normalize color: add # prefix if missing and color looks like a hex code
  const normalizedColor = color
    ? color.startsWith('#') || color.match(/^(rgb|hsl|var|currentColor)/i)
      ? color
      : `#${color}`
    : undefined

  // Map our size format to FontAwesome's SizeProp format
  // Explicit mapping ensures type safety without unsafe casts
  const sizeMap: Record<NonNullable<IconProps['size']>, SizeProp | undefined> = {
    sm: 'sm',
    md: undefined, // Medium is the default size (no size prop needed)
    lg: 'lg',
    xl: 'xl',
    '2x': '2x',
    '3x': '3x',
  }
  const faSize = sizeMap[size]

  // Validate icon exists in library
  if (!isValidIcon(iconName)) {
    // Development-time warning
    if (import.meta.env.DEV) {
      console.warn(
        `Icon "${name}" (converted to "${iconName}") not found in the icon library. ` +
          `Rendering fallback icon. Please add this icon to src/utils/iconLibrary.ts`
      )
    }

    // Render fallback icon (question mark circle)
    return (
      <FontAwesomeIcon
        icon={faCircleQuestion}
        size={faSize}
        className={className}
        aria-label={ariaLabel || `Unknown icon: ${name}`}
        aria-hidden={!ariaLabel}
        style={{ ...style, ...(normalizedColor ? { color: normalizedColor } : {}) }}
        {...(ariaLabel && { role: 'img' })}
      />
    )
  }

  // Determine variant class based on icon type
  const isBrandIconType = isBrandIcon(iconName)
  const variantClass = isBrandIconType
    ? 'fa-brands'
    : {
        solid: 'fa-solid',
        brands: 'fa-brands',
        regular: 'fa-regular',
      }[variant]

  // Map size to FontAwesome size class
  const sizeClass = size === 'md' ? '' : `fa-${size}`

  return (
    <i
      className={`${variantClass} ${name} ${sizeClass} ${className}${color ? ` icon-color-${color.replace('#', '')}` : ''}`}
      aria-label={ariaLabel}
      aria-hidden={!ariaLabel}
      style={{ ...style, ...(normalizedColor ? { color: normalizedColor } : {}) }}
      {...(ariaLabel && { role: 'img' })}
    />
  )
}
