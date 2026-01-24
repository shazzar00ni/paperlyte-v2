import { CSSProperties } from 'react'
import styles from './Illustration.module.css'

export interface IllustrationProps {
  /** The name of the illustration file (without extension) */
  name: string
  /** Size variant */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'hero'
  /** Primary color (defaults to CSS variable --color-primary) */
  primaryColor?: string
  /** Secondary color (defaults to CSS variable --color-primary-faint) */
  secondaryColor?: string
  /** Additional CSS classes */
  className?: string
  /** Accessible label for screen readers */
  ariaLabel?: string
}

/**
 * Illustration component for displaying duotone SVG illustrations.
 *
 * Supports theming via CSS variables and customizable colors.
 * SVG illustrations should be placed in /public/illustrations/ directory.
 *
 * @example
 * ```tsx
 * <Illustration
 *   name="rocket-launch"
 *   size="lg"
 *   ariaLabel="Rocket launching into space"
 * />
 * ```
 */
export const Illustration = ({
  name,
  size = 'md',
  primaryColor,
  secondaryColor,
  className,
  ariaLabel,
}: IllustrationProps): React.ReactElement => {
  const style: CSSProperties = {
    ...(primaryColor && { '--illustration-primary': primaryColor }),
    ...(secondaryColor && { '--illustration-secondary': secondaryColor }),
  } as CSSProperties

  return (
    <div
      className={`${styles.illustration} ${styles[size]} ${className || ''}`}
      style={style}
      role="img"
      aria-label={ariaLabel}
      {...(!ariaLabel && { 'aria-hidden': 'true' })}
    >
      <img
        src={`/illustrations/${name}.svg`}
        alt=""
        className={styles.image}
        loading="lazy"
        decoding="async"
      />
    </div>
  )
}
