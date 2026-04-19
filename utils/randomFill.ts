export type FillOutcome = { cells: number[] } | { error: string }

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
    const cells = Array.from({ length: cellCount }, () =>
      sorted[Math.floor(Math.random() * sorted.length)]
    )
    return { cells: fisherYates(cells) }
  }

  const minPossible = min * cellCount
  const maxPossible = max * cellCount

  if (target < minPossible || target > maxPossible) {
    return {
      error: `Target ${target.toLocaleString()} is not achievable with ${cellCount} cells and these denominations. Valid range: ${minPossible.toLocaleString()} – ${maxPossible.toLocaleString()}`,
    }
  }

  const result: number[] = []
  let remaining = target

  for (let i = 0; i < cellCount; i++) {
    const slotsLeft = cellCount - i
    const maxPick = Math.min(max, remaining - min * (slotsLeft - 1))
    const minPick = Math.max(min, remaining - max * (slotsLeft - 1))
    const valid = sorted.filter((d) => d >= minPick && d <= maxPick)
    if (valid.length === 0) return { error: 'Could not find a valid distribution. Try different denominations or target.' }
    const pick = valid[Math.floor(Math.random() * valid.length)]
    result.push(pick)
    remaining -= pick
  }

  return { cells: fisherYates(result) }
}

function fisherYates(arr: number[]): number[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
