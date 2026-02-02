import { type ReactNode } from 'react';
import { useParallax } from '@hooks/useParallax';
import styles from './ParallaxLayer.module.css';

/**
 * Props for the ParallaxLayer component
 */
interface ParallaxLayerProps {
  /** Content to be rendered with parallax effect */
  children: ReactNode;
  /**
   * Speed multiplier for the parallax effect
   * - 0 = no movement (static)
   * - 0.1 to 0.3 = subtle background effect
   * - 0.4 to 0.6 = medium parallax
   * - 0.7 to 1.0 = strong foreground effect
   * - Negative values = reverse direction
   * @default 0.3
   */
  speed?: number;
  /**
   * Z-index layer for depth stacking
   * @default 0
   */
  zIndex?: number;
  /** Additional CSS class names */
  className?: string;
  /**
   * Whether this is an absolute positioned layer (for background effects)
   * @default false
   */
  absolute?: boolean;
  /**
   * CSS opacity for the layer
   * @default 1
   */
  opacity?: number;
}

/**
 * Component that applies parallax scrolling effect to its children
 *
 * Uses GPU-accelerated CSS transforms for smooth 60fps performance.
 * Automatically respects prefers-reduced-motion for accessibility.
 * Disables on mobile by default for performance.
 *
 * @example
 * ```tsx
 * // Background parallax layer
 * <ParallaxLayer speed={0.2} absolute zIndex={-1}>
 *   <div className="background-decoration" />
 * </ParallaxLayer>
 *
 * // Content with subtle parallax
 * <ParallaxLayer speed={0.1}>
 *   <h1>Hero Title</h1>
 * </ParallaxLayer>
 * ```
 */
export const ParallaxLayer = ({
  children,
  speed = 0.3,
  zIndex = 0,
  className = '',
  absolute = false,
  opacity = 1,
}: ParallaxLayerProps): React.ReactElement => {
  const { ref, transform, isActive } = useParallax({ speed });

  const layerClasses = [styles.layer, absolute ? styles.absolute : '', className]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      ref={ref}
      className={layerClasses}
      style={{
        transform: isActive ? transform : undefined,
        zIndex,
        opacity,
        willChange: isActive ? 'transform' : undefined,
      }}
    >
      {children}
    </div>
  );
};
