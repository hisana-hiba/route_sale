import { useState, useMemo } from 'react'
import {
  Box,
  Button,
  Typography,
  TextField,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import DescriptionIcon from '@mui/icons-material/Description'
import GridOnIcon from '@mui/icons-material/GridOn'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import { PageShell, whiteCardSx } from '@/components/ui/PageShell'
import { v, mix } from '@/theme/cssVars'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Transaction {
  id: string
  date: string
  invoiceNo: string
  account: string
  narration: string
  paidBy: string
  cash: number
  branch: string
  ref: string
}

interface DayBookRow {
  id: string
  date: string
  invoiceNo: string
  account: string
  narration: string
  paidBy: string
  title: string
  debit: number | null
  credit: number | null
  branch: string
  ref: string
}

interface LedgerRow {
  id: string
  date: string
  voucherNo: string
  branch: string
  accountGroup: string
  account: string
  voucherType: string
  debit: number | null
  credit: number | null
}

interface CashRow {
  id: string
  date: string
  voucherNo: string
  branch: string
  voucherType: string
  description: string
  debit: number | null
  credit: number | null
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_TRANSACTIONS: Transaction[] = [
  { id: '1', date: 'July 06, 2026, 12:00 AM', invoiceNo: 'SN6', account: 'Gayathri', narration: 'Amount Received By Service', paidBy: 'Gayathri 9781227508 - Receivable', cash: 1000.0, branch: 'Nexcrest It', ref: 'SN6' },
  { id: '2', date: 'July 02, 2026, 12:00 AM', invoiceNo: 'INV-26071', account: 'Seema', narration: 'Amount Received By Sale', paidBy: 'Cash Account', cash: 600.0, branch: 'Nexcrest It', ref: 'SL1' },
  { id: '3', date: 'July 02, 2026, 12:00 AM', invoiceNo: 'INV-123', account: 'Test Supplier', narration: 'Amount Paid By Purchase', paidBy: 'Purchase Account', cash: 5000.0, branch: 'Nexcrest It', ref: 'PR1' },
  { id: '4', date: 'July 02, 2026, 12:00 AM', invoiceNo: 'INV-26072', account: 'Seema', narration: 'Amount Received By Sale', paidBy: 'Sales Account', cash: 630.0, branch: 'Nexcrest It', ref: 'SL2' },
]

const MOCK_DAYBOOK: DayBookRow[] = [
  { id: '1', date: 'July 17, 2026', invoiceNo: 'None', account: 'Opening Balance', narration: 'Opening Balance', paidBy: '', title: 'Opening Balance', debit: null, credit: 0.0, branch: 'Nexcrest It', ref: 'None' },
  { id: '2', date: 'July 17, 2026', invoiceNo: 'None', account: 'Closing Balance', narration: 'Closing Balance', paidBy: '', title: 'Closing Balance', debit: 0.0, credit: null, branch: 'Nexcrest It', ref: 'None' },
]

const MOCK_LEDGER: LedgerRow[] = [
  { id: '1', date: '06-07-2026', voucherNo: 'SN6', branch: 'Nexcrest It', accountGroup: 'Accounts Receivable', account: 'Gayathri 9781227508 - Receivable', voucherType: 'Service Entry Transaction', debit: null, credit: 1000.0 },
  { id: '2', date: '06-07-2026', voucherNo: 'SN6', branch: 'Nexcrest It', accountGroup: 'Cash in Hand', account: 'Cash Account', voucherType: 'Service Entry Transaction', debit: 1000.0, credit: null },
  { id: '3', date: '02-07-2026', voucherNo: 'INV-26072', branch: 'Nexcrest It', accountGroup: 'Accounts Receivable', account: 'Seema 7878909000 - Receivable', voucherType: 'Sales Invoice', debit: 630.0, credit: null },
  { id: '4', date: '02-07-2026', voucherNo: 'INV-26072', branch: 'Nexcrest It', accountGroup: 'Direct Income', account: 'Sales Account', voucherType: 'Sales Invoice', debit: null, credit: 600.0 },
  { id: '5', date: '02-07-2026', voucherNo: 'INV-26072', branch: 'Nexcrest It', accountGroup: 'Output Tax', account: 'CGST5%', voucherType: 'Sales Invoice', debit: null, credit: 30.0 },
  { id: '6', date: '02-07-2026', voucherNo: 'INV-26071', branch: 'Nexcrest It', accountGroup: 'Cash in Hand', account: 'Cash Account', voucherType: 'Sales Invoice', debit: 600.0, credit: null },
  { id: '7', date: '02-07-2026', voucherNo: 'INV-26071', branch: 'Nexcrest It', accountGroup: 'Direct Income', account: 'Sales Account', voucherType: 'Sales Invoice', debit: null, credit: 600.0 },
  { id: '8', date: '02-07-2026', voucherNo: 'INV-123', branch: 'Nexcrest It', accountGroup: 'Cash in Hand', account: 'Cash Account', voucherType: 'Purchase Invoice', debit: null, credit: 5000.0 },
  { id: '9', date: '02-07-2026', voucherNo: 'INV-123', branch: 'Nexcrest It', accountGroup: 'Direct Expense', account: 'Purchase Account', voucherType: 'Purchase Invoice', debit: 5000.0, credit: null },
]

const CASH_OPENING = 3400.0
const CASH_ROWS: CashRow[] = []
const DATE_RANGE = '17-07-2026 - 17-07-2026'
const BRANCH = 'Nexcrest It'

// ─── Tabs ─────────────────────────────────────────────────────────────────────

type TabId = 'transactions' | 'day-book' | 'cash-book' | 'general-ledger' | 'bank-book'

const TABS: { id: TabId; label: string }[] = [
  { id: 'transactions', label: 'Transactions' },
  { id: 'day-book', label: 'Day Book' },
  { id: 'cash-book', label: 'Cash Book' },
  { id: 'general-ledger', label: 'General Ledger' },
  { id: 'bank-book', label: 'Bank Book' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n: number | null) => (n === null ? '' : n.toFixed(2))

function downloadFile(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function toCsv(headers: string[], rows: (string | number)[][]) {
  const esc = (val: string | number) => `"${String(val).replace(/"/g, '""')}"`
  return [headers.map(esc).join(','), ...rows.map((r) => r.map(esc).join(','))].join('\n')
}

function exportData(name: string, headers: string[], rows: (string | number)[][], kind: 'csv' | 'excel' | 'pdf') {
  if (kind === 'csv') {
    downloadFile(`${name}.csv`, toCsv(headers, rows), 'text/csv;charset=utf-8;')
    return
  }
  if (kind === 'excel') {
    const table = `<table><thead><tr>${headers.map((h) => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rows
      .map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`)
      .join('')}</tbody></table>`
    downloadFile(`${name}.xls`, table, 'application/vnd.ms-excel')
    return
  }
  const win = window.open('', '_blank')
  if (!win) return
  win.document.write(
    `<html><head><title>${name}</title><style>body{font-family:'Plus Jakarta Sans',Inter,system-ui,sans-serif;padding:24px}h2{color:#111827}table{border-collapse:collapse;width:100%;font-size:12px}th,td{border:1px solid #e5e7eb;padding:6px 10px;text-align:left}th{background:#f3f4f6}</style></head><body><h2>${name}</h2><table><thead><tr>${headers
      .map((h) => `<th>${h}</th>`)
      .join('')}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table></body></html>`,
  )
  win.document.close()
  win.focus()
  win.print()
}

// ─── Shared UI bits ───────────────────────────────────────────────────────────

const headCellSx = {
  fontWeight: 700,
  fontSize: '0.68rem',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.05em',
  color: v.textSecondary,
  py: 1.25,
  borderBottom: `1px solid ${v.border}`,
  whiteSpace: 'nowrap' as const,
}

const bodyCellSx = { py: 1.4, fontSize: '0.82rem', color: v.textPrimary }

function CardHeader({ title, onClear }: { title: string; onClear?: () => void }) {
  return (
    <>
      <Box sx={{ px: 3, pt: 3, pb: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ width: 4, height: 26, borderRadius: 2, background: `linear-gradient(180deg, ${v.primary}, ${v.secondary})` }} />
          <Typography variant="h6" sx={{ fontWeight: 700, color: v.textPrimary }}>{title}</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <SearchIcon sx={{ color: v.textSecondary, fontSize: 20 }} />
          <Typography
            variant="body2"
            onClick={onClear}
            sx={{ color: v.primary, fontWeight: 600, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
          >
            Clear
          </Typography>
        </Box>
      </Box>
      <Divider sx={{ borderColor: v.border }} />
    </>
  )
}

function ExportButtons({ onExport }: { onExport: (kind: 'csv' | 'excel' | 'pdf') => void }) {
  const btnSx = {
    borderRadius: '10px',
    textTransform: 'none' as const,
    fontWeight: 600,
    fontSize: '0.78rem',
    borderColor: v.border,
    color: v.textSecondary,
    px: 1.75,
    '&:hover': { borderColor: v.primary, background: mix.primary(6), color: v.primary },
  }
  return (
    <Box sx={{ display: 'flex', gap: 1 }}>
      <Button variant="outlined" size="small" startIcon={<DescriptionIcon sx={{ color: v.primary }} />} sx={btnSx} onClick={() => onExport('csv')}>CSV</Button>
      <Button variant="outlined" size="small" startIcon={<GridOnIcon sx={{ color: v.success }} />} sx={btnSx} onClick={() => onExport('excel')}>Excel</Button>
      <Button variant="outlined" size="small" startIcon={<PictureAsPdfIcon sx={{ color: v.error }} />} sx={btnSx} onClick={() => onExport('pdf')}>PDF</Button>
    </Box>
  )
}

function Toolbar({ search, setSearch, onExport, placeholder }: { search: string; setSearch: (s: string) => void; onExport: (kind: 'csv' | 'excel' | 'pdf') => void; placeholder?: string }) {
  return (
    <Box sx={{ px: 3, py: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
      <TextField
        size="small"
        placeholder={placeholder ?? 'Search...'}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ width: { xs: '100%', sm: 260 }, '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
      />
      <ExportButtons onExport={onExport} />
    </Box>
  )
}

function RecordsFooter({ count }: { count: number }) {
  return (
    <Box sx={{ px: 3, py: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1.5 }}>
      <Typography variant="caption" sx={{ color: v.textSecondary }}>
        Showing {count === 0 ? 0 : 1} to {count} of {count} records
      </Typography>
      <Box sx={{ px: 2, py: 0.75, borderRadius: '8px', border: `1px solid ${v.border}` }}>
        <Typography variant="caption" sx={{ color: v.textSecondary, fontWeight: 600 }}>Page 1 of 1</Typography>
      </Box>
    </Box>
  )
}

const rowSx = (idx: number) => ({
  bgcolor: idx % 2 === 1 ? `color-mix(in srgb, ${v.primary} 2%, transparent)` : 'transparent',
  '&:hover': { bgcolor: `color-mix(in srgb, ${v.primary} 5%, transparent)` },
  transition: 'background 0.15s',
})

// ─── Transactions Tab ─────────────────────────────────────────────────────────

function TransactionsTab() {
  const [search, setSearch] = useState('')
  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return MOCK_TRANSACTIONS.filter((t) =>
      [t.invoiceNo, t.account, t.narration, t.paidBy, t.ref].some((f) => f.toLowerCase().includes(q)),
    )
  }, [search])

  const cols = ['SL', 'Date', 'Invoice/Bill No', 'Accounts', 'Narration', 'Paid By', 'Cash', 'Branch', 'ID']
  const handleExport = (kind: 'csv' | 'excel' | 'pdf') =>
    exportData('transactions', cols, filtered.map((t, i) => [i + 1, t.date, t.invoiceNo, t.account, t.narration, t.paidBy, fmt(t.cash), t.branch, t.ref]), kind)

  return (
    <Paper sx={{ ...whiteCardSx, overflow: 'hidden', p: 0 }}>
      <CardHeader title="Transactions" onClear={() => setSearch('')} />
      <Toolbar search={search} setSearch={setSearch} onExport={handleExport} />
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: mix.primary(4) }}>
              {cols.map((h) => (
                <TableCell key={h} align={h === 'Cash' ? 'right' : 'left'} sx={headCellSx}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow><TableCell colSpan={cols.length} align="center" sx={{ py: 6, color: v.textMuted }}>No records found</TableCell></TableRow>
            ) : (
              filtered.map((t, idx) => (
                <TableRow key={t.id} sx={rowSx(idx)}>
                  <TableCell sx={{ ...bodyCellSx, color: v.textSecondary }}>{idx + 1}</TableCell>
                  <TableCell sx={{ ...bodyCellSx, color: v.textSecondary, whiteSpace: 'nowrap' }}>{t.date}</TableCell>
                  <TableCell sx={{ ...bodyCellSx, fontWeight: 600 }}>{t.invoiceNo}</TableCell>
                  <TableCell sx={bodyCellSx}>{t.account}</TableCell>
                  <TableCell sx={{ ...bodyCellSx, color: v.textSecondary }}>{t.narration}</TableCell>
                  <TableCell sx={{ ...bodyCellSx, color: v.textSecondary }}>{t.paidBy}</TableCell>
                  <TableCell align="right" sx={{ ...bodyCellSx, fontWeight: 600 }}>{fmt(t.cash)}</TableCell>
                  <TableCell sx={{ ...bodyCellSx, color: v.textSecondary }}>{t.branch}</TableCell>
                  <TableCell sx={{ ...bodyCellSx, color: v.primary, fontWeight: 700 }}>{t.ref}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <RecordsFooter count={filtered.length} />
    </Paper>
  )
}

// ─── Day Book Tab ─────────────────────────────────────────────────────────────

function DayBookTab() {
  const [search, setSearch] = useState('')
  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return MOCK_DAYBOOK.filter((r) => [r.account, r.narration, r.title].some((f) => f.toLowerCase().includes(q)))
  }, [search])

  const cols = ['SL', 'Date', 'Invoice/Bill No', 'Accounts', 'Narration', 'Paid By', 'Title', 'Debit', 'Credit', 'Branch', 'ID']
  const handleExport = (kind: 'csv' | 'excel' | 'pdf') =>
    exportData('day-book', cols, filtered.map((r, i) => [i + 1, r.date, r.invoiceNo, r.account, r.narration, r.paidBy, r.title, fmt(r.debit), fmt(r.credit), r.branch, r.ref]), kind)

  return (
    <Paper sx={{ ...whiteCardSx, overflow: 'hidden', p: 0 }}>
      <CardHeader title="Day Book" onClear={() => setSearch('')} />
      <Toolbar search={search} setSearch={setSearch} onExport={handleExport} />
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: mix.primary(4) }}>
              {cols.map((h) => (
                <TableCell key={h} align={h === 'Debit' || h === 'Credit' ? 'right' : 'left'} sx={headCellSx}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((r, idx) => (
              <TableRow key={r.id} sx={rowSx(idx)}>
                <TableCell sx={{ ...bodyCellSx, color: v.textSecondary }}>{idx + 1}</TableCell>
                <TableCell sx={{ ...bodyCellSx, color: v.textSecondary, whiteSpace: 'nowrap' }}>{r.date}</TableCell>
                <TableCell sx={{ ...bodyCellSx, color: v.textMuted }}>{r.invoiceNo}</TableCell>
                <TableCell sx={{ ...bodyCellSx, fontWeight: 600 }}>{r.account}</TableCell>
                <TableCell sx={{ ...bodyCellSx, color: v.textSecondary }}>{r.narration}</TableCell>
                <TableCell sx={{ ...bodyCellSx, color: v.textSecondary }}>{r.paidBy}</TableCell>
                <TableCell sx={bodyCellSx}>{r.title}</TableCell>
                <TableCell align="right" sx={{ ...bodyCellSx, fontWeight: 600 }}>{fmt(r.debit)}</TableCell>
                <TableCell align="right" sx={{ ...bodyCellSx, fontWeight: 600 }}>{fmt(r.credit)}</TableCell>
                <TableCell sx={{ ...bodyCellSx, color: v.textSecondary }}>{r.branch}</TableCell>
                <TableCell sx={{ ...bodyCellSx, color: v.textMuted }}>{r.ref}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <RecordsFooter count={filtered.length} />
    </Paper>
  )
}

// ─── Cash Book Tab ────────────────────────────────────────────────────────────

function RangeHeader() {
  return (
    <Box sx={{ px: 3, py: 2.5 }}>
      <Typography variant="body2" sx={{ color: v.textSecondary }}>
        Date Range: <Box component="span" sx={{ color: v.textPrimary, fontWeight: 700 }}>{DATE_RANGE}</Box>
      </Typography>
      <Typography variant="body2" sx={{ color: v.textSecondary, mt: 0.5 }}>
        Branch: <Box component="span" sx={{ color: v.textPrimary, fontWeight: 700 }}>{BRANCH}</Box>
      </Typography>
    </Box>
  )
}

function CashBookTab() {
  const [search, setSearch] = useState('')
  const cols = ['Date', 'Voucher No', 'Branch', 'Voucher Type', 'Description', 'Debit', 'Credit']
  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return CASH_ROWS.filter((r) => [r.voucherNo, r.voucherType, r.description].some((f) => f.toLowerCase().includes(q)))
  }, [search])

  const handleExport = (kind: 'csv' | 'excel' | 'pdf') =>
    exportData('cash-book', cols, [
      ['', '', '', '', 'Opening Balance', '', fmt(CASH_OPENING)],
      ...filtered.map((r) => [r.date, r.voucherNo, r.branch, r.voucherType, r.description, fmt(r.debit), fmt(r.credit)]),
      ['', '', '', '', 'Closing Balance', '', fmt(CASH_OPENING)],
    ], kind)

  const balanceRowSx = { bgcolor: mix.primary(5) }
  const balanceCellSx = { py: 1.4, fontSize: '0.82rem', fontWeight: 700, color: v.textPrimary, border: 'none' }

  return (
    <Paper sx={{ ...whiteCardSx, overflow: 'hidden', p: 0 }}>
      <CardHeader title="Cash Book" onClear={() => setSearch('')} />
      <RangeHeader />
      <Divider sx={{ borderColor: v.border }} />
      <Box sx={{ px: 3, pt: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: v.textPrimary }}>Cash Account</Typography>
      </Box>
      <Toolbar search={search} setSearch={setSearch} onExport={handleExport} placeholder="Search transactions..." />
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: mix.primary(4) }}>
              {cols.map((h) => (
                <TableCell key={h} align={h === 'Debit' || h === 'Credit' ? 'right' : 'left'} sx={headCellSx}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow sx={balanceRowSx}>
              <TableCell sx={balanceCellSx}>Opening Balance</TableCell>
              <TableCell sx={balanceCellSx} />
              <TableCell sx={balanceCellSx} />
              <TableCell sx={balanceCellSx} />
              <TableCell sx={balanceCellSx} />
              <TableCell align="right" sx={balanceCellSx} />
              <TableCell align="right" sx={balanceCellSx}>{CASH_OPENING.toFixed(1)}</TableCell>
            </TableRow>
            {filtered.length === 0 ? (
              <TableRow><TableCell colSpan={cols.length} align="center" sx={{ py: 3, color: v.textMuted, fontSize: '0.82rem' }}>No transactions found for this period</TableCell></TableRow>
            ) : (
              filtered.map((r, idx) => (
                <TableRow key={r.id} sx={rowSx(idx)}>
                  <TableCell sx={bodyCellSx}>{r.date}</TableCell>
                  <TableCell sx={bodyCellSx}>{r.voucherNo}</TableCell>
                  <TableCell sx={{ ...bodyCellSx, color: v.textSecondary }}>{r.branch}</TableCell>
                  <TableCell sx={{ ...bodyCellSx, color: v.textSecondary }}>{r.voucherType}</TableCell>
                  <TableCell sx={{ ...bodyCellSx, color: v.textSecondary }}>{r.description}</TableCell>
                  <TableCell align="right" sx={bodyCellSx}>{fmt(r.debit)}</TableCell>
                  <TableCell align="right" sx={bodyCellSx}>{fmt(r.credit)}</TableCell>
                </TableRow>
              ))
            )}
            <TableRow sx={balanceRowSx}>
              <TableCell sx={balanceCellSx}>Closing Balance</TableCell>
              <TableCell sx={balanceCellSx} />
              <TableCell sx={balanceCellSx} />
              <TableCell sx={balanceCellSx} />
              <TableCell sx={balanceCellSx} />
              <TableCell align="right" sx={balanceCellSx} />
              <TableCell align="right" sx={balanceCellSx}>{CASH_OPENING.toFixed(1)}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
      <Box sx={{ py: 1 }} />
    </Paper>
  )
}

// ─── General Ledger Tab ───────────────────────────────────────────────────────

function GeneralLedgerTab() {
  const [search, setSearch] = useState('')
  const cols = ['Date', 'Voucher No', 'Branch', 'Account Group', 'Account', 'Voucher Type', 'Debit', 'Credit']
  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return MOCK_LEDGER.filter((r) => [r.voucherNo, r.accountGroup, r.account, r.voucherType].some((f) => f.toLowerCase().includes(q)))
  }, [search])

  const handleExport = (kind: 'csv' | 'excel' | 'pdf') =>
    exportData('general-ledger', cols, filtered.map((r) => [r.date, r.voucherNo, r.branch, r.accountGroup, r.account, r.voucherType, fmt(r.debit), fmt(r.credit)]), kind)

  return (
    <Paper sx={{ ...whiteCardSx, overflow: 'hidden', p: 0 }}>
      <CardHeader title="General Ledger" onClear={() => setSearch('')} />
      <Toolbar search={search} setSearch={setSearch} onExport={handleExport} />
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: mix.primary(4) }}>
              {cols.map((h) => (
                <TableCell key={h} align={h === 'Debit' || h === 'Credit' ? 'right' : 'left'} sx={headCellSx}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((r, idx) => (
              <TableRow key={r.id} sx={rowSx(idx)}>
                <TableCell sx={{ ...bodyCellSx, color: v.textSecondary, whiteSpace: 'nowrap' }}>{r.date}</TableCell>
                <TableCell sx={{ ...bodyCellSx, fontWeight: 600 }}>{r.voucherNo}</TableCell>
                <TableCell sx={{ ...bodyCellSx, color: v.textSecondary }}>{r.branch}</TableCell>
                <TableCell sx={{ ...bodyCellSx, color: v.textSecondary }}>{r.accountGroup}</TableCell>
                <TableCell sx={bodyCellSx}>{r.account}</TableCell>
                <TableCell sx={{ ...bodyCellSx, color: v.textSecondary }}>{r.voucherType}</TableCell>
                <TableCell align="right" sx={{ ...bodyCellSx, fontWeight: 600, color: r.debit ? v.textPrimary : v.textMuted }}>{fmt(r.debit)}</TableCell>
                <TableCell align="right" sx={{ ...bodyCellSx, fontWeight: 600, color: r.credit ? v.success : v.textMuted }}>{fmt(r.credit)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <RecordsFooter count={filtered.length} />
    </Paper>
  )
}

// ─── Bank Book Tab ────────────────────────────────────────────────────────────

function BankBookTab() {
  return (
    <Paper sx={{ ...whiteCardSx, overflow: 'hidden', p: 0 }}>
      <CardHeader title="Bank Book" />
      <RangeHeader />
      <Divider sx={{ borderColor: v.border }} />
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1.75, borderRadius: '10px', bgcolor: v.infoSoft }}>
          <InfoOutlinedIcon sx={{ color: v.info, fontSize: 20 }} />
          <Typography variant="body2" sx={{ color: v.info, fontWeight: 500 }}>
            No bank accounts found for the selected branch and date range.
          </Typography>
        </Box>
      </Box>
    </Paper>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

interface TransactionsPageProps {
  defaultTab?: TabId
  title?: string
}

export function TransactionsPage({ defaultTab = 'transactions', title = 'Transactions' }: TransactionsPageProps = {}) {
  const [activeTab, setActiveTab] = useState<TabId>(defaultTab)

  return (
    <PageShell
      title={title}
      subtitle="View transactions, day book, cash book, general ledger, and bank book"
      breadcrumbs={[
        { label: 'Home', path: '/' },
        { label: 'Accounting', path: '/accounting/accounts' },
        { label: title },
      ]}
    >
      {/* ── Tab Bar ── */}
      <Box sx={{ display: 'flex', gap: 0, mb: 3, borderBottom: `1px solid ${v.border}`, overflowX: 'auto' }}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <Box
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              sx={{
                px: 2.5,
                py: 1.5,
                cursor: 'pointer',
                position: 'relative',
                whiteSpace: 'nowrap',
                fontFamily: 'Plus Jakarta Sans, Inter, system-ui, sans-serif',
                fontSize: '0.875rem',
                fontWeight: isActive ? 700 : 500,
                color: isActive ? v.primary : v.textSecondary,
                transition: 'color 0.18s',
                '&:hover': { color: isActive ? v.primary : v.textPrimary },
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: -1,
                  left: 0,
                  right: 0,
                  height: 2,
                  borderRadius: '2px 2px 0 0',
                  background: isActive ? `linear-gradient(90deg, ${v.primary}, ${v.secondary})` : 'transparent',
                  transition: 'background 0.18s',
                },
              }}
            >
              {tab.label}
            </Box>
          )
        })}
      </Box>

      {/* ── Tab Content ── */}
      <Box>
        {activeTab === 'transactions' && <TransactionsTab />}
        {activeTab === 'day-book' && <DayBookTab />}
        {activeTab === 'cash-book' && <CashBookTab />}
        {activeTab === 'general-ledger' && <GeneralLedgerTab />}
        {activeTab === 'bank-book' && <BankBookTab />}
      </Box>
    </PageShell>
  )
}
