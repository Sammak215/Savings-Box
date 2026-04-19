'use client'

import { useState } from 'react'
import { saveLicense } from '@/utils/licenseUtils'

interface Props {
  onUnlocked: () => void
}

export default function LicenseInput({ onUnlocked }: Props) {
  const [key, setKey] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!key.trim()) return
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/verify-license', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ licenseKey: key.trim() }),
      })
      const data = await res.json()

      if (data.success) {
        saveLicense(key.trim())
        onUnlocked()
      } else {
        setError(data.error || 'Verification failed.')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-full">
      <input
        type="text"
        value={key}
        onChange={(e) => setKey(e.target.value)}
        placeholder="XXXXXXXX-XXXXXXXX-XXXXXXXX-XXXXXXXX"
        className="w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--ink)] placeholder:text-[var(--ink)]/40 focus:outline-none focus:ring-2 focus:ring-[var(--gold)] font-mono text-sm"
        disabled={loading}
        autoComplete="off"
        spellCheck={false}
      />
      {error && (
        <p className="text-red-500 text-sm text-center">{error}</p>
      )}
      <button
        type="submit"
        disabled={loading || !key.trim()}
        className="w-full py-3 rounded-lg bg-[var(--gold)] text-[var(--ink)] font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            Verifying…
          </>
        ) : (
          'Unlock Access'
        )}
      </button>
    </form>
  )
}
