'use client'

import { useEffect, useRef } from 'react'

interface AdUnitProps {
  slot: string
  format?: 'auto' | 'rectangle' | 'horizontal' | 'vertical'
  className?: string
}

/** True in `next dev` — AdSense almost never fills on localhost, so we show a layout preview instead. */
const useLocalAdPlaceholder =
  process.env.NODE_ENV === 'development' &&
  process.env.NEXT_PUBLIC_ADSENSE_PLACEHOLDER !== 'false'

export default function AdUnit({ slot, format = 'auto', className }: AdUnitProps) {
  const initialized = useRef(false)
  const client = process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID
  const adSlot = slot?.trim() ?? ''

  useEffect(() => {
    if (useLocalAdPlaceholder) return
    if (!client || !adSlot) return
    if (initialized.current) return
    initialized.current = true
    try {
      // @ts-ignore
      ;(window.adsbygoogle = window.adsbygoogle || []).push({})
    } catch {
      // AdSense not loaded (adblocker, dev mode, etc.) — fail silently
    }
  }, [client, adSlot])

  if (useLocalAdPlaceholder) {
    return (
      <div
        className={`flex flex-col items-center justify-center gap-0.5 border border-dashed border-[var(--border)] bg-[var(--surface)]/90 text-[var(--ink)]/50 ${className ?? ''}`}
        data-ad-placeholder="true"
      >
        <span className="text-[10px] font-medium uppercase tracking-wide">Ad preview (local)</span>
        {adSlot ? (
          <span className="text-[10px] opacity-80">
            slot {adSlot} · {format}
          </span>
        ) : (
          <span className="text-[10px] opacity-80">set NEXT_PUBLIC_ADSENSE_SLOT_* in .env.local</span>
        )}
      </div>
    )
  }

  if (!client || !adSlot) return null

  return (
    <div className={className}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={client}
        data-ad-slot={adSlot}
        data-ad-format={format}
        data-full-width-responsive="true"
        data-adtest={process.env.NODE_ENV === 'development' ? 'on' : undefined}
      />
    </div>
  )
}
