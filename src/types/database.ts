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
          sa_id_number: string | null
          province: 'eastern_cape' | 'free_state' | 'gauteng' | 'kwazulu_natal' | 'limpopo' | 'mpumalanga' | 'northern_cape' | 'north_west' | 'western_cape' | null
          languages: ('afrikaans' | 'english' | 'ndebele' | 'northern_sotho' | 'sotho' | 'swazi' | 'tsonga' | 'tswana' | 'venda' | 'xhosa' | 'zulu')[] | null
          bee_status: 'level_1' | 'level_2' | 'level_3' | 'level_4' | 'level_5' | 'level_6' | 'level_7' | 'level_8' | 'non_compliant' | null
          work_permit_status: string | null
          tax_number: string | null
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
          sa_id_number?: string | null
          province?: 'eastern_cape' | 'free_state' | 'gauteng' | 'kwazulu_natal' | 'limpopo' | 'mpumalanga' | 'northern_cape' | 'north_west' | 'western_cape' | null
          languages?: ('afrikaans' | 'english' | 'ndebele' | 'northern_sotho' | 'sotho' | 'swazi' | 'tsonga' | 'tswana' | 'venda' | 'xhosa' | 'zulu')[] | null
          bee_status?: 'level_1' | 'level_2' | 'level_3' | 'level_4' | 'level_5' | 'level_6' | 'level_7' | 'level_8' | 'non_compliant' | null
          work_permit_status?: string | null
          tax_number?: string | null
        }
        Update: {
          email?: string
          first_name?: string | null
          last_name?: string | null
          headline?: string | null
          role?: 'candidate' | 'recruiter'
          completion_score?: number | null
          sa_id_number?: string | null
          province?: 'eastern_cape' | 'free_state' | 'gauteng' | 'kwazulu_natal' | 'limpopo' | 'mpumalanga' | 'northern_cape' | 'north_west' | 'western_cape' | null
          languages?: ('afrikaans' | 'english' | 'ndebele' | 'northern_sotho' | 'sotho' | 'swazi' | 'tsonga' | 'tswana' | 'venda' | 'xhosa' | 'zulu')[] | null
          bee_status?: 'level_1' | 'level_2' | 'level_3' | 'level_4' | 'level_5' | 'level_6' | 'level_7' | 'level_8' | 'non_compliant' | null
          work_permit_status?: string | null
          tax_number?: string | null
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
          preferred_work_type: 'remote' | 'hybrid' | 'onsite' | 'flexible' | null
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
          preferred_work_type?: 'remote' | 'hybrid' | 'onsite' | 'flexible' | null
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
          preferred_work_type?: 'remote' | 'hybrid' | 'onsite' | 'flexible' | null
          location_preferences?: string[] | null
          notes?: string | null
          is_active?: boolean
          updated_at?: string
        }
      }
      recruiter_scorecards: {
        Row: {
          id: string
          recruiter_id: string
          candidate_id: string
          communication_rating: number
          professionalism_rating: number
          role_accuracy_rating: number
          overall_rating: number
          feedback_text: string | null
          job_title: string | null
          company_name: string | null
          is_public: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          recruiter_id: string
          candidate_id: string
          communication_rating: number
          professionalism_rating: number
          role_accuracy_rating: number
          feedback_text?: string | null
          job_title?: string | null
          company_name?: string | null
          is_public?: boolean
        }
        Update: {
          communication_rating?: number
          professionalism_rating?: number
          role_accuracy_rating?: number
          feedback_text?: string | null
          job_title?: string | null
          company_name?: string | null
          is_public?: boolean
          updated_at?: string
        }
      }
      pipeline_stages: {
        Row: {
          id: string
          recruiter_id: string
          stage_name: string
          stage_order: number
          stage_color: string
          auto_email_template: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          recruiter_id: string
          stage_name: string
          stage_order: number
          stage_color?: string
          auto_email_template?: string | null
          is_active?: boolean
        }
        Update: {
          stage_name?: string
          stage_order?: number
          stage_color?: string
          auto_email_template?: string | null
          is_active?: boolean
          updated_at?: string
        }
      }
      candidate_pipeline_positions: {
        Row: {
          id: string
          recruiter_id: string
          candidate_id: string
          job_posting_id: string | null
          current_stage_id: string
          previous_stage_id: string | null
          moved_at: string
          moved_by: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          recruiter_id: string
          candidate_id: string
          job_posting_id?: string | null
          current_stage_id: string
          previous_stage_id?: string | null
          moved_at?: string
          moved_by?: string | null
          notes?: string | null
        }
        Update: {
          job_posting_id?: string | null
          current_stage_id?: string
          previous_stage_id?: string | null
          moved_at?: string
          moved_by?: string | null
          notes?: string | null
          updated_at?: string
        }
      }
      candidate_communications: {
        Row: {
          id: string
          recruiter_id: string
          candidate_id: string
          communication_type: 'email' | 'sms' | 'call' | 'system'
          trigger_event: 'stage_move' | 'manual' | 'scheduled' | 'availability_change'
          subject: string | null
          message_content: string
          sent_at: string
          delivery_status: 'sent' | 'delivered' | 'failed' | 'pending'
          opened_at: string | null
          clicked_at: string | null
          replied_at: string | null
          created_at: string
        }
        Insert: {
          recruiter_id: string
          candidate_id: string
          communication_type: 'email' | 'sms' | 'call' | 'system'
          trigger_event: 'stage_move' | 'manual' | 'scheduled' | 'availability_change'
          subject?: string | null
          message_content: string
          sent_at?: string
          delivery_status?: 'sent' | 'delivered' | 'failed' | 'pending'
          opened_at?: string | null
          clicked_at?: string | null
          replied_at?: string | null
        }
        Update: {
          communication_type?: 'email' | 'sms' | 'call' | 'system'
          trigger_event?: 'stage_move' | 'manual' | 'scheduled' | 'availability_change'
          subject?: string | null
          message_content?: string
          sent_at?: string
          delivery_status?: 'sent' | 'delivered' | 'failed' | 'pending'
          opened_at?: string | null
          clicked_at?: string | null
          replied_at?: string | null
        }
      }
      interviews: {
        Row: {
          id: string
          recruiter_id: string
          candidate_name: string
          candidate_email: string
          interview_type: 'video' | 'phone' | 'in-person'
          scheduled_at: string
          duration_minutes: number
          interviewers: string[]
          location: string | null
          notes: string | null
          timezone: string
          meeting_url: string | null
          meeting_id: string | null
          status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled'
          created_at: string
          updated_at: string
        }
        Insert: {
          recruiter_id: string
          candidate_name: string
          candidate_email: string
          interview_type: 'video' | 'phone' | 'in-person'
          scheduled_at: string
          duration_minutes?: number
          interviewers?: string[]
          location?: string | null
          notes?: string | null
          timezone?: string
          meeting_url?: string | null
          meeting_id?: string | null
          status?: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled'
        }
        Update: {
          candidate_name?: string
          candidate_email?: string
          interview_type?: 'video' | 'phone' | 'in-person'
          scheduled_at?: string
          duration_minutes?: number
          interviewers?: string[]
          location?: string | null
          notes?: string | null
          timezone?: string
          meeting_url?: string | null
          meeting_id?: string | null
          status?: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled'
          updated_at?: string
        }
      }
      sa_government_verifications: {
        Row: {
          id: string
          profile_id: string
          verification_type: 'id_verification' | 'tax_clearance' | 'criminal_record' | 'credit_check' | 'education_saqa' | 'professional_registration' | 'seta_certification' | 'bee_certificate'
          agency: 'home_affairs' | 'sars' | 'saps' | 'saqa' | 'department_labour' | 'department_education' | 'professional_councils' | 'seta_bodies' | 'bee_verification_agencies'
          verification_id: string
          status: 'pending' | 'verified' | 'failed' | 'expired' | 'revoked'
          verified_data: Record<string, any>
          verification_date: string | null
          expiry_date: string | null
          verification_score: number | null
          metadata: Record<string, any>
          created_at: string
          updated_at: string
        }
        Insert: {
          profile_id: string
          verification_type: 'id_verification' | 'tax_clearance' | 'criminal_record' | 'credit_check' | 'education_saqa' | 'professional_registration' | 'seta_certification' | 'bee_certificate'
          agency: 'home_affairs' | 'sars' | 'saps' | 'saqa' | 'department_labour' | 'department_education' | 'professional_councils' | 'seta_bodies' | 'bee_verification_agencies'
          verification_id: string
          status?: 'pending' | 'verified' | 'failed' | 'expired' | 'revoked'
          verified_data?: Record<string, any>
          verification_date?: string | null
          expiry_date?: string | null
          verification_score?: number | null
          metadata?: Record<string, any>
        }
        Update: {
          verification_type?: 'id_verification' | 'tax_clearance' | 'criminal_record' | 'credit_check' | 'education_saqa' | 'professional_registration' | 'seta_certification' | 'bee_certificate'
          agency?: 'home_affairs' | 'sars' | 'saps' | 'saqa' | 'department_labour' | 'department_education' | 'professional_councils' | 'seta_bodies' | 'bee_verification_agencies'
          verification_id?: string
          status?: 'pending' | 'verified' | 'failed' | 'expired' | 'revoked'
          verified_data?: Record<string, any>
          verification_date?: string | null
          expiry_date?: string | null
          verification_score?: number | null
          metadata?: Record<string, any>
          updated_at?: string
        }
      }
      sa_identity_verifications: {
        Row: {
          id: string
          profile_id: string
          id_number: string
          id_type: string
          verification_status: 'pending' | 'verified' | 'failed' | 'expired' | 'revoked'
          home_affairs_verified: boolean
          biometric_verified: boolean
          verification_reference: string | null
          verification_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          profile_id: string
          id_number: string
          id_type?: string
          verification_status?: 'pending' | 'verified' | 'failed' | 'expired' | 'revoked'
          home_affairs_verified?: boolean
          biometric_verified?: boolean
          verification_reference?: string | null
          verification_date?: string | null
        }
        Update: {
          id_number?: string
          id_type?: string
          verification_status?: 'pending' | 'verified' | 'failed' | 'expired' | 'revoked'
          home_affairs_verified?: boolean
          biometric_verified?: boolean
          verification_reference?: string | null
          verification_date?: string | null
          updated_at?: string
        }
      }
      sa_bee_verifications: {
        Row: {
          id: string
          profile_id: string
          bee_level: 'level_1' | 'level_2' | 'level_3' | 'level_4' | 'level_5' | 'level_6' | 'level_7' | 'level_8' | 'non_compliant'
          verification_agency: string
          certificate_number: string | null
          issue_date: string | null
          expiry_date: string | null
          ownership_score: number | null
          management_score: number | null
          skills_development_score: number | null
          enterprise_development_score: number | null
          socioeconomic_development_score: number | null
          total_score: number | null
          verification_status: 'pending' | 'verified' | 'failed' | 'expired' | 'revoked'
          created_at: string
          updated_at: string
        }
        Insert: {
          profile_id: string
          bee_level: 'level_1' | 'level_2' | 'level_3' | 'level_4' | 'level_5' | 'level_6' | 'level_7' | 'level_8' | 'non_compliant'
          verification_agency: string
          certificate_number?: string | null
          issue_date?: string | null
          expiry_date?: string | null
          ownership_score?: number | null
          management_score?: number | null
          skills_development_score?: number | null
          enterprise_development_score?: number | null
          socioeconomic_development_score?: number | null
          total_score?: number | null
          verification_status?: 'pending' | 'verified' | 'failed' | 'expired' | 'revoked'
        }
        Update: {
          bee_level?: 'level_1' | 'level_2' | 'level_3' | 'level_4' | 'level_5' | 'level_6' | 'level_7' | 'level_8' | 'non_compliant'
          verification_agency?: string
          certificate_number?: string | null
          issue_date?: string | null
          expiry_date?: string | null
          ownership_score?: number | null
          management_score?: number | null
          skills_development_score?: number | null
          enterprise_development_score?: number | null
          socioeconomic_development_score?: number | null
          total_score?: number | null
          verification_status?: 'pending' | 'verified' | 'failed' | 'expired' | 'revoked'
          updated_at?: string
        }
      }
    }
    Views: {
      recruiter_ratings_summary: {
        Row: {
          recruiter_id: string
          first_name: string | null
          last_name: string | null
          email: string
          total_reviews: number
          avg_communication: number | null
          avg_professionalism: number | null
          avg_role_accuracy: number | null
          overall_rating: number | null
          positive_reviews: number
          negative_reviews: number
        }
      }
      live_candidate_availability: {
        Row: {
          candidate_id: string
          first_name: string | null
          last_name: string | null
          email: string
          headline: string | null
          reelpass_score: number | null
          availability_status: 'available' | 'open' | 'not-looking' | null
          available_from: string | null
          notice_period_days: number | null
          salary_expectation_min: number | null
          salary_expectation_max: number | null
          preferred_work_type: 'remote' | 'hybrid' | 'onsite' | 'flexible' | null
          location_preferences: string[] | null
          availability_updated_at: string | null
          verification_status: 'verified' | 'partial' | 'unverified'
        }
      }
      sa_reelpass_status: {
        Row: {
          profile_id: string
          user_id: string
          first_name: string | null
          last_name: string | null
          email: string
          province: 'eastern_cape' | 'free_state' | 'gauteng' | 'kwazulu_natal' | 'limpopo' | 'mpumalanga' | 'northern_cape' | 'north_west' | 'western_cape' | null
          bee_status: 'level_1' | 'level_2' | 'level_3' | 'level_4' | 'level_5' | 'level_6' | 'level_7' | 'level_8' | 'non_compliant' | null
          reelpass_score: number | null
          reelpass_status: 'verified' | 'partial' | 'unverified'
          verified_skill_count: number
          video_verified_skills: number
          persona_assessed: boolean
          persona_confidence_score: number
          verified_identity_checks: number
          verified_bee_count: number
          verified_education_count: number
          verified_employment_count: number
          verified_license_count: number
          verified_seta_count: number
        }
      }
    }
    Functions: {
      calculate_sa_reelpass_score: {
        Args: {
          candidate_profile_id: string
        }
        Returns: number
      }
      get_sa_reelpass_breakdown: {
        Args: {
          candidate_profile_id: string
        }
        Returns: Record<string, any>
      }
    }
    Enums: {
      availability_status: 'available' | 'open' | 'not-looking'
      interview_type: 'video' | 'phone' | 'in-person'
      interview_status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled'
      verification_status: 'pending' | 'verified' | 'failed' | 'expired' | 'revoked'
      government_agency: 'ssa' | 'dhs' | 'dol' | 'education' | 'state_licensing' | 'irs'
      verification_type: 'identity' | 'education' | 'employment' | 'license' | 'security_clearance' | 'background_check'
      sa_verification_type: 'id_verification' | 'tax_clearance' | 'criminal_record' | 'credit_check' | 'education_saqa' | 'professional_registration' | 'seta_certification' | 'bee_certificate'
      sa_government_agency: 'home_affairs' | 'sars' | 'saps' | 'saqa' | 'department_labour' | 'department_education' | 'professional_councils' | 'seta_bodies' | 'bee_verification_agencies'
      sa_verification_status: 'pending' | 'verified' | 'failed' | 'expired' | 'revoked'
      sa_province: 'eastern_cape' | 'free_state' | 'gauteng' | 'kwazulu_natal' | 'limpopo' | 'mpumalanga' | 'northern_cape' | 'north_west' | 'western_cape'
      sa_language: 'afrikaans' | 'english' | 'ndebele' | 'northern_sotho' | 'sotho' | 'swazi' | 'tsonga' | 'tswana' | 'venda' | 'xhosa' | 'zulu'
      bee_level: 'level_1' | 'level_2' | 'level_3' | 'level_4' | 'level_5' | 'level_6' | 'level_7' | 'level_8' | 'non_compliant'
    }
  }
}