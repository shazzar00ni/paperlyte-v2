import logoAvifSrc from '@/assets/logo.avif'
import logoPngSrc from '@/assets/logo.png'
import logoWebpSrc from '@/assets/logo.webp'

interface BrandLogoProps {
  className?: string
  imageClassName?: string
  textClassName?: string
  text?: string
}

/** Renders the shared Paperlyte brand mark with optimized image sources. */
export const BrandLogo = ({
  className,
  imageClassName,
  textClassName,
  text = 'Paperlyte',
}: BrandLogoProps): React.ReactElement => {
  return (
    <div className={className}>
      <picture>
        <source srcSet={logoAvifSrc} type="image/avif" />
        <source srcSet={logoWebpSrc} type="image/webp" />
        <img
          src={logoPngSrc}
          alt="Paperlyte logo"
          width="32"
          height="32"
          className={imageClassName}
        />
      </picture>
      <span className={textClassName}>{text}</span>
    </div>
  )
}
