/**
 * Chat Agent Types
 *
 * Shared type definitions for the chat agent state machine.
 * Imported by chat-agent.ts, chat-interface.tsx, and other chat components.
 */

import type { Message } from './chat-message'

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
