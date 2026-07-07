import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type UserRole = 'salesman' | 'deliveryAgent' | 'manager' | 'admin' | 'shopOwner'

export interface AuthUser {
  id: string
  name: string
  mobile: string
  role: UserRole
  email?: string
}

interface AuthState {
  token: string | null
  user: AuthUser | null
  login: (token: string, user: AuthUser) => void
  logout: () => void
  isAuthenticated: () => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      login: (token, user) => set({ token, user }),
      logout: () => set({ token: null, user: null }),
      isAuthenticated: () => !!get().token,
    }),
    { name: 'route-sale-auth' },
  ),
)
