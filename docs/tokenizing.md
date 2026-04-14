# Tokenization Pipeline

## Overview

Each `CapturedLine` is morphologically tokenized using [lindera-wasm](https://github.com/lindera/lindera-wasm) with the IPADIC dictionary. Tokenization runs async on line arrival; tokens are stored directly on the line object.

## Package

- `lindera-wasm-web-ipadic` v2.0.0 (web WASM target, IPADIC-only build)
- Dictionary: `embedded://ipadic` (set via `TokenizerBuilder.setDictionary`)
- Mode: `normal` (default, not explicitly set)
- Vite config: `optimizeDeps.exclude: ['lindera-wasm-web-ipadic']` required for WASM

## Data flow

```
clipboard text
  → useClipboardPoller creates CapturedLine { id, text, createdAt }
  → tokenizeJapanese(text) called async
  → tokens written back to line: { ...line, tokens: Token[] }
```

Only new lines are tokenized. No re-tokenization of history.

## Token type (`src/types/token.ts`)

```ts
interface Token {
  surface: string    // as-written form ("食べ")
  baseForm: string   // dictionary form ("食べる")
  reading: string    // katakana reading ("タベ")
  pos: string        // part of speech ("動詞")
  posDetail: string  // subcategory ("自立"), empty if "*"
  start: number      // char offset in line
}
```

## Lindera v2 raw output

Each token from `tokenizer.tokenize()` returns:

```
surface, baseForm, reading, pronunciation,
partOfSpeech, partOfSpeechSubcategory1/2/3,
conjugationForm, conjugationType,
byteStart, byteEnd, wordId
```

Field mapping in `src/lib/tokenizer.ts`:

| Token field | Lindera field |
|---|---|
| `surface` | `surface` |
| `baseForm` | `baseForm` |
| `reading` | `reading` |
| `pos` | `partOfSpeech` |
| `posDetail` | `partOfSpeechSubcategory1` (omitted if `*`) |
| `start` | `byteStart` → converted to char offset |

`byteStart`/`byteEnd` are UTF-8 byte offsets, not character offsets. `byteOffsetToCharOffset()` handles conversion.

## IPADIC tokenization behavior

IPADIC splits on morpheme boundaries. Conjugated forms are separate tokens:

| Input | Tokens |
|---|---|
| 面白かった | 面白かっ(形容詞) + た(助動詞) |
| 食べた | 食べ(動詞) + た(助動詞) |
| 行かなかった | 行か(動詞) + なかっ(助動詞) + た(助動詞) |
| 申し込んだ | 申し込ん(動詞) + だ(助動詞) |

`baseForm` gives the dictionary form: 面白い, 食べる, 行く, 申し込む.

## Files

| File | Role |
|---|---|
| `src/types/token.ts` | Token interface |
| `src/lib/tokenizer.ts` | WASM init, tokenize, field mapping |
| `src/hooks/useClipboardPoller.ts` | Calls tokenizer on new lines |
| `src/pages/ReadView.tsx` | Debug token table (Tokens button in nav) |
| `src/pages/TokenizerDiag.tsx` | Diagnostic page at `/diag` |
| `vite.config.ts` | WASM optimizeDeps exclusion |

## Debug tools

- **Tokens button** (nav bar on read view): toggles per-line token table showing surface/baseForm/reading/pos
- **/diag route**: runs tokenizer against test strings, dumps raw lindera output and mapped output
