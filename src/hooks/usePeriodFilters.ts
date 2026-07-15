import { useState, useCallback, useMemo } from 'react'
import type { Dayjs } from 'dayjs'
import dayjs from 'dayjs'
import type { PeriodFilterParams, PeriodPreset } from '@/types/period'

function getDateRangeForPeriod(period: PeriodPreset, customFrom: Dayjs | null, customTo: Dayjs | null) {
  const today = dayjs().startOf('day')
  switch (period) {
    case 'day':
      return { dateFrom: today.format('YYYY-MM-DD'), dateTo: today.format('YYYY-MM-DD') }
    case 'weekly':
      return { dateFrom: today.startOf('week').format('YYYY-MM-DD'), dateTo: today.format('YYYY-MM-DD') }
    case 'monthly':
      return { dateFrom: today.startOf('month').format('YYYY-MM-DD'), dateTo: today.format('YYYY-MM-DD') }
    case 'year':
      return { dateFrom: today.startOf('year').format('YYYY-MM-DD'), dateTo: today.format('YYYY-MM-DD') }
    case 'custom':
      return {
        dateFrom: customFrom?.format('YYYY-MM-DD'),
        dateTo: customTo?.format('YYYY-MM-DD'),
      }
    default:
      return {}
  }
}

export function usePeriodFilters(initialPeriod: PeriodPreset = 'monthly') {
  const [period, setPeriod] = useState<PeriodPreset>(initialPeriod)
  const [customFrom, setCustomFrom] = useState<Dayjs | null>(dayjs().startOf('month'))
  const [customTo, setCustomTo] = useState<Dayjs | null>(dayjs())

  const applied = useMemo<PeriodFilterParams>(() => {
    const range = getDateRangeForPeriod(period, customFrom, customTo)
    return { period, ...range }
  }, [period, customFrom, customTo])

  const appliedParams = useMemo(
    () => Object.fromEntries(
      Object.entries(applied).filter(([, v]) => v !== undefined && v !== ''),
    ) as PeriodFilterParams,
    [applied],
  )

  const setPeriodAndApply = useCallback((next: PeriodPreset) => {
    setPeriod(next)
  }, [])

  const resetFilters = useCallback(() => {
    setPeriod('monthly')
    setCustomFrom(dayjs().startOf('month'))
    setCustomTo(dayjs())
  }, [])

  return {
    period,
    customFrom,
    customTo,
    applied: appliedParams,
    setPeriod: setPeriodAndApply,
    setCustomFrom,
    setCustomTo,
    resetFilters,
  }
}
