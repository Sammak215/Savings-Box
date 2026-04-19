'use client'

import { useState } from 'react'
import { useSavingsStore } from '@/store/useSavingsStore'
import { getContrastText } from '@/utils/colorUtils'
import { formatCurrency } from '@/utils/formatUtils'

export default function DenomPicker() {
  const denoms = useSavingsStore((s) => s.denoms)
  const selectedDenom = useSavingsStore((s) => s.selectedDenom)
  const selectDenom = useSavingsStore((s) => s.selectDenom)
  const addDenom = useSavingsStore((s) => s.addDenom)
  const removeDenom = useSavingsStore((s) => s.removeDenom)

  const [newValue, setNewValue] = useState('')

  function handleAdd() {
    const num = parseFloat(newValue)
    if (!isNaN(num) && num > 0) {
      addDenom(num)
      setNewValue('')
    }
  }

  return (
    <div data-tour="denoms" className="flex flex-col gap-2 p-3 bg-[var(--surface)] border-r border-[var(--border)] min-w-[120px] max-w-[140px]">
      <p className="text-xs font-semibold text-[var(--ink)]/50 uppercase tracking-wider px-1">Amounts</p>

      {/* Eraser */}
      <button
        onClick={() => selectDenom(null)}
        className={`w-full py-2 rounded-lg text-sm font-medium transition border-2 ${
          selectedDenom === null
            ? 'border-[var(--gold)] bg-[var(--gold)]/10 text-[var(--ink)]'
            : 'border-transparent bg-[var(--bg)] text-[var(--ink)]/60 hover:border-[var(--border)]'
        }`}
      >
        ✕ Erase
      </button>

      {/* Denominations */}
      {denoms.map((d, i) => {
        const isSelected = selectedDenom === d.value
        const textColor = getContrastText(d.color)
        return (
          <div key={d.value} className="relative group">
            <button
              onClick={() => selectDenom(d.value)}
              style={{ backgroundColor: d.color, color: textColor }}
              className={`w-full py-2 px-1 rounded-lg text-sm font-bold transition border-2 ${
                isSelected ? 'border-white/80 scale-105' : 'border-transparent hover:scale-105'
              }`}
              title={`Press ${i + 1} to select`}
            >
              {formatCurrency(d.value)}
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); removeDenom(d.value) }}
              className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] opacity-0 group-hover:opacity-100 transition flex items-center justify-center"
            >
              ×
            </button>
          </div>
        )
      })}

      {/* Add new denom */}
      <div className="flex flex-col gap-1 mt-1">
        <input
          type="number"
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          placeholder="+ Add"
          className="w-full px-2 py-1.5 rounded-md border border-[var(--border)] bg-[var(--bg)] text-[var(--ink)] text-xs focus:outline-none focus:ring-1 focus:ring-[var(--gold)] [appearance:textfield]"
        />
        <button
          onClick={handleAdd}
          className="w-full py-1 rounded-md bg-[var(--gold)]/20 text-[var(--ink)] text-xs font-medium hover:bg-[var(--gold)]/40 transition"
        >
          Add
        </button>
      </div>
    </div>
  )
}
