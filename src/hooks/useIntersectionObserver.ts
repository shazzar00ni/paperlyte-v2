import { useEffect, useRef, useState } from 'react';

/**
 * Options for configuring the Intersection Observer behavior
 */
interface UseIntersectionObserverOptions {
  /**
   * Threshold value between 0 and 1 indicating what percentage of the target's visibility
   * is needed to trigger the callback (default: 0.1)
   */
  threshold?: number;
  /**
   * Margin around the root element (default: '0px')
   * @example '50px 0px' - adds 50px margin to top and bottom
   */
  rootMargin?: string;
  /**
   * If true, the element will only trigger visibility once and then stop observing (default: true)
   */
  triggerOnce?: boolean;
}

/**
 * Custom hook that tracks when an element becomes visible in the viewport using Intersection Observer API
 *
 * @param options - Configuration options for the Intersection Observer
 * @returns Object containing a ref to attach to the target element and visibility state
 *
 * @example
 * ```tsx
 * const MyComponent = () => {
 *   const { ref, isVisible } = useIntersectionObserver({ threshold: 0.5 });
 *
 *   return (
 *     <div ref={ref}>
 *       {isVisible ? 'I am visible!' : 'Scroll down to see me'}
 *     </div>
 *   );
 * };
 * ```
 */
export const useIntersectionObserver = (
  options: UseIntersectionObserverOptions = {}
) => {
  const { threshold = 0.1, rootMargin = '0px', triggerOnce = true } = options;
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (triggerOnce && ref.current) {
            observer.unobserve(ref.current);
          }
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin }
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
      observer.disconnect();
    };
  }, [threshold, rootMargin, triggerOnce]);

  return { ref, isVisible };
};
