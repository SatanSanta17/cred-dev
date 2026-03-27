/**
 * Chat Agent State Machine
 *
 * Client-side deterministic state machine that drives the conversational flow.
 * No LLM needed — all transitions are based on user input patterns (URLs, keywords, file uploads).
 *
 * State machine design mirrors TRD-010 Part 2.
 */

import type { Message } from './chat-message'

/* ------------------------------------------------------------------ */
/*  Agent State Types                                                  */
/* ------------------------------------------------------------------ */

export type AgentState =
  | 'greeting'
  | 'collecting_links'
  | 'confirming_links'
  | 'resume_prompt'
  | 'awaiting_resume'
  | 'extracting'
  | 'auth_gate'
  | 'checking_history'
  | 'generating'
  | 'delivering_report'
  | 'idle'
  | 'viewing_history'

export interface CollectedData {
  platformUrls: Record<string, string> // { github: "url", leetcode: "url", ... }
  resumeFile: File | null
  jobId: string | null
}

export interface AgentResponse {
  messages: Array<Omit<Message, 'id' | 'timestamp'>>
  nextState: AgentState
  updatedData?: Partial<CollectedData>
  showFileUpload?: boolean
}

/* ------------------------------------------------------------------ */
/*  URL Detection — TypeScript port of backend platform_utils.py       */
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

/* ------------------------------------------------------------------ */
/*  Agent Message Templates                                            */
/* ------------------------------------------------------------------ */

const GREETINGS = {
  anonymous:
    "Hey! I'm CredDev's analysis agent. I verify developer credibility by analyzing real data from GitHub, LeetCode, and other platforms.\n\nShare your profile links and I'll get started.",
  authenticated: (name: string) =>
    `Hey ${name}, welcome back! Share your profile links and I'll run a fresh credibility analysis for you.`,
} as const

const REDIRECTS = [
  "Interesting! I'm built for developer credibility analysis though. Share a profile link and I'll show you what I can do.",
  "Good question! My specialty is analyzing developer profiles. Drop your GitHub or LeetCode URL and let's get started.",
  "I appreciate the chat! I'm most useful when analyzing developer profiles though. Got any links to share?",
  "That's a bit outside my lane — I focus on verifying developer credibility. Paste a profile URL and I'll take it from here.",
  "I'd love to help with that, but I'm really designed for one thing: developer profile analysis. Share a link and let's go!",
] as const

const LINK_ACKNOWLEDGMENTS = {
  single: (platform: string) =>
    `Got it — I found your ${platform} profile. Want to add any other platform links (LeetCode, LinkedIn, etc.), or should I proceed with this?`,
  multiple: (platforms: string[]) =>
    `Nice — I picked up ${platforms.join(', ')}. Want to add more links, or are these good to go?`,
  additional: (platform: string, total: number) =>
    `Added your ${platform} profile — that's ${total} platform${total > 1 ? 's' : ''} total. Any more, or shall I proceed?`,
} as const

const CONFIRM_MESSAGES = {
  prompt: (platforms: string[]) =>
    `Here's what I have:\n\n${platforms.map((p) => `• ${p}`).join('\n')}\n\nLook good? Say "yes" to continue or add more links.`,
} as const

const RESUME_MESSAGES = {
  prompt:
    "Before I start the analysis — would you like to upload your resume (PDF)? It helps me give a more complete picture, but it's totally optional.",
  uploaded: "Resume received! I'll include it in the analysis. Starting extraction now...",
  skipped: "No worries — I'll work with the profile links. Starting extraction now...",
} as const

const EXTRACTION_MESSAGES = {
  starting: "Extracting data from your profiles. This usually takes 30–60 seconds...",
} as const

/* ------------------------------------------------------------------ */
/*  Intent Detection                                                   */
/* ------------------------------------------------------------------ */

/** Check if user message is an affirmative response. */
function isAffirmative(text: string): boolean {
  const normalized = text.toLowerCase().trim()
  const affirmatives = [
    'yes', 'yeah', 'yep', 'yup', 'sure', 'ok', 'okay', 'go', 'go ahead',
    'proceed', 'continue', 'do it', 'let\'s go', 'looks good', 'lgtm',
    'correct', 'confirmed', 'confirm', 'that\'s it', 'thats it',
    'good to go', 'start', 'run it', 'analyze', 'begin',
  ]
  return affirmatives.some((a) => normalized === a || normalized.startsWith(`${a} `) || normalized.startsWith(`${a},`))
}

/** Check if user message is a negative/decline response. */
function isNegative(text: string): boolean {
  const normalized = text.toLowerCase().trim()
  const negatives = [
    'no', 'nah', 'nope', 'skip', 'no thanks', 'no thank you',
    'pass', 'don\'t', 'dont', 'not now', 'later', 'without',
    'no resume', 'skip resume', 'without resume',
  ]
  return negatives.some((n) => normalized === n || normalized.startsWith(`${n} `) || normalized.startsWith(`${n},`))
}

/** Check if user wants to add more links. */
function wantsMore(text: string): boolean {
  const normalized = text.toLowerCase().trim()
  const more = [
    'add more', 'more links', 'wait', 'hold on', 'one more',
    'also', 'and', 'change', 'edit', 'modify', 'replace',
    'not yet', 'let me add',
  ]
  return more.some((m) => normalized.includes(m))
}

/* ------------------------------------------------------------------ */
/*  State Machine — Transition Logic                                   */
/* ------------------------------------------------------------------ */

/** Track last redirect index to avoid consecutive repeats. */
let lastRedirectIndex = -1

function getRedirectMessage(): string {
  let index: number
  do {
    index = Math.floor(Math.random() * REDIRECTS.length)
  } while (index === lastRedirectIndex && REDIRECTS.length > 1)
  lastRedirectIndex = index
  return REDIRECTS[index]
}

function agentMessage(content: string, type: 'text' | 'action' | 'system' = 'text', metadata?: Record<string, unknown>): Omit<Message, 'id' | 'timestamp'> {
  return { role: 'agent', type, content, metadata }
}

/**
 * Process user input and produce the agent's response + next state.
 *
 * This is a pure function (aside from the redirect index tracker).
 * The ChatInterface calls this on every user message and applies the returned state changes.
 */
export function processUserMessage(
  currentState: AgentState,
  userText: string,
  collectedData: CollectedData,
  isAuthenticated: boolean,
  userName?: string,
): AgentResponse {
  const detectedUrls = detectPlatformUrls(userText)
  const hasUrls = Object.keys(detectedUrls).length > 0

  switch (currentState) {
    /* -------------------------------------------------------------- */
    /*  GREETING → collecting_links on any user message                */
    /* -------------------------------------------------------------- */
    case 'greeting': {
      if (hasUrls) {
        const merged = { ...collectedData.platformUrls, ...detectedUrls }
        const platformNames = Object.keys(merged).map(getPlatformName)

        const content = platformNames.length === 1
          ? LINK_ACKNOWLEDGMENTS.single(platformNames[0])
          : LINK_ACKNOWLEDGMENTS.multiple(platformNames)

        return {
          messages: [agentMessage(content)],
          nextState: 'collecting_links',
          updatedData: { platformUrls: merged },
        }
      }

      // No URLs — treat as off-topic, move to collecting_links anyway
      return {
        messages: [agentMessage(getRedirectMessage())],
        nextState: 'collecting_links',
      }
    }

    /* -------------------------------------------------------------- */
    /*  COLLECTING_LINKS — accumulate URLs or transition to confirm     */
    /* -------------------------------------------------------------- */
    case 'collecting_links': {
      if (hasUrls) {
        const merged = { ...collectedData.platformUrls, ...detectedUrls }
        const newPlatformNames = Object.keys(detectedUrls).map(getPlatformName)
        const totalCount = Object.keys(merged).length

        const content = newPlatformNames.length === 1
          ? LINK_ACKNOWLEDGMENTS.additional(newPlatformNames[0], totalCount)
          : LINK_ACKNOWLEDGMENTS.multiple(Object.keys(merged).map(getPlatformName))

        return {
          messages: [agentMessage(content)],
          nextState: 'collecting_links',
          updatedData: { platformUrls: merged },
        }
      }

      // No URLs in this message
      const collectedPlatforms = Object.keys(collectedData.platformUrls)

      // User signals done (affirmative) and has at least one link → confirm
      if (collectedPlatforms.length > 0 && isAffirmative(userText)) {
        const platformNames = collectedPlatforms.map(getPlatformName)
        return {
          messages: [agentMessage(CONFIRM_MESSAGES.prompt(platformNames))],
          nextState: 'confirming_links',
        }
      }

      // No links collected yet, or user sent a non-URL non-affirmative message — redirect
      return {
        messages: [agentMessage(getRedirectMessage())],
        nextState: 'collecting_links',
      }
    }

    /* -------------------------------------------------------------- */
    /*  CONFIRMING_LINKS — user confirms or wants to change             */
    /* -------------------------------------------------------------- */
    case 'confirming_links': {
      if (hasUrls) {
        // User is adding more links even during confirmation
        const merged = { ...collectedData.platformUrls, ...detectedUrls }
        const platformNames = Object.keys(merged).map(getPlatformName)
        return {
          messages: [agentMessage(CONFIRM_MESSAGES.prompt(platformNames))],
          nextState: 'confirming_links',
          updatedData: { platformUrls: merged },
        }
      }

      if (isAffirmative(userText)) {
        return {
          messages: [agentMessage(RESUME_MESSAGES.prompt)],
          nextState: 'resume_prompt',
          showFileUpload: true,
        }
      }

      if (wantsMore(userText) || isNegative(userText)) {
        return {
          messages: [agentMessage("No problem — share any additional links, or tell me which ones to change.")],
          nextState: 'collecting_links',
        }
      }

      // Ambiguous — re-prompt
      const platformNames = Object.keys(collectedData.platformUrls).map(getPlatformName)
      return {
        messages: [agentMessage(CONFIRM_MESSAGES.prompt(platformNames))],
        nextState: 'confirming_links',
      }
    }

    /* -------------------------------------------------------------- */
    /*  RESUME_PROMPT — user decides whether to upload                  */
    /* -------------------------------------------------------------- */
    case 'resume_prompt': {
      if (isNegative(userText)) {
        return {
          messages: [agentMessage(RESUME_MESSAGES.skipped), agentMessage(EXTRACTION_MESSAGES.starting)],
          nextState: 'extracting',
          showFileUpload: false,
        }
      }

      if (isAffirmative(userText)) {
        return {
          messages: [agentMessage("Go ahead and upload your resume using the paperclip icon below.")],
          nextState: 'awaiting_resume',
          showFileUpload: true,
        }
      }

      // Ambiguous — re-ask
      return {
        messages: [agentMessage("Would you like to upload a resume PDF? Just say \"yes\" to upload or \"no\" to skip.")],
        nextState: 'resume_prompt',
        showFileUpload: true,
      }
    }

    /* -------------------------------------------------------------- */
    /*  AWAITING_RESUME — waiting for file upload                       */
    /* -------------------------------------------------------------- */
    case 'awaiting_resume': {
      // User can skip the resume upload with a text command
      if (isNegative(userText)) {
        return {
          messages: [agentMessage(RESUME_MESSAGES.skipped), agentMessage(EXTRACTION_MESSAGES.starting)],
          nextState: 'extracting',
          showFileUpload: false,
        }
      }

      // Any other text message — remind them about the upload
      return {
        messages: [agentMessage("I'm waiting for your resume upload. Use the paperclip icon to attach a PDF, or say \"skip\" to continue without it.")],
        nextState: 'awaiting_resume',
        showFileUpload: true,
      }
    }

    /* -------------------------------------------------------------- */
    /*  EXTRACTING — agent is working, no user action expected          */
    /* -------------------------------------------------------------- */
    case 'extracting': {
      return {
        messages: [agentMessage("I'm still analyzing your profiles — hang tight! This usually takes about 30–60 seconds.")],
        nextState: 'extracting',
      }
    }

    /* -------------------------------------------------------------- */
    /*  AUTH_GATE — waiting for authentication                          */
    /* -------------------------------------------------------------- */
    case 'auth_gate': {
      return {
        messages: [agentMessage("Please sign in to generate your credibility reports. Your data is ready — it'll just take a moment.")],
        nextState: 'auth_gate',
      }
    }

    /* -------------------------------------------------------------- */
    /*  CHECKING_HISTORY — checking for existing reports                */
    /* -------------------------------------------------------------- */
    case 'checking_history': {
      return {
        messages: [agentMessage("Checking if you have existing reports... One moment.")],
        nextState: 'checking_history',
      }
    }

    /* -------------------------------------------------------------- */
    /*  GENERATING — report generation in progress                     */
    /* -------------------------------------------------------------- */
    case 'generating': {
      return {
        messages: [agentMessage("Your reports are being generated — almost there! This takes about a minute.")],
        nextState: 'generating',
      }
    }

    /* -------------------------------------------------------------- */
    /*  DELIVERING_REPORT — reports just delivered                      */
    /* -------------------------------------------------------------- */
    case 'delivering_report': {
      return {
        messages: [agentMessage("Your reports are ready above! You can download each one as a PDF.")],
        nextState: 'idle',
      }
    }

    /* -------------------------------------------------------------- */
    /*  IDLE — reports delivered, user can start new or view history    */
    /* -------------------------------------------------------------- */
    case 'idle': {
      const normalized = userText.toLowerCase()
      const historyKeywords = ['history', 'old reports', 'past reports', 'previous', 'my reports', 'show reports']
      const newReportKeywords = ['new report', 'new analysis', 'another', 'again', 'fresh', 'start over', 'analyze']

      if (historyKeywords.some((k) => normalized.includes(k))) {
        return {
          messages: [agentMessage("Let me pull up your report history...")],
          nextState: 'viewing_history',
        }
      }

      if (newReportKeywords.some((k) => normalized.includes(k)) || hasUrls) {
        const merged = hasUrls ? { ...detectedUrls } : {}
        const msg = hasUrls
          ? `Starting fresh! I found ${Object.keys(merged).map(getPlatformName).join(', ')}. Want to add more links, or proceed?`
          : "Let's start a new analysis! Share your profile links and I'll get going."

        return {
          messages: [agentMessage(msg)],
          nextState: 'collecting_links',
          updatedData: { platformUrls: merged, resumeFile: null, jobId: null },
        }
      }

      return {
        messages: [agentMessage("Your reports are ready above. Want to start a new analysis or view your report history?")],
        nextState: 'idle',
      }
    }

    /* -------------------------------------------------------------- */
    /*  VIEWING_HISTORY — history displayed, return to idle             */
    /* -------------------------------------------------------------- */
    case 'viewing_history': {
      return {
        messages: [agentMessage("Want to start a new analysis? Share your profile links to get going.")],
        nextState: 'idle',
      }
    }

    default: {
      // Exhaustiveness check
      const _exhaustive: never = currentState
      return _exhaustive
    }
  }
}

/**
 * Handle resume file upload separately from text messages.
 * Called by ChatInterface when a file is uploaded via the paperclip icon.
 */
export function processResumeUpload(
  currentState: AgentState,
  file: File,
): AgentResponse | null {
  if (currentState === 'awaiting_resume' || currentState === 'resume_prompt') {
    return {
      messages: [
        agentMessage(RESUME_MESSAGES.uploaded),
        agentMessage(EXTRACTION_MESSAGES.starting),
      ],
      nextState: 'extracting',
      updatedData: { resumeFile: file },
      showFileUpload: false,
    }
  }

  // File upload in an unexpected state — ignore
  return null
}

/**
 * Get the initial greeting message based on auth state.
 */
export function getGreeting(isAuthenticated: boolean, userName?: string): string {
  if (isAuthenticated && userName) {
    return GREETINGS.authenticated(userName)
  }
  return GREETINGS.anonymous
}

/**
 * Create initial collected data with empty values.
 */
export function createInitialData(): CollectedData {
  return {
    platformUrls: {},
    resumeFile: null,
    jobId: null,
  }
}
