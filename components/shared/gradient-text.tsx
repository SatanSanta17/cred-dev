import { ReactNode } from 'react'

export function GradientText({ children }: { children: ReactNode }) {
  return (
    <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 animate-gradient">
      {children}
    </span>
  )
}