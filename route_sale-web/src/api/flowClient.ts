import axios from 'axios'
import { useAuthStore } from '@/store/authStore'

const API_BASE = import.meta.env.VITE_API_URL ?? '/api/v1'

export const flowApi = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
})

flowApi.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export async function apiCall<T>(path: string, options?: { method?: string; body?: unknown }): Promise<T> {
  const { data } = await flowApi.request<{ success: boolean; data: T; error?: { message: string } }>({
    url: path,
    method: options?.method ?? 'GET',
    data: options?.body,
  })
  if (data.success === false) throw new Error(data.error?.message ?? 'API error')
  return data.data
}

export async function login(mobile: string, password: string) {
  const result = await apiCall<{ token: string; user: { id: string; name: string; mobile: string; role: string; email?: string } }>(
    '/auth/login',
    { method: 'POST', body: { mobile, password } },
  )
  return result
}
