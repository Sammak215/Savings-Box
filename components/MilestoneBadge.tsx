'use client'

import { motion, AnimatePresence } from 'framer-motion'

const MILESTONES = [25, 50, 75, 100]

interface Props {
  percent: number
}

export default function MilestoneBadge({ percent }: Props) {
  return (
    <div className="flex gap-2 flex-wrap">
      {MILESTONES.map((m) => {
        const unlocked = percent >= m
        return (
          <AnimatePresence key={m}>
            {unlocked ? (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="flex items-center gap-1 px-2 py-1 rounded-full bg-[var(--gold)] text-[var(--ink)] text-xs font-bold"
              >
                {m === 100 ? '🏆' : '⭐'} {m}%
              </motion.div>
            ) : (
              <div className="flex items-center gap-1 px-2 py-1 rounded-full border border-[var(--border)] text-[var(--ink)]/30 text-xs">
                {m}%
              </div>
            )}
          </AnimatePresence>
        )
      })}
    </div>
  )
}
