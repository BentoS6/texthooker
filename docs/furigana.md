# Furigana Rendering

Displays hiragana readings above kanji using HTML `<ruby>` elements. Toggle on/off via the Furigana button in the nav bar.

## How it works

1. Each `CapturedLine` already has `tokens: Token[]` from lindera tokenization
2. `toFuriganaSegments()` converts tokens into render segments: kanji tokens get a hiragana reading, kana-only tokens get `null`
3. `FuriganaLine` renders each segment as `<ruby>` (kanji) or plain `<span>` (kana/punctuation)
4. When furigana is off, the existing `HighlightedLine` renders instead (highlights + JLPT underlines)

## Highlights and JLPT in furigana mode

`FuriganaLine` renders highlight backgrounds and JLPT underlines on each segment:
- **Manual highlights**: matched by surface text position against `highlightMap`
- **JLPT underlines**: matched by `token.baseForm` (dictionary form) against `jlptWords` — so conjugated forms like 食べた get underlined when 食べる is in JLPT list

## Katakana-to-hiragana conversion

Lindera returns readings in katakana (e.g. "タベ"). `katakanaToHiragana()` shifts codepoints to hiragana range for display (e.g. "たべ").

## Files

| File | Purpose |
|------|---------|
| `src/lib/furigana.ts` | `hasKanji()`, `katakanaToHiragana()`, `toFuriganaSegments()` |
| `src/components/FuriganaLine.tsx` | Renders `<ruby>` elements per token with highlight/JLPT styling |
| `src/pages/ReadView.tsx` | Toggle state + button, swaps between FuriganaLine and HighlightedLine |
| `src/index.css` | `rt` styling (0.5em, muted gray) |
