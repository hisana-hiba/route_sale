import { useState } from 'react'
import { Box, Typography, Paper, Divider, Checkbox, FormControlLabel, IconButton, Collapse } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import { PageShell, whiteCardSx } from '@/components/ui/PageShell'
import { v, mix } from '@/theme/cssVars'

// ─── Types & Data ─────────────────────────────────────────────────────────────

interface Line {
  id: string
  label: string
  amount: number
  children?: { label: string; amount: number }[]
}

const EXPENSE_ROWS: Line[] = [
  { id: 'opening-stock', label: 'Opening Stock', amount: 2086.96 },
  {
    id: 'direct-expense', label: 'Direct Expense', amount: 225000.0,
    children: [{ label: 'Purchase Account', amount: 225000.0 }],
  },
]
const EXPENSE_SUBTOTAL = 227086.96
const NET_PROFIT = 26913.05
const EXPENSE_TOTAL = 254000.01

const INCOME_ROWS: Line[] = [
  {
    id: 'direct-income', label: 'Direct Income', amount: 3826.09,
    children: [{ label: 'Sales Account', amount: 3826.09 }],
  },
  { id: 'closing-stock', label: 'Closing Stock', amount: 250173.92 },
]
const INCOME_SUBTOTAL = 254000.01

const START_DATE = 'July 17, 2026'
const END_DATE = 'July 17, 2026'

const fmt = (n: number) => n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

// ─── Statement Row ────────────────────────────────────────────────────────────

function StatementRow({ line, expanded, onToggle }: { line: Line; expanded: boolean; onToggle: () => void }) {
  const hasChildren = !!line.children?.length
  return (
    <>
      <Box
        onClick={hasChildren ? onToggle : undefined}
        sx={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          px: 2, py: 1.25, gap: 1,
          borderBottom: `1px solid ${v.border}`,
          cursor: hasChildren ? 'pointer' : 'default',
          '&:hover': hasChildren ? { bgcolor: mix.primary(4) } : undefined,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, minWidth: 0 }}>
          {hasChildren ? (
            expanded ? <KeyboardArrowDownIcon sx={{ fontSize: 18, color: v.textSecondary }} /> : <KeyboardArrowRightIcon sx={{ fontSize: 18, color: v.textSecondary }} />
          ) : (
            <Box sx={{ width: 18 }} />
          )}
          <Typography variant="body2" sx={{ color: v.textPrimary, fontWeight: 500 }} noWrap>{line.label}</Typography>
        </Box>
        <Typography variant="body2" sx={{ color: v.textSecondary, fontWeight: 500, whiteSpace: 'nowrap' }}>{fmt(line.amount)}</Typography>
      </Box>
      {hasChildren && (
        <Collapse in={expanded} unmountOnExit>
          {line.children!.map((c) => (
            <Box key={c.label} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1, pl: 5, gap: 1, borderBottom: `1px solid ${v.border}`, bgcolor: mix.primary(2) }}>
              <Typography variant="body2" sx={{ color: v.textSecondary }} noWrap>{c.label}</Typography>
              <Typography variant="body2" sx={{ color: v.textSecondary, whiteSpace: 'nowrap' }}>{fmt(c.amount)}</Typography>
            </Box>
          ))}
        </Collapse>
      )}
    </>
  )
}

function SectionHeader({ left, right }: { left: string; right: string }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1.25, bgcolor: mix.primary(8), borderBottom: `1px solid ${v.border}` }}>
      <Typography variant="body2" sx={{ fontWeight: 700, color: v.textPrimary }}>{left}</Typography>
      <Typography variant="body2" sx={{ fontWeight: 700, color: v.textPrimary }}>{right}</Typography>
    </Box>
  )
}

function ColumnHeader({ label }: { label: string }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1, bgcolor: mix.primary(4), borderBottom: `1px solid ${v.border}` }}>
      <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: v.textSecondary }}>{label}</Typography>
      <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: v.textSecondary }}>Amount</Typography>
    </Box>
  )
}

function TotalRow({ label, amount, strong }: { label: string; amount: number; strong?: boolean }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1.4, gap: 1, bgcolor: strong ? mix.primary(10) : mix.primary(3), borderBottom: `1px solid ${v.border}` }}>
      <Typography variant="body2" sx={{ fontWeight: 700, color: v.textPrimary }}>{label}</Typography>
      <Typography variant="body2" sx={{ fontWeight: 700, color: v.textPrimary, whiteSpace: 'nowrap' }}>{fmt(amount)}</Typography>
    </Box>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function ProfitLossPage() {
  const [expandAll, setExpandAll] = useState(false)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  const isOpen = (id: string) => expanded[id] ?? expandAll
  const toggle = (id: string) => setExpanded((m) => ({ ...m, [id]: !isOpen(id) }))
  const handleExpandAll = (checked: boolean) => { setExpandAll(checked); setExpanded({}) }

  return (
    <PageShell
      title="Profit & Loss"
      subtitle="Statement of income and expenses"
      breadcrumbs={[{ label: 'Home', path: '/' }, { label: 'Accounting', path: '/accounting/accounts' }, { label: 'Profit & Loss' }]}
    >
      {/* Single-tab bar (consistent with accounting pages) */}
      <Box sx={{ display: 'flex', mb: 3, borderBottom: `1px solid ${v.border}` }}>
        <Box sx={{ px: 2.5, py: 1.5, position: 'relative', fontFamily: 'Inter, system-ui, sans-serif', fontSize: '0.875rem', fontWeight: 700, color: v.primary, '&::after': { content: '""', position: 'absolute', bottom: -1, left: 0, right: 0, height: 2, borderRadius: '2px 2px 0 0', background: `linear-gradient(90deg, ${v.primary}, ${v.secondary})` } }}>
          Profit & Loss Account
        </Box>
      </Box>

      <Paper sx={{ ...whiteCardSx, p: 0, overflow: 'hidden' }}>
        {/* Card header */}
        <Box sx={{ px: 3, pt: 3, pb: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ width: 4, height: 26, borderRadius: 2, background: `linear-gradient(180deg, ${v.primary}, ${v.secondary})` }} />
            <Typography variant="h6" sx={{ fontWeight: 700, color: v.textPrimary }}>Profit &amp; Loss Account</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <SearchIcon sx={{ color: v.textSecondary, fontSize: 20 }} />
            <Typography variant="body2" sx={{ color: v.primary, fontWeight: 600, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}>Clear</Typography>
          </Box>
        </Box>
        <Divider sx={{ borderColor: v.border }} />

        {/* Date range + expand all */}
        <Box sx={{ px: 3, py: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5 }}>
          <Typography variant="body2" sx={{ color: v.textSecondary }}>
            Start Date: <Box component="span" sx={{ color: v.textPrimary, fontWeight: 700 }}>{START_DATE}</Box>
            <Box component="span" sx={{ ml: 2 }}>End Date: <Box component="span" sx={{ color: v.textPrimary, fontWeight: 700 }}>{END_DATE}</Box></Box>
          </Typography>
          <FormControlLabel
            control={<Checkbox size="small" checked={expandAll} onChange={(e) => handleExpandAll(e.target.checked)} sx={{ color: v.borderStrong, '&.Mui-checked': { color: v.primary } }} />}
            label={<Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: v.textSecondary }}>Expand All</Typography>}
            sx={{ mr: 0 }}
          />
        </Box>
        <Divider sx={{ borderColor: v.border }} />

        {/* Two-column statement */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
          {/* DR side */}
          <Box sx={{ borderRight: { md: `1px solid ${v.border}` } }}>
            <ColumnHeader label="Particulars (DR)" />
            <SectionHeader left="Expenses" right="" />
            {EXPENSE_ROWS.map((line) => <StatementRow key={line.id} line={line} expanded={isOpen(line.id)} onToggle={() => toggle(line.id)} />)}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', px: 2, py: 1.25, borderBottom: `1px solid ${v.border}`, bgcolor: mix.primary(2) }}>
              <Typography variant="body2" sx={{ fontWeight: 700, color: v.textPrimary }}>{fmt(EXPENSE_SUBTOTAL)}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1.25, borderBottom: `1px solid ${v.border}` }}>
              <Typography variant="body2" sx={{ color: v.textPrimary, fontWeight: 500 }}>Net Profit (Income &gt; Expenses)</Typography>
              <Typography variant="body2" sx={{ color: v.success, fontWeight: 700 }}>{fmt(NET_PROFIT)}</Typography>
            </Box>
            <TotalRow label="Total" amount={EXPENSE_TOTAL} />
          </Box>

          {/* CR side */}
          <Box>
            <ColumnHeader label="Particulars (CR)" />
            <SectionHeader left="Income" right="" />
            {INCOME_ROWS.map((line) => <StatementRow key={line.id} line={line} expanded={isOpen(line.id)} onToggle={() => toggle(line.id)} />)}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', px: 2, py: 1.25, borderBottom: `1px solid ${v.border}`, bgcolor: mix.primary(2) }}>
              <Typography variant="body2" sx={{ fontWeight: 700, color: v.textPrimary }}>{fmt(INCOME_SUBTOTAL)}</Typography>
            </Box>
          </Box>
        </Box>
      </Paper>
    </PageShell>
  )
}
