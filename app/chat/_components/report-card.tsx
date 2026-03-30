'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { FileText, Download, Loader2 } from 'lucide-react'
import { downloadReportPdf } from '@/lib/api'
import { cn } from '@/lib/utils'

/* ------------------------------------------------------------------ */
/*  Report metadata — mirrors backend REPORT_META                     */
/* ------------------------------------------------------------------ */

const REPORT_META: Record<string, { title: string; description: string }> = {
  extensive_report: {
    title: 'Comprehensive Technical Report',
    description: 'Deep-dive analysis with inline citations and skill verification',
  },
  developer_insight: {
    title: 'Developer Growth Insight',
    description: 'Career positioning, skill gaps, and 30-60 day focus areas',
  },
  recruiter_insight: {
    title: 'Recruiter Hiring Signal',
    description: 'Screening clarity, interview guidance, and hire confidence',
  },
}

/* ------------------------------------------------------------------ */
/*  Single report card                                                 */
/* ------------------------------------------------------------------ */

interface ReportCardProps {
  jobId: string
  reportType: string
  className?: string
}

function ReportCard({ jobId, reportType, className }: ReportCardProps) {
  const [isDownloading, setIsDownloading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const meta = REPORT_META[reportType] ?? {
    title: reportType.replace(/_/g, ' '),
    description: '',
  }

  async function handleDownload() {
    setIsDownloading(true)
    setError(null)

    try {
      const blob = await downloadReportPdf(jobId, reportType)

      // Trigger browser download
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `creddev-${reportType.replace(/_/g, '-')}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Download failed')
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <div
      className={cn(
        'glass-card-light rounded-xl p-4 flex flex-col gap-3 min-w-0',
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
          <FileText className="w-5 h-5 text-purple-400" />
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-medium text-[var(--text-heading)] leading-snug truncate">
            {meta.title}
          </h4>
          <p className="text-xs text-[var(--text-muted)] mt-0.5 line-clamp-2">
            {meta.description}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={handleDownload}
        disabled={isDownloading}
        className="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-lg text-xs font-medium border border-[var(--border-card)] text-[var(--text-heading)] hover:border-purple-500/50 hover:text-purple-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isDownloading ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Downloading...
          </>
        ) : (
          <>
            <Download className="w-3.5 h-3.5" />
            Download PDF
          </>
        )}
      </button>

      {error && (
        <p className="text-xs text-red-400 text-center">{error}</p>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Report card group — renders 3 cards in a row                      */
/* ------------------------------------------------------------------ */

interface ReportCardsProps {
  jobId: string
  className?: string
}

export function ReportCards({ jobId, className }: ReportCardsProps) {
  const reportTypes = ['extensive_report', 'developer_insight', 'recruiter_insight']

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className={cn(
        'grid grid-cols-1 md:grid-cols-3 gap-3 px-4 py-2 max-w-3xl mx-auto',
        className,
      )}
    >
      {reportTypes.map((type, i) => (
        <motion.div
          key={type}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 + i * 0.15 }}
        >
          <ReportCard jobId={jobId} reportType={type} />
        </motion.div>
      ))}
    </motion.div>
  )
}
