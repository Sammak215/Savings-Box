'use client'

import { useState, useMemo } from 'react'
import { useSavingsStore } from '@/store/useSavingsStore'
import { isFeasible } from '@/utils/randomFill'

interface GridOption {
  cols: number
  rows: number
  cells: number
  label: string
}

function suggestGrids(target: number, denomValues: number[]): GridOption[] {
  if (!denomValues.length || target <= 0) return []

  const avgDenom = denomValues.reduce((s, v) => s + v, 0) / denomValues.length
  const idealCells = Math.round(target / avgDenom)

  // Candidate cell counts around the ideal (±50%), clamped to 4–900
  const candidates = new Set<number>()
  for (let delta = -0.5; delta <= 0.5; delta += 0.1) {
    const n = Math.round(idealCells * (1 + delta))
    if (n >= 4 && n <= 900) candidates.add(n)
  }

  // For each candidate count find the most square-ish factorisation
  const options: GridOption[] = []
  for (const n of candidates) {
    let bestCols = 1, bestRows = n, bestDiff = n - 1
    for (let c = 2; c <= 30; c++) {
      if (n % c === 0) {
        const r = n / c
        if (r > 30) continue
        const diff = Math.abs(c - r)
        if (diff < bestDiff) { bestDiff = diff; bestCols = c; bestRows = r }
      }
    }
    // Only keep if both dims are in 2–30
    if (bestCols >= 2 && bestRows >= 2 && bestCols <= 30 && bestRows <= 30) {
      options.push({
        cols: bestCols,
        rows: bestRows,
        cells: n,
        label: `${bestCols} × ${bestRows} (${n} cells)`,
      })
    }
  }

  // Deduplicate by cols×rows, filter to feasible only, sort by closeness to ideal
  const seen = new Set<string>()
  return options
    .filter((o) => {
      const k = `${o.cols}x${o.rows}`
      if (seen.has(k)) return false
      seen.add(k)
      return isFeasible(o.cells, denomValues, target)
    })
    .sort((a, b) => Math.abs(a.cells - idealCells) - Math.abs(b.cells - idealCells))
    .slice(0, 8)
}

export default function SetupPanel() {
  const cols = useSavingsStore((s) => s.cols)
  const rows = useSavingsStore((s) => s.rows)
  const target = useSavingsStore((s) => s.target)
  const denoms = useSavingsStore((s) => s.denoms)
  const setConfig = useSavingsStore((s) => s.setConfig)
  const fillError = useSavingsStore((s) => s.fillError)
  const clearFillError = useSavingsStore((s) => s.clearFillError)

  const [localTarget, setLocalTarget] = useState(target != null ? String(target) : '')

  const denomValues = denoms.map((d) => d.value)
  const denomKey = denomValues.join(',')

  const gridOptions = useMemo(
    () => suggestGrids(parseFloat(localTarget) || 0, denomValues),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [localTarget, denomKey]
  )

  function handleTarget(val: string) {
    setLocalTarget(val)
    const num = parseFloat(val)
    if (!val) setConfig({ target: null })
    else if (!isNaN(num) && num > 0) setConfig({ target: num })
  }

  function handleGridSelect(e: React.ChangeEvent<HTMLSelectElement>) {
    const [c, r] = e.target.value.split('x').map(Number)
    setConfig({ cols: c, rows: r })
    // Auto-fill after resize so the grid isn't left empty
    setTimeout(() => fillRandom(), 0)
  }

  const selectedKey = `${cols}x${rows}`

  return (
    <div data-tour="setup" className="p-4 bg-[var(--surface)] border-b border-[var(--border)] flex flex-wrap gap-4 items-end">

      <label className="flex flex-col gap-1 text-xs font-medium text-[var(--ink)]/70">
        Target Amount
        <input
          type="number"
          min={0}
          value={localTarget}
          onChange={(e) => handleTarget(e.target.value)}
          placeholder="e.g. 10000"
          className="w-40 px-3 py-1.5 rounded-md border border-[var(--border)] bg-[var(--bg)] text-[var(--ink)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--gold)] [appearance:textfield]"
        />
      </label>

      {gridOptions.length > 0 && (
        <label className="flex flex-col gap-1 text-xs font-medium text-[var(--ink)]/70">
          Grid Size
          <select
            value={gridOptions.find((o) => `${o.cols}x${o.rows}` === selectedKey) ? selectedKey : ''}
            onChange={handleGridSelect}
            className="px-3 py-1.5 rounded-md border border-[var(--border)] bg-[var(--bg)] text-[var(--ink)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--gold)] cursor-pointer"
          >
            {!gridOptions.find((o) => `${o.cols}x${o.rows}` === selectedKey) && (
              <option value="" disabled>Choose a grid…</option>
            )}
            {gridOptions.map((o) => (
              <option key={`${o.cols}x${o.rows}`} value={`${o.cols}x${o.rows}`}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      )}

      {fillError && (
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-100 text-red-600 rounded-md text-xs self-end">
          <span>{fillError}</span>
          <button onClick={clearFillError} className="font-bold leading-none">×</button>
        </div>
      )}

      <span className="text-[10px] text-[var(--ink)]/40 self-end ml-auto">{cols * rows} cells</span>
    </div>
  )
}
