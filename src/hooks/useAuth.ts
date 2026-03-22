import { useQuery, useQueryClient } from '@tanstack/react-query'
import { me, login as apiLogin, logout as apiLogout } from '@/api/auth'
import type { User } from '@/types'

export function useAuth() {
  const queryClient = useQueryClient()

  const { data: user, isLoading } = useQuery<User | null>({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      try {
        return await me()
      } catch {
        return null
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
  })

  async function login(email: string, password: string) {
    await apiLogin(email, password)
    await queryClient.invalidateQueries({ queryKey: ['auth', 'me'] })
  }

  async function logout() {
    await apiLogout()
    queryClient.setQueryData(['auth', 'me'], null)
  }

  return {
    user: user ?? null,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
  }
}
