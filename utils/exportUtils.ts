import * as XLSX from 'xlsx'
import type { DenomConfig } from '@/types'
import { hexToARGB } from './colorUtils'
import { formatDate } from './formatUtils'

export function exportCSV(
  cells: Array<number | null>,
  cols: number,
  title: string
): void {
  const rows: string[][] = [
    Array.from({ length: cols }, (_, i) => `Col${i + 1}`),
  ]

  for (let r = 0; r < Math.ceil(cells.length / cols); r++) {
    const row: string[] = []
    for (let c = 0; c < cols; c++) {
      const val = cells[r * cols + c]
      row.push(val != null ? String(val) : '')
    }
    rows.push(row)
  }

  const csv = rows.map((r) => r.join(',')).join('\n')
  downloadBlob(
    new Blob([csv], { type: 'text/csv' }),
    `${title}-${formatDate(Date.now())}.csv`
  )
}

export function exportXLSX(
  cells: Array<number | null>,
  cols: number,
  title: string,
  denoms: DenomConfig[],
  target: number | null,
  totalSaved: number
): void {
  const colorMap: Record<number, string> = {}
  for (const d of denoms) colorMap[d.value] = d.color

  const wb = XLSX.utils.book_new()

  // Grid sheet
  const gridData: (number | string)[][] = [
    Array.from({ length: cols }, (_, i) => `Col${i + 1}`),
  ]
  const rows = Math.ceil(cells.length / cols)
  for (let r = 0; r < rows; r++) {
    const row: (number | string)[] = []
    for (let c = 0; c < cols; c++) {
      const val = cells[r * cols + c]
      row.push(val != null ? val : '')
    }
    gridData.push(row)
  }

  const ws = XLSX.utils.aoa_to_sheet(gridData)

  // Color the cells
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const val = cells[r * cols + c]
      if (val != null && colorMap[val]) {
        const addr = XLSX.utils.encode_cell({ r: r + 1, c })
        if (!ws[addr]) continue
        ws[addr].s = {
          fill: {
            patternType: 'solid',
            fgColor: { argb: hexToARGB(colorMap[val]) },
          },
        }
      }
    }
  }

  XLSX.utils.book_append_sheet(wb, ws, 'Grid')

  // Summary sheet
  const summaryData = [
    ['Summary', ''],
    ['Title', title],
    ['Date', formatDate(Date.now())],
    ['Total Saved', totalSaved],
    ['Target', target ?? 'N/A'],
    ['Remaining', target != null ? Math.max(0, target - totalSaved) : 'N/A'],
    ['% Complete', target != null ? `${Math.round((totalSaved / target) * 100)}%` : 'N/A'],
    [],
    ['Denomination Breakdown', ''],
    ['Value', 'Count', 'Subtotal'],
    ...denoms.map((d) => {
      const count = cells.filter((c) => c === d.value).length
      return [d.value, count, count * d.value]
    }),
  ]
  const ws2 = XLSX.utils.aoa_to_sheet(summaryData)
  XLSX.utils.book_append_sheet(wb, ws2, 'Summary')

  XLSX.writeFile(wb, `${title}-${formatDate(Date.now())}.xlsx`)
}

export async function exportPNG(
  gridRef: HTMLElement,
  title: string
): Promise<void> {
  const html2canvas = (await import('html2canvas')).default

  const canvas = await html2canvas(gridRef, {
    backgroundColor: null,
    scale: 2,
    useCORS: true,
  })

  const out = document.createElement('canvas')
  const padding = 40
  const headerH = 60
  out.width = canvas.width + padding * 2
  out.height = canvas.height + padding * 2 + headerH

  const ctx = out.getContext('2d')!
  ctx.fillStyle = '#f5f0e8'
  ctx.fillRect(0, 0, out.width, out.height)

  ctx.fillStyle = '#0f0e0c'
  ctx.font = 'bold 28px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText(title, out.width / 2, padding + 28)

  ctx.font = '14px sans-serif'
  ctx.fillStyle = '#888'
  ctx.fillText(formatDate(Date.now()), out.width / 2, padding + 50)

  ctx.drawImage(canvas, padding, padding + headerH)

  const link = document.createElement('a')
  link.download = `${title}-${formatDate(Date.now())}.png`
  link.href = out.toDataURL('image/png')
  link.click()
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
