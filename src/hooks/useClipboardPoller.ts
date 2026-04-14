import { useState, useEffect, useCallback, createContext, useContext } from 'react'
import type { Token } from '../types/token'
import { tokenizeJapanese } from '../lib/tokenizer'

export interface CapturedLine {
  id: string
  text: string
  createdAt: number
  tokens?: Token[]
}

interface ClipboardState {
  lines: CapturedLine[]
  clear: () => void
  undo: () => void
}

const ClipboardContext = createContext<ClipboardState>({ lines: [], clear: () => {}, undo: () => {} })

export function useClipboardInserter() {
  return useContext(ClipboardContext)
}

export function useClipboardInserterProvider() {
  const [lines, setLines] = useState<CapturedLine[]>([])

  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (
            node instanceof HTMLElement &&
            node.parentElement === document.body &&
            !document.getElementById('root')?.contains(node)
          ) {
            const text = node.textContent?.trim()
            if (text) {
              const id = crypto.randomUUID()
              setLines(prev => {
                if (prev.at(-1)?.text === text) return prev
                return [...prev, { id, text, createdAt: Date.now() }]
              })
              tokenizeJapanese(text).then(tokens => {
                setLines(prev => prev.map(l => l.id === id ? { ...l, tokens } : l))
              }).catch(err => {
                console.error('tokenization failed:', err)
              })
            }
            node.remove()
          }
        }
      }
    })

    observer.observe(document.body, { childList: true })
    return () => observer.disconnect()
  }, [])

  const clear = useCallback(() => {
    setLines([])
  }, [])

  const undo = useCallback(() => {
    setLines(prev => prev.slice(0, -1))
  }, [])

  return { lines, clear, undo }
}

export { ClipboardContext }
