'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react'

interface Skill {
  name: string
  verified: boolean
  source: string
}

interface SkillGroupProps {
  title: string
  skills: Skill[]
}

export function SkillGroup({ title, skills }: SkillGroupProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <Card className="p-4 bg-slate-800/30 border-slate-700">
      <p className="text-slate-400 text-sm font-medium mb-3">{title}</p>
      <div className="flex flex-wrap gap-2">
        {skills.map((skill) => (
          <Badge
            key={skill.name}
            className={
              skill.verified
                ? 'bg-green-500/10 border-green-500/30 text-green-400 gap-1'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-400 gap-1'
            }
          >
            {skill.verified ? (
              <CheckCircle2 className="w-3 h-3" />
            ) : (
              <AlertTriangle className="w-3 h-3" />
            )}
            {skill.name}
          </Badge>
        ))}
      </div>

      {/* Collapsible source details */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1 text-slate-600 text-xs mt-3 hover:text-slate-400 transition-colors"
      >
        {expanded ? (
          <ChevronUp className="w-3 h-3" />
        ) : (
          <ChevronDown className="w-3 h-3" />
        )}
        {expanded ? 'Hide' : 'Show'} verification sources
      </button>

      {expanded && (
        <div className="mt-2 space-y-1">
          {skills.map((skill) => (
            <p key={skill.name} className="text-slate-600 text-xs">
              <span
                className={
                  skill.verified ? 'text-green-600' : 'text-amber-600'
                }
              >
                {skill.name}:
              </span>{' '}
              {skill.source}
            </p>
          ))}
        </div>
      )}
    </Card>
  )
}
