# texthooker

Local-first web app for Japanese immersion learners. Receives text via clipboard polling, displays in clean reading view, supports word highlighting with browse/filter/heatmap.

## Stack

- TypeScript, React (Vite), Tailwind CSS
- IndexedDB via Dexie.js for persistence
- React Router (two routes: `/read`, `/highlights`)
- Vitest for testing

## Architecture

- No backend — static SPA, deployable anywhere
- No state management library — React context + hooks
- Clipboard polling for text input (not WebSocket)
- Highlight UX: select text, confirm with button/key (explicit action)

## Conventions

- Source/session tagging deferred for v0.1
- Horizontal text layout default (vertical deferred)
- UI in English only
