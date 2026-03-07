import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { GradientText } from '@/components/shared/gradient-text'

interface BackLinkProps {
  href?: string
  showBrand?: boolean
  className?: string
}

/**
 * Reusable back navigation link.
 * - Default: links to "/" with "Back to Home" text
 * - showBrand: replaces text with CredDev gradient brand name
 * - Used on /try page (with brand) and /report pages (without brand)
 */
export function BackLink({ href = '/', showBrand = false, className = '' }: BackLinkProps) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-2 group ${className}`}
    >
      <ArrowLeft className="w-4 h-4 text-gray-500 group-hover:text-purple-400 transition-colors" />
      {showBrand ? (
        <span className="text-xl font-bold">
          <GradientText>CredDev</GradientText>
        </span>
      ) : (
        <span className="text-sm text-slate-500 group-hover:text-purple-400 transition-colors">
          Back to CredDev
        </span>
      )}
    </Link>
  )
}
