'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const TOUR_KEY = 'sb_tour_done'

interface Step {
  target: string   // data-tour value
  title: string
  body: string
  placement: 'bottom' | 'top' | 'left' | 'right'
}

const STEPS: Step[] = [
  {
    target: 'title',
    title: 'Welcome to Savings Box! 🪙',
    body: 'Click the title to rename your savings goal — e.g. "Holiday Fund" or "Emergency Savings".',
    placement: 'bottom',
  },
  {
    target: 'setup',
    title: 'Set your target',
    body: 'Enter how much you want to save. A grid size dropdown will appear with options suited to your goal.',
    placement: 'bottom',
  },
  {
    target: 'denoms',
    title: 'Pick your denominations',
    body: 'These are your note/coin values. Select one, then click any grid cell to fill it. Use the eraser (✕) to clear a cell.',
    placement: 'right',
  },
  {
    target: 'grid',
    title: 'Your savings grid',
    body: 'Each cell represents a note you\'ll set aside. Click cells to fill them as you save. Watch your total grow!',
    placement: 'top',
  },
  {
    target: 'toolbar',
    title: 'Export & more',
    body: 'Export your grid as CSV, XLSX, or PNG. Undo mistakes with ↩, or reset the whole grid.',
    placement: 'bottom',
  },
  {
    target: 'stats',
    title: 'Track your progress',
    body: 'Watch your total saved, remaining amount, and milestone badges update in real time as you fill cells.',
    placement: 'left',
  },
]

function getRect(target: string): DOMRect | null {
  const el = document.querySelector(`[data-tour="${target}"]`)
  return el ? el.getBoundingClientRect() : null
}

interface TooltipPos {
  top: number
  left: number
  arrowSide: 'top' | 'bottom' | 'left' | 'right'
}

function calcPosition(rect: DOMRect, placement: Step['placement']): TooltipPos {
  const gap = 12
  const tooltipW = 280

  switch (placement) {
    case 'bottom':
      return {
        top: rect.bottom + gap,
        left: Math.min(Math.max(rect.left + rect.width / 2 - tooltipW / 2, 8), window.innerWidth - tooltipW - 8),
        arrowSide: 'top',
      }
    case 'top':
      return {
        top: rect.top - gap,
        left: Math.min(Math.max(rect.left + rect.width / 2 - tooltipW / 2, 8), window.innerWidth - tooltipW - 8),
        arrowSide: 'bottom',
      }
    case 'right':
      return {
        top: rect.top + rect.height / 2 - 60,
        left: rect.right + gap,
        arrowSide: 'left',
      }
    case 'left':
      return {
        top: rect.top + rect.height / 2 - 60,
        left: rect.left - tooltipW - gap,
        arrowSide: 'right',
      }
  }
}

export default function Tour() {
  const [step, setStep] = useState(0)
  const [active, setActive] = useState(false)
  const [pos, setPos] = useState<TooltipPos | null>(null)
  const [highlight, setHighlight] = useState<DOMRect | null>(null)

  const reposition = useCallback((stepIdx: number) => {
    const s = STEPS[stepIdx]
    const rect = getRect(s.target)
    if (!rect) return
    setHighlight(rect)
    setPos(calcPosition(rect, s.placement))
  }, [])

  useEffect(() => {
    if (localStorage.getItem(TOUR_KEY)) return
    // Small delay so DOM is painted
    const t = setTimeout(() => { setActive(true); reposition(0) }, 600)
    return () => clearTimeout(t)
  }, [reposition])

  useEffect(() => {
    if (!active) return
    const handler = () => reposition(step)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [active, step, reposition])

  function next() {
    const nextStep = step + 1
    if (nextStep >= STEPS.length) {
      finish()
    } else {
      setStep(nextStep)
      // Small tick so layout settles before measuring
      setTimeout(() => reposition(nextStep), 50)
    }
  }

  function finish() {
    localStorage.setItem(TOUR_KEY, '1')
    setActive(false)
  }

  if (!active || !pos) return null

  const current = STEPS[step]
  const isLast = step === STEPS.length - 1

  return (
    <>
      {/* Backdrop with cutout highlight */}
      <div
        className="fixed inset-0 z-[998] pointer-events-none"
        style={{
          background: 'rgba(0,0,0,0.45)',
          WebkitMaskImage: highlight
            ? `radial-gradient(ellipse ${highlight.width + 16}px ${highlight.height + 16}px at ${highlight.left + highlight.width / 2}px ${highlight.top + highlight.height / 2}px, transparent 99%, black 100%)`
            : undefined,
          maskImage: highlight
            ? `radial-gradient(ellipse ${highlight.width + 16}px ${highlight.height + 16}px at ${highlight.left + highlight.width / 2}px ${highlight.top + highlight.height / 2}px, transparent 99%, black 100%)`
            : undefined,
        }}
      />

      {/* Click-blocker so user can't interact behind tooltip */}
      <div className="fixed inset-0 z-[998]" onClick={next} />

      {/* Tooltip */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, scale: 0.92, y: 6 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 6 }}
          transition={{ duration: 0.18 }}
          style={{ top: pos.top, left: pos.left, width: 280 }}
          className="fixed z-[999] bg-[var(--surface)] border border-[var(--gold)] rounded-xl shadow-2xl p-4 pointer-events-auto"
        >
          {/* Arrow */}
          {pos.arrowSide === 'top' && (
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-[var(--surface)] border-l border-t border-[var(--gold)] rotate-45" />
          )}
          {pos.arrowSide === 'bottom' && (
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-[var(--surface)] border-r border-b border-[var(--gold)] rotate-45" />
          )}
          {pos.arrowSide === 'left' && (
            <div className="absolute -left-2 top-6 w-3 h-3 bg-[var(--surface)] border-l border-b border-[var(--gold)] rotate-45" />
          )}
          {pos.arrowSide === 'right' && (
            <div className="absolute -right-2 top-6 w-3 h-3 bg-[var(--surface)] border-r border-t border-[var(--gold)] rotate-45" />
          )}

          <p className="text-[10px] font-semibold text-[var(--gold)] uppercase tracking-widest mb-1">
            {step + 1} / {STEPS.length}
          </p>
          <h3 className="text-[var(--ink)] font-bold text-sm mb-1">{current.title}</h3>
          <p className="text-[var(--ink)]/70 text-xs leading-relaxed">{current.body}</p>

          <div className="flex items-center justify-between mt-3">
            <button
              onClick={(e) => { e.stopPropagation(); finish() }}
              className="text-[var(--ink)]/40 text-xs hover:text-[var(--ink)]/70 transition"
            >
              Skip tour
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); next() }}
              className="px-3 py-1 rounded-md bg-[var(--gold)] text-[var(--ink)] text-xs font-semibold hover:opacity-90 transition"
            >
              {isLast ? 'Done 🎉' : 'Next →'}
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </>
  )
}
