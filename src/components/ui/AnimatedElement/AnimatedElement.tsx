import { ReactNode } from 'react';
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

export const AnimatedElement = ({
  children,
  animation = 'fadeIn',
  delay = 0,
  threshold = 0.1,
  className = '',
}: AnimatedElementProps): React.ReactElement => {
  const { ref, isVisible } = useIntersectionObserver({ threshold });
  const prefersReducedMotion = useReducedMotion();

  const animationClass = prefersReducedMotion ? '' : styles[animation];

  const classes = [
    animationClass,
    isVisible ? styles.visible : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div
      ref={ref}
      className={classes}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};
