/**
 * Chat Agent Intent Detection
 *
 * Pattern-matching utilities for classifying user messages.
 * Used by the state machine to determine which transition to take.
 */

/** Check if user message is an affirmative response. */
export function isAffirmative(text: string): boolean {
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
export function isNegative(text: string): boolean {
  const normalized = text.toLowerCase().trim()
  const negatives = [
    'no', 'nah', 'nope', 'skip', 'no thanks', 'no thank you',
    'pass', 'don\'t', 'dont', 'not now', 'later', 'without',
    'no resume', 'skip resume', 'without resume',
  ]
  return negatives.some((n) => normalized === n || normalized.startsWith(`${n} `) || normalized.startsWith(`${n},`))
}

/** Check if user wants to add more links. */
export function wantsMore(text: string): boolean {
  const normalized = text.toLowerCase().trim()
  const more = [
    'add more', 'more links', 'wait', 'hold on', 'one more',
    'also', 'and', 'change', 'edit', 'modify', 'replace',
    'not yet', 'let me add',
  ]
  return more.some((m) => normalized.includes(m))
}
