import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../services/supabase'
import type { User, Session } from '@supabase/supabase-js'

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEmployer, setIsEmployer] = useState(false)
  const [initialized, setInitialized] = useState(false)

  // Always define useCallback - never conditionally
  const initialize = useCallback(async () => {
    if (initialized) {
      console.log("useAuth - Already initialized, skipping")
      return
    }

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
      
      setInitialized(true)
    } catch (error) {
      console.error('Error initializing auth:', error)
      setInitialized(true)
    } finally {
      console.log("useAuth - initialize completed, setting isLoading to false")
      setIsLoading(false)
    }
  }, [initialized])

  useEffect(() => {
    console.log("useAuth - useEffect running, initialized:", initialized)
    
    // Set up auth state change listener first (only once)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log("Auth state changed:", event, newSession ? "Session exists" : "No session")
        
        setSession(newSession)
        setUser(newSession?.user || null)
        
        if (newSession?.user) {
          // Check if user is an employer/recruiter
          try {
            const { data: profile, error } = await supabase
              .from('profiles')
              .select('role')
              .eq('user_id', newSession.user.id)
              .single()
            
            console.log("Profile check on auth change:", { profile, error })
            
            setIsEmployer(profile?.role === 'recruiter')
          } catch (error) {
            console.error('Error checking profile on auth change:', error)
            setIsEmployer(false)
          }
        } else {
          setIsEmployer(false)
        }
        
        // Always set loading to false after auth state change
        console.log("Auth state change completed, setting isLoading to false")
        setIsLoading(false)
        setInitialized(true)
      }
    )
    
    // Only initialize if not already initialized
    if (!initialized) {
      initialize()
    }
    
    // Cleanup function
    return () => {
      subscription.unsubscribe()
    }
  }, [initialize, initialized])

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

  const signUp = async (email: string, password: string, userData?: { firstName?: string, lastName?: string }) => {
    console.log("Signing up with email:", email)
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: userData?.firstName || '',
          last_name: userData?.lastName || '',
          full_name: userData?.firstName && userData?.lastName 
            ? `${userData.firstName} ${userData.lastName}` 
            : ''
        }
      }
    })
    
    if (error) throw error
    
    console.log("Sign up successful:", data.user?.id)
    
    // If user is created, ensure profile exists
    if (data.user) {
      try {
        // Check if profile already exists
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('user_id', data.user.id)
          .single()
        
        if (!existingProfile) {
          // Create profile if it doesn't exist
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              user_id: data.user.id,
              email: email,
              first_name: userData?.firstName || '',
              last_name: userData?.lastName || '',
              role: 'recruiter' // Default to recruiter for this platform
            })
          
          if (profileError) {
            console.error('Error creating profile:', profileError)
            // Don't throw here as the user is already created
          } else {
            console.log('Profile created successfully for user:', data.user.id)
          }
        }
      } catch (profileError) {
        console.error('Error handling profile creation:', profileError)
      }
    }
    
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
    isEmployer,
    initialized
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
    signUp,
    signOut,
    getAccessToken
  }
}