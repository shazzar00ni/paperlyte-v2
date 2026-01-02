# [MEDIUM] Implement image optimization pipeline

**Labels**: `priority:medium`, `area:performance`, `area:images`

## Description
The project lacks modern image optimization features including WebP/AVIF formats, responsive images (srcset), lazy loading, and build-time optimization. This impacts page load performance and mobile experience.

## Impact
- **Severity**: 🟡 MEDIUM PRIORITY
- **Risk**: Slower page loads, higher bandwidth costs, poor mobile performance, increased bounce rate
- **Owner**: Frontend Team
- **Timeline**: Sprint 2

## Missing Optimizations

### 1. Modern Image Formats ❌
**Current**: Only PNG/JPG formats served
**Needed**: WebP and AVIF with fallbacks

**Impact**:
- WebP: 25-35% smaller than JPEG/PNG
- AVIF: 50% smaller than JPEG/PNG
- Faster load times, especially on mobile

### 2. Responsive Images ❌
**Current**: No srcset implementation
**Needed**: Responsive images for different viewport sizes

**Impact**:
- Mobile users download unnecessarily large images
- Wasted bandwidth on small screens
- Slower mobile load times

### 3. Lazy Loading ❌
**Current**: All images load immediately
**Needed**: Lazy loading for below-fold images

**Impact**:
- Unnecessary initial page load time
- Poor performance metrics (LCP, Speed Index)
- Higher bandwidth usage

### 4. Build Pipeline Optimization ❌
**Current**: No automated image optimization
**Needed**: Build-time image processing

**Impact**:
- Manual optimization required
- Inconsistent image quality
- Larger bundle sizes

## Implementation Plan

### Phase 1: Modern Image Formats (Week 1)

#### Install Dependencies
```bash
npm install -D vite-plugin-imagemin @squoosh/lib
# or
npm install -D vite-imagetools
```

#### Configure Vite Plugin
```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import { imagetools } from 'vite-imagetools';

export default defineConfig({
  plugins: [
    imagetools({
      defaultDirectives: (url) => {
        return new URLSearchParams({
          format: 'webp;avif;png',
          quality: '80',
          withoutEnlargement: '',
        });
      },
    }),
  ],
});
```

#### Update Image Usage
```tsx
// Before
<img src="/logo.png" alt="Paperlyte" />

// After (with vite-imagetools)
import logoWebp from './logo.png?w=400&format=webp';
import logoAvif from './logo.png?w=400&format=avif';
import logoPng from './logo.png?w=400&format=png';

<picture>
  <source srcSet={logoAvif} type="image/avif" />
  <source srcSet={logoWebp} type="image/webp" />
  <img src={logoPng} alt="Paperlyte" />
</picture>
```

### Phase 2: Responsive Images (Week 2)

#### Create ResponsiveImage Component
```tsx
// src/components/ui/ResponsiveImage.tsx
interface ResponsiveImageProps {
  src: string;
  alt: string;
  sizes?: string;
  className?: string;
  loading?: 'lazy' | 'eager';
}

export function ResponsiveImage({
  src,
  alt,
  sizes = '100vw',
  className,
  loading = 'lazy'
}: ResponsiveImageProps) {
  return (
    <picture>
      <source
        type="image/avif"
        srcSet={`
          ${src}?w=400&format=avif 400w,
          ${src}?w=800&format=avif 800w,
          ${src}?w=1200&format=avif 1200w
        `}
        sizes={sizes}
      />
      <source
        type="image/webp"
        srcSet={`
          ${src}?w=400&format=webp 400w,
          ${src}?w=800&format=webp 800w,
          ${src}?w=1200&format=webp 1200w
        `}
        sizes={sizes}
      />
      <img
        src={`${src}?w=800`}
        srcSet={`
          ${src}?w=400 400w,
          ${src}?w=800 800w,
          ${src}?w=1200 1200w
        `}
        sizes={sizes}
        alt={alt}
        loading={loading}
        className={className}
      />
    </picture>
  );
}
```

#### Update Image Usage
```tsx
// Replace all <img> tags with ResponsiveImage
<ResponsiveImage
  src="/hero-image.png"
  alt="Paperlyte Hero"
  sizes="(max-width: 768px) 100vw, 50vw"
  loading="eager" // Above the fold
/>

<ResponsiveImage
  src="/feature-image.png"
  alt="Feature"
  sizes="(max-width: 768px) 100vw, 33vw"
  loading="lazy" // Below the fold
/>
```

### Phase 3: Lazy Loading (Week 2)

#### Native Lazy Loading
```tsx
// Use native loading="lazy" for below-fold images
<img src="image.jpg" alt="..." loading="lazy" />
```

#### Intersection Observer (Advanced)
```tsx
// src/hooks/useIntersectionObserver.ts
export function useIntersectionObserver(
  elementRef: RefObject<Element>,
  options?: IntersectionObserverInit
) {
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, options);

    observer.observe(element);
    return () => observer.disconnect();
  }, [elementRef, options]);

  return isIntersecting;
}

// Usage
function LazyImage({ src, alt }: { src: string; alt: string }) {
  const ref = useRef<HTMLImageElement>(null);
  const isVisible = useIntersectionObserver(ref, { rootMargin: '100px' });

  return (
    <img
      ref={ref}
      src={isVisible ? src : undefined}
      alt={alt}
      loading="lazy"
    />
  );
}
```

### Phase 4: Build Pipeline (Week 3)

#### Configure Image Optimization
```typescript
// vite.config.ts
import viteImagemin from 'vite-plugin-imagemin';

export default defineConfig({
  plugins: [
    viteImagemin({
      gifsicle: { optimizationLevel: 7 },
      mozjpeg: { quality: 80 },
      pngquant: { quality: [0.8, 0.9], speed: 4 },
      svgo: {
        plugins: [
          { name: 'removeViewBox', active: false },
          { name: 'removeEmptyAttrs', active: false },
        ],
      },
    }),
  ],
});
```

## Icon Assets Optimization

Current icon assets to optimize:
- `favicon-16x16.png`
- `favicon-32x32.png`
- `apple-touch-icon.png` (180x180)
- `android-chrome-192x192.png`
- `android-chrome-512x512.png`

**Optimization**:
- Convert to WebP/AVIF where supported
- Optimize PNG with pngquant
- Consider SVG favicon for better quality

## Performance Impact (Expected)

### Before Optimization
- Average image size: ~200 KB per image
- Total images: ~10 images = ~2 MB
- Mobile load time: ~3-4 seconds

### After Optimization
- Average image size (WebP): ~70 KB per image
- Average image size (AVIF): ~40 KB per image
- Total images (AVIF): ~10 images = ~400 KB
- Mobile load time: ~1-1.5 seconds
- **Improvement**: 60-75% reduction in image bandwidth

## Testing Checklist
- [ ] All images convert to WebP/AVIF successfully
- [ ] Fallback to PNG/JPG works in older browsers
- [ ] Responsive images serve correct sizes at different viewports
- [ ] Lazy loading triggers at appropriate times
- [ ] Build pipeline optimizes images automatically
- [ ] Lighthouse performance score improves
- [ ] Visual quality remains acceptable (no artifacts)
- [ ] Mobile bandwidth usage significantly reduced

## Browser Support
- **WebP**: 96% global support (all modern browsers)
- **AVIF**: 89% global support (Chrome, Firefox, Safari 16+)
- **Lazy loading**: 95% global support (native)
- **Fallback**: PNG/JPG for older browsers

## Acceptance Criteria
- [ ] WebP and AVIF formats implemented with fallbacks
- [ ] Responsive images (srcset) on all image assets
- [ ] Lazy loading on all below-fold images
- [ ] Build pipeline automatically optimizes images
- [ ] ResponsiveImage component created and tested
- [ ] All existing images converted to new format
- [ ] Performance metrics improved (LCP, Speed Index)
- [ ] Mobile bandwidth usage reduced by ≥50%
- [ ] Documentation updated with image best practices

## Monitoring
After implementation, track:
- Lighthouse Performance score (target: ≥90)
- LCP (Largest Contentful Paint) - should improve
- Speed Index - should improve
- Total page weight - should decrease significantly
- Mobile vs Desktop load times

## Related Issues
- Issue #5: Lighthouse CI setup (will measure image optimization impact)
- Phase 1 (pre-production): Performance targets must be met

## Resources
- vite-imagetools: https://github.com/JonasKruckenberg/imagetools
- vite-plugin-imagemin: https://github.com/vbenjs/vite-plugin-imagemin
- Web.dev Image Optimization: https://web.dev/fast/#optimize-your-images

## Source
Baseline Audit 2025-12-22: `docs/audit-results/baseline-audit-2025-12-22.md` (Lines 73-78, 219-222, 353-358)
