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
import AddIcon from '@mui/icons-material/Add'
import CloseIcon from '@mui/icons-material/Close'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'
import { PageShell, whiteCardSx, primaryButtonSx } from '@/components/ui/PageShell'
import { v, mix } from '@/theme/cssVars'

// ─── Options ──────────────────────────────────────────────────────────────────

const ACCOUNTS = ['Cash Account', 'Bank Account - HDFC', 'Sales Account', 'Purchase Account', 'Accounts Payable', 'Accounts Receivable']
const PARTY_TYPES = ['Customer', 'Supplier', 'Employee', 'Other']
const PARTY_NAMES = ['Gayathri', 'Seema', 'Maax', 'Test Supplier', 'Linux']
const BRANCH = 'Nexcrest It'

// ─── Types ────────────────────────────────────────────────────────────────────

interface JournalItem {
  id: string
  partyType: string
  partyName: string
  account: string
  debit: string
  credit: string
  description: string
}

interface JournalRecord {
  id: string
  refId: string
  date: string
  branch: string
  narration: string
  status: 'Posted' | 'Draft'
}

const MOCK_JOURNALS: JournalRecord[] = []

// ─── Tabs ─────────────────────────────────────────────────────────────────────

type TabId = 'journal-entry' | 'journal-list'

const TABS: { id: TabId; label: string }[] = [
  { id: 'journal-entry', label: 'Journal Entry' },
  { id: 'journal-list', label: 'Journal List' },
]

// ─── Shared styles ────────────────────────────────────────────────────────────

const inputSx = { '& .MuiOutlinedInput-root': { borderRadius: '10px' } }
const cellInputSx = { '& .MuiOutlinedInput-root': { borderRadius: '8px', fontSize: '0.82rem' } }

const newItem = (): JournalItem => ({ id: crypto.randomUUID(), partyType: '', partyName: '', account: '', debit: '', credit: '', description: '' })

// ─── Journal Entry Tab ────────────────────────────────────────────────────────

function JournalEntryTab() {
  const [postingDate, setPostingDate] = useState('')
  const [items, setItems] = useState<JournalItem[]>([newItem()])
  const [narration, setNarration] = useState('')
  const [saved, setSaved] = useState(false)

  const totals = useMemo(() => {
    const debit = items.reduce((s, i) => s + (parseFloat(i.debit) || 0), 0)
    const credit = items.reduce((s, i) => s + (parseFloat(i.credit) || 0), 0)
    return { debit, credit, balanced: debit === credit && debit > 0 }
  }, [items])

  const updateItem = (id: string, field: keyof JournalItem, value: string) =>
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, [field]: value } : it)))

  const removeItem = (id: string) => setItems((prev) => (prev.length > 1 ? prev.filter((it) => it.id !== id) : prev))

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!postingDate || !narration || !totals.balanced) return
    setSaved(true)
    setItems([newItem()]); setNarration(''); setPostingDate('')
    setTimeout(() => setSaved(false), 3000)
  }

  const headCellSx = {
    fontWeight: 700, fontSize: '0.68rem', textTransform: 'uppercase' as const, letterSpacing: '0.05em',
    color: v.textSecondary, py: 1.25, borderBottom: `1px solid ${v.border}`, whiteSpace: 'nowrap' as const,
  }

  return (
    <Box component="form" onSubmit={handleSave} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Branch + Posting Date */}
      <Paper sx={{ ...whiteCardSx, px: { xs: 3, md: 4 }, py: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 2.5, flexDirection: { xs: 'column', sm: 'row' } }}>
          <Typography sx={{ minWidth: 140, fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: v.textSecondary }}>Branch</Typography>
          <TextField fullWidth size="small" value={BRANCH} disabled sx={{ ...inputSx, '& .MuiOutlinedInput-root': { borderRadius: '10px', bgcolor: mix.primary(3) } }} />
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexDirection: { xs: 'column', sm: 'row' } }}>
          <Typography sx={{ minWidth: 140, fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: v.textSecondary }}>Posting Date <span style={{ color: v.error }}>*</span></Typography>
          <TextField
            fullWidth required size="small" type="date" value={postingDate} onChange={(e) => setPostingDate(e.target.value)} sx={inputSx}
            slotProps={{ input: { endAdornment: <InputAdornment position="end"><CalendarTodayIcon sx={{ fontSize: 16, color: v.textSecondary }} /></InputAdornment> } }}
          />
        </Box>
      </Paper>

      {/* Journal Items */}
      <Paper sx={{ ...whiteCardSx, p: 0, overflow: 'hidden' }}>
        <Box sx={{ px: 3, pt: 3, pb: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ width: 4, height: 24, borderRadius: 2, background: `linear-gradient(180deg, ${v.primary}, ${v.secondary})` }} />
          <Typography variant="h6" sx={{ fontWeight: 700, color: v.textPrimary }}>Journal Items <span style={{ color: v.error }}>*</span></Typography>
        </Box>
        <Divider sx={{ borderColor: v.border }} />

        <TableContainer>
          <Table size="small" sx={{ minWidth: 820 }}>
            <TableHead>
              <TableRow sx={{ bgcolor: mix.primary(4) }}>
                <TableCell sx={{ ...headCellSx, width: 56 }} />
                <TableCell sx={headCellSx}>Party Type</TableCell>
                <TableCell sx={headCellSx}>Party Name</TableCell>
                <TableCell sx={headCellSx}>Account</TableCell>
                <TableCell align="right" sx={headCellSx}>Debit</TableCell>
                <TableCell align="right" sx={headCellSx}>Credit</TableCell>
                <TableCell sx={headCellSx}>Description</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((it) => (
                <TableRow key={it.id}>
                  <TableCell sx={{ py: 1.25 }}>
                    <Tooltip title="Remove row">
                      <span>
                        <IconButton
                          size="small"
                          onClick={() => removeItem(it.id)}
                          disabled={items.length === 1}
                          sx={{ bgcolor: mix.error(12), color: v.error, borderRadius: '8px', '&:hover': { bgcolor: mix.error(20) }, '&.Mui-disabled': { bgcolor: mix.error(6), color: mix.error(40) } }}
                        >
                          <CloseIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </TableCell>
                  <TableCell sx={{ py: 1.25, minWidth: 130 }}>
                    <TextField select fullWidth size="small" value={it.partyType} onChange={(e) => updateItem(it.id, 'partyType', e.target.value)} sx={cellInputSx} slotProps={{ select: { displayEmpty: true } }} label="">
                      <MenuItem value="" disabled><span style={{ color: '#9CA3AF' }}>Select</span></MenuItem>
                      {PARTY_TYPES.map((p) => <MenuItem key={p} value={p}>{p}</MenuItem>)}
                    </TextField>
                  </TableCell>
                  <TableCell sx={{ py: 1.25, minWidth: 130 }}>
                    <TextField select fullWidth size="small" value={it.partyName} onChange={(e) => updateItem(it.id, 'partyName', e.target.value)} sx={cellInputSx} slotProps={{ select: { displayEmpty: true } }} label="">
                      <MenuItem value="" disabled><span style={{ color: '#9CA3AF' }}>Select</span></MenuItem>
                      {PARTY_NAMES.map((p) => <MenuItem key={p} value={p}>{p}</MenuItem>)}
                    </TextField>
                  </TableCell>
                  <TableCell sx={{ py: 1.25, minWidth: 160 }}>
                    <TextField select fullWidth size="small" value={it.account} onChange={(e) => updateItem(it.id, 'account', e.target.value)} sx={cellInputSx} slotProps={{ select: { displayEmpty: true } }} label="">
                      <MenuItem value="" disabled><span style={{ color: '#9CA3AF' }}>Select Account</span></MenuItem>
                      {ACCOUNTS.map((a) => <MenuItem key={a} value={a}>{a}</MenuItem>)}
                    </TextField>
                  </TableCell>
                  <TableCell sx={{ py: 1.25, minWidth: 110 }}>
                    <TextField fullWidth size="small" type="number" placeholder="0.00" value={it.debit} onChange={(e) => updateItem(it.id, 'debit', e.target.value)} sx={cellInputSx} slotProps={{ htmlInput: { style: { textAlign: 'right' } } }} />
                  </TableCell>
                  <TableCell sx={{ py: 1.25, minWidth: 110 }}>
                    <TextField fullWidth size="small" type="number" placeholder="0.00" value={it.credit} onChange={(e) => updateItem(it.id, 'credit', e.target.value)} sx={cellInputSx} slotProps={{ htmlInput: { style: { textAlign: 'right' } } }} />
                  </TableCell>
                  <TableCell sx={{ py: 1.25, minWidth: 160 }}>
                    <TextField fullWidth size="small" multiline placeholder="Line note..." value={it.description} onChange={(e) => updateItem(it.id, 'description', e.target.value)} sx={cellInputSx} />
                  </TableCell>
                </TableRow>
              ))}
              {/* Totals */}
              <TableRow sx={{ bgcolor: mix.primary(3) }}>
                <TableCell sx={{ border: 'none' }} />
                <TableCell colSpan={2} sx={{ border: 'none' }} />
                <TableCell align="right" sx={{ border: 'none', fontWeight: 700, fontSize: '0.8rem', color: v.textSecondary }}>Total</TableCell>
                <TableCell align="right" sx={{ border: 'none', fontWeight: 700, fontSize: '0.85rem', color: v.textPrimary }}>{totals.debit.toFixed(2)}</TableCell>
                <TableCell align="right" sx={{ border: 'none', fontWeight: 700, fontSize: '0.85rem', color: v.textPrimary }}>{totals.credit.toFixed(2)}</TableCell>
                <TableCell align="right" sx={{ border: 'none' }}>
                  <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
                    {totals.balanced ? (
                      <><CheckCircleIcon sx={{ fontSize: 15, color: v.success }} /><Typography variant="caption" sx={{ color: v.success, fontWeight: 700 }}>Balanced</Typography></>
                    ) : (
                      <><CancelIcon sx={{ fontSize: 15, color: v.error }} /><Typography variant="caption" sx={{ color: v.error, fontWeight: 700 }}>Not balanced</Typography></>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ px: 3, py: 2.5 }}>
          <Button
            variant="outlined" size="small" startIcon={<AddIcon />} onClick={() => setItems((prev) => [...prev, newItem()])}
            sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 600, fontSize: '0.8rem', borderColor: v.border, color: v.textSecondary, bgcolor: mix.primary(3), '&:hover': { borderColor: v.primary, background: mix.primary(8), color: v.primary } }}
          >
            Add Journal Item
          </Button>
        </Box>
      </Paper>

      {/* Overall Description */}
      <Paper sx={{ ...whiteCardSx, px: { xs: 3, md: 4 }, py: 3 }}>
        <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: v.textSecondary, mb: 1.25 }}>
          Overall Description / Narration <span style={{ color: v.error }}>*</span>
        </Typography>
        <TextField
          fullWidth required multiline minRows={3} size="small" value={narration} onChange={(e) => setNarration(e.target.value)}
          placeholder="Write a brief description about this journal entry, payment purpose, or any remarks..." sx={inputSx}
        />
      </Paper>

      {saved && (
        <Box sx={{ px: 2, py: 1.25, borderRadius: '10px', bgcolor: mix.success(12), border: `1px solid ${mix.success(25)}` }}>
          <Typography variant="caption" sx={{ color: v.success, fontWeight: 600 }}>✓ Journal saved successfully!</Typography>
        </Box>
      )}

      <Box>
        <Button type="submit" variant="contained" startIcon={<SaveIcon />} disabled={!totals.balanced} sx={{ ...primaryButtonSx, px: 3, py: 1.1, fontSize: '0.875rem', '&.Mui-disabled': { background: mix.primary(30), color: '#fff' } }}>
          Save Journal
        </Button>
      </Box>
    </Box>
  )
}

// ─── Journal List Tab ─────────────────────────────────────────────────────────

function downloadFile(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function JournalListTab() {
  const [search, setSearch] = useState('')
  const cols = ['SL', 'ID', 'Date', 'Branch', 'Narration', 'Status', 'View']

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return MOCK_JOURNALS.filter((r) => [r.refId, r.branch, r.narration].some((f) => f.toLowerCase().includes(q)))
  }, [search])

  const handleExport = (kind: 'csv' | 'excel' | 'pdf') => {
    const headers = cols.slice(0, 6)
    const rows = filtered.map((r, i) => [i + 1, r.refId, r.date, r.branch, r.narration, r.status])
    const esc = (val: string | number) => `"${String(val).replace(/"/g, '""')}"`
    if (kind === 'csv') {
      downloadFile('journal-list.csv', [headers.map(esc).join(','), ...rows.map((r) => r.map(esc).join(','))].join('\n'), 'text/csv;charset=utf-8;')
    } else if (kind === 'excel') {
      const table = `<table><thead><tr>${headers.map((h) => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table>`
      downloadFile('journal-list.xls', table, 'application/vnd.ms-excel')
    } else {
      const win = window.open('', '_blank')
      if (!win) return
      win.document.write(`<html><head><title>Journal List</title></head><body><h2>Journal List</h2><table border="1" cellpadding="6" style="border-collapse:collapse">${`<tr>${headers.map((h) => `<th>${h}</th>`).join('')}</tr>`}${rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`).join('')}</table></body></html>`)
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
        <Typography variant="h6" sx={{ fontWeight: 700, color: v.textPrimary }}>Journal List</Typography>
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
                  align={h === 'SL' || h === 'Status' || h === 'View' ? 'center' : 'left'}
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
                  <TableCell sx={{ py: 1.5, fontSize: '0.82rem' }}>{r.branch}</TableCell>
                  <TableCell sx={{ py: 1.5, fontSize: '0.82rem', color: v.textSecondary }}>{r.narration}</TableCell>
                  <TableCell align="center" sx={{ py: 1.5 }}>
                    <Box component="span" sx={{ px: 1.25, py: 0.4, borderRadius: '20px', fontSize: '0.7rem', fontWeight: 600, bgcolor: r.status === 'Posted' ? mix.success(14) : mix.primary(10), color: r.status === 'Posted' ? v.success : v.primary }}>
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

export function JournalPage() {
  const [activeTab, setActiveTab] = useState<TabId>('journal-entry')

  return (
    <PageShell
      title="Journal"
      subtitle="Create balanced journal entries and review journal history"
      breadcrumbs={[
        { label: 'Home', path: '/' },
        { label: 'Accounting', path: '/accounting/accounts' },
        { label: 'Journal' },
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
        {activeTab === 'journal-entry' && <JournalEntryTab />}
        {activeTab === 'journal-list' && <JournalListTab />}
      </Box>
    </PageShell>
  )
}
