'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react'

interface RiskFlag {
  title: string
  description: string
  source: string
}

interface RiskFlagCardProps {
  flag: RiskFlag
}

export function RiskFlagCard({ flag }: RiskFlagCardProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <Card className="p-4 bg-amber-500/5 border-amber-500/20">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-white text-sm font-medium">{flag.title}</p>
          <p className="text-slate-400 text-sm mt-1">{flag.description}</p>

          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-slate-600 text-xs mt-2 hover:text-slate-400 transition-colors"
          >
            {expanded ? (
              <ChevronUp className="w-3 h-3" />
            ) : (
              <ChevronDown className="w-3 h-3" />
            )}
            {expanded ? 'Hide' : 'Show'} source
          </button>

          {expanded && (
            <p className="text-slate-600 text-xs mt-1">{flag.source}</p>
          )}
        </div>
      </div>
    </Card>
  )
}
