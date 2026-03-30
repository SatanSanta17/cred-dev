# PRD-010: Chat Interface + Progressive Authentication

**Status:** Draft
**Created:** 2026-03-23

---

## Emotion

CredDev claims to understand developers — but the first thing it shows them is a cold form. Fill these fields, click submit, wait. There's no conversation, no personality, no relationship. It feels like every SaaS tool from 2015.

Meanwhile, authentication doesn't exist. Anyone can generate reports anonymously. Reports can't be linked to users, returning users can't access their history, and there's no protection against abuse. The `user_id` column sits empty in every row.

This feature replaces the form with a conversational chat interface where the CredDev agent guides users through profile analysis — and weaves authentication into the flow naturally, at the moment of highest motivation, not as a gate at the front door.

---

## User Story

As a developer, I want to land on a chat interface where I can talk to the CredDev agent, share my profile links, and get my credibility report — without being forced to sign up before I've seen any value. When the agent has pulled my data and is ready to generate my report, I'm happy to authenticate because I already trust the product and want to save my results.

---

## Part 1: Auth Infrastructure + Chat UI Shell

### Requirements

**P1.R1 — Chat replaces the form.**
The existing form-based report generation flow is replaced entirely by a conversational chat interface. The chat is the only way to generate reports. The old form route is removed.

**P1.R2 — Chat interface feels native to CredDev.**
The chat fills the full viewport height. Agent messages appear left-aligned with the CredDev avatar. User messages appear right-aligned with accent styling. The dark theme, glass morphism, and purple accents match the rest of the platform. Mobile layout adjusts gracefully.

**P1.R3 — Messages have distinct types.**
The chat supports at minimum: text messages, loading/progress indicators, action messages (buttons, links, downloads), and system messages (auth prompts, status updates). Each type renders differently.

**P1.R4 — Smart auto-scroll.**
New messages scroll the chat to the bottom. If the user has scrolled up to read history, the chat does not force-scroll — it shows a "new message" indicator instead.

**P1.R5 — Input reflects agent state.**
The chat input is disabled with contextual placeholder text when the agent is processing (extracting, generating, waiting for auth). Users cannot send messages during these states.

**P1.R6 — Authentication uses GitHub and Google OAuth.**
Users can sign in via GitHub or Google. Authentication is handled by the configured auth provider — no custom password storage, no custom JWT generation. The auth session persists across page reloads.

**P1.R7 — Auth modal is an overlay, not a redirect.**
When authentication is required, a modal slides up over the chat interface with OAuth sign-in buttons. The user never leaves the chat page. After successful auth, the modal closes and the conversation continues from where it left off.

**P1.R8 — Auth context is globally available.**
Any component in the app can read the current auth state (user, isAuthenticated, isLoading) and trigger sign-in/sign-out actions. This is a cross-cutting concern, not scoped to a single page.

**P1.R9 — Backend validates auth tokens on protected endpoints.**
Protected API endpoints require a valid auth token in the request header. Invalid or expired tokens return 401. A single reusable dependency handles token validation across all protected routes.

**P1.R10 — Extraction is anonymous, generation requires auth.**
Users can submit profile links and run extraction without authenticating. Generation (the expensive LLM step) requires a valid auth session. This is the progressive auth boundary.

**P1.R11 — Authenticated users can sign out.**
An authenticated user can sign out from within the chat interface. Sign-out clears the local session, reverts the UI to the unauthenticated state (sign-in button visible), and does not disrupt the current conversation. The user can continue chatting anonymously or sign in again.

### Acceptance Criteria

- [ ] Chat interface loads at the designated route and fills the viewport
- [ ] Agent greeting message appears on load
- [ ] User can type and send messages; they appear instantly (optimistic rendering)
- [ ] Agent messages appear left-aligned with avatar; user messages right-aligned
- [ ] Message types (text, loading, action, system) render with distinct styling
- [ ] Auto-scroll works; scrolling up suppresses auto-scroll; "new message" indicator appears
- [ ] Input field disables with placeholder during agent processing states
- [ ] GitHub OAuth sign-in works end-to-end (redirects, callback, session stored)
- [ ] Google OAuth sign-in works end-to-end
- [ ] Auth modal appears as overlay on the chat, not a page redirect
- [ ] After auth, modal closes and conversation continues seamlessly
- [ ] Auth state persists across page reload (session cookie/token)
- [ ] Authenticated user can sign out from the chat header
- [ ] After sign-out, UI reverts to unauthenticated state (sign-in button visible) without losing conversation
- [ ] Backend returns 401 for unauthenticated requests to protected endpoints
- [ ] Extraction API works without auth token
- [ ] Generation API rejects requests without valid auth token
- [ ] Mobile layout is responsive and usable
- [ ] Old form route returns 404
- [ ] Landing page CTA links to the new chat route

---

## Part 2: Guided Chat Agent + Pipeline Integration

### Requirements

**P2.R1 — Agent guides the conversation through a state machine.**
The chat agent follows a deterministic flow: greet the user → collect profile links → ask if they want to add more → ask about resume upload → confirm readiness to generate → run extraction → prompt auth → run generation → deliver report. Each state has defined transitions and the agent never gets stuck in an undefined state. The agent never auto-generates — every generation is explicitly confirmed by the user.

**P2.R2 — URL detection is automatic.**
When a user message contains a URL, the agent detects the platform (GitHub, LeetCode, LinkedIn, Kaggle, etc.) and acknowledges it immediately. Multiple URLs in a single message are all detected.

**P2.R3 — Off-topic messages are redirected, not refused.**
If the user sends a message unrelated to profile analysis, the agent briefly acknowledges it and steers back to the core experience. Redirect messages vary — the same message is never repeated consecutively.

**P2.R4 — Extraction and generation progress is ephemeral.**
While extraction or generation is running, progress updates appear as a loading indicator in the chat (stage name, animation). These messages do not persist in chat history — they appear during the operation and fade away once it completes, replaced by a final summary message (e.g., "Extraction complete — pulled data from GitHub and LeetCode"). This keeps the conversation clean.

**P2.R5 — Auth gate appears at the right moment.**
After extraction succeeds and before generation begins, the agent explains why authentication is needed and triggers the auth modal. The framing is conversational, not transactional.

**P2.R6 — Resume upload is always offered before generation.**
Before triggering generation, the agent always asks the user if they want to upload their resume: *"Before I generate your report, would you like to upload your resume? It's recommended for best results."* The chat input area provides a file upload mechanism (PDF only, max 10MB). If the user declines, generation proceeds without it. If they upload, the resume is included in the extraction data.

**P2.R7 — Reports are delivered as downloadable PDF cards in chat.**
When all three reports are generated (Comprehensive, Developer, Recruiter), they appear in the chat as three distinct PDF cards — each with the report title, a brief description, and a download button. No email delivery option in this phase. The user downloads directly from the chat.

**P2.R8 — Authenticated users skip the auth gate.**
If the user is already authenticated when they reach the generation step, the auth modal is not shown. Generation starts immediately.

**P2.R9 — Returning authenticated users are greeted by name.**
When a user with an active session loads the chat, the agent greets them by name and acknowledges their history (e.g., "Your last report was on [date]").

**P2.R10 — Users can view previous reports through chat.**
An authenticated user can ask to see their previous reports. The agent fetches their report history and presents it with download/view options.

**P2.R11 — The `user_id` column is populated.**
Every report generated through the authenticated flow has the user's ID stored in the database. This links reports to accounts for history retrieval.

### Acceptance Criteria

- [ ] Agent correctly transitions through all states: greeting → collecting → confirming → resume prompt → extracting → auth gate → generating → delivering
- [ ] URLs in user messages are detected and the correct platform is identified
- [ ] Multiple URLs in one message are all detected
- [ ] Agent always asks "want to add more profiles?" before moving to generation
- [ ] Agent always asks about resume upload before generation, regardless of prior context
- [ ] Resume upload works via file picker in chat (PDF only, max 10MB)
- [ ] Off-topic messages get varied redirect responses (no consecutive repeats)
- [ ] Extraction progress appears as ephemeral loading indicator, fades after completion
- [ ] A persistent summary message replaces the ephemeral progress after extraction completes
- [ ] Auth modal triggers after extraction, before generation
- [ ] Auth modal does NOT trigger if user is already authenticated
- [ ] Generation progress appears as ephemeral loading indicator, fades after completion
- [ ] Three PDF report cards appear in chat after generation (Comprehensive, Developer, Recruiter)
- [ ] Each PDF card has title, description, and download button
- [ ] No email delivery option in this phase
- [ ] Authenticated returning user is greeted by name
- [ ] User can request and view previous reports
- [ ] `user_id` is populated in `analysis_jobs` for authenticated generations
- [ ] Full end-to-end flow works: share links → confirm → resume → extraction → auth → generation → PDF cards

---

## Complete User State Matrix

This matrix defines agent behavior for every combination of user state and intent. Implementation must cover all paths.

### State 1: User Doesn't Exist (No Account, Unauthenticated)

**1.a — Wants to generate a report:**
Agent greets → user shares links → agent asks "want to add more?" → agent asks about resume upload → user confirms readiness → extraction runs (anonymous) → auth modal (sign up) → generation runs → 3 PDF cards delivered in chat.

**1.b — Doesn't want to generate, just talks:**
Agent greets → user sends off-topic messages → agent redirects to core experience → no auth forced.

### State 2: User Exists but Unauthenticated (Session Expired / New Device)

**2.a — Has no report, doesn't try to generate, just talks:**
Same as 1.b. Agent doesn't know they have an account. If they trigger any auth-required action, modal appears → sign in → agent recognizes them.

**2.b — Has no report, wants to generate:**
Same as 1.a, but at auth gate they sign in (not sign up). Agent says "Welcome back!"

**2.c — Has a previous report, wants to generate a new one:**
Same as 2.b, but after auth the agent detects report history and acknowledges it before generating.

**2.d — Has a previous report, wants to VIEW it:**
User asks for their report → agent prompts auth → signs in → agent fetches and presents report history.

### State 3: User Exists and Is Authenticated (Active Session)

**3.a — Has no report, doesn't try to generate, just talks:**
Agent greets by name. Steers toward report generation. Phase 1: lightweight responses.

**3.b — Has no report, wants to generate:**
Agent greets by name. No auth modal needed. Extraction + generation run directly.

**3.c — Has a report, wants to generate another:**
Agent acknowledges report history. Full pipeline runs. New report linked to account.

**3.d — Has a report, just wants to talk/grow:**
Phase 1: Agent acknowledges intent, offers to generate an updated report. Phase 2+: full conversational career coaching.

### Edge Cases

**E1 — Mid-flow abandonment (unauthenticated):**
Orphaned extraction jobs (no user_id) are cleaned up after 24 hours. User starts fresh on return.

**E2 — OAuth identity conflict:**
Same email across providers auto-links to one account (default auth provider behavior).

**E3 — User submits someone else's profile:**
Phase 1: allowed. Phase 2+: optional ownership verification.

**E4 — Rate limiting (unauthenticated):**
Max 3 anonymous extractions per IP per hour. On limit, agent prompts auth to continue.

**E5 — Session expiry mid-conversation:**
401 from any API call triggers re-auth modal. Conversation state is preserved across re-authentication.

**E6 — Returning authenticated user:**
Auth state checked on page load. Valid session → agent greets by name immediately.

---

## Future Phases (Out of Scope — Backlog)

- **Phase 2:** LLM-powered chat agent replacing the guided state machine. Real conversational AI with context awareness.
- **Phase 3:** Sandbox — tech discussions where the agent assesses developer knowledge depth. Insights feed into the credibility profile.
- **Phase 4:** Profile ownership verification — match OAuth identity with submitted profile URLs.
- **Phase 5:** Additional auth methods — magic email links, phone OTP.
- **Phase 6:** Conversation persistence — save and resume chat history across sessions.
