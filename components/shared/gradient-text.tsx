import { ReactNode } from 'react'

export function GradientText({ children }: { children: ReactNode }) {
  return (
    <span className="text-brand-gradient animate-gradient">
      {children}
    </span>
  )
}