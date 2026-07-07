import { useState, useMemo, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import dayjs, { type Dayjs } from 'dayjs'
import { fetchList, createItem, updateItem, deleteItem } from '@/api/client'
import type { ModuleConfig, ModuleListResponse } from '@/types/module'

export function useModuleData(config: ModuleConfig) {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [dateFrom, setDateFrom] = useState<Dayjs | null>(null)
  const [dateTo, setDateTo] = useState<Dayjs | null>(null)

  const listParams = useMemo(() => ({
    page: page + 1,
    pageSize,
    search: search || undefined,
    status: statusFilter || undefined,
    dateFrom: dateFrom?.format('YYYY-MM-DD'),
    dateTo: dateTo?.format('YYYY-MM-DD'),
  }), [page, pageSize, search, statusFilter, dateFrom, dateTo])

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['module', config.slug, listParams],
    queryFn: () => fetchList<Record<string, unknown>>(`/${config.slug}`, listParams) as Promise<ModuleListResponse>,
  })

  const createMutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) => createItem(`/${config.slug}`, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['module', config.slug] }),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Record<string, unknown> }) =>
      updateItem(`/${config.slug}`, id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['module', config.slug] }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteItem(`/${config.slug}`, id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['module', config.slug] }),
  })

  const resetPage = useCallback(() => setPage(0), [])

  return {
    data, isLoading, isFetching, refetch,
    page, setPage, pageSize, setPageSize,
    search, setSearch: (v: string) => { setSearch(v); resetPage() },
    statusFilter, setStatusFilter: (v: string) => { setStatusFilter(v); resetPage() },
    dateFrom, setDateFrom: (v: Dayjs | null) => { setDateFrom(v); resetPage() },
    dateTo, setDateTo: (v: Dayjs | null) => { setDateTo(v); resetPage() },
    createMutation, updateMutation, deleteMutation,
  }
}

export function formatStatValue(value: number | undefined, format?: string) {
  if (value === undefined) return '—'
  if (format === 'currency') return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value)
  if (format === 'percent') return `${value}%`
  return new Intl.NumberFormat('en-IN').format(value)
}
