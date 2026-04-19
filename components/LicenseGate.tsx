'use client'

import { useState } from 'react'
import LicenseInput from './LicenseInput'

// Update this URL after creating your Gumroad product
const GUMROAD_PRODUCT_URL = 'https://gumroad.com/l/savings-box'

const FEATURES = [
  'Visual savings grid — up to 30×30 cells',
  'Multiple denominations with custom colors',
  'Random fill with target amount solver',
  'Export as CSV, XLSX, or PNG',
  'Multiple save slots — never lose progress',
  'Dark, light & high-contrast themes',
]

interface Props {
  onUnlocked: () => void
}

export default function LicenseGate({ onUnlocked }: Props) {
  const [showInput, setShowInput] = useState(false)

  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        {/* Logo / title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[var(--gold)] text-[var(--ink)] text-3xl mb-4">
            🪙
          </div>
          <h1 className="text-4xl font-bold text-[var(--ink)] tracking-tight">
            Savings Box
          </h1>
          <p className="mt-2 text-[var(--ink)]/60">
            Track your savings visually, one cell at a time.
          </p>
        </div>

        {/* Feature list */}
        <ul className="mb-8 space-y-2">
          {FEATURES.map((f) => (
            <li key={f} className="flex items-center gap-2 text-[var(--ink)]/80 text-sm">
              <span className="text-[var(--gold)] font-bold">✓</span>
              {f}
            </li>
          ))}
        </ul>

        {/* CTA */}
        <a
          href={GUMROAD_PRODUCT_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full py-3 rounded-lg bg-[var(--gold)] text-[var(--ink)] font-semibold text-center hover:opacity-90 transition mb-4"
        >
          Get Access →
        </a>

        {/* Already purchased */}
        {!showInput ? (
          <button
            onClick={() => setShowInput(true)}
            className="w-full py-2 text-[var(--ink)]/50 hover:text-[var(--ink)]/80 text-sm transition"
          >
            Already purchased? Enter your license key
          </button>
        ) : (
          <div className="mt-2">
            <p className="text-[var(--ink)]/60 text-xs text-center mb-3">
              Enter the license key from your Gumroad receipt email.
            </p>
            <LicenseInput onUnlocked={onUnlocked} />
          </div>
        )}
      </div>
    </div>
  )
}
