import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ParallaxLayer } from './ParallaxLayer';

// Mock the useParallax hook
vi.mock('@hooks/useParallax', () => ({
  useParallax: vi.fn(),
}));

import { useParallax } from '@hooks/useParallax';

describe('ParallaxLayer', () => {
  const mockUseParallax = useParallax as unknown as vi.MockedFunction<typeof useParallax>;
  const mockRef = { current: null };

  // Factory helper for creating parallax state with defaults
  const createParallaxState = (
    overrides: Partial<ReturnType<typeof useParallax>> = {}
  ): ReturnType<typeof useParallax> => ({
    ref: mockRef,
    transform: 'translate3d(0, 50px, 0)',
    isActive: true,
    offset: 50,
    isInView: true,
    ...overrides,
  });

  // Helper to get the layer element from a rendered container
  const getLayerElement = (container: HTMLElement) => container.firstChild as HTMLElement;

  beforeEach(() => {
    // Reset mock before each test with default state
    mockUseParallax.mockReturnValue(createParallaxState());
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Children Rendering', () => {
    it('should render children', () => {
      render(
        <ParallaxLayer>
          <div data-testid="child-content">Test content</div>
        </ParallaxLayer>
      );

      expect(screen.getByTestId('child-content')).toBeInTheDocument();
      expect(screen.getByText('Test content')).toBeInTheDocument();
    });

    it('should render multiple children', () => {
      render(
        <ParallaxLayer>
          <div>First child</div>
          <div>Second child</div>
        </ParallaxLayer>
      );

      expect(screen.getByText('First child')).toBeInTheDocument();
      expect(screen.getByText('Second child')).toBeInTheDocument();
    });
  });

  describe('useParallax Hook Integration', () => {
    it('should call useParallax with default speed', () => {
      render(
        <ParallaxLayer>
          <div>Content</div>
        </ParallaxLayer>
      );

      expect(mockUseParallax).toHaveBeenCalledWith(expect.objectContaining({ speed: 0.3 }));
    });

    it('should call useParallax with custom speed', () => {
      render(
        <ParallaxLayer speed={0.5}>
          <div>Content</div>
        </ParallaxLayer>
      );

      expect(mockUseParallax).toHaveBeenCalledWith(expect.objectContaining({ speed: 0.5 }));
    });

    it('should call useParallax with negative speed', () => {
      render(
        <ParallaxLayer speed={-0.2}>
          <div>Content</div>
        </ParallaxLayer>
      );

      expect(mockUseParallax).toHaveBeenCalledWith(expect.objectContaining({ speed: -0.2 }));
    });

    it('should call useParallax with zero speed', () => {
      render(
        <ParallaxLayer speed={0}>
          <div>Content</div>
        </ParallaxLayer>
      );

      expect(mockUseParallax).toHaveBeenCalledWith(expect.objectContaining({ speed: 0 }));
    });
  });

  describe('Transform Application When Active', () => {
    it('should apply transform when isActive is true', () => {
      mockUseParallax.mockReturnValue(createParallaxState());

      const { container } = render(
        <ParallaxLayer>
          <div>Content</div>
        </ParallaxLayer>
      );

      const layerElement = getLayerElement(container);
      expect(layerElement.style.transform).toBe('translate3d(0, 50px, 0)');
    });

    it('should apply different transform values based on hook output', () => {
      mockUseParallax.mockReturnValue(
        createParallaxState({ transform: 'translate3d(0, -25px, 0)', offset: -25 })
      );

      const { container } = render(
        <ParallaxLayer speed={-0.5}>
          <div>Content</div>
        </ParallaxLayer>
      );

      const layerElement = getLayerElement(container);
      expect(layerElement.style.transform).toBe('translate3d(0, -25px, 0)');
    });

    it('should apply willChange when isActive is true', () => {
      mockUseParallax.mockReturnValue(createParallaxState());

      const { container } = render(
        <ParallaxLayer>
          <div>Content</div>
        </ParallaxLayer>
      );

      const layerElement = getLayerElement(container);
      expect(layerElement.style.willChange).toBe('transform');
    });
  });

  describe('Static Behavior When Inactive', () => {
    it('should not apply transform when isActive is false (reduced motion)', () => {
      mockUseParallax.mockReturnValue(createParallaxState({ isActive: false, offset: 0 }));

      const { container } = render(
        <ParallaxLayer>
          <div>Content</div>
        </ParallaxLayer>
      );

      const layerElement = getLayerElement(container);
      expect(layerElement.style.transform).toBe('');
    });

    it('should not apply willChange when isActive is false', () => {
      mockUseParallax.mockReturnValue(createParallaxState({ isActive: false, offset: 0 }));

      const { container } = render(
        <ParallaxLayer>
          <div>Content</div>
        </ParallaxLayer>
      );

      const layerElement = getLayerElement(container);
      expect(layerElement.style.willChange).toBe('');
    });

    it('should render content without parallax on mobile', () => {
      mockUseParallax.mockReturnValue(
        createParallaxState({ transform: 'translate3d(0, 0px, 0)', isActive: false, offset: 0 })
      );

      render(
        <ParallaxLayer>
          <div>Mobile content</div>
        </ParallaxLayer>
      );

      expect(screen.getByText('Mobile content')).toBeInTheDocument();
    });
  });

  describe('Style Prop Application', () => {
    it('should apply default zIndex of 0', () => {
      const { container } = render(
        <ParallaxLayer>
          <div>Content</div>
        </ParallaxLayer>
      );

      const layerElement = getLayerElement(container);
      expect(layerElement.style.zIndex).toBe('0');
    });

    it('should apply custom zIndex', () => {
      const { container } = render(
        <ParallaxLayer zIndex={10}>
          <div>Content</div>
        </ParallaxLayer>
      );

      const layerElement = getLayerElement(container);
      expect(layerElement.style.zIndex).toBe('10');
    });

    it('should apply negative zIndex for background layers', () => {
      const { container } = render(
        <ParallaxLayer zIndex={-1}>
          <div>Background</div>
        </ParallaxLayer>
      );

      const layerElement = getLayerElement(container);
      expect(layerElement.style.zIndex).toBe('-1');
    });

    it('should apply default opacity of 1', () => {
      const { container } = render(
        <ParallaxLayer>
          <div>Content</div>
        </ParallaxLayer>
      );

      const layerElement = getLayerElement(container);
      expect(layerElement.style.opacity).toBe('1');
    });

    it('should apply custom opacity', () => {
      const { container } = render(
        <ParallaxLayer opacity={0.5}>
          <div>Content</div>
        </ParallaxLayer>
      );

      const layerElement = getLayerElement(container);
      expect(layerElement.style.opacity).toBe('0.5');
    });

    it('should apply opacity of 0 for invisible layers', () => {
      const { container } = render(
        <ParallaxLayer opacity={0}>
          <div>Invisible</div>
        </ParallaxLayer>
      );

      const layerElement = getLayerElement(container);
      expect(layerElement.style.opacity).toBe('0');
    });

    it('should apply all style props together', () => {
      mockUseParallax.mockReturnValue(
        createParallaxState({ transform: 'translate3d(0, 100px, 0)', offset: 100 })
      );

      const { container } = render(
        <ParallaxLayer zIndex={5} opacity={0.8}>
          <div>Content</div>
        </ParallaxLayer>
      );

      const layerElement = getLayerElement(container);
      expect(layerElement.style.zIndex).toBe('5');
      expect(layerElement.style.opacity).toBe('0.8');
      expect(layerElement.style.transform).toBe('translate3d(0, 100px, 0)');
      expect(layerElement.style.willChange).toBe('transform');
    });
  });

  describe('Absolute Positioning ClassName Application', () => {
    it('should not have absolute class by default', () => {
      const { container } = render(
        <ParallaxLayer>
          <div>Content</div>
        </ParallaxLayer>
      );

      const layerElement = getLayerElement(container);
      expect(layerElement.className).not.toContain('absolute');
    });

    it('should apply absolute class when absolute prop is true', () => {
      const { container } = render(
        <ParallaxLayer absolute>
          <div>Background</div>
        </ParallaxLayer>
      );

      const layerElement = getLayerElement(container);
      expect(layerElement.className).toContain('absolute');
    });

    it('should apply absolute class with custom className', () => {
      const { container } = render(
        <ParallaxLayer absolute className="custom-layer">
          <div>Background</div>
        </ParallaxLayer>
      );

      const layerElement = getLayerElement(container);
      expect(layerElement.className).toContain('absolute');
      expect(layerElement.className).toContain('custom-layer');
    });

    it('should apply custom className without absolute', () => {
      const { container } = render(
        <ParallaxLayer className="custom-layer">
          <div>Content</div>
        </ParallaxLayer>
      );

      const layerElement = getLayerElement(container);
      expect(layerElement.className).toContain('custom-layer');
      expect(layerElement.className).not.toContain('absolute');
    });

    it('should apply layer base class', () => {
      const { container } = render(
        <ParallaxLayer>
          <div>Content</div>
        </ParallaxLayer>
      );

      const layerElement = getLayerElement(container);
      expect(layerElement.className).toContain('layer');
    });
  });

  describe('Complete Integration Scenarios', () => {
    it('should create background parallax layer', () => {
      mockUseParallax.mockReturnValue(
        createParallaxState({ transform: 'translate3d(0, 20px, 0)', offset: 20 })
      );

      const { container } = render(
        <ParallaxLayer speed={0.2} absolute zIndex={-1} opacity={0.6}>
          <div className="background-decoration">Background</div>
        </ParallaxLayer>
      );

      const layerElement = getLayerElement(container);
      expect(layerElement.className).toContain('layer');
      expect(layerElement.className).toContain('absolute');
      expect(layerElement.style.zIndex).toBe('-1');
      expect(layerElement.style.opacity).toBe('0.6');
      expect(layerElement.style.transform).toBe('translate3d(0, 20px, 0)');
      expect(layerElement.style.willChange).toBe('transform');
      expect(mockUseParallax).toHaveBeenCalledWith({ speed: 0.2 });
    });

    it('should create foreground parallax layer', () => {
      mockUseParallax.mockReturnValue(
        createParallaxState({ transform: 'translate3d(0, -30px, 0)', offset: -30 })
      );

      const { container } = render(
        <ParallaxLayer speed={0.8} zIndex={10}>
          <h1>Hero Title</h1>
        </ParallaxLayer>
      );

      const layerElement = getLayerElement(container);
      expect(layerElement.className).toContain('layer');
      expect(layerElement.className).not.toContain('absolute');
      expect(layerElement.style.zIndex).toBe('10');
      expect(layerElement.style.transform).toBe('translate3d(0, -30px, 0)');
      expect(mockUseParallax).toHaveBeenCalledWith({ speed: 0.8 });
    });

    it('should handle static layer with reduced motion', () => {
      mockUseParallax.mockReturnValue(
        createParallaxState({ transform: 'translate3d(0, 0px, 0)', isActive: false, offset: 0 })
      );

      const { container } = render(
        <ParallaxLayer speed={0.5}>
          <div>Static content</div>
        </ParallaxLayer>
      );

      const layerElement = getLayerElement(container);
      expect(layerElement.style.transform).toBe('');
      expect(layerElement.style.willChange).toBe('');
      expect(screen.getByText('Static content')).toBeInTheDocument();
    });
  });
});
