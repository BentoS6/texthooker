import { useState, useMemo } from 'react'
import { getWordsForLevel, type JlptLevel } from '../data/jlpt'

const STORAGE_KEY = 'jlpt-level'

function readLevel(): JlptLevel | null {
  const v = localStorage.getItem(STORAGE_KEY)
  if (v && [1, 2, 3, 4, 5].includes(Number(v))) return Number(v) as JlptLevel
  return null
}

export function useJlptLevel() {
  const [level, setLevelState] = useState<JlptLevel | null>(readLevel)

  const setLevel = (l: JlptLevel | null) => {
    setLevelState(l)
    if (l) localStorage.setItem(STORAGE_KEY, String(l))
    else localStorage.removeItem(STORAGE_KEY)
  }

  const jlptWords = useMemo(
    () => (level ? getWordsForLevel(level) : new Map<string, JlptLevel>()),
    [level],
  )

  return { level, setLevel, jlptWords }
}
