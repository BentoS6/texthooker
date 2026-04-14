# JLPT Auto-Highlight

Automatically underlines words matching a selected JLPT level in the reading view.

## How it works

1. Select JLPT level (N5–N1) from dropdown in nav bar
2. All words at that level **and below** get dotted underlines in the reading view
3. Selecting N4 → underlines N5 + N4 words (cumulative, since you know lower levels)
4. Set to "JLPT" (blank) to disable

## BaseForm matching (token-aware)

When tokens are available (after lindera tokenization), JLPT matching uses `token.baseForm` — the dictionary form. This means conjugated verbs/adjectives get underlined:

| Surface text | baseForm | JLPT match |
|---|---|---|
| 食べた | 食べる | Yes |
| 走って | 走る | Yes |
| 面白かった | 面白い | Yes |

Without tokens (pre-tokenization), falls back to surface text regex matching (only exact dictionary form matches).

## Underline colors by level

| Level | Color | Hex |
|-------|-------|-----|
| N5 | Blue | `#60a5fa` |
| N4 | Green | `#34d399` |
| N3 | Yellow | `#facc15` |
| N2 | Orange | `#fb923c` |
| N1 | Purple | `#c084fc` |

## Interaction with manual highlights

- JLPT underline and manual highlight background **coexist** on the same word
- Manual highlight = colored background, JLPT = dotted underline underneath
- No conflict between the two systems

## Data source

- 8,138 unique words from [Bluskyo/JLPT_Vocabulary](https://github.com/Bluskyo/JLPT_Vocabulary)
- Bundled as static JSON (`src/data/jlpt/words.json`), no network calls
- Format: `{ "word": [{ "reading": "...", "level": 1-5 }] }`
- Words appearing at multiple levels use the highest difficulty (lowest number)

## Persistence

Level selection stored in `localStorage` under key `jlpt-level`. Survives page reloads.

## Files

| File | Purpose |
|------|---------|
| `src/data/jlpt/words.json` | Raw JLPT vocabulary (N1–N5) |
| `src/data/jlpt/index.ts` | Loader, builds word→level Map, exports `getWordsForLevel()` and level colors |
| `src/hooks/useJlptLevel.ts` | Hook for level selection + cumulative word Set |
| `src/components/HighlightedLine.tsx` | Renders dotted underlines for JLPT matches (baseForm-aware when tokens provided) |
| `src/components/FuriganaLine.tsx` | Renders JLPT underlines in furigana mode via token baseForm |
| `src/pages/ReadView.tsx` | Wires JLPT dropdown + passes data to HighlightedLine |
