'use client'

import { useEffect } from 'react'
import { useSavingsStore } from '@/store/useSavingsStore'

export function useKeyboardShortcuts() {
  const denoms = useSavingsStore((s) => s.denoms)
  const selectDenom = useSavingsStore((s) => s.selectDenom)
  const fillRandom = useSavingsStore((s) => s.fillRandom)
  const undo = useSavingsStore((s) => s.undo)
  const saveSlotAction = useSavingsStore((s) => s.saveSlotAction)
  const activeSlot = useSavingsStore((s) => s.activeSlot)

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return

      const key = e.key

      // 1–9: select denom by index
      if (/^[1-9]$/.test(key)) {
        const idx = parseInt(key) - 1
        if (idx < denoms.length) selectDenom(denoms[idx].value)
        return
      }

      // 0 or E: eraser
      if (key === '0' || key === 'e' || key === 'E') {
        selectDenom(null)
        return
      }

      // R: random fill
      if (key === 'r' || key === 'R') {
        fillRandom()
        return
      }

      // Cmd+Z / Ctrl+Z: undo
      if ((e.metaKey || e.ctrlKey) && key === 'z') {
        e.preventDefault()
        undo()
        return
      }

      // Cmd+S / Ctrl+S: save to active slot
      if ((e.metaKey || e.ctrlKey) && key === 's') {
        e.preventDefault()
        saveSlotAction(activeSlot)
        return
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [denoms, selectDenom, fillRandom, undo, saveSlotAction, activeSlot])
}
