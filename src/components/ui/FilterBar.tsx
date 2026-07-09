import { Box, TextField, MenuItem, IconButton, Tooltip, InputAdornment, Button, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import FilterListIcon from '@mui/icons-material/FilterList'
import FileDownloadIcon from '@mui/icons-material/FileDownload'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import PrintIcon from '@mui/icons-material/Print'
import RefreshIcon from '@mui/icons-material/Refresh'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import type { Dayjs } from 'dayjs'
import { useState } from 'react'
import { v } from '@/theme/cssVars'
import { primaryButtonSx } from '@/components/ui/PageShell'
import { inputRootSx, toolbarIconButtonSx } from '@/components/ui/cardStyles'

interface FilterBarProps {
  search: string
  onSearchChange: (v: string) => void
  status: string
  onStatusChange: (v: string) => void
  statuses?: string[]
  dateFrom: Dayjs | null
  dateTo: Dayjs | null
  onDateFromChange: (v: Dayjs | null) => void
  onDateToChange: (v: Dayjs | null) => void
  onExportExcel?: () => void
  onExportPdf?: () => void
  onPrint?: () => void
  onRefresh?: () => void
  showDateFilter?: boolean
  showStatusFilter?: boolean
}

export function FilterBar({
  search, onSearchChange, status, onStatusChange, statuses = [],
  dateFrom, dateTo, onDateFromChange, onDateToChange,
  onExportExcel, onExportPdf, onPrint, onRefresh,
  showDateFilter = true, showStatusFilter = true,
}: FilterBarProps) {
  const [moreOpen, setMoreOpen] = useState(false)
  const [extraStatus, setExtraStatus] = useState('')

  const applyMoreFilters = () => {
    if (extraStatus) onStatusChange(extraStatus)
    setMoreOpen(false)
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 1.5,
        alignItems: 'center',
        p: 1.5,
        borderRadius: '10px',
        bgcolor: 'color-mix(in srgb, var(--rs-background) 40%, transparent)',
        backdropFilter: 'blur(20px) saturate(120%)',
        WebkitBackdropFilter: 'blur(20px) saturate(120%)',
        border: `1px solid color-mix(in srgb, var(--rs-border-strong) 40%, transparent)`,
        mb: 2,
      }}
    >
      <TextField
        placeholder="Search records..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        size="small"
        sx={{
          minWidth: { xs: '100%', sm: 220 },
          flex: { sm: 1 },
          maxWidth: 320,
          '& .MuiOutlinedInput-root': inputRootSx,
        }}
        InputProps={{
          startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 18, color: v.textMuted }} /></InputAdornment>,
        }}
      />
      {showStatusFilter && (
        <TextField
          select
          label="Status"
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
          size="small"
          sx={{ minWidth: 130, '& .MuiOutlinedInput-root': inputRootSx }}
        >
          <MenuItem value="">All Status</MenuItem>
          {statuses.map((s) => <MenuItem key={s} value={s} sx={{ textTransform: 'capitalize' }}>{s.replace(/_/g, ' ')}</MenuItem>)}
        </TextField>
      )}
      {showDateFilter && (
        <>
          <DatePicker label="From" value={dateFrom} onChange={onDateFromChange} slotProps={{ textField: { size: 'small', sx: { width: 140, '& .MuiOutlinedInput-root': inputRootSx } } }} />
          <DatePicker label="To" value={dateTo} onChange={onDateToChange} slotProps={{ textField: { size: 'small', sx: { width: 140, '& .MuiOutlinedInput-root': inputRootSx } } }} />
        </>
      )}
      <Box sx={{ flex: 1 }} />
      {onRefresh && (
        <Tooltip title="Refresh">
          <IconButton onClick={onRefresh} size="small" sx={toolbarIconButtonSx}>
            <RefreshIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
      {onExportExcel && (
        <Tooltip title="Export Excel">
          <IconButton onClick={onExportExcel} size="small" sx={toolbarIconButtonSx}>
            <FileDownloadIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
      {onExportPdf && (
        <Tooltip title="Export PDF">
          <IconButton onClick={onExportPdf} size="small" sx={toolbarIconButtonSx}>
            <PictureAsPdfIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
      {onPrint && (
        <Tooltip title="Print">
          <IconButton onClick={onPrint} size="small" sx={toolbarIconButtonSx}>
            <PrintIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
      <Button variant="outlined" size="small" startIcon={<FilterListIcon />} onClick={() => setMoreOpen(true)} sx={{ display: { xs: 'none', md: 'inline-flex' }, borderRadius: '12px', textTransform: 'none', borderColor: v.border, color: v.textSecondary }}>
        More Filters
      </Button>

      <Dialog open={moreOpen} onClose={() => setMoreOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Advanced Filters</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <TextField select label="Additional Status" value={extraStatus} onChange={(e) => setExtraStatus(e.target.value)} size="small">
            <MenuItem value="">None</MenuItem>
            {statuses.map((s) => <MenuItem key={s} value={s}>{s.replace(/_/g, ' ')}</MenuItem>)}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMoreOpen(false)}>Cancel</Button>
          <Button variant="contained" color="primary" onClick={applyMoreFilters} sx={primaryButtonSx}>Apply</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
