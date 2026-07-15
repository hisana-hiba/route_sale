import type { ListParams } from '@/api/client'

export type CustomerPeriod = 'day' | 'weekly' | 'monthly' | 'year' | 'custom'

export interface CustomerFilterParams extends ListParams {
  period?: CustomerPeriod
  route?: string
  shopCategory?: string
  lastVisitFrom?: string
  lastVisitTo?: string
  creditMin?: string
  creditMax?: string
  outstandingMin?: string
  outstandingMax?: string
}

export const CUSTOMER_PERIOD_LABELS: Record<CustomerPeriod, string> = {
  day: 'Day',
  weekly: 'Weekly',
  monthly: 'Monthly',
  year: 'Year',
  custom: 'Custom Date',
}

export const emptyCustomerFilters: CustomerFilterParams = {}
