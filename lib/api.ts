const API_BASE = process.env.NEXT_PUBLIC_CREDDEV_API_URL || 'http://localhost:8000'

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

export async function submitExtraction(formData: {
  candidate_name: string
  candidate_email: string
  github_url?: string
  leetcode_url?: string
  linkedin_url?: string
  resume?: File
}): Promise<ExtractionResponse> {
  const body = new FormData()
  body.append('candidate_name', formData.candidate_name)
  body.append('candidate_email', formData.candidate_email)
  if (formData.github_url) body.append('github_url', formData.github_url)
  if (formData.leetcode_url) body.append('leetcode_url', formData.leetcode_url)
  if (formData.linkedin_url) body.append('linkedin_url', formData.linkedin_url)
  if (formData.resume) body.append('resume', formData.resume)

  const res = await fetch(`${API_BASE}/api/v1/extract`, {
    method: 'POST',
    body,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Network error' }))
    throw new Error(err.detail || `Extraction failed (${res.status})`)
  }

  return res.json()
}

export async function getExtractionStatus(jobId: string): Promise<ExtractionStatusResponse> {
  const res = await fetch(`${API_BASE}/api/v1/extract/${jobId}`)

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Network error' }))
    throw new Error(err.detail || `Status check failed (${res.status})`)
  }

  return res.json()
}

export async function triggerGeneration(jobId: string): Promise<GenerationResponse> {
  const res = await fetch(`${API_BASE}/api/v1/generate/${jobId}`, {
    method: 'POST',
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Network error' }))
    throw new Error(err.detail || `Generation failed (${res.status})`)
  }

  return res.json()
}

export async function getGenerationStatus(jobId: string): Promise<GenerationResponse> {
  const res = await fetch(`${API_BASE}/api/v1/generate/${jobId}`)

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Network error' }))
    throw new Error(err.detail || `Status check failed (${res.status})`)
  }

  return res.json()
}

export function getSSEUrl(jobId: string): string {
  return `${API_BASE}/api/v1/generate/${jobId}/stream`
}
