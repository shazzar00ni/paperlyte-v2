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
  const sizeClass = {
    sm: 'fa-sm',
    md: '', // Medium size is default (no class)
    lg: 'fa-lg',
    xl: 'fa-xl',
    '2x': 'fa-2x',
    '3x': 'fa-3x',
  }[size]

  const variantClass = {
    solid: 'fa-solid',
    brands: 'fa-brands',
    regular: 'fa-regular',
  }[variant]

  return (
    <i
      className={`${variantClass} ${name} ${sizeClass} ${className}${color ? ` icon-color-${color.replace('#', '')}` : ''}`}
      aria-label={ariaLabel}
      aria-hidden={!ariaLabel}
      style={style}
      {...(ariaLabel && { role: 'img' })}
    />
  )
}
