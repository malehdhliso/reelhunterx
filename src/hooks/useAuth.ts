import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../services/supabase'
import type { User, Session } from '@supabase/supabase-js'

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEmployer, setIsEmployer] = useState(false)

  const initialize = useCallback(async () => {
    try {
      console.log("useAuth - initialize called")
      setIsLoading(true)
      
      // Get current session
      const { data: { session: currentSession } } = await supabase.auth.getSession()
      console.log("Current session:", currentSession ? "Found" : "None")
      
      if (currentSession) {
        setSession(currentSession)
        setUser(currentSession.user)
        
        // Check if user is an employer/recruiter
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('user_id', currentSession.user.id)
          .single()
        
        console.log("Profile check result:", { profile, error })
        
        setIsEmployer(profile?.role === 'recruiter')
      } else {
        setSession(null)
        setUser(null)
        setIsEmployer(false)
      }
    } catch (error) {
      console.error('Error initializing auth:', error)
    } finally {
      console.log("useAuth - initialize completed, setting isLoading to false")
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    console.log("useAuth - useEffect running")
    initialize()
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log("Auth state changed:", event, newSession ? "Session exists" : "No session")
        setSession(newSession)
        setUser(newSession?.user || null)
        
        if (newSession?.user) {
          // Check if user is an employer/recruiter
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('user_id', newSession.user.id)
            .single()
          
          console.log("Profile check on auth change:", { profile, error })
          
          setIsEmployer(profile?.role === 'recruiter')
        } else {
          setIsEmployer(false)
        }
        
        console.log("Auth state change completed, setting isLoading to false")
        setIsLoading(false)
      }
    )
    
    return () => {
      subscription.unsubscribe()
    }
  }, [initialize])

  const signIn = async (email: string, password: string) => {
    console.log("Signing in with email:", email)
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    if (error) throw error
    
    console.log("Sign in successful:", data.user?.id)
    return data
  }

  const signOut = async () => {
    console.log("Signing out")
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    console.log("Sign out successful")
  }

  const getAccessToken = () => {
    return session?.access_token || null
  }

  console.log("useAuth - Current state:", { 
    isLoading, 
    isAuthenticated: !!user, 
    userId: user?.id,
    isEmployer 
  })

  return {
    user,
    session,
    isLoading,
    isEmployer,
    isAuthenticated: !!user,
    accessToken: session?.access_token || null,
    initialize,
    signIn,
    signOut,
    getAccessToken
  }
}