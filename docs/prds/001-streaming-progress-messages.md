# PRD-001: Streaming Progress Messages

**Status:** Implemented
**Created:** 2026-03-04
**Author:** Burhanuddin

---

## 1. The Emotion

The user submits their profile and waits ~4 minutes for report generation. Right now the progress bar jumps from 15% → 50% → 80% with static messages that sit unchanged for 40+ seconds at a time. It feels broken — like nothing is happening. The natural reaction is "did it crash?" and some users will close the tab.

What we want them to feel: **"This thing is actually working hard for me right now."** They should see the system actively analyzing repos, searching the web, cross-referencing data. Not the report content — just the activity. Like watching a chef through a kitchen window — you see the effort, not the recipe.

---

## 2. Mental Model (User Experience)

After the user submits and extraction completes, generation begins. Instead of a frozen progress bar, they see:

```
"Loading your GitHub and LeetCode data..."           ← stage message
"Analyzing 42 public repositories..."                ← context-aware
"Searching the web for company background..."         ← real LLM web_search event
"Evaluating code quality across contributions..."     ← section-aware message
"Searching the web for additional verification..."    ← real LLM web_search event
"Cross-referencing resume claims with platform data..."
"Building developer growth insights..."               ← report 2 starts
"Preparing recruiter hiring signal..."                 ← report 3 starts
```

Messages update every few seconds. Some are real events from the LLM (web searches). Others are derived from which report section the LLM is currently generating. The progress bar moves more smoothly — gradual increments during each LLM call instead of big jumps.

**What we do NOT show:** The actual text being written in the report. That's for the final deliverable only.

---

## 3. Requirements

### Must Have
- Stream LLM responses using `stream=True` on `responses.create()`
- Capture `response.web_search_call.searching` events and surface them as real-time messages (e.g., "Searching the web for verification...")
- Update progress messages every 3-6 seconds during text generation (not every token)
- Smooth percentage increments within each report stage (not just stage-level jumps)
- No report content exposed in progress messages
- No frontend changes needed — ProgressManager already feeds messages through SSE to GenerationLoader

### Should Have
- Section-aware messages: map rough token progress to known report sections (e.g., "Analyzing engineering depth..." when the LLM is in section 2 of the extensive report)

### Won't Do (this PRD)
- Show live report text / streaming output to the user
- Change the GenerationLoader UI component (current animation + message display is fine)
- Change the SSE endpoint or frontend SSE hook (they already work)

---

## 4. Architecture & Changes Required

### Files Modified

| File | Change |
|------|--------|
| `services/report_generator.py` | New `_call_llm_streaming()` method — wraps `responses.create(stream=True)`, iterates events, calls a progress callback on web_search and periodic text intervals |
| `app/routes/generate.py` | Pass a progress callback to `_call_llm_streaming()` that calls `progress_manager.update()` with live messages |
| `services/progress_manager.py` | Add a `update_message()` method — updates only the message field without changing stage/percentage. Add `increment_percentage()` — nudges percentage up by a small amount within the current stage's range |

### No Changes Needed

| File | Why |
|------|-----|
| `app/routes/stream.py` | Already reads from ProgressManager every 1s and pushes to SSE |
| `lib/use-generation-progress.ts` | Already receives and renders progress.message |
| `components/sections/generation-loader.tsx` | Already displays progress.message with animation |
| `lib/api.ts` | No new endpoints |

### Data Flow (New)

```
_call_llm_streaming() iterates OpenAI stream events
       │
       ├── web_search_call.searching → callback("Searching the web for...")
       │                                    │
       ├── output_text.delta (every ~5s) → callback("Analyzing engineering depth...")
       │                                    │
       └── response.completed → return full text
                                            │
                                            ▼
                               progress_manager.update_message(job_id, msg)
                               progress_manager.increment_percentage(job_id, delta)
                                            │
                                            ▼
                               SSE endpoint reads ProgressManager every 1s
                                            │
                                            ▼
                               Frontend GenerationLoader displays message
```

### Percentage Strategy

Instead of hard jumps (15% → 50% → 80%), each report stage owns a percentage range:

| Stage | Range | What generates increments |
|-------|-------|--------------------------|
| `loading_data` | 0% → 5% | Single jump (fast, ~1 second) |
| `generating_extensive` (initial) | 5% → 10% | Single jump when LLM call starts |
| `generating_extensive` (streaming) | 10% → 48% | Gradual during streaming (~1% every 3-6s) |
| `generating_developer` | 50% → 78% | Gradual during streaming |
| `generating_recruiter` | 80% → 93% | Gradual during streaming |
| `storing` | 95% | Single jump |
| `sending_email` | 98% | Single jump |
| `completed` | 100% | Single jump |

### Message Strategy

Two types of messages:

1. **Real events** (from LLM stream) — highest priority, shown immediately:
   - `web_search_call.searching` → "Searching the web for verification..."
   - `web_search_call.completed` → resume previous section message

2. **Section-aware messages** (derived from token progress) — shown every 3-6 seconds:
   - We define a mapping of approximate token thresholds to section names per report type
   - As tokens accumulate, messages rotate through section-relevant descriptions
   - Example for extensive report: "Evaluating capability identity..." → "Analyzing engineering depth..." → "Assessing problem solving patterns..." → etc.

### Edge Cases

- **Stream fails mid-generation:** `_call_llm_streaming()` catches the error and falls back to `_call_llm()` (the current non-streaming method). The user gets their report either way — they just lose live messages and get the old static progress. The existing fallback message system in `use-generation-progress.ts` also handles SSE disconnects on the frontend side.
- **Web search takes very long:** Keep showing "Searching the web..." until `web_search_call.completed` arrives. No timeout on individual events.
- **Token count mapping is approximate:** Section messages don't need to be perfectly aligned with actual report sections. They just need to feel alive and relevant. Being off by a section is fine.

---

## 5. Implementation Plan (Small Increments)

### Increment 1: Streaming LLM call
- Add `_call_llm_streaming()` to `report_generator.py`
- Accept a `progress_callback` parameter
- Iterate stream events, accumulate text, fire callback on web_search events
- Return full text at the end (same interface as `_call_llm()`)

### Increment 2: ProgressManager enhancements
- Add `update_message(job_id, message)` — updates message without changing stage
- Add `increment_percentage(job_id, delta, max_pct)` — nudges percentage, capped at max

### Increment 3: Wire pipeline to streaming
- Update `_run_generation_pipeline()` in `generate.py` to use `_call_llm_streaming()` instead of `_call_llm()`
- Define progress callbacks per report type with section-aware messages and percentage ranges

### Increment 4: Cleanup dead code
- Remove `ReportGenerator.generate_reports()` — the pipeline calls individual LLM methods directly with streaming callbacks, this method is no longer used by anyone

### Increment 5: Verify and document
- Test full flow: submit → extract → generate with streaming → success
- Verify no regressions on email resend, error handling, fallback messages
- Update ARCHITECTURE.md and CHANGELOG.md

---

## 6. Success Criteria

- During the ~4 minute generation, the user sees a new message every 3-6 seconds (not 40+ seconds)
- Web search events appear as real-time "Searching the web..." messages
- Progress bar moves smoothly within each stage range instead of jumping
- No report content is leaked in progress messages
- Existing happy path (extraction → generation → email → success) works unchanged
- Email failure + resend still works
- SSE disconnect fallback still works

---

## 7. Risks

- **OpenAI streaming API changes:** We're using `responses.create(stream=True)` which is the current API. If OpenAI changes event types, the callback mapping breaks. **Handled:** `_call_llm_streaming()` wraps stream iteration in try/except — on any failure it falls back to `_call_llm()` (non-streaming). Reports still generate, user just gets static progress messages instead of live ones.
- **Token-to-section mapping is imprecise:** Reports vary in length. The section messages might not match perfectly. This is acceptable — the goal is engagement, not accuracy.
- **Increased ProgressManager writes:** Currently ~7 updates per job. With streaming, it could be 30-50. This is fine for an in-memory dict on a single Render instance.
