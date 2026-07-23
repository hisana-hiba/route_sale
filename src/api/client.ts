import axios from 'axios'
import type { ModuleListResponse } from '@/types/module'
import type { PeriodFilterParams } from '@/types/period'

export const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
})

export interface ListParams {
  page?: number
  pageSize?: number
  search?: string
  status?: string
  dateFrom?: string
  dateTo?: string
}

export type ModuleListParams = ListParams & Partial<PeriodFilterParams> & Partial<{
  route: string
  shopCategory: string
  warehouse: string
  lastVisitFrom: string
  lastVisitTo: string
  creditMin: string
  creditMax: string
  outstandingMin: string
  outstandingMax: string
  view: string
  payrollMonth: string
}>

export async function fetchList<T>(endpoint: string, params: ModuleListParams = {}): Promise<ModuleListResponse> {
  const { data } = await api.get<ModuleListResponse>(endpoint, { params })
  return data
}

export async function fetchOne<T>(endpoint: string, id: string): Promise<T> {
  const { data } = await api.get<T>(`${endpoint}/${id}`)
  return data
}

export async function createItem<T>(endpoint: string, payload: Partial<T>): Promise<T> {
  const { data } = await api.post<T>(endpoint, payload)
  return data
}

export async function updateItem<T>(endpoint: string, id: string, payload: Partial<T>): Promise<T> {
  const { data } = await api.put<T>(`${endpoint}/${id}`, payload)
  return data
}

export async function deleteItem(endpoint: string, id: string): Promise<void> {
  await api.delete(`${endpoint}/${id}`)
}
