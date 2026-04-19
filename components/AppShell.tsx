'use client'

import { useEffect, useRef } from 'react'
import { useSavingsStore } from '@/store/useSavingsStore'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import Header from './Header'
import SetupPanel from './SetupPanel'
import DenomPicker from './DenomPicker'
import Grid from './Grid'
import StatsPanel from './StatsPanel'
import Toolbar from './Toolbar'

export default function AppShell() {
  const hydrateFromStorage = useSavingsStore((s) => s.hydrateFromStorage)
  const gridRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    hydrateFromStorage()
  }, [hydrateFromStorage])

  useKeyboardShortcuts()

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Header />
      <SetupPanel />
      <Toolbar gridRef={gridRef} />

      <div className="flex flex-1 overflow-hidden">
        {/* Denom picker sidebar */}
        <div className="overflow-y-auto flex-shrink-0">
          <DenomPicker />
        </div>

        {/* Grid area */}
        <div className="flex-1 overflow-auto">
          <Grid ref={gridRef} />
        </div>

        {/* Stats sidebar */}
        <div className="overflow-y-auto flex-shrink-0 hidden lg:block">
          <StatsPanel />
        </div>
      </div>

      {/* Mobile stats below grid */}
      <div className="lg:hidden border-t border-[var(--border)]">
        <StatsPanel />
      </div>
    </div>
  )
}
