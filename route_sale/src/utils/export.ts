import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export function exportToExcel<T extends Record<string, unknown>>(
  data: T[],
  filename: string,
  columns?: { key: keyof T; header: string }[],
) {
  const headers = columns ?? Object.keys(data[0] ?? {}).map((k) => ({ key: k as keyof T, header: String(k) }))
  const rows = data.map((row) =>
    headers.reduce(
      (acc, col) => {
        acc[col.header] = row[col.key]
        return acc
      },
      {} as Record<string, unknown>,
    ),
  )
  const ws = XLSX.utils.json_to_sheet(rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Data')
  XLSX.writeFile(wb, `${filename}.xlsx`)
}

export function exportToPdf<T extends Record<string, unknown>>(
  data: T[],
  filename: string,
  title: string,
  columns?: { key: keyof T; header: string }[],
) {
  const headers = columns ?? Object.keys(data[0] ?? {}).map((k) => ({ key: k as keyof T, header: String(k) }))
  const doc = new jsPDF()
  doc.setFontSize(16)
  doc.text(title, 14, 20)
  autoTable(doc, {
    startY: 28,
    head: [headers.map((c) => c.header)],
    body: data.map((row) => headers.map((c) => String(row[c.key] ?? ''))),
    styles: { fontSize: 8 },
    headStyles: { fillColor: [26, 46, 37] },
  })
  doc.save(`${filename}.pdf`)
}

export function printTable(title: string) {
  window.print()
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-IN').format(num)
}
