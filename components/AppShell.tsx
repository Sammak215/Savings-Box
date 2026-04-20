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
import Tour from './Tour'
import AdUnit from './ads/AdUnit'

export default function AppShell() {
  const hydrateFromStorage = useSavingsStore((s) => s.hydrateFromStorage)
  const gridRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    hydrateFromStorage()
  }, [hydrateFromStorage])

  useKeyboardShortcuts()

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Tour />
      <Header />
      <SetupPanel />
      <Toolbar gridRef={gridRef} />

      <main className="flex flex-1 flex-col min-h-0 min-w-0">
        <div className="flex flex-1 overflow-hidden min-h-0">
          {/* Denom picker sidebar */}
          <div className="overflow-y-auto flex-shrink-0">
            <DenomPicker />
          </div>

          {/* Grid area */}
          <div className="flex-1 overflow-auto min-w-0">
            <Grid ref={gridRef} />
          </div>

          {/* Stats sidebar */}
          <div className="overflow-y-auto flex-shrink-0 hidden lg:block">
            <StatsPanel />
          </div>
        </div>

        {/* Ads only below primary content, with publisher copy — not on navigation-only chrome */}
        <section
          className="flex-shrink-0 border-t border-[var(--border)] bg-[var(--surface)]/40 px-4 py-3"
          aria-label="About Savings Box"
        >
          <p className="text-sm text-[var(--ink)]/75 max-w-3xl mb-3 leading-relaxed">
            Savings Box is a visual cash savings tracker: choose bill and coin denominations, fill grid cells as
            you set money aside, set a savings target, and follow your progress in the stats panel. Export your
            grid to CSV, XLSX, or PNG when you need a record outside the app.
          </p>
          <AdUnit
            slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_BOTTOM ?? ''}
            format="horizontal"
            className="w-full min-h-[90px] flex items-center justify-center"
          />
        </section>

        {/* Mobile stats below grid */}
        <div className="lg:hidden border-t border-[var(--border)]">
          <StatsPanel />
        </div>
      </main>
    </div>
  )
}
