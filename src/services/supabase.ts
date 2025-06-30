import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          user_id: string
          email: string
          first_name: string | null
          last_name: string | null
          headline: string | null
          role: 'candidate' | 'recruiter'
          completion_score: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          email: string
          first_name?: string | null
          last_name?: string | null
          headline?: string | null
          role?: 'candidate' | 'recruiter'
          completion_score?: number | null
        }
        Update: {
          email?: string
          first_name?: string | null
          last_name?: string | null
          headline?: string | null
          role?: 'candidate' | 'recruiter'
          completion_score?: number | null
          updated_at?: string
        }
      }
      skills: {
        Row: {
          id: string
          profile_id: string
          name: string
          verified: boolean
          video_verified: boolean | null
          video_demo_url: string | null
          proficiency: string | null
          created_at: string
        }
        Insert: {
          profile_id: string
          name: string
          verified?: boolean
          video_verified?: boolean | null
          video_demo_url?: string | null
          proficiency?: string | null
        }
        Update: {
          name?: string
          verified?: boolean
          video_verified?: boolean | null
          video_demo_url?: string | null
          proficiency?: string | null
        }
      }
      availability_updates: {
        Row: {
          id: string
          profile_id: string
          availability_status: 'available' | 'open' | 'not-looking'
          available_from: string | null
          notice_period_days: number | null
          salary_expectation_min: number | null
          salary_expectation_max: number | null
          preferred_work_type: string | null
          location_preferences: string[] | null
          notes: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          profile_id: string
          availability_status: 'available' | 'open' | 'not-looking'
          available_from?: string | null
          notice_period_days?: number | null
          salary_expectation_min?: number | null
          salary_expectation_max?: number | null
          preferred_work_type?: string | null
          location_preferences?: string[] | null
          notes?: string | null
          is_active?: boolean
        }
        Update: {
          availability_status?: 'available' | 'open' | 'not-looking'
          available_from?: string | null
          notice_period_days?: number | null
          salary_expectation_min?: number | null
          salary_expectation_max?: number | null
          preferred_work_type?: string | null
          location_preferences?: string[] | null
          notes?: string | null
          is_active?: boolean
          updated_at?: string
        }
      }
    }
  }
}