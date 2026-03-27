/**
 * Chat Agent State Machine
 *
 * Client-side deterministic state machine that drives the conversational flow.
 * No LLM needed — all transitions are based on user input patterns (URLs, keywords, file uploads).
 *
 * State machine design mirrors TRD-010 Part 2.
 */

import type { Message } from './chat-message'
import type { AgentState, CollectedData, AgentResponse } from './chat-agent-types'
import { detectPlatformUrls, getPlatformName } from '@/lib/platform-utils'
import { isAffirmative, isNegative, wantsMore } from './chat-agent-intents'
import {
  GREETINGS,
  REDIRECTS,
  LINK_ACKNOWLEDGMENTS,
  CONFIRM_MESSAGES,
  RESUME_MESSAGES,
  EXTRACTION_MESSAGES,
} from './chat-agent-messages'

/* Re-export types so consumers can import from a single module */
export type { AgentState, CollectedData, AgentResponse } from './chat-agent-types'
export { getPlatformName } from '@/lib/platform-utils'

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
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

function agentMessage(
  content: string,
  type: 'text' | 'action' | 'system' = 'text',
  metadata?: Record<string, unknown>,
): Omit<Message, 'id' | 'timestamp'> {
  return { role: 'agent', type, content, metadata }
}

/* ------------------------------------------------------------------ */
/*  State Machine — Transition Logic                                   */
/* ------------------------------------------------------------------ */

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

      const collectedPlatforms = Object.keys(collectedData.platformUrls)

      if (collectedPlatforms.length > 0 && isAffirmative(userText)) {
        const platformNames = collectedPlatforms.map(getPlatformName)
        return {
          messages: [agentMessage(CONFIRM_MESSAGES.prompt(platformNames))],
          nextState: 'confirming_links',
        }
      }

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
      if (isNegative(userText)) {
        return {
          messages: [agentMessage(RESUME_MESSAGES.skipped), agentMessage(EXTRACTION_MESSAGES.starting)],
          nextState: 'extracting',
          showFileUpload: false,
        }
      }

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
