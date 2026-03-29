/**
 * 用户状态管理
 */
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { UserResponse } from '../services/api'

interface UserState {
  user: UserResponse | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null

  // Actions
  setUser: (user: UserResponse | null) => void
  setToken: (token: string | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  logout: () => void
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setToken: (token) => {
        if (token) {
          localStorage.setItem('access_token', token)
        } else {
          localStorage.removeItem('access_token')
        }
        set({ token })
      },
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      logout: () => {
        localStorage.removeItem('access_token')
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
        })
      },
    }),
    {
      name: 'user-storage',
      partialize: (state) => ({ token, isAuthenticated }),
    }
  )
)
