import { useMemo, useState } from 'react'
import { Box, Tabs, Tab, Typography, LinearProgress } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined'
import { fetchList } from '@/api/client'
import { DataPanel } from '@/components/ui/DataPanel'
import { StatusChip } from '@/components/ui/StatusChip'
import { formatCurrency } from '@/utils/export'
import { v } from '@/theme/cssVars'
import type { ModuleListResponse } from '@/types/module'

/** Product-level stock split by warehouse, shown as a tabbed panel on Warehouse screens. */
export function WarehouseStockTabs() {
  const { data, isLoading } = useQuery({
    queryKey: ['module', 'stock-management-current-stock', 'warehouse-stock-tabs'],
    queryFn: () => fetchList('/stock-management-current-stock', { page: 1, pageSize: 500 }) as Promise<ModuleListResponse>,
  })
  const allRows = data?.data ?? []

  const warehouses = useMemo(() => {
    const map = new Map<string, Record<string, unknown>[]>()
    allRows.forEach((r) => {
      const w = String(r.warehouse ?? 'Unknown')
      if (!map.has(w)) map.set(w, [])
      map.get(w)!.push(r)
    })
    return [...map.entries()]
      .map(([name, items]) => ({
        name,
        items,
        totalStock: items.reduce((sum, it) => sum + (Number(it.stock) || 0), 0),
        totalValue: items.reduce((sum, it) => sum + (Number(it.stock) || 0) * (Number(it.mrp) || 0), 0),
        lowStock: items.filter((it) => it.status === 'low_stock' || it.status === 'overdue').length,
      }))
      .sort((a, b) => b.totalStock - a.totalStock)
  }, [allRows])

  const [tab, setTab] = useState(0)
  const activeIndex = Math.min(tab, Math.max(warehouses.length - 1, 0))
  const active = warehouses[activeIndex]

  if (isLoading || warehouses.length === 0) return null

  return (
    <DataPanel
      title="Warehouse Stock"
      subtitle="Product-wise stock split across locations"
      noPadding
    >
      <Tabs
        value={activeIndex}
        onChange={(_, next) => setTab(next)}
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
        sx={{
          px: 2,
          minHeight: 44,
          borderBottom: `1px solid ${v.border}`,
          '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, fontSize: '0.82rem', minHeight: 44 },
        }}
      >
        {warehouses.map((w) => (
          <Tab key={w.name} label={`${w.name} (${w.items.length})`} />
        ))}
      </Tabs>

      {active && (
        <Box sx={{ p: { xs: 2, md: 2.5 } }}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
            <Box sx={{ minWidth: 120 }}>
              <Typography variant="caption" sx={{ color: v.textMuted }}>Products</Typography>
              <Typography sx={{ fontWeight: 800, fontSize: '1.05rem', color: v.textPrimary }}>{active.items.length}</Typography>
            </Box>
            <Box sx={{ minWidth: 120 }}>
              <Typography variant="caption" sx={{ color: v.textMuted }}>Total Units</Typography>
              <Typography sx={{ fontWeight: 800, fontSize: '1.05rem', color: v.textPrimary }}>
                {new Intl.NumberFormat('en-IN').format(active.totalStock)}
              </Typography>
            </Box>
            <Box sx={{ minWidth: 120 }}>
              <Typography variant="caption" sx={{ color: v.textMuted }}>Stock Value</Typography>
              <Typography sx={{ fontWeight: 800, fontSize: '1.05rem', color: v.textPrimary }}>
                {formatCurrency(active.totalValue)}
              </Typography>
            </Box>
            <Box sx={{ minWidth: 120 }}>
              <Typography variant="caption" sx={{ color: v.textMuted }}>Low / Out of Stock</Typography>
              <Typography sx={{ fontWeight: 800, fontSize: '1.05rem', color: active.lowStock > 0 ? v.error : v.textPrimary }}>
                {active.lowStock}
              </Typography>
            </Box>
          </Box>

          {active.items.length === 0 ? (
            <Box sx={{ py: 4, textAlign: 'center' }}>
              <Inventory2OutlinedIcon sx={{ fontSize: 36, color: v.textMuted, mb: 1 }} />
              <Typography variant="body2" color="text.secondary">No stock recorded at this warehouse.</Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, maxHeight: 320, overflowY: 'auto', pr: 0.5 }}>
              {active.items.slice(0, 30).map((r) => {
                const stock = Number(r.stock) || 0
                const min = Number(r.minStock) || 1
                const ratio = Math.min(Math.round((stock / min) * 100), 100)
                return (
                  <Box
                    key={String(r.id)}
                    sx={{
                      display: 'flex', alignItems: 'center', gap: 1.5,
                      px: 1.5, py: 1, borderRadius: '10px',
                      border: `1px solid ${v.border}`,
                    }}
                  >
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: v.textPrimary, lineHeight: 1.2 }} noWrap>
                        {String(r.name)}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.4 }}>
                        <Typography sx={{ fontSize: 11, color: v.textMuted }} noWrap>{String(r.category ?? '')}</Typography>
                        <Box sx={{ flex: 1, height: 4, borderRadius: 2, bgcolor: 'color-mix(in srgb, var(--rs-border-strong) 28%, transparent)', overflow: 'hidden', minWidth: 24, maxWidth: 120 }}>
                          <Box sx={{ height: '100%', width: `${ratio}%`, bgcolor: ratio < 40 ? v.error : v.success, borderRadius: 2 }} />
                        </Box>
                      </Box>
                    </Box>
                    <Typography sx={{ fontSize: 13, fontWeight: 700, color: v.textPrimary, flexShrink: 0 }}>{stock}</Typography>
                    <Box sx={{ flexShrink: 0 }}><StatusChip status={String(r.status)} /></Box>
                  </Box>
                )
              })}
              {active.items.length > 30 && (
                <Typography variant="caption" sx={{ color: v.textMuted, textAlign: 'center', pt: 0.5 }}>
                  Showing first 30 of {active.items.length} products
                </Typography>
              )}
            </Box>
          )}

          {active.items.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <LinearProgress
                variant="determinate"
                value={Math.min((active.lowStock / active.items.length) * 100, 100)}
                color={active.lowStock > 0 ? 'warning' : 'success'}
                sx={{ height: 5, borderRadius: 2 }}
              />
              <Typography variant="caption" sx={{ color: v.textMuted, mt: 0.5, display: 'block' }}>
                {active.lowStock} of {active.items.length} products at or below reorder level
              </Typography>
            </Box>
          )}
        </Box>
      )}
    </DataPanel>
  )
}
