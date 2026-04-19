'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useSavingsStore } from '@/store/useSavingsStore'
import { getContrastText } from '@/utils/colorUtils'
import { formatCurrency, formatDate } from '@/utils/formatUtils'

interface Props {
  idx: number
}

export default function Cell({ idx }: Props) {
  const value = useSavingsStore((s) => s.cells[idx])
  const timestamp = useSavingsStore((s) => s.timestamps[idx])
  const denoms = useSavingsStore((s) => s.denoms)
  const selectedDenom = useSavingsStore((s) => s.selectedDenom)
  const setCell = useSavingsStore((s) => s.setCell)

  const denomConfig = value != null ? denoms.find((d) => d.value === value) : null
  const bgColor = denomConfig?.color ?? undefined
  const textColor = bgColor ? getContrastText(bgColor) : undefined

  const cellNum = idx + 1

  function handleClick() {
    if (value != null) {
      // clicking any filled cell always clears it
      setCell(idx, null)
    } else if (selectedDenom !== null) {
      // clicking an empty cell fills it with selected denom
      setCell(idx, selectedDenom)
    }
  }

  const tooltipText = value != null
    ? `Cell ${cellNum} · ${formatCurrency(value)} · ${timestamp ? formatDate(timestamp) : ''}`
    : `Cell ${cellNum} · empty`

  return (
    <motion.button
      layout
      onClick={handleClick}
      title={tooltipText}
      style={{
        backgroundColor: bgColor ?? undefined,
        color: textColor ?? undefined,
      }}
      className={`
        relative aspect-square w-full rounded-sm focus:outline-none select-none
        transition-shadow
        ${!bgColor ? 'bg-[var(--bg)] text-[var(--ink)]/20' : ''}
        ${selectedDenom === null ? 'cursor-crosshair' : 'cursor-pointer'}
      `}
      whileHover={{ scale: 1.06, boxShadow: '0 2px 8px rgba(0,0,0,0.18)' }}
      whileTap={{ scale: 0.95 }}
    >
      <AnimatePresence mode="wait">
        {value != null ? (
          <motion.span
            key={`filled-${value}`}
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: [0.85, 1.12, 1.0], opacity: 1 }}
            exit={{ scale: 0.85, opacity: 0 }}
            transition={{ duration: 0.25, times: [0, 0.6, 1] }}
            className="absolute inset-0 flex items-center justify-center text-[clamp(8px,1.5cqw,13px)] font-bold leading-none"
          >
            {formatCurrency(value)}
          </motion.span>
        ) : (
          <motion.span
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute top-0.5 left-1 text-[clamp(6px,1cqw,10px)] font-mono leading-none opacity-30"
          >
            {cellNum}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  )
}
