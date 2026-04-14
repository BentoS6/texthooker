# Development Log

## M2 — Clipboard Polling + Reading View

### `src/hooks/useClipboardPoller.ts` (new)
- Created `useClipboardInserter` hook using MutationObserver
- Watches `document.body` for DOM nodes injected by Clipboard Inserter browser extension
- Captures text content, removes raw DOM node, appends to React state
- Exposes `{ lines, clear }`
- State lifted to App level via React Context (`ClipboardContext`) so lines persist across route changes

### `src/pages/ReadView.tsx` (modified)
- Replaced placeholder with real reading view
- Consumes `useClipboardInserter()` from context
- Lines render as `<p>` elements, `text-xl leading-normal`, color `#c8c8c8`
- Auto-scroll to bottom on new lines (instant, not smooth)
- Smart scroll: tracks if user is near bottom; if user scrolls up, autoscroll pauses until they return to bottom
- Stats (chars/lines) and Clear button portaled into nav bar via `createPortal` to `#nav-right`
- No manual paste handler — relies entirely on Clipboard Inserter extension

### `src/App.tsx` (modified)
- Clipboard state provider wraps entire app (`ClipboardContext.Provider`)
- Nav bar made sticky with `bg-[#1e1e1e]` background
- Nav links: `text-sm font-mono text-[#c8c8c8]`
- Border color: `#333`
- Added `#nav-right` slot in nav for ReadView to portal stats/clear into
- Added gear icon (bottom-right, fixed) for future settings page — currently non-functional
- Gear icon color matches Clear button (`zinc-400`)

### `src/index.css` (modified)
- Set `html, body, #root` background to `#1e1e1e`
- Ensures no white background bleed on scroll overflow

### Design decisions
- No start/stop polling button — clipboard monitoring is automatic
- Removed manual paste handling — Clipboard Inserter extension handles all input
- MutationObserver approach chosen over `navigator.clipboard.readText()` polling because the extension injects DOM nodes directly, and Clipboard API requires tab focus
- Context used over local state to preserve lines when navigating between Read and Highlights pages
