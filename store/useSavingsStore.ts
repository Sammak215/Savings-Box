'use client'

import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import type { DenomConfig, SavedState, Theme } from '@/types'
import { assignColor } from '@/utils/colorUtils'
import { randomFill } from '@/utils/randomFill'
import {
  getSaveSlots,
  writeSaveSlots,
  getTheme,
  setThemeStorage,
  getActiveSlot,
  setActiveSlot,
} from '@/utils/localStorage'

const DEFAULT_DENOMS: DenomConfig[] = [
  { value: 50, color: '#e63946' },
  { value: 100, color: '#457b9d' },
  { value: 200, color: '#2a9d8f' },
  { value: 500, color: '#e9c46a' },
  { value: 1000, color: '#f4a261' },
]

const DEFAULT_COLS = 10
const DEFAULT_ROWS = 10

function makeEmptyCells(count: number): Array<number | null> {
  return Array(count).fill(null)
}

interface HistoryEntry {
  cells: Array<number | null>
  timestamps: Array<number | null>
}

interface SavingsState {
  title: string
  cols: number
  rows: number
  denoms: DenomConfig[]
  target: number | null
  cells: Array<number | null>
  timestamps: Array<number | null>
  selectedDenom: number | null
  theme: Theme
  activeSlot: string
  saveSlots: Record<string, SavedState>
  history: HistoryEntry[]
  fillError: string | null

  // Actions
  setTitle(title: string): void
  setConfig(patch: { cols?: number; rows?: number; target?: number | null }): void
  setCell(idx: number, value: number | null): void
  fillRandom(): void
  clearGrid(): void
  selectDenom(d: number | null): void
  addDenom(value: number): void
  removeDenom(value: number): void
  setTheme(t: Theme): void
  saveSlotAction(name: string): void
  loadSlotAction(name: string): void
  deleteSlotAction(name: string): void
  undo(): void
  hydrateFromStorage(): void
  clearFillError(): void
}

const MAX_HISTORY = 20

export const useSavingsStore = create<SavingsState>()(
  immer((set, get) => ({
    title: 'My Savings Box',
    cols: DEFAULT_COLS,
    rows: DEFAULT_ROWS,
    denoms: DEFAULT_DENOMS,
    target: null,
    cells: makeEmptyCells(DEFAULT_COLS * DEFAULT_ROWS),
    timestamps: makeEmptyCells(DEFAULT_COLS * DEFAULT_ROWS),
    selectedDenom: DEFAULT_DENOMS[0].value,
    theme: 'light',
    activeSlot: 'default',
    saveSlots: {},
    history: [],
    fillError: null,

    setTitle(title) {
      set((s) => { s.title = title })
    },

    setConfig({ cols, rows, target }) {
      set((s) => {
        const newCols = cols ?? s.cols
        const newRows = rows ?? s.rows
        const newCount = newCols * newRows
        const oldCount = s.cols * s.rows

        if (cols !== undefined) s.cols = newCols
        if (rows !== undefined) s.rows = newRows
        if (target !== undefined) s.target = target

        if (newCount !== oldCount) {
          // Resize cells — preserve existing, pad or truncate
          const newCells: Array<number | null> = Array(newCount).fill(null)
          const newTs: Array<number | null> = Array(newCount).fill(null)
          for (let r = 0; r < Math.min(s.rows, newRows ?? s.rows); r++) {
            for (let c = 0; c < Math.min(s.cols, newCols ?? s.cols); c++) {
              const oldIdx = r * (cols ?? s.cols) + c
              const newIdx = r * newCols + c
              if (oldIdx < s.cells.length) {
                newCells[newIdx] = s.cells[oldIdx]
                newTs[newIdx] = s.timestamps[oldIdx]
              }
            }
          }
          s.cells = newCells
          s.timestamps = newTs
        }
      })
    },

    setCell(idx, value) {
      set((s) => {
        // push to history
        if (s.history.length >= MAX_HISTORY) s.history.shift()
        s.history.push({ cells: [...s.cells], timestamps: [...s.timestamps] })
        s.cells[idx] = value
        s.timestamps[idx] = value != null ? Date.now() : null
      })
    },

    fillRandom() {
      const s = get()
      const cellCount = s.cols * s.rows
      const denomValues = s.denoms.map((d) => d.value)
      const result = randomFill(cellCount, denomValues, s.target)
      if ('error' in result) {
        set((st) => { st.fillError = result.error })
        return
      }
      const now = Date.now()
      set((st) => {
        if (st.history.length >= MAX_HISTORY) st.history.shift()
        st.history.push({ cells: [...st.cells], timestamps: [...st.timestamps] })
        st.cells = result.cells
        st.timestamps = result.cells.map(() => now)
        st.fillError = null
      })
    },

    clearGrid() {
      set((s) => {
        const count = DEFAULT_COLS * DEFAULT_ROWS
        s.title = 'My Savings Box'
        s.cols = DEFAULT_COLS
        s.rows = DEFAULT_ROWS
        s.denoms = DEFAULT_DENOMS
        s.target = null
        s.cells = makeEmptyCells(count)
        s.timestamps = makeEmptyCells(count)
        s.selectedDenom = DEFAULT_DENOMS[0].value
        s.history = []
        s.fillError = null
        s.saveSlots = {}
        s.activeSlot = 'default'
        writeSaveSlots({})
      })
    },

    selectDenom(d) {
      set((s) => { s.selectedDenom = d })
    },

    addDenom(value) {
      set((s) => {
        if (s.denoms.find((d) => d.value === value)) return
        s.denoms.push({ value, color: assignColor(s.denoms.length) })
        s.denoms.sort((a, b) => a.value - b.value)
      })
    },

    removeDenom(value) {
      set((s) => {
        s.denoms = s.denoms.filter((d) => d.value !== value)
        if (s.selectedDenom === value) {
          s.selectedDenom = s.denoms[0]?.value ?? null
        }
      })
    },

    setTheme(t) {
      set((s) => { s.theme = t })
      setThemeStorage(t)
      document.documentElement.setAttribute('data-theme', t)
    },

    saveSlotAction(name) {
      set((s) => {
        const snapshot: SavedState = {
          title: s.title,
          cols: s.cols,
          rows: s.rows,
          denoms: s.denoms,
          target: s.target,
          cells: [...s.cells],
          timestamps: [...s.timestamps],
          savedAt: Date.now(),
        }
        s.saveSlots[name] = snapshot
        s.activeSlot = name
        writeSaveSlots(get().saveSlots)
        setActiveSlot(name)
      })
    },

    loadSlotAction(name) {
      set((s) => {
        const slot = s.saveSlots[name]
        if (!slot) return
        s.title = slot.title
        s.cols = slot.cols
        s.rows = slot.rows
        s.denoms = slot.denoms
        s.target = slot.target
        s.cells = slot.cells
        s.timestamps = slot.timestamps
        s.activeSlot = name
        setActiveSlot(name)
      })
    },

    deleteSlotAction(name) {
      set((s) => {
        delete s.saveSlots[name]
        writeSaveSlots(get().saveSlots)
        if (s.activeSlot === name) s.activeSlot = 'default'
      })
    },

    undo() {
      set((s) => {
        const prev = s.history.pop()
        if (!prev) return
        s.cells = prev.cells
        s.timestamps = prev.timestamps
      })
    },

    hydrateFromStorage() {
      const slots = getSaveSlots()
      const theme = (getTheme() as Theme) || 'light'
      const activeSlot = getActiveSlot() || 'default'
      set((s) => {
        s.saveSlots = slots
        s.theme = theme
        s.activeSlot = activeSlot
      })
      document.documentElement.setAttribute('data-theme', theme)

      // Auto-load the active slot if it exists
      const slot = slots[activeSlot]
      if (slot) {
        get().loadSlotAction(activeSlot)
      }
    },

    clearFillError() {
      set((s) => { s.fillError = null })
    },
  }))
)
