import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/database'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Export types for convenience
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']
export type Views<T extends keyof Database['public']['Views']> = Database['public']['Views'][T]['Row']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]

// Specific type exports
export type Profile = Tables<'profiles'>
export type Skill = Tables<'skills'>
export type AvailabilityUpdate = Tables<'availability_updates'>
export type RecruiterScorecard = Tables<'recruiter_scorecards'>
export type PipelineStage = Tables<'pipeline_stages'>
export type CandidatePipelinePosition = Tables<'candidate_pipeline_positions'>
export type CandidateCommunication = Tables<'candidate_communications'>
export type Interview = Tables<'interviews'>
export type SAGovernmentVerification = Tables<'sa_government_verifications'>
export type SAIdentityVerification = Tables<'sa_identity_verifications'>
export type SABeeVerification = Tables<'sa_bee_verifications'>

// View types
export type RecruiterRatingSummary = Views<'recruiter_ratings_summary'>
export type LiveCandidateAvailability = Views<'live_candidate_availability'>
export type SAReelPassStatus = Views<'sa_reelpass_status'>

// Enum types
export type AvailabilityStatus = Enums<'availability_status'>
export type InterviewType = Enums<'interview_type'>
export type InterviewStatus = Enums<'interview_status'>
export type VerificationStatus = Enums<'verification_status'>
export type SAVerificationType = Enums<'sa_verification_type'>
export type SAGovernmentAgency = Enums<'sa_government_agency'>
export type SAProvince = Enums<'sa_province'>
export type SALanguage = Enums<'sa_language'>
export type BeeLevel = Enums<'bee_level'>