import { useState } from 'react'
import { Box, Typography, Paper, Divider, Checkbox, FormControlLabel, Collapse } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import BalanceIcon from '@mui/icons-material/Balance'
import { PageShell, whiteCardSx } from '@/components/ui/PageShell'
import { v, mix } from '@/theme/cssVars'

// ─── Types & Data ─────────────────────────────────────────────────────────────

interface Line {
  id: string
  label: string
  amount: number
  emphasize?: boolean
  children?: { label: string; amount: number }[]
}

const LIABILITIES: Line[] = [
  {
    id: 'source-of-funds', label: 'Source of Funds', amount: 400030.0,
    children: [{ label: 'Capital Account', amount: 400000.0 }, { label: 'Loans', amount: 30.0 }],
  },
]
const TOTAL_LIABILITIES = 400030.0

const EQUITY: Line[] = [
  { id: 'retained-earnings', label: 'RETAINED EARNINGS (Net Profit)', amount: 25200.01, emphasize: true },
]
const TOTAL_EQUITY = 25200.01
const TOTAL_LIABILITIES_EQUITY = 425230.01

const ASSETS: Line[] = [
  {
    id: 'application-of-funds', label: 'Application of Funds', amount: 175056.09,
    children: [{ label: 'Cash & Bank', amount: 175056.09 }],
  },
  { id: 'closing-stock', label: 'CLOSING STOCK', amount: 250173.92, emphasize: true },
]
const TOTAL_ASSETS = 425230.01

const AS_OF_DATE = '17-07-2026'

const fmt = (n: number) => n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

// ─── Row ──────────────────────────────────────────────────────────────────────

function BsRow({ line, expanded, onToggle }: { line: Line; expanded: boolean; onToggle: () => void }) {
  const hasChildren = !!line.children?.length
  return (
    <>
      <Box
        onClick={hasChildren ? onToggle : undefined}
        sx={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          px: 2, py: 1.25, gap: 1, borderBottom: `1px solid ${v.border}`,
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
          <Typography variant="body2" sx={{ color: line.emphasize ? v.primary : v.textPrimary, fontWeight: line.emphasize ? 600 : 500 }} noWrap>{line.label}</Typography>
        </Box>
        <Typography variant="body2" sx={{ color: line.emphasize ? v.primary : v.textSecondary, fontWeight: line.emphasize ? 600 : 500, whiteSpace: 'nowrap' }}>{fmt(line.amount)}</Typography>
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

function BlockHeader({ label }: { label: string }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1.25, bgcolor: mix.primary(8) }}>
      <Typography variant="body2" sx={{ fontWeight: 700, color: v.textPrimary }}>{label}</Typography>
      <Typography variant="body2" sx={{ fontWeight: 700, color: v.textPrimary }}>Amount</Typography>
    </Box>
  )
}

function TotalRow({ label, amount, strong }: { label: string; amount: number; strong?: boolean }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1.4, gap: 1, bgcolor: strong ? mix.primary(12) : mix.primary(4) }}>
      <Typography variant="body2" sx={{ fontWeight: 700, color: v.textPrimary }}>{label}</Typography>
      <Typography variant="body2" sx={{ fontWeight: 700, color: v.textPrimary, whiteSpace: 'nowrap' }}>{fmt(amount)}</Typography>
    </Box>
  )
}

function Block({ children }: { children: React.ReactNode }) {
  return (
    <Box sx={{ border: `1px solid ${v.border}`, borderRadius: '12px', overflow: 'hidden' }}>{children}</Box>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function BalanceSheetPage() {
  const [expandAll, setExpandAll] = useState(false)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  const isOpen = (id: string) => expanded[id] ?? expandAll
  const toggle = (id: string) => setExpanded((m) => ({ ...m, [id]: !isOpen(id) }))
  const handleExpandAll = (checked: boolean) => { setExpandAll(checked); setExpanded({}) }

  return (
    <PageShell
      title="Balance Sheet"
      subtitle="Statement of financial position"
      breadcrumbs={[{ label: 'Home', path: '/' }, { label: 'Accounting', path: '/accounting/accounts' }, { label: 'Balance Sheet' }]}
    >
      {/* Single-tab bar */}
      <Box sx={{ display: 'flex', mb: 3, borderBottom: `1px solid ${v.border}` }}>
        <Box sx={{ px: 2.5, py: 1.5, position: 'relative', fontFamily: 'Inter, system-ui, sans-serif', fontSize: '0.875rem', fontWeight: 700, color: v.primary, '&::after': { content: '""', position: 'absolute', bottom: -1, left: 0, right: 0, height: 2, borderRadius: '2px 2px 0 0', background: `linear-gradient(90deg, ${v.primary}, ${v.secondary})` } }}>
          Balance Sheet
        </Box>
      </Box>

      <Paper sx={{ ...whiteCardSx, p: 0, overflow: 'hidden' }}>
        {/* Card header */}
        <Box sx={{ px: 3, pt: 3, pb: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <BalanceIcon sx={{ color: v.primary, fontSize: 22 }} />
            <Typography variant="h6" sx={{ fontWeight: 700, color: v.textPrimary }}>Balance Sheet</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <SearchIcon sx={{ color: v.textSecondary, fontSize: 20 }} />
            <Typography variant="body2" sx={{ color: v.primary, fontWeight: 600, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}>Clear</Typography>
          </Box>
        </Box>
        <Divider sx={{ borderColor: v.border }} />

        {/* As of date + expand all */}
        <Box sx={{ px: 3, py: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5 }}>
          <Typography variant="body2" sx={{ color: v.textSecondary }}>
            As of Date : <Box component="span" sx={{ color: v.textPrimary, fontWeight: 700 }}>{AS_OF_DATE}</Box>
          </Typography>
          <FormControlLabel
            control={<Checkbox size="small" checked={expandAll} onChange={(e) => handleExpandAll(e.target.checked)} sx={{ color: v.borderStrong, '&.Mui-checked': { color: v.primary } }} />}
            label={<Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: v.textSecondary }}>Expand All</Typography>}
            sx={{ mr: 0 }}
          />
        </Box>
        <Divider sx={{ borderColor: v.border }} />

        {/* Grid: left (Liabilities + Equity) / right (Assets) */}
        <Box sx={{ p: 3, display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, alignItems: 'start' }}>
          {/* Left column */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Block>
              <BlockHeader label="Liabilities" />
              {LIABILITIES.map((line) => <BsRow key={line.id} line={line} expanded={isOpen(line.id)} onToggle={() => toggle(line.id)} />)}
              <TotalRow label="Total Liabilities" amount={TOTAL_LIABILITIES} />
            </Block>

            <Block>
              <BlockHeader label="Equity" />
              {EQUITY.map((line) => <BsRow key={line.id} line={line} expanded={isOpen(line.id)} onToggle={() => toggle(line.id)} />)}
              <TotalRow label="Total Equity" amount={TOTAL_EQUITY} />
              <TotalRow label="Total Liabilities and Equity" amount={TOTAL_LIABILITIES_EQUITY} strong />
            </Block>
          </Box>

          {/* Right column */}
          <Box>
            <Block>
              <BlockHeader label="Assets" />
              {ASSETS.map((line) => <BsRow key={line.id} line={line} expanded={isOpen(line.id)} onToggle={() => toggle(line.id)} />)}
              <TotalRow label="Total Assets" amount={TOTAL_ASSETS} />
            </Block>
          </Box>
        </Box>
      </Paper>
    </PageShell>
  )
}
