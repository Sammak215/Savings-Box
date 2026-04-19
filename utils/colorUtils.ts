const PALETTE = [
  '#e63946', '#457b9d', '#2a9d8f', '#e9c46a', '#f4a261',
  '#264653', '#a8dadc', '#6d6875', '#b5838d', '#48cae4',
  '#70e000', '#9b5de5', '#f15bb5', '#fee440', '#00bbf9',
]

export function assignColor(index: number): string {
  return PALETTE[index % PALETTE.length]
}

export function getContrastText(hexColor: string): string {
  const hex = hexColor.replace('#', '')
  const r = parseInt(hex.slice(0, 2), 16)
  const g = parseInt(hex.slice(2, 4), 16)
  const b = parseInt(hex.slice(4, 6), 16)
  // Relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.5 ? '#0f0e0c' : '#f5f0e8'
}

export function hexToARGB(hex: string): string {
  const clean = hex.replace('#', '')
  return 'FF' + clean.toUpperCase()
}
