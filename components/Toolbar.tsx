'use client'

import { useRef, useState } from 'react'
import { useSavingsStore } from '@/store/useSavingsStore'
import { exportCSV, exportXLSX, exportPNG } from '@/utils/exportUtils'
import AdUnit from './ads/AdUnit'

interface Props {
  gridRef: React.RefObject<HTMLDivElement | null>
}

export default function Toolbar({ gridRef }: Props) {
  const cells = useSavingsStore((s) => s.cells)
  const cols = useSavingsStore((s) => s.cols)
  const title = useSavingsStore((s) => s.title)
  const denoms = useSavingsStore((s) => s.denoms)
  const target = useSavingsStore((s) => s.target)
  const fillRandom = useSavingsStore((s) => s.fillRandom)
  const clearGrid = useSavingsStore((s) => s.clearGrid)
  const undo = useSavingsStore((s) => s.undo)
  const fillError = useSavingsStore((s) => s.fillError)
  const clearFillError = useSavingsStore((s) => s.clearFillError)

  const totalSaved = cells.reduce<number>((sum, c) => sum + (c ?? 0), 0)
  const [showPostExport, setShowPostExport] = useState(false)
  const postExportTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  function triggerPostExport() {
    setShowPostExport(true)
    if (postExportTimer.current) clearTimeout(postExportTimer.current)
    postExportTimer.current = setTimeout(() => setShowPostExport(false), 4000)
  }

  function handleExportPNG() {
    if (gridRef.current) exportPNG(gridRef.current, title)
    triggerPostExport()
  }

  function handlePrint() {
    window.print()
  }

  return (
    <div className="flex flex-col">
    <div data-tour="toolbar" className="flex flex-wrap items-center gap-2 px-4 py-2 bg-[var(--surface)] border-b border-[var(--border)]">
      <button
        onClick={fillRandom}
        className="btn-toolbar bg-[var(--gold)] text-[var(--ink)]"
        title="R — Random fill"
      >
        🎲 Random Fill
      </button>

      <div className="w-px h-5 bg-[var(--border)]" />

      <button
        onClick={() => { exportCSV(cells, cols, title); triggerPostExport() }}
        className="btn-toolbar"
      >
        CSV
      </button>
      <button
        onClick={() => { exportXLSX(cells, cols, title, denoms, target, totalSaved); triggerPostExport() }}
        className="btn-toolbar"
      >
        XLSX
      </button>
      <button
        onClick={handleExportPNG}
        className="btn-toolbar"
      >
        PNG
      </button>
      <button
        onClick={handlePrint}
        className="btn-toolbar"
      >
        🖨 Print
      </button>

      <div className="w-px h-5 bg-[var(--border)]" />

      <button
        onClick={undo}
        className="btn-toolbar"
        title="Ctrl+Z"
      >
        ↩ Undo
      </button>
      <button
        onClick={clearGrid}
        className="btn-toolbar text-red-400 hover:text-red-600"
        title="Clear all cells"
      >
        🗑 Reset
      </button>

      {fillError && (
        <div className="flex items-center gap-2 ml-2 px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-md text-xs">
          <span>{fillError}</span>
          <button onClick={clearFillError} className="font-bold">×</button>
        </div>
      )}
    </div>

    {/* Post-export ad — auto-hides after 4s */}
    {showPostExport && (
      <AdUnit
        slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_EXPORT ?? ''}
        format="horizontal"
        className="w-full min-h-[90px] flex items-center justify-center bg-[var(--surface)] border-b border-[var(--border)]"
      />
    )}

    {/* Bottom banner */}
    <AdUnit
      slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_BOTTOM ?? ''}
      format="horizontal"
      className="w-full min-h-[90px] flex items-center justify-center bg-[var(--surface)]/50 border-b border-[var(--border)]"
    />
    </div>
  )
}
