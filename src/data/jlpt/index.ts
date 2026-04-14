import wordsData from './words.json'

export type JlptLevel = 1 | 2 | 3 | 4 | 5

const data = wordsData as Record<string, { reading: string; level: number }[]>

// Map: word → lowest (hardest) JLPT level it appears at
// If word has readings at multiple levels, use lowest number (highest difficulty)
const wordLevelMap = new Map<string, JlptLevel>()

for (const [word, readings] of Object.entries(data)) {
  const minLevel = Math.min(...readings.map(r => r.level)) as JlptLevel
  wordLevelMap.set(word, minLevel)
}

// Get all words at given level and below (cumulative)
// E.g. level 4 → returns N5 + N4 words
export function getWordsForLevel(level: JlptLevel): Map<string, JlptLevel> {
  const result = new Map<string, JlptLevel>()
  for (const [word, lvl] of wordLevelMap) {
    if (lvl >= level) {
      result.set(word, lvl)
    }
  }
  return result
}

export const JLPT_COLORS: Record<JlptLevel, string> = {
  5: '#60a5fa',
  4: '#34d399',
  3: '#facc15',
  2: '#fb923c',
  1: '#c084fc',
}
