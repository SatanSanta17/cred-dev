import { getAccessToken } from './supabase-auth'

const API_BASE = process.env.NEXT_PUBLIC_CRED_SERVICE_API_URL || 'http://localhost:8000'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface ExtractionResponse {
  job_id: string
  status: string
  message?: string
}

export interface ExtractionStatusResponse {
  job_id: string
  status: string
  candidate_name?: string
  raw_data?: Record<string, unknown>
  error?: string
  message?: string
}

export interface GenerationResponse {
  job_id: string
  status: string
  message?: string
  reports?: Record<string, string>
  error?: string
}

export interface UserReport {
  job_id: string
  candidate_name: string
  status: string
  created_at: string | null
  platform_urls: Record<string, string> | null
}

export interface UserReportsResponse {
  reports: UserReport[]
  page: number
  per_page: number
  total: number
}

/* ------------------------------------------------------------------ */
/*  Auth-aware fetch wrapper                                           */
/* ------------------------------------------------------------------ */

/**
 * Centralized fetch wrapper that injects the auth token when available.
 * Emits a custom 'auth:expired' event on 401 so the auth context can
 * trigger re-authentication without every component handling it individually.
 */
async function fetchWithAuth(
  url: string,
  options: RequestInit = {},
): Promise<Response> {
  const token = await getAccessToken()

  const headers = new Headers(options.headers)
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const res = await fetch(url, { ...options, headers })

  // Global 401 interceptor — emit event so auth context can react
  if (res.status === 401 && token) {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('auth:expired'))
    }
  }

  return res
}

/**
 * Parse error detail from a failed response.
 */
async function parseError(res: Response, fallback: string): Promise<string> {
  const err = await res.json().catch(() => ({ detail: 'Network error' }))
  return err.detail || `${fallback} (${res.status})`
}

/* ------------------------------------------------------------------ */
/*  Extraction endpoints                                               */
/* ------------------------------------------------------------------ */

export async function submitExtraction(formData: {
  candidate_name: string
  candidate_email: string
  github_url?: string
  leetcode_url?: string
  platform_urls?: Record<string, string>
  resume?: File
}): Promise<ExtractionResponse> {
  const body = new FormData()
  body.append('candidate_name', formData.candidate_name)
  body.append('candidate_email', formData.candidate_email)
  // Dedicated platform fields (backward compat)
  if (formData.github_url) body.append('github_url', formData.github_url)
  if (formData.leetcode_url) body.append('leetcode_url', formData.leetcode_url)
  // New: all platform URLs as JSON string
  if (formData.platform_urls && Object.keys(formData.platform_urls).length > 0) {
    body.append('platform_urls', JSON.stringify(formData.platform_urls))
  }
  if (formData.resume) body.append('resume', formData.resume)

  const res = await fetchWithAuth(`${API_BASE}/api/v1/extract`, {
    method: 'POST',
    body,
  })

  if (!res.ok) {
    throw new Error(await parseError(res, 'Extraction failed'))
  }

  return res.json()
}

export async function getExtractionStatus(jobId: string): Promise<ExtractionStatusResponse> {
  const res = await fetchWithAuth(`${API_BASE}/api/v1/extract/${jobId}`)

  if (!res.ok) {
    throw new Error(await parseError(res, 'Status check failed'))
  }

  return res.json()
}

/* ------------------------------------------------------------------ */
/*  Generation endpoints                                               */
/* ------------------------------------------------------------------ */

export async function triggerGeneration(jobId: string): Promise<GenerationResponse> {
  const res = await fetchWithAuth(`${API_BASE}/api/v1/generate/${jobId}`, {
    method: 'POST',
  })

  if (!res.ok) {
    throw new Error(await parseError(res, 'Generation failed'))
  }

  return res.json()
}

export async function getGenerationStatus(jobId: string): Promise<GenerationResponse> {
  const res = await fetchWithAuth(`${API_BASE}/api/v1/generate/${jobId}`)

  if (!res.ok) {
    throw new Error(await parseError(res, 'Status check failed'))
  }

  return res.json()
}

export function getSSEUrl(jobId: string): string {
  return `${API_BASE}/api/v1/generate/${jobId}/stream`
}

export async function resendEmail(jobId: string): Promise<{ status: string; message: string }> {
  const res = await fetchWithAuth(`${API_BASE}/api/v1/generate/${jobId}/resend-email`, {
    method: 'POST',
  })

  if (!res.ok) {
    throw new Error(await parseError(res, 'Resend failed'))
  }

  return res.json()
}

/* ------------------------------------------------------------------ */
/*  PDF download                                                       */
/* ------------------------------------------------------------------ */

/**
 * Get the download URL for a specific report PDF.
 * Returns a URL that the browser can open directly to trigger download.
 */
export function getReportPdfUrl(jobId: string, reportType: string): string {
  return `${API_BASE}/api/v1/generate/${jobId}/pdf/${reportType}`
}

/**
 * Download a report PDF with auth. Returns the PDF blob.
 */
export async function downloadReportPdf(jobId: string, reportType: string): Promise<Blob> {
  const res = await fetchWithAuth(
    `${API_BASE}/api/v1/generate/${jobId}/pdf/${reportType}`,
  )

  if (!res.ok) {
    throw new Error(await parseError(res, 'PDF download failed'))
  }

  return res.blob()
}

/* ------------------------------------------------------------------ */
/*  User report history                                                */
/* ------------------------------------------------------------------ */

export async function getUserReports(
  page = 1,
  perPage = 10,
): Promise<UserReportsResponse> {
  const res = await fetchWithAuth(
    `${API_BASE}/api/v1/user/reports?page=${page}&per_page=${perPage}`,
  )

  if (!res.ok) {
    throw new Error(await parseError(res, 'Failed to fetch report history'))
  }

  return res.json()
}
