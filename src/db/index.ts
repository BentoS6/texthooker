import Dexie, { type EntityTable } from 'dexie'

export interface Highlight {
  word: string
  color: string
  createdAt: Date
  context: string
  note?: string
}

const db = new Dexie('texthooker') as Dexie & {
  highlights: EntityTable<Highlight, 'word'>
}

db.version(1).stores({
  highlights: 'word, color, createdAt',
})

export { db }
