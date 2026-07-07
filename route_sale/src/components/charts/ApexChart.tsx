import { useMemo } from 'react'
import { useTheme, alpha } from '@mui/material'
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
}

export function ApexChart({ data, type = 'area', height = 300 }: ApexChartProps) {
  const theme = useTheme()
  const mode = useAppStore((s) => s.themeMode)
  const colorPreset = useAppStore((s) => s.colorPreset)
  const customAccent = useAppStore((s) => s.customAccent)
  const tokens = getDesignTokens(colorPreset, mode, customAccent)

  const options: ApexOptions = useMemo(() => ({
    chart: {
      toolbar: { show: false },
      fontFamily: theme.typography.fontFamily,
      animations: { enabled: true, speed: 800, animateGradually: { enabled: true } },
      sparkline: { enabled: false },
    },
    colors: type === 'bar'
      ? [colors.success, colors.warning]
      : type === 'area'
        ? [colors.primary]
        : [colors.primary, tokens.secondary, tokens.info, tokens.success],
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: type === 'bar' ? 0 : 2.5 },
    fill: {
      type: type === 'area' ? 'gradient' : 'solid',
      gradient: { shadeIntensity: 1, opacityFrom: 0.35, opacityTo: 0.02, stops: [0, 100] },
    },
    plotOptions: {
      bar: { borderRadius: 6, columnWidth: '45%', borderRadiusApplication: 'end' },
      pie: { donut: { size: '72%', labels: { show: true, total: { show: true, fontWeight: 700 } } } },
    },
    xaxis: {
      categories: data.categories,
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { style: { colors: tokens.textSecondary, fontSize: '11px', fontWeight: 500 } },
    },
    yaxis: {
      labels: {
        style: { colors: tokens.textSecondary, fontSize: '11px' },
        formatter: (v) => `₹${(v / 1000).toFixed(0)}K`,
      },
    },
    grid: {
      borderColor: tokens.border,
      strokeDashArray: 4,
      xaxis: { lines: { show: false } },
    },
    legend: {
      position: 'top', horizontalAlign: 'right',
      labels: { colors: tokens.textPrimary },
      markers: { size: 6, shape: 'circle' },
    },
    tooltip: {
      theme: mode,
      style: { fontSize: '12px' },
      y: { formatter: (v) => `₹${v.toLocaleString('en-IN')}` },
    },
  }), [data.categories, theme, type, mode, tokens])

  const series = type === 'donut'
    ? data.series[0]?.data ?? []
    : data.series

  const chartType = type === 'donut' ? 'donut' : type
  const labels = type === 'donut' ? data.categories : undefined

  return (
    <Chart
      options={{ ...options, labels }}
      series={type === 'donut' ? series as unknown as number[] : series}
      type={chartType}
      height={height}
    />
  )
}
