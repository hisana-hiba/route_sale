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
  InputAdornment,
  Chip,
  Collapse,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TablePagination,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import EditIcon from '@mui/icons-material/Edit'
import VisibilityIcon from '@mui/icons-material/Visibility'
import DeleteIcon from '@mui/icons-material/Delete'
import SaveIcon from '@mui/icons-material/Save'
import AccountBalanceIcon from '@mui/icons-material/AccountBalance'
import FolderIcon from '@mui/icons-material/Folder'
import FolderOpenIcon from '@mui/icons-material/FolderOpen'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import PaymentIcon from '@mui/icons-material/Payment'
import AddIcon from '@mui/icons-material/Add'
import { PageShell, primaryButtonSx, whiteCardSx } from '@/components/ui/PageShell'
import { v, mix } from '@/theme/cssVars'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Account {
  id: string
  accountId: string
  title: string
  subType: string
  group: string
  branch: string
  createdBy: string
  createdDate: string
}

interface PaymentMethod {
  id: string
  name: string
  account: string
  branch: string
  createdBy: string
  createdDate: string
}

interface ChartNode {
  id: string
  name: string
  balance: number
  children?: ChartNode[]
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_ACCOUNTS: Account[] = [
  { id: '1', accountId: 'ACC-3-3-00047', title: 'gaaayu 98765432123 - Receivable', subType: 'Receivable', group: 'Accounts Receivable', branch: 'Nexcrest It', createdBy: 'branch admin', createdDate: '14 Jul 2026' },
  { id: '2', accountId: 'ACC-3-3-00035', title: 'Linux - 8988980090', subType: 'Payable', group: 'Accounts Payable', branch: 'Nexcrest It', createdBy: 'branch admin', createdDate: '03 Jul 2026' },
  { id: '3', accountId: 'ACC-3-3-00033', title: 'Gayathri 9781227508 - Receivable', subType: 'Receivable', group: 'Accounts Receivable', branch: 'Nexcrest It', createdBy: 'branch admin', createdDate: '03 Jul 2026' },
  { id: '4', accountId: 'ACC-3-3-00031', title: 'Maax - 9781227588', subType: 'Payable', group: 'Accounts Payable', branch: 'Nexcrest It', createdBy: 'branch admin', createdDate: '03 Jul 2026' },
  { id: '5', accountId: 'ACC-3-3-00023', title: 'Seema 7878909000 - Receivable', subType: 'Receivable', group: 'Accounts Receivable', branch: 'Nexcrest It', createdBy: 'branch admin', createdDate: '02 Jul 2026' },
  { id: '6', accountId: 'ACC-3-3-00021', title: 'SGST5%', subType: 'Output Tax', group: 'Output Tax', branch: 'Nexcrest It', createdBy: 'branch admin', createdDate: '02 Jul 2026' },
  { id: '7', accountId: 'ACC-3-2-00033', title: 'SGST5%', subType: 'Input Tax', group: 'Input Tax', branch: 'Nexcrest It', createdBy: 'branch admin', createdDate: '02 Jul 2026' },
  { id: '8', accountId: 'ACC-3-1-00019', title: 'Cash Account', subType: 'Cash', group: 'Cash & Bank', branch: 'Nexcrest It', createdBy: 'admin', createdDate: '01 Jul 2026' },
  { id: '9', accountId: 'ACC-3-1-00020', title: 'Bank Account - HDFC', subType: 'Bank', group: 'Cash & Bank', branch: 'Nexcrest It', createdBy: 'admin', createdDate: '01 Jul 2026' },
]

const MOCK_PAYMENT_METHODS: PaymentMethod[] = [
  { id: '1', name: 'Cash', account: 'Cash Account', branch: 'Nexcrest It', createdBy: 'admin', createdDate: '02-07-2026' },
  { id: '2', name: 'Bank Transfer', account: 'Bank Account - HDFC', branch: 'Nexcrest It', createdBy: 'admin', createdDate: '02-07-2026' },
]

const CHART_DATA: ChartNode = {
  id: 'root',
  name: 'Nexcrest It',
  balance: 0.00,
  children: [
    {
      id: 'asset', name: 'Asset', balance: -3770.00,
      children: [
        { id: 'cash-bank', name: 'Cash & Bank', balance: -3770.00 },
        { id: 'fixed-asset', name: 'Fixed Assets', balance: 0.00 },
      ],
    },
    {
      id: 'expense', name: 'EXPENSE', balance: 5000.00,
      children: [
        { id: 'direct-exp', name: 'Direct Expenses', balance: 3000.00 },
        { id: 'indirect-exp', name: 'Indirect Expenses', balance: 2000.00 },
      ],
    },
    {
      id: 'income-group', name: 'INCOME', balance: 0.00,
      children: [],
    },
    {
      id: 'income', name: 'Income', balance: -1200.00,
      children: [
        { id: 'sales-income', name: 'Sales Income', balance: -1200.00 },
      ],
    },
    {
      id: 'liabilities', name: 'Liabilities', balance: -30.00,
      children: [
        { id: 'accounts-payable', name: 'Accounts Payable', balance: -30.00 },
        { id: 'tax-payable', name: 'Tax Payable', balance: 0.00 },
      ],
    },
  ],
}

const SUB_TYPES = ['Receivable', 'Payable', 'Cash', 'Bank', 'Input Tax', 'Output Tax', 'Capital', 'Expense', 'Income']
const ACCOUNT_GROUPS = ['Accounts Receivable', 'Accounts Payable', 'Cash & Bank', 'Input Tax', 'Output Tax', 'Capital', 'Direct Expenses', 'Indirect Expenses', 'Sales Income']
const BRANCHES = ['Nexcrest It', 'Branch Alpha', 'Branch Beta']

// ─── Tab style ────────────────────────────────────────────────────────────────

type TabId = 'add-account' | 'accounts-list' | 'chart-of-accounts' | 'add-payment-method' | 'payment-method-list'

const TABS: { id: TabId; label: string }[] = [
  { id: 'add-account', label: 'Add Account' },
  { id: 'accounts-list', label: 'Accounts List' },
  { id: 'chart-of-accounts', label: 'Chart of Accounts' },
  { id: 'add-payment-method', label: 'Add Payment Method' },
  { id: 'payment-method-list', label: 'Payment Method List' },
]

// ─── Shared label style (matching screenshots) ────────────────────────────────

const fieldLabelSx = {
  fontSize: '0.7rem',
  fontWeight: 700,
  letterSpacing: '0.06em',
  textTransform: 'uppercase' as const,
  color: v.textSecondary,
  minWidth: 180,
  flexShrink: 0,
  pt: 1.5,
}

const fieldRowSx = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: 3,
  mb: 2.5,
}

// ─── Chart of Accounts Row ────────────────────────────────────────────────────

function ChartRow({ node, level = 0, isExpanded, onToggle }: {
  node: ChartNode
  level?: number
  isExpanded: boolean
  onToggle: (id: string) => void
}) {
  const hasChildren = node.children && node.children.length > 0
  const balance = node.balance
  const balanceColor = balance === 0 ? v.info : balance < 0 ? v.error : v.success
  const isRoot = level === 0

  return (
    <>
      <TableRow
        sx={{
          bgcolor: isRoot
            ? `color-mix(in srgb, ${v.primary} 6%, transparent)`
            : level === 1
            ? `color-mix(in srgb, ${v.primary} 3%, transparent)`
            : 'transparent',
          '&:hover': { bgcolor: `color-mix(in srgb, ${v.primary} 5%, transparent)` },
          cursor: hasChildren ? 'pointer' : 'default',
        }}
        onClick={() => hasChildren && onToggle(node.id)}
      >
        <TableCell sx={{ pl: `${(level + 1) * 20}px`, py: 1.25, border: 'none' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {hasChildren ? (
              <>
                {isExpanded ? <ExpandLessIcon sx={{ fontSize: 16, color: v.textSecondary }} /> : <ExpandMoreIcon sx={{ fontSize: 16, color: v.textSecondary }} />}
                {isExpanded ? <FolderOpenIcon sx={{ fontSize: 16, color: v.info }} /> : <FolderIcon sx={{ fontSize: 16, color: v.info }} />}
              </>
            ) : (
              <Box sx={{ display: 'flex', gap: 1, ml: 2.5 }}>
                <FolderIcon sx={{ fontSize: 16, color: `color-mix(in srgb, ${v.textSecondary} 60%, transparent)` }} />
              </Box>
            )}
            <Typography
              variant="body2"
              sx={{
                fontWeight: isRoot ? 700 : level === 1 ? 600 : 500,
                color: isRoot ? v.primary : level === 1 ? v.textPrimary : v.textSecondary,
                fontSize: isRoot ? '0.85rem' : '0.82rem',
              }}
            >
              {node.name}
            </Typography>
          </Box>
        </TableCell>
        <TableCell align="right" sx={{ py: 1.25, border: 'none', pr: 3 }}>
          <Typography
            variant="body2"
            sx={{ fontWeight: isRoot ? 700 : 600, color: balanceColor, fontSize: '0.82rem' }}
          >
            {balance === 0 ? '0.00' : balance.toFixed(2)}
          </Typography>
        </TableCell>
      </TableRow>
      {hasChildren && node.children!.map((child) => (
        <ChartRowWrapper key={child.id} node={child} level={level + 1} parentExpanded={isExpanded} />
      ))}
    </>
  )
}

function ChartRowWrapper({ node, level, parentExpanded }: { node: ChartNode; level: number; parentExpanded: boolean }) {
  const [expanded, setExpanded] = useState(false)
  const hasChildren = node.children && node.children.length > 0

  if (!parentExpanded) return null
  return (
    <ChartRow
      node={node}
      level={level}
      isExpanded={expanded}
      onToggle={() => setExpanded((e) => !e)}
    />
  )
}

// ─── Add Account Tab ──────────────────────────────────────────────────────────

function AddAccountTab({ onSaved }: { onSaved?: (account: Account) => void }) {
  const [accountId, setAccountId] = useState('')
  const [title, setTitle] = useState('')
  const [subType, setSubType] = useState('')
  const [accountGroup, setAccountGroup] = useState('')
  const [branch, setBranch] = useState(BRANCHES[0])
  const [saved, setSaved] = useState(false)

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!accountId || !title || !subType || !accountGroup || !branch) return
    const newAccount: Account = {
      id: Date.now().toString(),
      accountId,
      title,
      subType,
      group: accountGroup,
      branch,
      createdBy: 'admin',
      createdDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    }
    onSaved?.(newAccount)
    setSaved(true)
    setAccountId(''); setTitle(''); setSubType(''); setAccountGroup(''); setBranch(BRANCHES[0])
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <Box>
      <Paper sx={{ ...whiteCardSx, maxWidth: 760, mx: 'auto', px: { xs: 3, md: 5 }, py: 4 }}>
        {/* Card header accent bar */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
          <Box sx={{ width: 4, height: 28, borderRadius: 2, background: `linear-gradient(180deg, ${v.primary}, ${v.secondary})` }} />
          <Typography variant="h6" sx={{ fontWeight: 700, color: v.textPrimary }}>Account Details</Typography>
        </Box>
        <Divider sx={{ mb: 3.5, borderColor: v.border }} />

        <Box component="form" onSubmit={handleSave}>
          <Box sx={fieldRowSx}>
            <Typography sx={fieldLabelSx}>Account ID <span style={{ color: v.error }}>*</span></Typography>
            <TextField
              fullWidth value={accountId} onChange={(e) => setAccountId(e.target.value)}
              required size="small" placeholder="e.g. ACC-3-3-00050"
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
            />
          </Box>
          <Box sx={fieldRowSx}>
            <Typography sx={fieldLabelSx}>Title <span style={{ color: v.error }}>*</span></Typography>
            <TextField
              fullWidth value={title} onChange={(e) => setTitle(e.target.value)}
              required size="small" placeholder="Enter account title"
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
            />
          </Box>
          <Box sx={fieldRowSx}>
            <Typography sx={fieldLabelSx}>Sub Type <span style={{ color: v.error }}>*</span></Typography>
            <TextField
              select fullWidth value={subType} onChange={(e) => setSubType(e.target.value)}
              required size="small"
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
              slotProps={{ select: { displayEmpty: true }, inputLabel: { shrink: false } }}
              label=""
            >
              <MenuItem value="" disabled><span style={{ color: '#9CA3AF' }}>Select Sub Type</span></MenuItem>
              {SUB_TYPES.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
            </TextField>
          </Box>
          <Box sx={fieldRowSx}>
            <Typography sx={fieldLabelSx}>Account Group <span style={{ color: v.error }}>*</span></Typography>
            <TextField
              select fullWidth value={accountGroup} onChange={(e) => setAccountGroup(e.target.value)}
              required size="small"
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
              slotProps={{ select: { displayEmpty: true } }}
              label=""
            >
              <MenuItem value="" disabled><span style={{ color: '#9CA3AF' }}>Select Account Group</span></MenuItem>
              {ACCOUNT_GROUPS.map((g) => <MenuItem key={g} value={g}>{g}</MenuItem>)}
            </TextField>
          </Box>
          <Box sx={fieldRowSx}>
            <Typography sx={fieldLabelSx}>Branch <span style={{ color: v.error }}>*</span></Typography>
            <TextField
              select fullWidth value={branch} onChange={(e) => setBranch(e.target.value)}
              required size="small"
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
              label=""
            >
              {BRANCHES.map((b) => <MenuItem key={b} value={b}>{b}</MenuItem>)}
            </TextField>
          </Box>

          {saved && (
            <Box sx={{ mb: 2, px: 2, py: 1.25, borderRadius: '10px', bgcolor: mix.success(12), border: `1px solid ${mix.success(25)}` }}>
              <Typography variant="caption" sx={{ color: v.success, fontWeight: 600 }}>✓ Account saved successfully!</Typography>
            </Box>
          )}

          <Box sx={{ mt: 1 }}>
            <Button
              type="submit"
              variant="contained"
              startIcon={<SaveIcon />}
              sx={{ ...primaryButtonSx, px: 3, py: 1.1, fontSize: '0.875rem' }}
            >
              Save Account
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  )
}

// ─── Accounts List Tab ────────────────────────────────────────────────────────

const groupColor: Record<string, string> = {
  'Accounts Receivable': '#2563EB',
  'Accounts Payable': '#7C3AED',
  'Cash & Bank': '#16A34A',
  'Output Tax': '#D97706',
  'Input Tax': '#DC2626',
  'Capital': '#0891B2',
}

function AccountsListTab({ accounts, onDelete }: { accounts: Account[]; onDelete: (id: string) => void }) {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [viewOpen, setViewOpen] = useState(false)
  const [selected, setSelected] = useState<Account | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [toDelete, setToDelete] = useState<Account | null>(null)

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return accounts.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.accountId.toLowerCase().includes(q) ||
        a.group.toLowerCase().includes(q),
    )
  }, [accounts, search])

  const paged = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)

  return (
    <Paper sx={{ ...whiteCardSx, overflow: 'hidden' }}>
      <Box sx={{ px: 3, pt: 3, pb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ width: 4, height: 24, borderRadius: 2, background: `linear-gradient(180deg, ${v.primary}, ${v.secondary})` }} />
          <Typography variant="h6" sx={{ fontWeight: 700, color: v.textPrimary }}>Accounts List</Typography>
          <Chip label={filtered.length} size="small" sx={{ bgcolor: mix.primary(10), color: v.primary, fontWeight: 700, fontSize: '0.72rem', height: 20 }} />
        </Box>
        <TextField
          size="small" placeholder="Search account title, ID, group..."
          value={search} onChange={(e) => { setSearch(e.target.value); setPage(0) }}
          slotProps={{ input: { startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 0.5, fontSize: 18 }} /> } }}
          sx={{ width: { xs: '100%', sm: 300 }, '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
        />
      </Box>

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: `color-mix(in srgb, ${v.primary} 4%, transparent)` }}>
              {['SL', 'Account ID', 'Title', 'Group', 'Branch', 'Created By', 'Created Date', 'Action'].map((h) => (
                <TableCell
                  key={h}
                  sx={{
                    fontWeight: 700, fontSize: '0.68rem', textTransform: 'uppercase',
                    letterSpacing: '0.05em', color: v.textSecondary, py: 1.25,
                    borderBottom: `1px solid ${v.border}`,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {h}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {paged.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 6, color: v.textMuted }}>
                  No accounts found
                </TableCell>
              </TableRow>
            ) : (
              paged.map((account, idx) => (
                <TableRow
                  key={account.id}
                  sx={{
                    bgcolor: idx % 2 === 1 ? `color-mix(in srgb, ${v.primary} 2%, transparent)` : 'transparent',
                    '&:hover': { bgcolor: `color-mix(in srgb, ${v.primary} 5%, transparent)` },
                    transition: 'background 0.15s',
                  }}
                >
                  <TableCell sx={{ py: 1.5, color: v.primary, fontWeight: 700, fontSize: '0.82rem' }}>
                    {page * rowsPerPage + idx + 1}
                  </TableCell>
                  <TableCell sx={{ py: 1.5, fontSize: '0.82rem', color: v.primary, fontWeight: 600 }}>
                    {account.accountId}
                  </TableCell>
                  <TableCell sx={{ py: 1.5, fontSize: '0.82rem', color: v.textPrimary, maxWidth: 220 }}>
                    <Typography variant="body2" sx={{ color: v.textPrimary, fontSize: 'inherit' }} noWrap>
                      {account.title}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ py: 1.5, fontSize: '0.82rem' }}>
                    <Typography
                      variant="caption"
                      sx={{ color: groupColor[account.group] ?? v.textSecondary, fontWeight: 600 }}
                    >
                      {account.group}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ py: 1.5, fontSize: '0.82rem', color: v.textSecondary }}>{account.branch}</TableCell>
                  <TableCell sx={{ py: 1.5, fontSize: '0.82rem', color: v.textSecondary }}>{account.createdBy}</TableCell>
                  <TableCell sx={{ py: 1.5, fontSize: '0.82rem', color: v.textSecondary }}>{account.createdDate}</TableCell>
                  <TableCell sx={{ py: 1.5 }}>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Tooltip title="Edit">
                        <IconButton size="small" sx={{ color: v.info }}>
                          <EditIcon sx={{ fontSize: 17 }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="View">
                        <IconButton size="small" sx={{ color: v.success }} onClick={() => { setSelected(account); setViewOpen(true) }}>
                          <VisibilityIcon sx={{ fontSize: 17 }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton size="small" sx={{ color: v.error }} onClick={() => { setToDelete(account); setDeleteOpen(true) }}>
                          <DeleteIcon sx={{ fontSize: 17 }} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2, flexWrap: 'wrap' }}>
        <Typography variant="caption" sx={{ color: v.textSecondary, px: 1 }}>
          Showing {filtered.length === 0 ? 0 : page * rowsPerPage + 1} to {Math.min((page + 1) * rowsPerPage, filtered.length)} of {filtered.length} records
        </Typography>
        <TablePagination
          component="div"
          count={filtered.length}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0) }}
          rowsPerPageOptions={[5, 10, 25, 50]}
          sx={{
            '& .MuiTablePagination-displayedRows': { fontSize: '0.78rem', color: v.textSecondary },
          }}
        />
      </Box>

      {/* View Dialog */}
      <Dialog open={viewOpen} onClose={() => setViewOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: v.textPrimary }}>Account Details</DialogTitle>
        <DialogContent>
          {selected && [
            ['Account ID', selected.accountId],
            ['Title', selected.title],
            ['Sub Type', selected.subType],
            ['Group', selected.group],
            ['Branch', selected.branch],
            ['Created By', selected.createdBy],
            ['Created Date', selected.createdDate],
          ].map(([label, value]) => (
            <Box key={label} sx={{ display: 'flex', py: 1.25, borderBottom: `1px solid ${v.border}` }}>
              <Typography variant="body2" color="text.secondary" sx={{ width: 140, flexShrink: 0 }}>{label}</Typography>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>{value}</Typography>
            </Box>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Delete account <strong>{toDelete?.title}</strong>? This cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteOpen(false)}>Cancel</Button>
          <Button
            color="error" variant="contained"
            onClick={() => { if (toDelete) onDelete(toDelete.id); setDeleteOpen(false) }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  )
}

// ─── Chart of Accounts Tab ────────────────────────────────────────────────────

function ChartOfAccountsTab() {
  const [expandAll, setExpandAll] = useState(false)
  const [expandedMap, setExpandedMap] = useState<Record<string, boolean>>({})

  const toggleNode = (id: string) => {
    setExpandedMap((m) => ({ ...m, [id]: !m[id] }))
    setExpandAll(false)
  }

  const handleExpandAll = () => {
    const map: Record<string, boolean> = {}
    const expand = (node: ChartNode) => {
      map[node.id] = true
      node.children?.forEach(expand)
    }
    expand(CHART_DATA)
    setExpandedMap(map)
    setExpandAll(true)
  }

  const handleCollapseAll = () => {
    setExpandedMap({})
    setExpandAll(false)
  }

  return (
    <Paper sx={{ ...whiteCardSx, overflow: 'hidden' }}>
      <Box sx={{ px: 3, pt: 3, pb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ width: 4, height: 24, borderRadius: 2, background: `linear-gradient(180deg, ${v.primary}, ${v.secondary})` }} />
          <Typography variant="h6" sx={{ fontWeight: 700, color: v.textPrimary }}>Chart of Accounts</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined" size="small"
            onClick={handleExpandAll}
            sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 600, fontSize: '0.8rem', borderColor: v.borderStrong, color: v.textSecondary }}
          >
            Expand All
          </Button>
          <Button
            variant="outlined" size="small"
            onClick={handleCollapseAll}
            sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 600, fontSize: '0.8rem', borderColor: v.borderStrong, color: v.textSecondary }}
          >
            Collapse All
          </Button>
        </Box>
      </Box>

      <TableContainer>
        <Table size="small">
          <TableBody>
            <ChartRow
              node={CHART_DATA}
              level={0}
              isExpanded={expandedMap[CHART_DATA.id] ?? expandAll}
              onToggle={toggleNode}
            />
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  )
}

// ─── Add Payment Method Tab ───────────────────────────────────────────────────

function AddPaymentMethodTab({ accounts, onSaved }: { accounts: Account[]; onSaved?: (pm: PaymentMethod) => void }) {
  const [name, setName] = useState('')
  const [account, setAccount] = useState('')
  const [branch] = useState(BRANCHES[0])
  const [saved, setSaved] = useState(false)

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !account) return
    onSaved?.({
      id: Date.now().toString(),
      name, account, branch,
      createdBy: 'admin',
      createdDate: new Date().toLocaleDateString('en-GB').replace(/\//g, '-'),
    })
    setName(''); setAccount('')
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <Box>
      <Paper sx={{ ...whiteCardSx, maxWidth: 760, mx: 'auto', px: { xs: 3, md: 5 }, py: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
          <Box sx={{ width: 4, height: 28, borderRadius: 2, background: `linear-gradient(180deg, ${v.primary}, ${v.secondary})` }} />
          <Typography variant="h6" sx={{ fontWeight: 700, color: v.textPrimary }}>Payment Method Details</Typography>
        </Box>
        <Divider sx={{ mb: 3.5, borderColor: v.border }} />

        <Box component="form" onSubmit={handleSave}>
          <Box sx={fieldRowSx}>
            <Typography sx={fieldLabelSx}>Name <span style={{ color: v.error }}>*</span></Typography>
            <TextField
              fullWidth value={name} onChange={(e) => setName(e.target.value)}
              required size="small" placeholder="e.g. Cash, Bank Transfer"
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
            />
          </Box>
          <Box sx={fieldRowSx}>
            <Typography sx={fieldLabelSx}>Account <span style={{ color: v.error }}>*</span></Typography>
            <TextField
              select fullWidth value={account} onChange={(e) => setAccount(e.target.value)}
              required size="small" label=""
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
              slotProps={{ select: { displayEmpty: true } }}
            >
              <MenuItem value="" disabled><span style={{ color: '#9CA3AF' }}>Select Account</span></MenuItem>
              {accounts.map((a) => <MenuItem key={a.id} value={a.title}>{a.title}</MenuItem>)}
            </TextField>
          </Box>
          <Box sx={fieldRowSx}>
            <Typography sx={fieldLabelSx}>Branch <span style={{ color: v.error }}>*</span></Typography>
            <TextField
              fullWidth value={branch} size="small" disabled
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
            />
          </Box>

          {saved && (
            <Box sx={{ mb: 2, px: 2, py: 1.25, borderRadius: '10px', bgcolor: mix.success(12), border: `1px solid ${mix.success(25)}` }}>
              <Typography variant="caption" sx={{ color: v.success, fontWeight: 600 }}>✓ Payment method saved successfully!</Typography>
            </Box>
          )}

          <Box sx={{ mt: 1 }}>
            <Button
              type="submit" variant="contained"
              startIcon={<SaveIcon />}
              sx={{ ...primaryButtonSx, px: 3, py: 1.1, fontSize: '0.875rem' }}
            >
              Save Payment Method
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  )
}

// ─── Payment Method List Tab ──────────────────────────────────────────────────

function PaymentMethodListTab({ methods, onDelete }: { methods: PaymentMethod[]; onDelete: (id: string) => void }) {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [toDelete, setToDelete] = useState<PaymentMethod | null>(null)
  const [viewOpen, setViewOpen] = useState(false)
  const [selected, setSelected] = useState<PaymentMethod | null>(null)

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return methods.filter(
      (m) => m.name.toLowerCase().includes(q) || m.account.toLowerCase().includes(q) || m.branch.toLowerCase().includes(q),
    )
  }, [methods, search])

  const paged = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)

  return (
    <Paper sx={{ ...whiteCardSx, overflow: 'hidden' }}>
      <Box sx={{ px: 3, pt: 3, pb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ width: 4, height: 24, borderRadius: 2, background: `linear-gradient(180deg, ${v.primary}, ${v.secondary})` }} />
          <Typography variant="h6" sx={{ fontWeight: 700, color: v.textPrimary }}>Payment Method List</Typography>
          <Chip label={filtered.length} size="small" sx={{ bgcolor: mix.primary(10), color: v.primary, fontWeight: 700, fontSize: '0.72rem', height: 20 }} />
        </Box>
        <TextField
          size="small" placeholder="Search name, account, branch..."
          value={search} onChange={(e) => { setSearch(e.target.value); setPage(0) }}
          slotProps={{ input: { startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 0.5, fontSize: 18 }} /> } }}
          sx={{ width: { xs: '100%', sm: 280 }, '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
        />
      </Box>

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: `color-mix(in srgb, ${v.primary} 4%, transparent)` }}>
              {['SL', 'Name', 'Account', 'Branch', 'Created By', 'Created Date', 'Action'].map((h) => (
                <TableCell
                  key={h}
                  sx={{
                    fontWeight: 700, fontSize: '0.68rem', textTransform: 'uppercase',
                    letterSpacing: '0.05em', color: v.textSecondary, py: 1.25,
                    borderBottom: `1px solid ${v.border}`,
                  }}
                >
                  {h}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {paged.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 6, color: v.textMuted }}>
                  No payment methods found
                </TableCell>
              </TableRow>
            ) : (
              paged.map((method, idx) => (
                <TableRow
                  key={method.id}
                  sx={{
                    bgcolor: idx % 2 === 1 ? `color-mix(in srgb, ${v.primary} 2%, transparent)` : 'transparent',
                    '&:hover': { bgcolor: `color-mix(in srgb, ${v.primary} 5%, transparent)` },
                    transition: 'background 0.15s',
                  }}
                >
                  <TableCell sx={{ py: 1.5, color: v.textSecondary, fontSize: '0.82rem' }}>{page * rowsPerPage + idx + 1}</TableCell>
                  <TableCell sx={{ py: 1.5, fontSize: '0.82rem', fontWeight: 500 }}>{method.name}</TableCell>
                  <TableCell sx={{ py: 1.5, fontSize: '0.82rem', color: v.textSecondary }}>{method.account}</TableCell>
                  <TableCell sx={{ py: 1.5, fontSize: '0.82rem' }}>
                    <Typography variant="caption" sx={{ color: v.info }}>{method.branch}</Typography>
                  </TableCell>
                  <TableCell sx={{ py: 1.5, fontSize: '0.82rem', color: v.textSecondary }}>{method.createdBy}</TableCell>
                  <TableCell sx={{ py: 1.5, fontSize: '0.82rem', color: v.textSecondary }}>{method.createdDate}</TableCell>
                  <TableCell sx={{ py: 1.5 }}>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Tooltip title="Edit">
                        <IconButton size="small" sx={{ color: v.info }}>
                          <EditIcon sx={{ fontSize: 17 }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="View">
                        <IconButton size="small" sx={{ color: v.success }} onClick={() => { setSelected(method); setViewOpen(true) }}>
                          <VisibilityIcon sx={{ fontSize: 17 }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton size="small" sx={{ color: v.error }} onClick={() => { setToDelete(method); setDeleteOpen(true) }}>
                          <DeleteIcon sx={{ fontSize: 17 }} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2, flexWrap: 'wrap' }}>
        <Typography variant="caption" sx={{ color: v.textSecondary, px: 1 }}>
          Showing {filtered.length === 0 ? 0 : page * rowsPerPage + 1} to {Math.min((page + 1) * rowsPerPage, filtered.length)} of {filtered.length} records
        </Typography>
        <TablePagination
          component="div"
          count={filtered.length}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0) }}
          rowsPerPageOptions={[5, 10, 25, 50]}
          sx={{ '& .MuiTablePagination-displayedRows': { fontSize: '0.78rem', color: v.textSecondary } }}
        />
      </Box>

      {/* View Dialog */}
      <Dialog open={viewOpen} onClose={() => setViewOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Payment Method Details</DialogTitle>
        <DialogContent>
          {selected && [
            ['Name', selected.name],
            ['Account', selected.account],
            ['Branch', selected.branch],
            ['Created By', selected.createdBy],
            ['Created Date', selected.createdDate],
          ].map(([label, value]) => (
            <Box key={label} sx={{ display: 'flex', py: 1.25, borderBottom: `1px solid ${v.border}` }}>
              <Typography variant="body2" color="text.secondary" sx={{ width: 140, flexShrink: 0 }}>{label}</Typography>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>{value}</Typography>
            </Box>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Delete payment method <strong>{toDelete?.name}</strong>? This cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteOpen(false)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={() => { if (toDelete) onDelete(toDelete.id); setDeleteOpen(false) }}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  )
}

// ─── Main AccountPage ─────────────────────────────────────────────────────────

export function AccountPage() {
  const [activeTab, setActiveTab] = useState<TabId>('add-account')
  const [accounts, setAccounts] = useState<Account[]>(MOCK_ACCOUNTS)
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(MOCK_PAYMENT_METHODS)

  const handleAccountSaved = (account: Account) => {
    setAccounts((prev) => [account, ...prev])
  }

  const handlePaymentMethodSaved = (pm: PaymentMethod) => {
    setPaymentMethods((prev) => [pm, ...prev])
  }

  return (
    <PageShell
      title="Accounts"
      subtitle="Manage your chart of accounts, account list, and payment methods"
      breadcrumbs={[
        { label: 'Home', path: '/' },
        { label: 'Accounting', path: '/accounting/transactions' },
        { label: 'Accounts' },
      ]}
    >
      {/* ── Tab Bar ── */}
      <Box
        sx={{
          display: 'flex',
          gap: 0,
          mb: 3,
          borderBottom: `1px solid ${v.border}`,
          overflowX: 'auto',
        }}
      >
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
        {activeTab === 'add-account' && (
          <AddAccountTab onSaved={handleAccountSaved} />
        )}
        {activeTab === 'accounts-list' && (
          <AccountsListTab
            accounts={accounts}
            onDelete={(id) => setAccounts((prev) => prev.filter((a) => a.id !== id))}
          />
        )}
        {activeTab === 'chart-of-accounts' && <ChartOfAccountsTab />}
        {activeTab === 'add-payment-method' && (
          <AddPaymentMethodTab accounts={accounts} onSaved={handlePaymentMethodSaved} />
        )}
        {activeTab === 'payment-method-list' && (
          <PaymentMethodListTab
            methods={paymentMethods}
            onDelete={(id) => setPaymentMethods((prev) => prev.filter((m) => m.id !== id))}
          />
        )}
      </Box>
    </PageShell>
  )
}
