import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import type { IconProp, SizeProp, IconName } from '@fortawesome/fontawesome-svg-core'
import { convertIconName } from '../../../utils/iconLibrary'

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

  // Map our size format to FontAwesome's SizeProp format
  const faSize: SizeProp | undefined = size === 'md' ? undefined : (size as SizeProp)

  // Determine the icon type (brand vs solid)
  // Brand icons: github, twitter, apple, windows
  const isBrandIcon = ['github', 'twitter', 'apple', 'windows'].includes(iconName)
  const iconProp: IconProp = isBrandIcon
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
