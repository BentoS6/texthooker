import type { Token } from '../types/token'

interface LinderaToken {
  surface: string
  baseForm: string
  reading: string
  partOfSpeech: string
  partOfSpeechSubcategory1: string
  byteStart: number
  byteEnd: number
}

let tokenizerInstance: { tokenize: (text: string) => LinderaToken[] } | null = null

async function getTokenizer() {
  if (tokenizerInstance) return tokenizerInstance

  const lindera = await import('lindera-wasm-web-ipadic')
  await lindera.default()
  const builder = new lindera.TokenizerBuilder()
  builder.setDictionary('embedded://ipadic')
  tokenizerInstance = builder.build() as unknown as typeof tokenizerInstance
  return tokenizerInstance!
}

function byteOffsetToCharOffset(text: string, byteOffset: number): number {
  const encoder = new TextEncoder()
  let bytes = 0
  for (let i = 0; i < text.length; i++) {
    if (bytes >= byteOffset) return i
    bytes += encoder.encode(text[i]).length
  }
  return text.length
}

export async function tokenizeJapanese(text: string): Promise<Token[]> {
  const tokenizer = await getTokenizer()
  const raw = tokenizer.tokenize(text)

  return raw.map(t => ({
    surface: t.surface,
    baseForm: t.baseForm,
    reading: t.reading,
    pos: t.partOfSpeech,
    posDetail: t.partOfSpeechSubcategory1 === '*' ? '' : t.partOfSpeechSubcategory1,
    start: byteOffsetToCharOffset(text, t.byteStart),
  }))
}
