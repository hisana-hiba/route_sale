import { handleFlowRequest } from '@/mocks/flowApi'

/** Mock-only flow client — no HTTP / axios. */
export async function apiCall<T>(path: string, options?: { method?: string; body?: unknown }): Promise<T> {
  return handleFlowRequest<T>(options?.method ?? 'GET', path, options?.body)
}

export async function login(mobile: string, password: string) {
  return apiCall<{ token: string; user: { id: string; name: string; mobile: string; role: string; email?: string } }>(
    '/auth/login',
    { method: 'POST', body: { mobile, password } },
  )
}
