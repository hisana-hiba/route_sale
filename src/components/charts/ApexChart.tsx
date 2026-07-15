import { useMemo } from 'react'
import { useTheme, Box, Typography } from '@mui/material'
import Chart from 'react-apexcharts'
import type { ApexOptions } from 'apexcharts'
import type { ChartData } from '@/types/module'
import { useAppStore } from '@/store/appStore'
import { getDesignTokens } from '@/theme/palette'
import { colors } from '@/theme/palette'

interface ApexChartProps {
  data: ChartData
  type?: 'line' | 'bar' | 'area' | 'donut' | 'pie'
  height?: number
  yAxisFormat?: 'K' | 'L'
}

export function ApexChart({ data, type = 'area', height = 300, yAxisFormat = 'K' }: ApexChartProps) {
  const theme = useTheme()
  const mode = useAppStore((s) => s.themeMode)
  const colorPreset = useAppStore((s) => s.colorPreset)
  const customAccent = useAppStore((s) => s.customAccent)
  const tokens = getDesignTokens(colorPreset, mode, customAccent)

  const chartType = type === 'donut' ? 'donut' : type

  const options: ApexOptions = useMemo(() => ({
    chart: {
      type: chartType,
      toolbar: { show: false },
      fontFamily: theme.typography.fontFamily,
      animations: { enabled: true, speed: 800, animateGradually: { enabled: true } },
      sparkline: { enabled: false },
    },
    colors: type === 'bar'
      ? [tokens.primary || '#1A2E25', tokens.warning || '#EA580C']
      : type === 'area'
        ? [tokens.primary || '#1A2E25']
        : [tokens.primary || '#1A2E25', tokens.secondary || '#D4A745', tokens.info || '#2563EB', tokens.success || '#16A34A'],
    dataLabels: { enabled: false },
    stroke: { 
      show: true,
      curve: 'smooth', 
      width: type === 'bar' ? 2 : 2.5,
      colors: type === 'bar' ? ['transparent'] : undefined
    },
    fill: {
      type: type === 'area' ? 'gradient' : 'solid',
      opacity: 1,
      gradient: { shadeIntensity: 1, opacityFrom: 0.35, opacityTo: 0.02, stops: [0, 100] },
    },
    plotOptions: {
      bar: { borderRadius: 4, borderRadiusApplication: 'end', columnWidth: '55%' },
      pie: { donut: { size: '72%', labels: { show: true, total: { show: true, fontWeight: 700 } } } },
    },
    xaxis: {
      type: 'category',
      categories: data?.categories || [],
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { style: { colors: Array(data?.categories?.length || 12).fill(tokens.textSecondary), fontSize: '11px', fontWeight: 500 } },
    },
    yaxis: {
      min: 0,
      ...(yAxisFormat === 'L' ? { max: 1800000, tickAmount: 6 } : {}),
      labels: {
        style: { colors: Array(10).fill(tokens.textSecondary), fontSize: '11px' },
        formatter: (v) => {
          const val = Number(v)
          if (isNaN(val)) return ''
          if (val === 0) return '₹0'
          if (yAxisFormat === 'L') return `₹${(val / 100000).toFixed(0)}L`
          return `₹${(val / 1000).toFixed(0)}K`
        },
      },
    },
    grid: {
      borderColor: tokens.border || '#e5e7eb',
      strokeDashArray: 4,
      xaxis: { lines: { show: false } },
    },
    legend: {
      position: 'top', horizontalAlign: 'right',
      labels: { colors: tokens.textPrimary },
    },
    tooltip: {
      theme: mode,
      style: { fontSize: '12px' },
      y: { formatter: (v) => `₹${Number(v).toLocaleString('en-IN')}` },
    },
  }), [data?.categories, theme, chartType, type, mode, tokens, yAxisFormat])

  if (!data || !data.series || data.series.length === 0) {
    return (
      <Box sx={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography color="text.secondary" variant="body2">No data available</Typography>
      </Box>
    )
  }

  const series = type === 'donut'
    ? data.series[0]?.data ?? []
    : data.series

  const labels = type === 'donut' ? data.categories : undefined

  return (
    <Chart
      options={{ ...options, labels }}
      series={type === 'donut' ? series as unknown as number[] : series}
      type={chartType}
      height={height}
      width="100%"
    />
  )
}
