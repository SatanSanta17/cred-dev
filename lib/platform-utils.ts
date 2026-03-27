/**
 * Platform Detection Utilities
 *
 * TypeScript port of backend `services/platform_utils.py`.
 * Auto-detects platform name from URL domain. Used by the chat agent
 * for URL detection and available app-wide for any platform-related logic.
 */

/* ------------------------------------------------------------------ */
/*  Domain → Platform Mapping                                          */
/* ------------------------------------------------------------------ */

const DOMAIN_MAP: Record<string, string> = {
  'github.com': 'github',
  'leetcode.com': 'leetcode',
  'linkedin.com': 'linkedin',
  'kaggle.com': 'kaggle',
  'codechef.com': 'codechef',
  'codeforces.com': 'codeforces',
  'huggingface.co': 'huggingface',
  'hackerrank.com': 'hackerrank',
  'hackerearth.com': 'hackerearth',
  'stackoverflow.com': 'stackoverflow',
  'medium.com': 'medium',
  'dev.to': 'devto',
  'behance.net': 'behance',
  'dribbble.com': 'dribbble',
  'npmjs.com': 'npm',
  'pypi.org': 'pypi',
  'gitlab.com': 'gitlab',
  'bitbucket.org': 'bitbucket',
}

const PLATFORM_NAMES: Record<string, string> = {
  github: 'GitHub',
  leetcode: 'LeetCode',
  linkedin: 'LinkedIn',
  kaggle: 'Kaggle',
  codechef: 'CodeChef',
  codeforces: 'Codeforces',
  huggingface: 'HuggingFace',
  hackerrank: 'HackerRank',
  hackerearth: 'HackerEarth',
  stackoverflow: 'Stack Overflow',
  medium: 'Medium',
  devto: 'DEV Community',
  behance: 'Behance',
  dribbble: 'Dribbble',
  npm: 'npm',
  pypi: 'PyPI',
  gitlab: 'GitLab',
  bitbucket: 'Bitbucket',
}

/* ------------------------------------------------------------------ */
/*  URL Extraction & Detection                                         */
/* ------------------------------------------------------------------ */

/** Extract URLs from a text string. */
function extractUrls(text: string): string[] {
  const urlRegex = /https?:\/\/[^\s<>\"']+|(?:www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z]{2,6}\b(?:[-a-zA-Z0-9@:%_+.~#?&/=]*)/gi
  return text.match(urlRegex) ?? []
}

/** Detect platform from a single URL. Mirrors backend detect_platform(). */
function detectPlatform(url: string): string {
  try {
    const withProtocol = url.includes('://') ? url : `https://${url}`
    const parsed = new URL(withProtocol)
    const hostname = parsed.hostname.toLowerCase().replace(/^www\./, '')

    for (const [domain, platformId] of Object.entries(DOMAIN_MAP)) {
      if (hostname === domain || hostname.endsWith(`.${domain}`)) {
        return platformId
      }
    }

    // Fallback: use domain name as platform id
    return hostname.split('.')[0] || 'unknown'
  } catch {
    return 'unknown'
  }
}

/** Get human-readable platform name. */
export function getPlatformName(platformId: string): string {
  return PLATFORM_NAMES[platformId] ?? platformId.charAt(0).toUpperCase() + platformId.slice(1)
}

/**
 * Detect all platform URLs in a text string.
 * Returns { platformId: url } for each recognized URL.
 */
export function detectPlatformUrls(text: string): Record<string, string> {
  const urls = extractUrls(text)
  const detected: Record<string, string> = {}

  for (const url of urls) {
    const platform = detectPlatform(url)
    if (platform !== 'unknown') {
      detected[platform] = url.includes('://') ? url : `https://${url}`
    }
  }

  return detected
}
