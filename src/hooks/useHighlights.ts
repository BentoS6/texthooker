import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'

export function useHighlights() {
  const highlights = useLiveQuery(() => db.highlights.toArray()) ?? []

  const highlightMap = new Map(highlights.map(h => [h.word, h]))

  async function addHighlight(word: string, context: string, color: string, note?: string) {
    await db.highlights.put({
      word,
      color,
      context,
      createdAt: new Date(),
      ...(note ? { note } : {}),
    })
  }

  async function removeHighlight(word: string) {
    await db.highlights.delete(word)
  }

  return { highlights, highlightMap, addHighlight, removeHighlight }
}
