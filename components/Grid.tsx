'use client'

import { forwardRef } from 'react'
import { useSavingsStore } from '@/store/useSavingsStore'
import Cell from './Cell'

const Grid = forwardRef<HTMLDivElement>((_, ref) => {
  const cols = useSavingsStore((s) => s.cols)
  const rows = useSavingsStore((s) => s.rows)
  const cellCount = cols * rows

  return (
    <div
      ref={ref}
      id="savings-grid"
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gap: '3px',
        containerType: 'inline-size',
      }}
      data-tour="grid"
      className="w-full p-3 bg-[var(--bg)] print:p-0"
    >
      {Array.from({ length: cellCount }, (_, i) => (
        <Cell key={i} idx={i} />
      ))}
    </div>
  )
})

Grid.displayName = 'Grid'
export default Grid
