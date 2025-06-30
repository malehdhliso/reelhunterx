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
          email: string
          full_name: string
          headline: string
          reelpass_verified: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name: string
          headline?: string
          reelpass_verified?: boolean
        }
        Update: {
          email?: string
          full_name?: string
          headline?: string
          reelpass_verified?: boolean
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          candidate_id: string
          title: string
          description: string
          tech_stack: string[]
          demo_url?: string
          github_url?: string
          created_at: string
        }
        Insert: {
          candidate_id: string
          title: string
          description: string
          tech_stack: string[]
          demo_url?: string
          github_url?: string
        }
        Update: {
          title?: string
          description?: string
          tech_stack?: string[]
          demo_url?: string
          github_url?: string
        }
      }
      skills: {
        Row: {
          id: string
          candidate_id: string
          skill_name: string
          proficiency_level: number
          verified: boolean
          created_at: string
        }
        Insert: {
          candidate_id: string
          skill_name: string
          proficiency_level: number
          verified?: boolean
        }
        Update: {
          skill_name?: string
          proficiency_level?: number
          verified?: boolean
        }
      }
    }
  }
}