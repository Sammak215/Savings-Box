'use client'

import { useSavingsStore } from '@/store/useSavingsStore'
import { formatCurrency } from '@/utils/formatUtils'

export default function DenomBreakdown() {
  const denoms = useSavingsStore((s) => s.denoms)
  const cells = useSavingsStore((s) => s.cells)

  const rows = denoms
    .map((d) => {
      const count = cells.filter((c) => c === d.value).length
      return { ...d, count, subtotal: count * d.value }
    })
    .filter((r) => r.count > 0)

  if (rows.length === 0) return null

  return (
    <div className="mt-3">
      <p className="text-xs font-semibold text-[var(--ink)]/50 uppercase tracking-wider mb-2">
        Breakdown
      </p>
      <div className="space-y-1.5">
        {rows.map((r) => (
          <div key={r.value} className="flex items-center gap-2 text-sm">
            <span
              className="inline-block w-3 h-3 rounded-sm flex-shrink-0"
              style={{ backgroundColor: r.color }}
            />
            <span className="text-[var(--ink)]/70 flex-1">
              {formatCurrency(r.value)}
            </span>
            <span className="text-[var(--ink)]/50 text-xs">×{r.count}</span>
            <span className="text-[var(--ink)] font-medium">
              {formatCurrency(r.subtotal)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
