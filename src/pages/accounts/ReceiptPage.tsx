import { useState, useMemo } from 'react'
import {
  Box,
  Button,
  Typography,
  TextField,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Divider,
  InputAdornment,
} from '@mui/material'
import SaveIcon from '@mui/icons-material/Save'
import SearchIcon from '@mui/icons-material/Search'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import DescriptionIcon from '@mui/icons-material/Description'
import GridOnIcon from '@mui/icons-material/GridOn'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import VisibilityIcon from '@mui/icons-material/Visibility'
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong'
import { PageShell, whiteCardSx, primaryButtonSx } from '@/components/ui/PageShell'
import { v, mix } from '@/theme/cssVars'

// ─── Options ──────────────────────────────────────────────────────────────────

const ACCOUNTS = ['Cash Account', 'Bank Account - HDFC', 'Sales Account', 'Purchase Account', 'Accounts Payable', 'Accounts Receivable']
const PAYMENT_METHODS = ['Cash', 'Bank Transfer', 'Cheque', 'UPI', 'Card']
const DISCOUNT_METHODS = ['Percentage', 'Fixed Amount']
const CUSTOMERS = ['Gayathri', 'Seema', 'Maax', 'Linux']
const INVOICES = ['INV-26071', 'INV-26072', 'INV-26073']

// ─── Types ────────────────────────────────────────────────────────────────────

interface ReceiptRecord {
  id: string
  refId: string
  date: string
  referenceNo: string
  narration: string
  amount: number
  status: 'Received' | 'Pending'
}

const MOCK_RECEIPTS: ReceiptRecord[] = []

// ─── Tabs ─────────────────────────────────────────────────────────────────────

type TabId = 'receipt-entry' | 'sale-receipt' | 'receipt-list'

const TABS: { id: TabId; label: string }[] = [
  { id: 'receipt-entry', label: 'Receipt Entry' },
  { id: 'sale-receipt', label: 'Sale Receipt' },
  { id: 'receipt-list', label: 'Receipt List' },
]

// ─── Shared styles ────────────────────────────────────────────────────────────

const fieldLabelSx = {
  fontSize: '0.7rem',
  fontWeight: 700,
  letterSpacing: '0.06em',
  textTransform: 'uppercase' as const,
  color: v.textSecondary,
  minWidth: 180,
  flexShrink: 0,
  pt: 1.4,
}

const fieldRowSx = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: 3,
  mb: 2.5,
  flexDirection: { xs: 'column', sm: 'row' } as const,
}

const inputSx = { '& .MuiOutlinedInput-root': { borderRadius: '10px' } }

function CardTitle({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ width: 4, height: 28, borderRadius: 2, background: `linear-gradient(180deg, ${v.primary}, ${v.secondary})` }} />
          <Typography variant="h6" sx={{ fontWeight: 700, color: v.textPrimary }}>{title}</Typography>
        </Box>
        {action}
      </Box>
      <Divider sx={{ mb: 3.5, borderColor: v.border }} />
    </>
  )
}

// ─── Receipt Entry Tab ────────────────────────────────────────────────────────

function ReceiptEntryTab({ onSaleReceipt }: { onSaleReceipt: () => void }) {
  const [narration, setNarration] = useState('')
  const [date, setDate] = useState('')
  const [reference, setReference] = useState('')
  const [debitAccount, setDebitAccount] = useState('')
  const [creditAccount, setCreditAccount] = useState('')
  const [receivedAmount, setReceivedAmount] = useState('')
  const [description, setDescription] = useState('')
  const [saved, setSaved] = useState(false)

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!narration || !date || !debitAccount || !creditAccount || !receivedAmount || !description) return
    setSaved(true)
    setNarration(''); setDate(''); setReference(''); setDebitAccount(''); setCreditAccount(''); setReceivedAmount(''); setDescription('')
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <Paper sx={{ ...whiteCardSx, maxWidth: 900, mx: 'auto', px: { xs: 3, md: 5 }, py: 4 }}>
      <CardTitle
        title="Receipt Details"
        action={
          <Button
            variant="outlined"
            size="small"
            onClick={onSaleReceipt}
            startIcon={<ReceiptLongIcon />}
            sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 600, fontSize: '0.78rem', borderColor: v.primary, color: v.primary, '&:hover': { borderColor: v.primary, background: mix.primary(6) } }}
          >
            Sale Receipt
          </Button>
        }
      />

      <Box component="form" onSubmit={handleSave}>
        <Box sx={fieldRowSx}>
          <Typography sx={fieldLabelSx}>Narration <span style={{ color: v.error }}>*</span></Typography>
          <TextField fullWidth required size="small" value={narration} onChange={(e) => setNarration(e.target.value)} placeholder="Enter narration" sx={inputSx} />
        </Box>
        <Box sx={fieldRowSx}>
          <Typography sx={fieldLabelSx}>Date <span style={{ color: v.error }}>*</span></Typography>
          <TextField
            fullWidth required size="small" type="date" value={date} onChange={(e) => setDate(e.target.value)} sx={inputSx}
            slotProps={{ input: { endAdornment: <InputAdornment position="end"><CalendarTodayIcon sx={{ fontSize: 16, color: v.textSecondary }} /></InputAdornment> } }}
          />
        </Box>
        <Box sx={fieldRowSx}>
          <Typography sx={fieldLabelSx}>Reference Number</Typography>
          <TextField fullWidth size="small" value={reference} onChange={(e) => setReference(e.target.value)} placeholder="Enter reference number" sx={inputSx} />
        </Box>
        <Box sx={fieldRowSx}>
          <Typography sx={fieldLabelSx}>Debit Account <span style={{ color: v.error }}>*</span></Typography>
          <TextField select fullWidth required size="small" value={debitAccount} onChange={(e) => setDebitAccount(e.target.value)} sx={inputSx} slotProps={{ select: { displayEmpty: true } }} label="">
            <MenuItem value="" disabled><span style={{ color: '#9CA3AF' }}>Select Debit Account</span></MenuItem>
            {ACCOUNTS.map((a) => <MenuItem key={a} value={a}>{a}</MenuItem>)}
          </TextField>
        </Box>
        <Box sx={fieldRowSx}>
          <Typography sx={fieldLabelSx}>Credit Account <span style={{ color: v.error }}>*</span></Typography>
          <TextField select fullWidth required size="small" value={creditAccount} onChange={(e) => setCreditAccount(e.target.value)} sx={inputSx} slotProps={{ select: { displayEmpty: true } }} label="">
            <MenuItem value="" disabled><span style={{ color: '#9CA3AF' }}>Select Credit Account</span></MenuItem>
            {ACCOUNTS.map((a) => <MenuItem key={a} value={a}>{a}</MenuItem>)}
          </TextField>
        </Box>
        <Box sx={fieldRowSx}>
          <Typography sx={fieldLabelSx}>Received Amount <span style={{ color: v.error }}>*</span></Typography>
          <TextField fullWidth required size="small" type="number" value={receivedAmount} onChange={(e) => setReceivedAmount(e.target.value)} placeholder="0.00" sx={inputSx} />
        </Box>
        <Box sx={fieldRowSx}>
          <Typography sx={fieldLabelSx}>Description <span style={{ color: v.error }}>*</span></Typography>
          <Box sx={{ width: '100%' }}>
            <TextField
              fullWidth required size="small" multiline minRows={4} value={description}
              onChange={(e) => setDescription(e.target.value.slice(0, 200))}
              placeholder="Enter description" sx={inputSx}
            />
            <Typography variant="caption" sx={{ color: v.textMuted, mt: 0.5, display: 'block' }}>{description.length}/200</Typography>
          </Box>
        </Box>

        {saved && (
          <Box sx={{ mb: 2, px: 2, py: 1.25, borderRadius: '10px', bgcolor: mix.success(12), border: `1px solid ${mix.success(25)}` }}>
            <Typography variant="caption" sx={{ color: v.success, fontWeight: 600 }}>✓ Receipt saved successfully!</Typography>
          </Box>
        )}

        <Box sx={{ mt: 1 }}>
          <Button type="submit" variant="contained" startIcon={<SaveIcon />} sx={{ ...primaryButtonSx, px: 3, py: 1.1, fontSize: '0.875rem' }}>
            Save Receipt
          </Button>
        </Box>
      </Box>
    </Paper>
  )
}

// ─── Sale Receipt Tab ─────────────────────────────────────────────────────────

function SaleReceiptTab() {
  const [customer, setCustomer] = useState('')
  const [invoice, setInvoice] = useState('')
  const [reference, setReference] = useState('')
  const [paymentDate, setPaymentDate] = useState('2026-07-17')
  const [debitAccount, setDebitAccount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('')
  const [creditAccount, setCreditAccount] = useState('')
  const [totalInclTax] = useState('0')
  const [discount, setDiscount] = useState('0')
  const [discountMethod, setDiscountMethod] = useState('')
  const [previousReceived] = useState('0')
  const [due] = useState('0')
  const [received, setReceived] = useState('')
  const [saved, setSaved] = useState(false)

  const finalDue = useMemo(() => {
    const d = parseFloat(due || '0') - parseFloat(received || '0') - parseFloat(discount || '0')
    return isNaN(d) ? '0.00' : d.toFixed(2)
  }, [due, received, discount])

  const readOnlyInputSx = { ...inputSx, '& .MuiOutlinedInput-root': { borderRadius: '10px', bgcolor: mix.primary(3) } }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Filter Options */}
      <Paper sx={{ ...whiteCardSx, px: { xs: 3, md: 4 }, py: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: v.textPrimary, mb: 2.5 }}>Filter Options</Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <Box sx={{ flex: 1, minWidth: 220 }}>
            <Typography sx={{ ...fieldLabelSx, pt: 0, mb: 0.75 }}>Customer <span style={{ color: v.error }}>*</span></Typography>
            <TextField select fullWidth size="small" value={customer} onChange={(e) => setCustomer(e.target.value)} sx={inputSx} slotProps={{ select: { displayEmpty: true } }} label="">
              <MenuItem value="" disabled><span style={{ color: '#9CA3AF' }}>Select Customer</span></MenuItem>
              {CUSTOMERS.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
            </TextField>
          </Box>
          <Box sx={{ flex: 1, minWidth: 220 }}>
            <Typography sx={{ ...fieldLabelSx, pt: 0, mb: 0.75 }}>Invoice <span style={{ color: v.error }}>*</span></Typography>
            <TextField select fullWidth size="small" value={invoice} onChange={(e) => setInvoice(e.target.value)} sx={inputSx} slotProps={{ select: { displayEmpty: true } }} label="">
              <MenuItem value="" disabled><span style={{ color: '#9CA3AF' }}>Select Invoice</span></MenuItem>
              {INVOICES.map((i) => <MenuItem key={i} value={i}>{i}</MenuItem>)}
            </TextField>
          </Box>
          <Button variant="contained" startIcon={<SearchIcon />} sx={{ ...primaryButtonSx, px: 4, py: 1, height: 40 }}>Search</Button>
        </Box>
      </Paper>

      {/* Sale Receipt Details */}
      <Paper sx={{ ...whiteCardSx, px: { xs: 3, md: 5 }, py: 4 }}>
        <CardTitle title="Sale Receipt Details" />
        <Box component="form" onSubmit={(e) => { e.preventDefault(); setSaved(true); setTimeout(() => setSaved(false), 3000) }}>
          <Box sx={fieldRowSx}>
            <Typography sx={fieldLabelSx}>Reference Number</Typography>
            <TextField fullWidth size="small" value={reference} onChange={(e) => setReference(e.target.value)} placeholder="Enter reference number" sx={inputSx} />
          </Box>
          <Box sx={fieldRowSx}>
            <Typography sx={fieldLabelSx}>Payment Date</Typography>
            <TextField
              fullWidth size="small" type="date" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} sx={inputSx}
              slotProps={{ input: { endAdornment: <InputAdornment position="end"><CalendarTodayIcon sx={{ fontSize: 16, color: v.textSecondary }} /></InputAdornment> } }}
            />
          </Box>
          <Box sx={fieldRowSx}>
            <Typography sx={fieldLabelSx}>Debit Account</Typography>
            <TextField select fullWidth size="small" value={debitAccount} onChange={(e) => setDebitAccount(e.target.value)} sx={inputSx} slotProps={{ select: { displayEmpty: true } }} label="">
              <MenuItem value="" disabled><span style={{ color: '#9CA3AF' }}>Select Debit Account</span></MenuItem>
              {ACCOUNTS.map((a) => <MenuItem key={a} value={a}>{a}</MenuItem>)}
            </TextField>
          </Box>
          <Box sx={fieldRowSx}>
            <Typography sx={fieldLabelSx}>Payment Method</Typography>
            <TextField select fullWidth size="small" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} sx={inputSx} slotProps={{ select: { displayEmpty: true } }} label="">
              <MenuItem value="" disabled><span style={{ color: '#9CA3AF' }}>Select Payment Method</span></MenuItem>
              {PAYMENT_METHODS.map((m) => <MenuItem key={m} value={m}>{m}</MenuItem>)}
            </TextField>
          </Box>
          <Box sx={fieldRowSx}>
            <Typography sx={fieldLabelSx}>Credit Account</Typography>
            <TextField select fullWidth size="small" value={creditAccount} onChange={(e) => setCreditAccount(e.target.value)} sx={inputSx} slotProps={{ select: { displayEmpty: true } }} label="">
              <MenuItem value="" disabled><span style={{ color: '#9CA3AF' }}>Select Credit Account</span></MenuItem>
              {ACCOUNTS.map((a) => <MenuItem key={a} value={a}>{a}</MenuItem>)}
            </TextField>
          </Box>
          <Box sx={fieldRowSx}>
            <Typography sx={fieldLabelSx}>Total Incl Tax</Typography>
            <TextField fullWidth size="small" value={totalInclTax} disabled sx={readOnlyInputSx} />
          </Box>
          <Box sx={fieldRowSx}>
            <Typography sx={fieldLabelSx}>Discount</Typography>
            <TextField fullWidth size="small" type="number" value={discount} onChange={(e) => setDiscount(e.target.value)} sx={inputSx} />
          </Box>
          <Box sx={fieldRowSx}>
            <Typography sx={fieldLabelSx}>Discount Method</Typography>
            <TextField select fullWidth size="small" value={discountMethod} onChange={(e) => setDiscountMethod(e.target.value)} sx={inputSx} slotProps={{ select: { displayEmpty: true } }} label="">
              <MenuItem value="" disabled><span style={{ color: '#9CA3AF' }}>Select Discount Method</span></MenuItem>
              {DISCOUNT_METHODS.map((m) => <MenuItem key={m} value={m}>{m}</MenuItem>)}
            </TextField>
          </Box>
          <Box sx={fieldRowSx}>
            <Typography sx={fieldLabelSx}>Previous Received</Typography>
            <TextField fullWidth size="small" value={previousReceived} disabled sx={readOnlyInputSx} />
          </Box>
          <Box sx={fieldRowSx}>
            <Typography sx={fieldLabelSx}>Due</Typography>
            <TextField fullWidth size="small" value={due} disabled sx={readOnlyInputSx} />
          </Box>
          <Box sx={fieldRowSx}>
            <Typography sx={fieldLabelSx}>Received Amount</Typography>
            <TextField fullWidth size="small" type="number" value={received} onChange={(e) => setReceived(e.target.value)} placeholder="0.00" sx={inputSx} />
          </Box>
          <Box sx={fieldRowSx}>
            <Typography sx={fieldLabelSx}>Final Due</Typography>
            <TextField fullWidth size="small" value={finalDue} disabled sx={readOnlyInputSx} />
          </Box>

          {saved && (
            <Box sx={{ mb: 2, px: 2, py: 1.25, borderRadius: '10px', bgcolor: mix.success(12), border: `1px solid ${mix.success(25)}` }}>
              <Typography variant="caption" sx={{ color: v.success, fontWeight: 600 }}>✓ Sale receipt saved successfully!</Typography>
            </Box>
          )}

          <Box sx={{ mt: 1 }}>
            <Button type="submit" variant="contained" startIcon={<SaveIcon />} sx={{ ...primaryButtonSx, px: 3, py: 1.1, fontSize: '0.875rem' }}>
              Save Receipt
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  )
}

// ─── Receipt List Tab ─────────────────────────────────────────────────────────

function downloadFile(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function ReceiptListTab() {
  const [search, setSearch] = useState('')
  const cols = ['SL', 'ID', 'Date', 'Reference No', 'Narration', 'Amount', 'Status', 'View']

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return MOCK_RECEIPTS.filter((r) => [r.refId, r.referenceNo, r.narration].some((f) => f.toLowerCase().includes(q)))
  }, [search])

  const handleExport = (kind: 'csv' | 'excel' | 'pdf') => {
    const headers = cols.slice(0, 7)
    const rows = filtered.map((r, i) => [i + 1, r.refId, r.date, r.referenceNo, r.narration, r.amount.toFixed(2), r.status])
    const esc = (val: string | number) => `"${String(val).replace(/"/g, '""')}"`
    if (kind === 'csv') {
      downloadFile('receipt-list.csv', [headers.map(esc).join(','), ...rows.map((r) => r.map(esc).join(','))].join('\n'), 'text/csv;charset=utf-8;')
    } else if (kind === 'excel') {
      const table = `<table><thead><tr>${headers.map((h) => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table>`
      downloadFile('receipt-list.xls', table, 'application/vnd.ms-excel')
    } else {
      const win = window.open('', '_blank')
      if (!win) return
      win.document.write(`<html><head><title>Receipt List</title></head><body><h2>Receipt List</h2><table border="1" cellpadding="6" style="border-collapse:collapse">${`<tr>${headers.map((h) => `<th>${h}</th>`).join('')}</tr>`}${rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`).join('')}</table></body></html>`)
      win.document.close(); win.focus(); win.print()
    }
  }

  const exportBtnSx = {
    borderRadius: '10px', textTransform: 'none' as const, fontWeight: 600, fontSize: '0.78rem',
    borderColor: v.border, color: v.textSecondary, px: 1.75,
    '&:hover': { borderColor: v.primary, background: mix.primary(6), color: v.primary },
  }

  return (
    <Paper sx={{ ...whiteCardSx, overflow: 'hidden', p: 0 }}>
      <Box sx={{ px: 3, pt: 3, pb: 2.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box sx={{ width: 4, height: 26, borderRadius: 2, background: `linear-gradient(180deg, ${v.primary}, ${v.secondary})` }} />
        <Typography variant="h6" sx={{ fontWeight: 700, color: v.textPrimary }}>Receipt List</Typography>
      </Box>
      <Divider sx={{ borderColor: v.border }} />

      <Box sx={{ px: 3, py: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
        <TextField
          size="small" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)}
          slotProps={{ input: { startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 0.5, fontSize: 18 }} /> } }}
          sx={{ width: { xs: '100%', sm: 260 }, ...inputSx }}
        />
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" size="small" startIcon={<DescriptionIcon sx={{ color: v.primary }} />} sx={exportBtnSx} onClick={() => handleExport('csv')}>CSV</Button>
          <Button variant="outlined" size="small" startIcon={<GridOnIcon sx={{ color: v.success }} />} sx={exportBtnSx} onClick={() => handleExport('excel')}>Excel</Button>
          <Button variant="outlined" size="small" startIcon={<PictureAsPdfIcon sx={{ color: v.error }} />} sx={exportBtnSx} onClick={() => handleExport('pdf')}>PDF</Button>
        </Box>
      </Box>

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: mix.primary(4) }}>
              {cols.map((h) => (
                <TableCell
                  key={h}
                  align={h === 'Amount' ? 'right' : h === 'SL' || h === 'Status' || h === 'View' ? 'center' : 'left'}
                  sx={{ fontWeight: 700, fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: v.textSecondary, py: 1.25, borderBottom: `1px solid ${v.border}`, whiteSpace: 'nowrap' }}
                >
                  {h}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={cols.length} align="center" sx={{ py: 3, color: v.textMuted, fontSize: '0.85rem', bgcolor: mix.primary(2) }}>
                  No data available.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((r, idx) => (
                <TableRow key={r.id} sx={{ '&:hover': { bgcolor: mix.primary(5) } }}>
                  <TableCell align="center" sx={{ py: 1.5, fontSize: '0.82rem', color: v.textSecondary }}>{idx + 1}</TableCell>
                  <TableCell sx={{ py: 1.5, fontSize: '0.82rem', color: v.primary, fontWeight: 700 }}>{r.refId}</TableCell>
                  <TableCell sx={{ py: 1.5, fontSize: '0.82rem', color: v.textSecondary }}>{r.date}</TableCell>
                  <TableCell sx={{ py: 1.5, fontSize: '0.82rem' }}>{r.referenceNo}</TableCell>
                  <TableCell sx={{ py: 1.5, fontSize: '0.82rem', color: v.textSecondary }}>{r.narration}</TableCell>
                  <TableCell align="right" sx={{ py: 1.5, fontSize: '0.82rem', fontWeight: 600 }}>{r.amount.toFixed(2)}</TableCell>
                  <TableCell align="center" sx={{ py: 1.5 }}>
                    <Box component="span" sx={{ px: 1.25, py: 0.4, borderRadius: '20px', fontSize: '0.7rem', fontWeight: 600, bgcolor: r.status === 'Received' ? mix.success(14) : mix.primary(10), color: r.status === 'Received' ? v.success : v.primary }}>
                      {r.status}
                    </Box>
                  </TableCell>
                  <TableCell align="center" sx={{ py: 1.5 }}>
                    <Tooltip title="View"><IconButton size="small" sx={{ color: v.info }}><VisibilityIcon sx={{ fontSize: 17 }} /></IconButton></Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <Box sx={{ py: 1 }} />
    </Paper>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function ReceiptPage() {
  const [activeTab, setActiveTab] = useState<TabId>('receipt-entry')

  return (
    <PageShell
      title="Receipt"
      subtitle="Record receipts, process sale receipts, and view receipt history"
      breadcrumbs={[
        { label: 'Home', path: '/' },
        { label: 'Accounting', path: '/accounting/accounts' },
        { label: 'Receipt' },
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
                fontFamily: 'Inter, system-ui, sans-serif',
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
        {activeTab === 'receipt-entry' && <ReceiptEntryTab onSaleReceipt={() => setActiveTab('sale-receipt')} />}
        {activeTab === 'sale-receipt' && <SaleReceiptTab />}
        {activeTab === 'receipt-list' && <ReceiptListTab />}
      </Box>
    </PageShell>
  )
}
