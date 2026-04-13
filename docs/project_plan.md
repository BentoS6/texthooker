# texthooker v0.1 — Project Plan

## Product Summary

A local-first web app for Japanese immersion learners. It receives text from external tools (via clipboard polling) and displays it in a clean reading view. The core v0.1 feature is **word highlighting**: select any word or phrase, mark it as highlighted, and browse your highlights later with date filtering and a heatmap visualization. No accounts, no server — everything stays in the browser.

**Decision:** Building from scratch (not forking ttu-reader). Keeps things simple, avoids inheriting unwanted complexity.

## User Stories

1. **As a learner**, I want to paste or stream text into the app so I can read Japanese content in a clean interface.
2. **As a learner**, I want to select a word/phrase and explicitly mark it as a highlight so I can track vocabulary I encounter while reading.
3. **As a learner**, I want my highlights to persist across browser reloads so I don't lose my data.
4. **As a learner**, I want to browse all my highlights on a separate page, filtered by day/week/month, so I can review what I've encountered.
5. **As a learner**, I want to see a heatmap of highlights-per-day and click a day to filter, so I can visualize my immersion habit.

## Tech Stack

| Choice | Justification |
|--------|--------------|
| **TypeScript** | Type safety, you asked for it |
| **React** (Vite) | Fast dev loop, huge ecosystem, simple SPA routing |
| **IndexedDB** (via Dexie.js) | Structured local storage with indexing — localStorage too limited for querying by date/filtering |
| **React Router** | Two routes (`/read`, `/highlights`), lightweight |
| **Tailwind CSS** | Rapid styling without CSS file sprawl |
| **Vitest** | Same Vite pipeline, zero extra config |

**Non-obvious call-outs:**
- **Dexie.js over raw IndexedDB** — IndexedDB API is painful. Dexie wraps it with a promise-based API and compound indexes, ~15KB gzipped. Worth it.
- **No backend** — Clipboard API runs in-browser. No server, no WebSocket. Deploy as static files anywhere (GitHub Pages, Vercel, local `file://`).
- **No state management library** — React context + hooks sufficient for v0.1 scope. Add Zustand only if pain appears.

## Data Model

```typescript
interface Highlight {
  id: string;           // crypto.randomUUID()
  text: string;         // highlighted word/phrase
  sentence: string;     // surrounding sentence for context
  createdAt: number;    // Unix timestamp (ms)
  // source/session field deferred — see Open Questions
}
```

**Storage:** Single Dexie table `highlights` with indexes on:
- `id` (primary key)
- `createdAt` (for date range queries and heatmap aggregation)

**Heatmap aggregation:** Query highlights in date range, group by day in JS. No pre-computed counters — v0.1 dataset will be small enough.

## Milestones

### M1: Hello World App Deployed
- Vite + React + TypeScript + Tailwind scaffolded
- Two routes: `/read` (empty) and `/highlights` (empty)
- Deployed to GitHub Pages (or similar static host)
- **Demo:** App loads, routes work, looks intentional

### M2: Reading View with Clipboard Polling
- Reading view displays text
- Clipboard polling: app watches clipboard, appends new text as it arrives
- Manual paste fallback (textarea or paste event)
- Text displayed in readable Japanese typography (vertical optional, horizontal default)
- **Demo:** Open VN with textractor → text appears in app

### M3: Highlight Creation
- Select text in reading view → "Highlight" button/tooltip appears
- Clicking it saves a `Highlight` record to IndexedDB via Dexie
- Highlighted words visually marked in the text (background color)
- Highlights persist across reload — re-rendered on existing text
- **Demo:** Read text, highlight words, reload, highlights still visible

### M4: Highlight Browser + Heatmap
- `/highlights` route shows all highlights in reverse chronological order
- Each entry shows: text, sentence context, date
- Date filter controls: day, week, month
- Heatmap component (GitHub contribution graph style) showing highlights-per-day
- Click a day on heatmap → filters list to that day
- **Demo:** Full v0.1 flow — read, highlight, browse, filter

## Open Questions & Risks

| # | Question/Risk |
|---|--------------|
| 1 | ~~**Fork ttu-reader vs. build from scratch?**~~ **Resolved:** Building from scratch. |
| 2 | **Source/session field** — What does "source" mean? Game title? Window name? Manual label? Deferred from v0.1 data model but we may want to add it before M4 if the shape becomes clear. Schema migration is cheap with Dexie. |
| 3 | **Clipboard API permissions** — `navigator.clipboard.readText()` requires focus + permission grant + secure context (HTTPS/localhost). May need user to click "start polling" button. Test early in M2. |
| 4 | **Sentence boundary detection** — How to extract "surrounding sentence" from streamed text? Japanese sentence boundaries (。, ！, ？) are simpler than English but edge cases exist. Good-enough heuristic in M3, refine later. |
| 5 | **Highlight matching on re-render** — If same text appears multiple times, how to anchor highlights to the right occurrence? Position-based? Offset from start of session? Needs design in M3. |
| 6 | ~~**Heatmap library**~~ **Resolved:** Using `react-activity-calendar`. |

## Explicitly Deferred

- **User accounts / cloud sync** — Local-only for v0.1
- **Source/session tagging** — Data model ready for it, UI not built
- **Export (Anki, CSV)** — Natural next feature, not v0.1
- **Dictionary lookup / popup** — Integration with Yomitan or similar
- **Vertical text layout** — Nice to have, horizontal first
- **WebSocket text streaming** — Clipboard polling sufficient for v0.1
- **Highlight categories/colors** — Single highlight type for now
- **Search within highlights** — Filter by date only for v0.1
- **Mobile support** — Desktop-first, responsive later
- **i18n** — UI in English only
