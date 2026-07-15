export type PeriodPreset = 'day' | 'weekly' | 'monthly' | 'year' | 'custom'

export interface PeriodFilterParams {
  period?: PeriodPreset
  dateFrom?: string
  dateTo?: string
}

export const PERIOD_LABELS: Record<PeriodPreset, string> = {
  day: 'Day',
  weekly: 'Weekly',
  monthly: 'Monthly',
  year: 'Year',
  custom: 'Custom Date',
}
