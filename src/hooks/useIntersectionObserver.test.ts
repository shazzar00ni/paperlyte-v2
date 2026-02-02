import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useIntersectionObserver } from './useIntersectionObserver';

describe('useIntersectionObserver', () => {
  it('should return a ref and isVisible state', () => {
    const { result } = renderHook(() => useIntersectionObserver());

    expect(result.current).toHaveProperty('ref');
    expect(result.current).toHaveProperty('isVisible');
    expect(result.current.isVisible).toBe(false);
  });

  it('should accept custom options', () => {
    const { result } = renderHook(() =>
      useIntersectionObserver({
        threshold: 0.5,
        rootMargin: '10px',
        triggerOnce: false,
      })
    );

    expect(result.current).toHaveProperty('ref');
    expect(result.current).toHaveProperty('isVisible');
  });

  it('should use default options when none provided', () => {
    const { result } = renderHook(() => useIntersectionObserver());

    expect(result.current.ref.current).toBeNull();
    expect(result.current.isVisible).toBe(false);
  });
});
