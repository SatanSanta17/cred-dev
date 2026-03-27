/**
 * Chat Agent Message Templates
 *
 * All predefined agent messages used by the state machine.
 * Separated from logic so templates can be updated independently.
 */

/* ------------------------------------------------------------------ */
/*  Greeting Messages                                                  */
/* ------------------------------------------------------------------ */

export const GREETINGS = {
  anonymous:
    "Hey! I'm CredDev's analysis agent. I verify developer credibility by analyzing real data from GitHub, LeetCode, and other platforms.\n\nShare your profile links and I'll get started.",
  authenticated: (name: string) =>
    `Hey ${name}, welcome back! Share your profile links and I'll run a fresh credibility analysis for you.`,
} as const

/* ------------------------------------------------------------------ */
/*  Off-Topic Redirects (minimum 3 variations, no consecutive repeats) */
/* ------------------------------------------------------------------ */

export const REDIRECTS = [
  "Interesting! I'm built for developer credibility analysis though. Share a profile link and I'll show you what I can do.",
  "Good question! My specialty is analyzing developer profiles. Drop your GitHub or LeetCode URL and let's get started.",
  "I appreciate the chat! I'm most useful when analyzing developer profiles though. Got any links to share?",
  "That's a bit outside my lane — I focus on verifying developer credibility. Paste a profile URL and I'll take it from here.",
  "I'd love to help with that, but I'm really designed for one thing: developer profile analysis. Share a link and let's go!",
] as const

/* ------------------------------------------------------------------ */
/*  Link Acknowledgment Messages                                       */
/* ------------------------------------------------------------------ */

export const LINK_ACKNOWLEDGMENTS = {
  single: (platform: string) =>
    `Got it — I found your ${platform} profile. Want to add any other platform links (LeetCode, LinkedIn, etc.), or should I proceed with this?`,
  multiple: (platforms: string[]) =>
    `Nice — I picked up ${platforms.join(', ')}. Want to add more links, or are these good to go?`,
  additional: (platform: string, total: number) =>
    `Added your ${platform} profile — that's ${total} platform${total > 1 ? 's' : ''} total. Any more, or shall I proceed?`,
} as const

/* ------------------------------------------------------------------ */
/*  Confirmation Messages                                              */
/* ------------------------------------------------------------------ */

export const CONFIRM_MESSAGES = {
  prompt: (platforms: string[]) =>
    `Here's what I have:\n\n${platforms.map((p) => `• ${p}`).join('\n')}\n\nLook good? Say "yes" to continue or add more links.`,
} as const

/* ------------------------------------------------------------------ */
/*  Resume Messages                                                    */
/* ------------------------------------------------------------------ */

export const RESUME_MESSAGES = {
  prompt:
    "Before I start the analysis — would you like to upload your resume (PDF)? It helps me give a more complete picture, but it's totally optional.",
  uploaded: "Resume received! I'll include it in the analysis. Starting extraction now...",
  skipped: "No worries — I'll work with the profile links. Starting extraction now...",
} as const

/* ------------------------------------------------------------------ */
/*  Extraction Messages                                                */
/* ------------------------------------------------------------------ */

export const EXTRACTION_MESSAGES = {
  starting: "Extracting data from your profiles. This usually takes 30–60 seconds...",
} as const
