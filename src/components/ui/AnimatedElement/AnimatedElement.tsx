import React, { type ReactNode, useMemo, useEffect } from 'react';
import { useIntersectionObserver } from '@hooks/useIntersectionObserver';
import { useReducedMotion } from '@hooks/useReducedMotion';
import styles from './AnimatedElement.module.css';

interface AnimatedElementProps {
  children: ReactNode;
  animation?: 'fadeIn' | 'slideUp' | 'slideInLeft' | 'slideInRight' | 'scale';
  delay?: number;
  threshold?: number;
  className?: string;
}

export const AnimatedElement = React.memo<AnimatedElementProps>(({
  children,
  animation = 'fadeIn',
  delay = 0,
  threshold = 0.1,
  className = '',
}) => {
  const { ref, isVisible } = useIntersectionObserver({ threshold });
  const prefersReducedMotion = useReducedMotion();

  const animationClass = prefersReducedMotion ? '' : styles[animation];

  const classes = useMemo(
    () => [animationClass, isVisible ? styles.visible : '', className].filter(Boolean).join(' '),
    [animationClass, isVisible, className]
  );

  // Set CSS custom property for animation delay programmatically
  useEffect(() => {
    if (ref.current) {
      ref.current.style.setProperty('--animation-delay', `${delay}ms`);
    }
  }, [delay, ref]);

  return (
    <div
      ref={ref}
      className={classes}
    >
      {children}
    </div>
  );
});

AnimatedElement.displayName = 'AnimatedElement';
