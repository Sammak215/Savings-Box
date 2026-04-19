'use client'

import { useState } from 'react'
import { useSavingsStore } from '@/store/useSavingsStore'

export default function SetupPanel() {
  const cols = useSavingsStore((s) => s.cols)
  const rows = useSavingsStore((s) => s.rows)
  const target = useSavingsStore((s) => s.target)
  const setConfig = useSavingsStore((s) => s.setConfig)

  const [localTarget, setLocalTarget] = useState(target != null ? String(target) : '')

  function handleTarget(val: string) {
    setLocalTarget(val)
    const num = parseFloat(val)
    if (!val) setConfig({ target: null })
    else if (!isNaN(num) && num > 0) setConfig({ target: num })
  }

  return (
    <div className="p-4 bg-[var(--surface)] border-b border-[var(--border)] flex flex-wrap gap-4 items-end">
      <label className="flex flex-col gap-1 text-xs font-medium text-[var(--ink)]/70">
        Columns
        <div className="flex items-center gap-2">
          <input
            type="range"
            min={2}
            max={30}
            value={cols}
            onChange={(e) => setConfig({ cols: Number(e.target.value) })}
            className="w-24 accent-[var(--gold)]"
          />
          <span className="text-[var(--ink)] font-bold w-5 text-center">{cols}</span>
        </div>
      </label>

      <label className="flex flex-col gap-1 text-xs font-medium text-[var(--ink)]/70">
        Rows
        <div className="flex items-center gap-2">
          <input
            type="range"
            min={2}
            max={30}
            value={rows}
            onChange={(e) => setConfig({ rows: Number(e.target.value) })}
            className="w-24 accent-[var(--gold)]"
          />
          <span className="text-[var(--ink)] font-bold w-5 text-center">{rows}</span>
        </div>
      </label>

      <label className="flex flex-col gap-1 text-xs font-medium text-[var(--ink)]/70">
        Target Amount (optional)
        <input
          type="number"
          min={0}
          value={localTarget}
          onChange={(e) => handleTarget(e.target.value)}
          placeholder="e.g. 10000"
          className="w-36 px-3 py-1.5 rounded-md border border-[var(--border)] bg-[var(--bg)] text-[var(--ink)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--gold)] [appearance:textfield]"
        />
      </label>

      <div className="text-xs text-[var(--ink)]/40 self-center">
        {cols * rows} cells total
      </div>
    </div>
  )
}
