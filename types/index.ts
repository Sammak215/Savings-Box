export type Theme = 'light' | 'dark' | 'contrast'

export interface DenomConfig {
  value: number
  color: string
}

export interface Config {
  title: string
  cols: number
  rows: number
  denoms: DenomConfig[]
  target: number | null
}

export interface SavedState {
  title: string
  cols: number
  rows: number
  denoms: DenomConfig[]
  target: number | null
  cells: Array<number | null>
  timestamps: Array<number | null>
  savedAt: number
}

export interface FillResult {
  cells: number[]
  error?: never
}

export interface FillError {
  error: string
  cells?: never
}

export interface StatsSnapshot {
  totalSaved: number
  target: number | null
  remaining: number | null
  percentComplete: number
  notesFilled: number
  notesLeft: number
  avgPerNote: number | null
}
