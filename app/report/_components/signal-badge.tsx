interface SignalBadgeProps {
  label: string
  present: boolean
}

export function SignalBadge({ label, present }: SignalBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs ${present
        ? 'bg-green-500/10 text-green-400 border border-green-500/20'
        : 'bg-slate-800 text-slate-600 border border-slate-700'
        }`}
    >
      {present ? '✓' : '✗'} {label}
    </span>
  )
}
