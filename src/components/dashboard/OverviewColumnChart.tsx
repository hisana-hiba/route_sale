import { Grid, Skeleton, Typography } from '@mui/material'
import { motion } from 'framer-motion'
import { DashboardKpiCard } from '@/components/dashboard/DashboardKpiCard'
import { ApexChart } from '@/components/charts/ApexChart'
import { DataPanel } from '@/components/ui/DataPanel'
import { dashboardGridSpacing } from '@/components/ui/cardStyles'
import { formatStatValue } from '@/hooks/useModuleData'
import type { ChartData } from '@/types/module'
import type { StatDef } from '@/types/module'

interface KpiItem {
  label: string
  value: string
  trend: number
  trendLabel: string
  icon: React.ReactNode
  iconIndex: number
}

interface OverviewColumnChartProps {
  kpis: KpiItem[]
  chartTitle: string
  chart?: ChartData
  loading?: boolean
}

const miniCardGap = 1.5

export function OverviewColumnChart({ kpis, chartTitle, chart, loading }: OverviewColumnChartProps) {
  return (
    <Grid container spacing={dashboardGridSpacing} sx={{ mb: dashboardGridSpacing }}>
      <Grid size={{ xs: 12, lg: 4 }}>
        <Grid container spacing={miniCardGap} sx={{ height: '100%' }}>
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <Grid key={i} size={{ xs: 6 }}>
                  <Skeleton variant="rounded" height={88} sx={{ borderRadius: '20px' }} />
                </Grid>
              ))
            : kpis.slice(0, 4).map((kpi, i) => (
                <Grid key={kpi.label} size={{ xs: 6 }}>
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    style={{ height: '100%' }}
                  >
                    <DashboardKpiCard {...kpi} mini />
                  </motion.div>
                </Grid>
              ))}
        </Grid>
      </Grid>

      <Grid size={{ xs: 12, lg: 8 }} sx={{ display: 'flex' }}>
        {loading ? (
          <Skeleton variant="rounded" sx={{ width: '100%', minHeight: { xs: 260, lg: 220 }, borderRadius: '16px' }} />
        ) : (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }} style={{ width: '100%' }}>
            <DataPanel
              title={chartTitle}
              subtitle="Monthly order value trend"
              fillHeight
              sx={{ height: '100%', minHeight: { xs: 260, lg: 220 }, '& > div:last-child': { px: 2, pt: 1.5, pb: 1 } }}
            >
              {chart ? (
                <ApexChart data={chart} type="bar" height={220} />
              ) : (
                <Typography variant="body2" color="text.secondary">No chart data available.</Typography>
              )}
            </DataPanel>
          </motion.div>
        )}
      </Grid>
    </Grid>
  )
}

export function buildKpisFromStats(
  stats: StatDef[],
  data: Record<string, number> | undefined,
  icons: React.ReactNode[],
  trends: number[],
  trendLabels: string[],
  loading?: boolean,
): KpiItem[] {
  return stats.map((stat, i) => ({
    label: stat.label,
    value: loading ? '—' : formatStatValue(data?.[stat.key], stat.format),
    trend: trends[i % trends.length],
    trendLabel: trendLabels[i % trendLabels.length],
    icon: icons[i % icons.length],
    iconIndex: i,
  }))
}
