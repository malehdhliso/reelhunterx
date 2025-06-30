import { useEffect } from 'react'
import { useAuthStore } from '../store/authStore'

export const useAuth = () => {
  const { user, session, isLoading, isEmployer, initialize, signIn, signOut, getAccessToken } = useAuthStore()

  useEffect(() => {
    initialize()
  }, [initialize])

  return {
    user,
    session,
    isLoading,
    isEmployer,
    signIn,
    signOut,
    getAccessToken,
    accessToken: session?.access_token || null,
    isAuthenticated: !!user,
  }
}