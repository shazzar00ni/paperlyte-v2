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

export const AnimatedElement: React.FC<AnimatedElementProps> = ({
  children,
  animation = 'fadeIn',
  delay = 0,
  threshold = 0.1,
  className = '',
}) => {
  const { ref, isVisible } = useIntersectionObserver({ threshold });
  const prefersReducedMotion = useReducedMotion();

  const animationClass = prefersReducedMotion ? '' : styles[animation];

  return (
    <div
      ref={ref}
      className={`${animationClass} ${isVisible ? styles.visible : ''} ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};
