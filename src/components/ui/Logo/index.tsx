import logoAvifSrc from '@/assets/logo.avif'
import logoPngSrc from '@/assets/logo.png'
import logoWebpSrc from '@/assets/logo.webp'

interface LogoProps {
  className?: string
}

export const Logo = ({ className }: LogoProps): React.ReactElement => (
  <picture>
    <source srcSet={logoAvifSrc} type="image/avif" />
    <source srcSet={logoWebpSrc} type="image/webp" />
    <img
      src={logoPngSrc}
      alt="Paperlyte logo"
      width="32"
      height="32"
      className={className}
    />
  </picture>
)
