import type { Database as DatabaseGenerated } from '../services/supabase'

// Re-export the Database type
export type Database = DatabaseGenerated

// Define types for all tables
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Skill = Database['public']['Tables']['skills']['Row']
export type Project = Database['public']['Tables']['projects']['Row']
export type PipelineStage = Database['public']['Tables']['pipeline_stages']['Row']
export type CandidatePipelinePosition = Database['public']['Tables']['candidate_pipeline_positions']['Row']
export type RecruiterScorecard = Database['public']['Tables']['recruiter_scorecards']['Row']
export type AvailabilityUpdate = Database['public']['Tables']['availability_updates']['Row']
export type CandidateCommunication = Database['public']['Tables']['candidate_communications']['Row']
export type Interview = Database['public']['Tables']['interviews']['Row']
export type SAGovernmentVerification = Database['public']['Tables']['sa_government_verifications']['Row']
export type SAIdentityVerification = Database['public']['Tables']['sa_identity_verifications']['Row']
export type SAEducationVerification = Database['public']['Tables']['sa_education_verifications']['Row']
export type SAEmploymentVerification = Database['public']['Tables']['sa_employment_verifications']['Row']
export type SAProfessionalLicense = Database['public']['Tables']['sa_professional_licenses']['Row']
export type SASetaCertification = Database['public']['Tables']['sa_seta_certifications']['Row']
export type SABeeVerification = Database['public']['Tables']['sa_bee_verifications']['Row']
export type RecruiterRatingSummary = Database['public']['Views']['recruiter_ratings_summary']['Row']
export type LiveCandidateAvailability = Database['public']['Views']['live_candidate_availability']['Row']
export type SAReelPassStatus = Database['public']['Views']['sa_reelpass_status']['Row']

// Define enum types
export type VerificationStatus = 'pending' | 'verified' | 'failed' | 'expired' | 'revoked'
export type VerificationType = 'identity' | 'education' | 'employment' | 'license' | 'security_clearance' | 'background_check'
export type GovernmentAgency = 'ssa' | 'dhs' | 'dol' | 'education' | 'state_licensing' | 'irs'
export type SAVerificationType = 'id_verification' | 'tax_clearance' | 'criminal_record' | 'credit_check' | 'education_saqa' | 'professional_registration' | 'seta_certification' | 'bee_certificate'
export type SAGovernmentAgency = 'home_affairs' | 'sars' | 'saps' | 'saqa' | 'department_labour' | 'department_education' | 'professional_councils' | 'seta_bodies' | 'bee_verification_agencies'
export type SAVerificationStatus = 'pending' | 'verified' | 'failed' | 'expired' | 'revoked'
export type SAProvince = 'eastern_cape' | 'free_state' | 'gauteng' | 'kwazulu_natal' | 'limpopo' | 'mpumalanga' | 'northern_cape' | 'north_west' | 'western_cape'
export type SALanguage = 'afrikaans' | 'english' | 'ndebele' | 'northern_sotho' | 'sotho' | 'swazi' | 'tsonga' | 'tswana' | 'venda' | 'xhosa' | 'zulu'
export type BeeLevel = 'level_1' | 'level_2' | 'level_3' | 'level_4' | 'level_5' | 'level_6' | 'level_7' | 'level_8' | 'non_compliant'
export type InterviewType = 'video' | 'phone' | 'in-person'
export type InterviewStatus = 'scheduled' | 'completed' | 'cancelled' | 'rescheduled'
export type AvailabilityStatus = 'available' | 'open' | 'not-looking'
export type WorkType = 'remote' | 'hybrid' | 'onsite' | 'flexible'

// Define custom types for specific use cases
export interface ReelPassVerificationStatus {
  reelpassScore: number
  reelpassStatus: 'verified' | 'partial' | 'unverified'
  verifiedGovernmentChecks: number
  verifiedEducationCount: number
  verifiedEmploymentCount: number
  verifiedLicenseCount: number
  verifiedSkillCount: number
}

export interface SAReelPassVerificationStatus {
  reelpassScore: number
  reelpassStatus: 'verified' | 'partial' | 'unverified'
  province: SAProvince
  beeStatus: BeeLevel
  verifiedSkillCount: number
  videoVerifiedSkills: number
  personaAssessed: boolean
  personaConfidenceScore: number
  verifiedIdentityChecks: number
  verifiedBeeCount: number
  verifiedEducationCount: number
  verifiedEmploymentCount: number
  verifiedLicenseCount: number
  verifiedSetaCount: number
}

// Define types for database functions
export interface CalculateReelPassScoreFunction {
  Args: {
    candidate_profile_id: string
  }
  Returns: number
}

export interface GetSAReelPassBreakdownFunction {
  Args: {
    candidate_profile_id: string
  }
  Returns: {
    total_score: number
    skills_demonstration: {
      total_possible: number
      total_earned: number
      basic_skills: {
        count: number
        score: number
        max: number
      }
      verified_skills: {
        count: number
        score: number
        max: number
      }
      video_skills: {
        count: number
        score: number
        max: number
      }
    }
    reelpersona_assessment: {
      total_possible: number
      total_earned: number
      assessed: boolean
      communication: {
        score: number
        max: number
      }
      problem_solving: {
        score: number
        max: number
      }
      leadership: {
        score: number
        max: number
      }
      adaptability: {
        score: number
        max: number
      }
    }
    government_trust: {
      total_possible: number
      total_earned: number
      identity_verification: {
        verified: boolean
        score: number
        max: number
      }
      bee_verification: {
        verified: boolean
        score: number
        max: number
      }
    }
    traditional_credentials: {
      total_possible: number
      total_earned: number
      education: {
        count: number
        score: number
        max: number
      }
      employment: {
        count: number
        score: number
        max: number
      }
      licenses: {
        count: number
        score: number
        max: number
      }
      seta: {
        count: number
        score: number
        max: number
      }
    }
  }
}