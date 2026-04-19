'use client'

import { useRef, useState } from 'react'
import { useSavingsStore } from '@/store/useSavingsStore'
import type { Theme } from '@/types'

const THEME_ICONS: Record<Theme, string> = {
  light: '☀️',
  dark: '🌙',
  contrast: '◑',
}

const THEMES: Theme[] = ['light', 'dark', 'contrast']

export default function Header() {
  const title = useSavingsStore((s) => s.title)
  const theme = useSavingsStore((s) => s.theme)
  const activeSlot = useSavingsStore((s) => s.activeSlot)
  const saveSlots = useSavingsStore((s) => s.saveSlots)
  const setTitle = useSavingsStore((s) => s.setTitle)
  const setTheme = useSavingsStore((s) => s.setTheme)
  const saveSlotAction = useSavingsStore((s) => s.saveSlotAction)
  const loadSlotAction = useSavingsStore((s) => s.loadSlotAction)
  const deleteSlotAction = useSavingsStore((s) => s.deleteSlotAction)

  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(title)
  const [showSlots, setShowSlots] = useState(false)
  const [newSlot, setNewSlot] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  function commitTitle() {
    const trimmed = draft.trim()
    if (trimmed) setTitle(trimmed)
    else setDraft(title)
    setEditing(false)
  }

  function cycleTheme() {
    const next = THEMES[(THEMES.indexOf(theme) + 1) % THEMES.length]
    setTheme(next)
  }

  const slotNames = Object.keys(saveSlots)

  return (
    <header className="flex items-center justify-between px-4 py-3 bg-[var(--surface)] border-b border-[var(--border)] gap-3 flex-wrap">
      {/* Editable title */}
      <div data-tour="title" className="flex items-center gap-2 min-w-0">
        {editing ? (
          <input
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commitTitle}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitTitle()
              if (e.key === 'Escape') { setDraft(title); setEditing(false) }
            }}
            className="text-xl font-bold bg-transparent border-b-2 border-[var(--gold)] outline-none text-[var(--ink)] min-w-0 w-56"
            autoFocus
          />
        ) : (
          <button
            onClick={() => { setDraft(title); setEditing(true) }}
            className="text-xl font-bold text-[var(--ink)] hover:text-[var(--gold)] transition truncate max-w-xs"
            title="Click to rename"
          >
            {title}
          </button>
        )}
        <span className="text-[var(--ink)]/30 text-xs hidden sm:inline">✎</span>
      </div>

      <div className="flex items-center gap-2">
        {/* Save slots */}
        <div className="relative">
          <button
            onClick={() => setShowSlots(!showSlots)}
            className="px-3 py-1.5 rounded-md bg-[var(--bg)] border border-[var(--border)] text-[var(--ink)] text-sm hover:border-[var(--gold)] transition"
          >
            Slot: <span className="font-medium">{activeSlot}</span> ▾
          </button>
          {showSlots && (
            <div className="absolute right-0 top-full mt-1 z-50 bg-[var(--surface)] border border-[var(--border)] rounded-lg shadow-lg min-w-48 py-1">
              {slotNames.length === 0 && (
                <p className="px-3 py-2 text-[var(--ink)]/50 text-xs">No saved slots</p>
              )}
              {slotNames.map((name) => (
                <div key={name} className="flex items-center justify-between px-3 py-1.5 hover:bg-[var(--bg)] group">
                  <button
                    onClick={() => { loadSlotAction(name); setShowSlots(false) }}
                    className={`text-sm flex-1 text-left ${name === activeSlot ? 'font-semibold text-[var(--gold)]' : 'text-[var(--ink)]'}`}
                  >
                    {name}
                  </button>
                  <button
                    onClick={() => deleteSlotAction(name)}
                    className="text-red-400 text-xs opacity-0 group-hover:opacity-100 transition ml-2"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <div className="border-t border-[var(--border)] mt-1 pt-1 px-3 pb-2 flex gap-1">
                <input
                  value={newSlot}
                  onChange={(e) => setNewSlot(e.target.value)}
                  placeholder="New slot name…"
                  className="flex-1 text-xs px-2 py-1 rounded bg-[var(--bg)] border border-[var(--border)] text-[var(--ink)] outline-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newSlot.trim()) {
                      saveSlotAction(newSlot.trim())
                      setNewSlot('')
                      setShowSlots(false)
                    }
                  }}
                />
                <button
                  onClick={() => {
                    if (newSlot.trim()) { saveSlotAction(newSlot.trim()); setNewSlot(''); setShowSlots(false) }
                    else saveSlotAction(activeSlot)
                    setShowSlots(false)
                  }}
                  className="text-xs px-2 py-1 bg-[var(--gold)] text-[var(--ink)] rounded font-medium"
                >
                  Save
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Theme toggle */}
        <button
          onClick={cycleTheme}
          title={`Theme: ${theme}`}
          className="w-9 h-9 flex items-center justify-center rounded-md bg-[var(--bg)] border border-[var(--border)] hover:border-[var(--gold)] transition text-lg"
        >
          {THEME_ICONS[theme]}
        </button>
      </div>
    </header>
  )
}
