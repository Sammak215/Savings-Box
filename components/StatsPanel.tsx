'use client'

import { useEffect, useRef } from 'react'
import { useSavingsStore } from '@/store/useSavingsStore'
import { formatCurrency, formatFull } from '@/utils/formatUtils'
import ProgressRing from './ProgressRing'
import DenomBreakdown from './DenomBreakdown'
import MilestoneBadge from './MilestoneBadge'
import AdUnit from './ads/AdUnit'

export default function StatsPanel() {
  const cells = useSavingsStore((s) => s.cells)
  const target = useSavingsStore((s) => s.target)
  const cols = useSavingsStore((s) => s.cols)
  const rows = useSavingsStore((s) => s.rows)

  const confettiFiredRef = useRef(false)

  const totalCells = cols * rows
  const notesFilled = cells.filter((c) => c != null).length
  const notesLeft = totalCells - notesFilled
  const totalSaved = cells.reduce<number>((sum, c) => sum + (c ?? 0), 0)
  const remaining = target != null ? Math.max(0, target - totalSaved) : null
  const percentComplete = target != null && target > 0
    ? Math.min(100, (totalSaved / target) * 100)
    : notesFilled > 0
      ? (notesFilled / totalCells) * 100
      : 0
  const avgPerNote = notesFilled > 0 ? totalSaved / notesFilled : null

  useEffect(() => {
    if (percentComplete >= 100 && !confettiFiredRef.current) {
      confettiFiredRef.current = true
      import('canvas-confetti').then(({ default: confetti }) => {
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#c9a84c', '#e8c96a', '#f5f0e8', '#2a9d8f', '#e63946'],
        })
      })
    }
    if (percentComplete < 100) confettiFiredRef.current = false
  }, [percentComplete])

  const cards = [
    { label: 'Saved', value: formatFull(totalSaved as number), sub: null },
    target != null
      ? { label: 'Target', value: formatCurrency(target), sub: null }
      : null,
    remaining != null
      ? { label: 'Remaining', value: formatCurrency(remaining), sub: null }
      : null,
    { label: 'Cells Filled', value: `${notesFilled}`, sub: `of ${totalCells}` },
    avgPerNote != null
      ? { label: 'Avg per Cell', value: formatCurrency(avgPerNote), sub: null }
      : null,
  ].filter(Boolean) as { label: string; value: string; sub: string | null }[]

  return (
    <aside className="flex flex-col gap-4 p-4 bg-[var(--surface)] border-l border-[var(--border)] w-64 min-w-56 overflow-y-auto print:hidden">
      {/* Progress ring */}
      <div className="flex flex-col items-center gap-2">
        <ProgressRing percent={percentComplete} size={96} stroke={10} />
        <MilestoneBadge percent={percentComplete} />
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-2">
        {cards.map((c) => (
          <div
            key={c.label}
            className="flex flex-col p-2 rounded-lg bg-[var(--bg)] border border-[var(--border)]"
          >
            <span className="text-[var(--ink)]/50 text-[10px] uppercase tracking-wide leading-none mb-0.5">
              {c.label}
            </span>
            <span className="text-[var(--ink)] font-bold text-base leading-tight">
              {c.value}
            </span>
            {c.sub && (
              <span className="text-[var(--ink)]/40 text-[10px]">{c.sub}</span>
            )}
          </div>
        ))}
      </div>

      <DenomBreakdown />

      <AdUnit
        slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR ?? ''}
        format="rectangle"
        className="hidden md:block mt-2 min-h-[250px] w-full"
      />
    </aside>
  )
}
