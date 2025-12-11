import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import type { IconProp, SizeProp, IconName } from '@fortawesome/fontawesome-svg-core'
import { faCircleQuestion } from '@fortawesome/free-solid-svg-icons'
import { convertIconName, isBrandIcon, isValidIcon } from '../../../utils/iconLibrary'

interface IconProps {
  name: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2x' | '3x'
  className?: string
  ariaLabel?: string
  color?: string
  style?: React.CSSProperties
}

export const Icon: React.FC<IconProps> = ({
  name,
  size = 'md',
  className = '',
  ariaLabel,
  color,
  style,
}) => {
  // Convert old icon name format (fa-bolt) to new format (bolt)
  const iconName = convertIconName(name)

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
        size={size === 'md' ? undefined : (size as SizeProp)}
        className={className}
        aria-label={ariaLabel || `Unknown icon: ${name}`}
        aria-hidden={!ariaLabel}
        style={{ ...style, ...(color ? { color } : {}) }}
        {...(ariaLabel && { role: 'img' })}
      />
    )
  }

  // Map our size format to FontAwesome's SizeProp format
  const faSize: SizeProp | undefined = size === 'md' ? undefined : (size as SizeProp)

  // Determine the icon type (brand vs solid) using helper function
  const isBrandIconType = isBrandIcon(iconName)
  const iconProp: IconProp = isBrandIconType
    ? (['fab', iconName as IconName] as IconProp)
    : (['fas', iconName as IconName] as IconProp)

  return (
    <FontAwesomeIcon
      icon={iconProp}
      size={faSize}
      className={className}
      aria-label={ariaLabel}
      aria-hidden={!ariaLabel}
      style={{ ...style, ...(color ? { color } : {}) }}
      {...(ariaLabel && { role: 'img' })}
    />
  )
}
