import Image from 'next/image'
import { GradientText } from '@/components/shared/gradient-text'

const SIZES = {
  sm: { icon: 24, text: 'text-lg' },
  md: { icon: 32, text: 'text-xl' },
  lg: { icon: 40, text: 'text-2xl' },
} as const

interface BrandProps {
  size?: keyof typeof SIZES
  className?: string
}

/**
 * CredDev brand mark — logo icon + gradient name.
 * Used in hero, back-link (showBrand), and anywhere brand identity is needed.
 */
export function Brand({ size = 'md', className = '' }: BrandProps) {
  const { icon, text } = SIZES[size]

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <Image
        src="/meta-icon.png"
        alt="CredDev"
        width={icon}
        height={icon}
        className="rounded-full"
      />
      <span className={`${text} font-bold`}>
        <GradientText>CredDev</GradientText>
      </span>
    </div>
  )
}
