import { useState, useCallback, useMemo } from 'react'
import type { Dayjs } from 'dayjs'
import dayjs from 'dayjs'
import type { CustomerFilterParams, CustomerPeriod } from '@/types/customer'

function getDateRangeForPeriod(period: CustomerPeriod, customFrom: Dayjs | null, customTo: Dayjs | null) {
  const today = dayjs().startOf('day')
  switch (period) {
    case 'day':
      return { lastVisitFrom: today.format('YYYY-MM-DD'), lastVisitTo: today.format('YYYY-MM-DD') }
    case 'weekly':
      return { lastVisitFrom: today.startOf('week').format('YYYY-MM-DD'), lastVisitTo: today.format('YYYY-MM-DD') }
    case 'monthly':
      return { lastVisitFrom: today.startOf('month').format('YYYY-MM-DD'), lastVisitTo: today.format('YYYY-MM-DD') }
    case 'year':
      return { lastVisitFrom: today.startOf('year').format('YYYY-MM-DD'), lastVisitTo: today.format('YYYY-MM-DD') }
    case 'custom':
      return {
        lastVisitFrom: customFrom?.format('YYYY-MM-DD'),
        lastVisitTo: customTo?.format('YYYY-MM-DD'),
      }
    default:
      return {}
  }
}

function buildAppliedParams(
  period: CustomerPeriod,
  customFrom: Dayjs | null,
  customTo: Dayjs | null,
): CustomerFilterParams {
  const range = getDateRangeForPeriod(period, customFrom, customTo)
  return { period, ...range }
}

export function useCustomerFilters(initialPeriod: CustomerPeriod = 'monthly') {
  const [period, setPeriod] = useState<CustomerPeriod>(initialPeriod)
  const [customFrom, setCustomFrom] = useState<Dayjs | null>(dayjs().startOf('month'))
  const [customTo, setCustomTo] = useState<Dayjs | null>(dayjs())

  const applied = useMemo(
    () => buildAppliedParams(period, customFrom, customTo),
    [period, customFrom, customTo],
  )

  const appliedParams = useMemo(
    () => Object.fromEntries(
      Object.entries(applied).filter(([, v]) => v !== undefined && v !== ''),
    ) as CustomerFilterParams,
    [applied],
  )

  const setPeriodAndApply = useCallback((next: CustomerPeriod) => {
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
