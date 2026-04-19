import type { SavedState } from '@/types'

const SLOTS_KEY = 'sb_save_slots'
const THEME_KEY = 'sb_theme'
const ACTIVE_SLOT_KEY = 'sb_active_slot'

export function getSaveSlots(): Record<string, SavedState> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem(SLOTS_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export function writeSaveSlots(slots: Record<string, SavedState>): void {
  localStorage.setItem(SLOTS_KEY, JSON.stringify(slots))
}

export function getTheme(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(THEME_KEY)
}

export function setThemeStorage(theme: string): void {
  localStorage.setItem(THEME_KEY, theme)
}

export function getActiveSlot(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(ACTIVE_SLOT_KEY)
}

export function setActiveSlot(name: string): void {
  localStorage.setItem(ACTIVE_SLOT_KEY, name)
}
