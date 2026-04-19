export type FillOutcome = { cells: number[] } | { error: string }

const MAX_ATTEMPTS = 100

export function randomFill(
  cellCount: number,
  denoms: number[],
  target: number | null
): FillOutcome {
  if (denoms.length === 0) return { error: 'Add at least one denomination first.' }
  if (cellCount === 0) return { cells: [] }

  const sorted = [...new Set(denoms)].sort((a, b) => a - b)
  const min = sorted[0]
  const max = sorted[sorted.length - 1]

  if (target === null) {
    return { cells: fisherYates(
      Array.from({ length: cellCount }, () => sorted[Math.floor(Math.random() * sorted.length)])
    )}
  }

  const minPossible = min * cellCount
  const maxPossible = max * cellCount

  if (target < minPossible || target > maxPossible) {
    return {
      error: `Target ${target.toLocaleString()} not achievable with ${cellCount} cells. Valid range: ${minPossible.toLocaleString()} – ${maxPossible.toLocaleString()}`,
    }
  }

  // Retry the greedy pass up to MAX_ATTEMPTS times (random choices may dead-end)
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const result = greedyFill(cellCount, sorted, min, max, target)
    if (result) return { cells: fisherYates(result) }
  }

  return { error: `Could not hit target ${target.toLocaleString()} with ${cellCount} cells — try a different grid size or denominations.` }
}

function greedyFill(
  cellCount: number,
  sorted: number[],
  min: number,
  max: number,
  target: number
): number[] | null {
  const result: number[] = []
  let remaining = target

  for (let i = 0; i < cellCount; i++) {
    const slotsLeft = cellCount - i
    const maxPick = Math.min(max, remaining - min * (slotsLeft - 1))
    const minPick = Math.max(min, remaining - max * (slotsLeft - 1))
    const valid = sorted.filter((d) => d >= minPick && d <= maxPick)
    if (valid.length === 0) return null
    result.push(valid[Math.floor(Math.random() * valid.length)])
    remaining -= result[result.length - 1]
  }

  return remaining === 0 ? result : null
}

function fisherYates(arr: number[]): number[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** Returns true if target is exactly reachable using cellCount picks from denoms */
export function isFeasible(cellCount: number, denoms: number[], target: number): boolean {
  const sorted = [...new Set(denoms)].sort((a, b) => a - b)
  const min = sorted[0]
  const max = sorted[sorted.length - 1]
  if (target < min * cellCount || target > max * cellCount) return false

  // DP over possible remainders for one cell at a time
  // dp[r] = true means remainder r is reachable after some number of picks
  let reachable = new Set<number>([0])
  for (let i = 0; i < cellCount; i++) {
    const next = new Set<number>()
    for (const r of reachable) {
      for (const d of sorted) {
        const nr = r + d
        if (nr <= target) next.add(nr)
      }
    }
    reachable = next
  }
  return reachable.has(target)
}
