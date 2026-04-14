import { useEffect, useState } from 'react'

const TEST_STRINGS = ['面白かった', '食べた', '行かなかった', '申し込んだ']

function TokenizerDiag() {
  const [log, setLog] = useState<string[]>(['Starting diagnostic...'])

  const addLog = (msg: string) => setLog(prev => [...prev, msg])

  useEffect(() => {
    async function run() {
      // Step 1: Import
      let lindera: Record<string, unknown>
      try {
        lindera = await import('lindera-wasm-web-ipadic') as Record<string, unknown>
        addLog(`[1] Package imported: lindera-wasm-web-ipadic v2.0.0`)
        addLog(`[1] Exports: ${Object.keys(lindera).join(', ')}`)
      } catch (e) {
        addLog(`[1] IMPORT FAILED: ${e}`)
        return
      }

      // Step 1b: Version
      try {
        if (typeof lindera.getVersion === 'function') {
          addLog(`[1] getVersion(): ${(lindera.getVersion as () => string)()}`)
        }
      } catch (e) {
        addLog(`[1] getVersion failed: ${e}`)
      }

      // Step 2: WASM init
      try {
        await (lindera.default as () => Promise<unknown>)()
        addLog(`[2] WASM init: OK`)
      } catch (e) {
        addLog(`[2] WASM init FAILED: ${e}`)
        return
      }

      // Step 3: Build tokenizer - try multiple approaches
      let tokenizer: { tokenize: (t: string) => unknown } | null = null

      // Approach A: with setDictionary
      try {
        const TB = lindera.TokenizerBuilder as new () => {
          setDictionary: (u: string) => void
          setMode: (m: string) => void
          build: () => { tokenize: (t: string) => unknown }
        }
        const b = new TB()
        addLog(`[3a] TokenizerBuilder created`)
        b.setDictionary('embedded://ipadic')
        addLog(`[3a] setDictionary('embedded://ipadic'): OK`)
        tokenizer = b.build()
        addLog(`[3a] build(): OK`)
      } catch (e) {
        addLog(`[3a] Approach A FAILED: ${e}`)
      }

      // Approach B: without setDictionary
      if (!tokenizer) {
        try {
          const TB = lindera.TokenizerBuilder as new () => {
            build: () => { tokenize: (t: string) => unknown }
          }
          const b = new TB()
          addLog(`[3b] TokenizerBuilder created (no setDictionary)`)
          tokenizer = b.build()
          addLog(`[3b] build(): OK`)
        } catch (e) {
          addLog(`[3b] Approach B ALSO FAILED: ${e}`)
        }
      }

      if (!tokenizer) {
        addLog(`[FATAL] No tokenizer could be built`)
        return
      }

      // Step 4: Raw token output for each test string
      for (const input of TEST_STRINGS) {
        try {
          const raw = tokenizer.tokenize(input)
          addLog(``)
          addLog(`=== Input: "${input}" ===`)
          addLog(`[4] Raw type: ${typeof raw}, isArray: ${Array.isArray(raw)}`)
          addLog(`[4] Raw JSON:`)
          addLog(JSON.stringify(raw, null, 2))

          // Step 5: Show what keys each token has
          if (Array.isArray(raw) && raw.length > 0) {
            const first = raw[0]
            addLog(`[5] First token keys: ${Object.keys(first).join(', ')}`)
            addLog(`[5] First token: ${JSON.stringify(first)}`)
          }
        } catch (e) {
          addLog(`[4] tokenize("${input}") FAILED: ${e}`)
        }
      }

      addLog(``)
      addLog(`=== DIAGNOSTIC COMPLETE ===`)
    }

    run()
  }, [])

  return (
    <div className="p-4 font-mono text-xs text-zinc-300">
      <h1 className="text-lg font-bold text-white mb-4">Tokenizer Diagnostic</h1>
      <pre className="bg-zinc-900 p-4 rounded whitespace-pre-wrap leading-relaxed">
        {log.join('\n')}
      </pre>
    </div>
  )
}

export default TokenizerDiag
