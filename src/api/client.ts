import type { ModuleListResponse } from '@/types/module'
import type { PeriodFilterParams } from '@/types/period'
import {
  listModule,
  getModuleRecord,
  createModuleRecord,
  updateModuleRecord,
  deleteModuleRecord,
  getDashboard,
  getTopSalesShops,
} from '@/mocks/moduleApi'

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

/** Mock-only client — no HTTP. Keeps the same helpers pages already import. */
export const api = {
  async get<T>(url: string, config?: { params?: ModuleListParams }): Promise<{ data: T }> {
    const path = url.replace(/^\//, '')
    if (path === 'dashboard') {
      return { data: getDashboard() as T }
    }
    if (path === 'customers/top-sales-shops' || path.startsWith('customers/top-sales-shops')) {
      return { data: getTopSalesShops(config?.params) as T }
    }
    throw new Error(`Mock API: unknown GET /${path}`)
  },
}

export async function fetchList(endpoint: string, params: ModuleListParams = {}): Promise<ModuleListResponse> {
  return listModule(endpoint, params)
}

export async function fetchOne<T>(endpoint: string, id: string): Promise<T> {
  return getModuleRecord<T>(endpoint, id)
}

export async function createItem<T>(endpoint: string, payload: Partial<T>): Promise<T> {
  return createModuleRecord<T>(endpoint, payload as Record<string, unknown>)
}

export async function updateItem<T>(endpoint: string, id: string, payload: Partial<T>): Promise<T> {
  return updateModuleRecord<T>(endpoint, id, payload as Record<string, unknown>)
}

export async function deleteItem(endpoint: string, id: string): Promise<void> {
  deleteModuleRecord(endpoint, id)
}
