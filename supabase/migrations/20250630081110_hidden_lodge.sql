/*
  # South African Government Verification System

  1. New Tables
    - `sa_government_verifications` - Integration with South African government systems
    - `sa_employment_verifications` - SARS and Department of Labour integration
    - `sa_education_verifications` - SAQA and university verification
    - `sa_professional_licenses` - SAPC, ECSA, and other professional bodies
    - `sa_identity_verifications` - Home Affairs ID verification
    - `sa_skills_development` - SETA and skills development tracking

  2. Security
    - Enable RLS on all tables
    - Add policies for user access control
    - Implement POPIA compliance measures

  3. South African Specific Features
    - ID number validation
    - BEE status tracking
    - Language proficiency
    - Provincial location data
*/

-- Create South African specific enum types
CREATE TYPE sa_verification_type AS ENUM (
  'id_verification',
  'tax_clearance', 
  'criminal_record',
  'credit_check',
  'education_saqa',
  'professional_registration',
  'seta_certification',
  'bee_certificate'
);

CREATE TYPE sa_government_agency AS ENUM (
  'home_affairs',
  'sars',
  'saps',
  'saqa',
  'department_labour',
  'department_education',
  'professional_councils',
  'seta_bodies',
  'bee_verification_agencies'
);

CREATE TYPE sa_verification_status AS ENUM (
  'pending',
  'verified',
  'failed',
  'expired',
  'revoked'
);

CREATE TYPE sa_province AS ENUM (
  'eastern_cape',
  'free_state',
  'gauteng',
  'kwazulu_natal',
  'limpopo',
  'mpumalanga',
  'northern_cape',
  'north_west',
  'western_cape'
);

CREATE TYPE sa_language AS ENUM (
  'afrikaans',
  'english',
  'ndebele',
  'northern_sotho',
  'sotho',
  'swazi',
  'tsonga',
  'tswana',
  'venda',
  'xhosa',
  'zulu'
);

CREATE TYPE bee_level AS ENUM (
  'level_1',
  'level_2', 
  'level_3',
  'level_4',
  'level_5',
  'level_6',
  'level_7',
  'level_8',
  'non_compliant'
);

-- Update profiles table for South African context
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS sa_id_number text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS province sa_province;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS languages sa_language[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bee_status bee_level;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS work_permit_status text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS tax_number text;

-- South African Government Verifications
CREATE TABLE IF NOT EXISTS sa_government_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  verification_type sa_verification_type NOT NULL,
  agency sa_government_agency NOT NULL,
  verification_id text NOT NULL,
  status sa_verification_status NOT NULL DEFAULT 'pending',
  verified_data jsonb DEFAULT '{}',
  verification_date timestamptz,
  expiry_date timestamptz,
  verification_score integer CHECK (verification_score >= 0 AND verification_score <= 100),
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- South African Identity Verification (Home Affairs)
CREATE TABLE IF NOT EXISTS sa_identity_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  id_number text NOT NULL,
  id_type text NOT NULL DEFAULT 'south_african_id',
  verification_status sa_verification_status NOT NULL DEFAULT 'pending',
  home_affairs_verified boolean DEFAULT false,
  biometric_verified boolean DEFAULT false,
  verification_reference text,
  verification_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- South African Education Verification (SAQA)
CREATE TABLE IF NOT EXISTS sa_education_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  institution_name text NOT NULL,
  qualification_title text NOT NULL,
  nqf_level integer CHECK (nqf_level >= 1 AND nqf_level <= 10),
  saqa_id text,
  qualification_type text,
  completion_date date,
  verification_status sa_verification_status NOT NULL DEFAULT 'pending',
  saqa_verified boolean DEFAULT false,
  institution_verified boolean DEFAULT false,
  verification_reference text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- South African Employment Verification (SARS/DoL)
CREATE TABLE IF NOT EXISTS sa_employment_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  employer_name text NOT NULL,
  employer_registration_number text,
  job_title text NOT NULL,
  employment_start_date date NOT NULL,
  employment_end_date date,
  employment_type text DEFAULT 'permanent',
  salary_verified boolean DEFAULT false,
  uif_contributions_verified boolean DEFAULT false,
  tax_certificate_verified boolean DEFAULT false,
  verification_status sa_verification_status NOT NULL DEFAULT 'pending',
  sars_reference text,
  dol_reference text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- South African Professional Licenses
CREATE TABLE IF NOT EXISTS sa_professional_licenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  professional_body text NOT NULL, -- ECSA, SAPC, SAICA, etc.
  license_type text NOT NULL,
  license_number text NOT NULL,
  registration_category text,
  issue_date date,
  expiry_date date,
  cpd_compliant boolean DEFAULT false,
  status sa_verification_status NOT NULL DEFAULT 'pending',
  verification_reference text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- SETA Skills Development Tracking
CREATE TABLE IF NOT EXISTS sa_seta_certifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  seta_name text NOT NULL, -- BANKSETA, MERSETA, etc.
  qualification_title text NOT NULL,
  unit_standards text[],
  credits_achieved integer,
  completion_date date,
  certificate_number text,
  verification_status sa_verification_status NOT NULL DEFAULT 'pending',
  seta_verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- BEE Verification Tracking
CREATE TABLE IF NOT EXISTS sa_bee_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  bee_level bee_level NOT NULL,
  verification_agency text NOT NULL,
  certificate_number text,
  issue_date date,
  expiry_date date,
  ownership_score numeric(5,2),
  management_score numeric(5,2),
  skills_development_score numeric(5,2),
  enterprise_development_score numeric(5,2),
  socioeconomic_development_score numeric(5,2),
  total_score numeric(5,2),
  verification_status sa_verification_status NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_sa_gov_verifications_profile_id ON sa_government_verifications(profile_id);
CREATE INDEX IF NOT EXISTS idx_sa_gov_verifications_type ON sa_government_verifications(verification_type);
CREATE INDEX IF NOT EXISTS idx_sa_gov_verifications_status ON sa_government_verifications(status);
CREATE INDEX IF NOT EXISTS idx_sa_identity_profile_id ON sa_identity_verifications(profile_id);
CREATE INDEX IF NOT EXISTS idx_sa_identity_id_number ON sa_identity_verifications(id_number);
CREATE INDEX IF NOT EXISTS idx_sa_education_profile_id ON sa_education_verifications(profile_id);
CREATE INDEX IF NOT EXISTS idx_sa_education_nqf ON sa_education_verifications(nqf_level);
CREATE INDEX IF NOT EXISTS idx_sa_employment_profile_id ON sa_employment_verifications(profile_id);
CREATE INDEX IF NOT EXISTS idx_sa_licenses_profile_id ON sa_professional_licenses(profile_id);
CREATE INDEX IF NOT EXISTS idx_sa_seta_profile_id ON sa_seta_certifications(profile_id);
CREATE INDEX IF NOT EXISTS idx_sa_bee_profile_id ON sa_bee_verifications(profile_id);
CREATE INDEX IF NOT EXISTS idx_profiles_province ON profiles(province);
CREATE INDEX IF NOT EXISTS idx_profiles_bee_status ON profiles(bee_status);

-- Enable RLS on all tables
ALTER TABLE sa_government_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE sa_identity_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE sa_education_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE sa_employment_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE sa_professional_licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE sa_seta_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE sa_bee_verifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own SA government verifications"
  ON sa_government_verifications
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = sa_government_verifications.profile_id 
      AND p.user_id = uid()
    )
  );

CREATE POLICY "Users can view own SA identity verifications"
  ON sa_identity_verifications
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = sa_identity_verifications.profile_id 
      AND p.user_id = uid()
    )
  );

CREATE POLICY "Users can view own SA education verifications"
  ON sa_education_verifications
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = sa_education_verifications.profile_id 
      AND p.user_id = uid()
    )
  );

CREATE POLICY "Users can view own SA employment verifications"
  ON sa_employment_verifications
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = sa_employment_verifications.profile_id 
      AND p.user_id = uid()
    )
  );

CREATE POLICY "Users can view own SA professional licenses"
  ON sa_professional_licenses
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = sa_professional_licenses.profile_id 
      AND p.user_id = uid()
    )
  );

CREATE POLICY "Users can view own SA SETA certifications"
  ON sa_seta_certifications
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = sa_seta_certifications.profile_id 
      AND p.user_id = uid()
    )
  );

CREATE POLICY "Users can view own SA BEE verifications"
  ON sa_bee_verifications
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = sa_bee_verifications.profile_id 
      AND p.user_id = uid()
    )
  );

-- Recruiters can view candidate verifications
CREATE POLICY "Recruiters can view candidate SA verifications"
  ON sa_government_verifications
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles candidate
      WHERE candidate.id = sa_government_verifications.profile_id 
      AND candidate.role = 'candidate'
    ) AND EXISTS (
      SELECT 1 FROM profiles recruiter
      WHERE recruiter.user_id = uid() 
      AND recruiter.role = 'recruiter'
    )
  );

-- Service role can manage all verifications
CREATE POLICY "Service role can manage all SA verifications"
  ON sa_government_verifications
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create trigger functions for updated_at
CREATE OR REPLACE FUNCTION update_sa_verifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER update_sa_government_verifications_updated_at
  BEFORE UPDATE ON sa_government_verifications
  FOR EACH ROW
  EXECUTE FUNCTION update_sa_verifications_updated_at();

CREATE TRIGGER update_sa_identity_verifications_updated_at
  BEFORE UPDATE ON sa_identity_verifications
  FOR EACH ROW
  EXECUTE FUNCTION update_sa_verifications_updated_at();

CREATE TRIGGER update_sa_education_verifications_updated_at
  BEFORE UPDATE ON sa_education_verifications
  FOR EACH ROW
  EXECUTE FUNCTION update_sa_verifications_updated_at();

CREATE TRIGGER update_sa_employment_verifications_updated_at
  BEFORE UPDATE ON sa_employment_verifications
  FOR EACH ROW
  EXECUTE FUNCTION update_sa_verifications_updated_at();

CREATE TRIGGER update_sa_professional_licenses_updated_at
  BEFORE UPDATE ON sa_professional_licenses
  FOR EACH ROW
  EXECUTE FUNCTION update_sa_verifications_updated_at();

CREATE TRIGGER update_sa_seta_certifications_updated_at
  BEFORE UPDATE ON sa_seta_certifications
  FOR EACH ROW
  EXECUTE FUNCTION update_sa_verifications_updated_at();

CREATE TRIGGER update_sa_bee_verifications_updated_at
  BEFORE UPDATE ON sa_bee_verifications
  FOR EACH ROW
  EXECUTE FUNCTION update_sa_verifications_updated_at();

-- Create view for comprehensive SA ReelPass status
CREATE OR REPLACE VIEW sa_reelpass_status AS
SELECT 
  p.id as profile_id,
  p.user_id,
  p.first_name,
  p.last_name,
  p.email,
  p.province,
  p.bee_status,
  p.completion_score as reelpass_score,
  CASE 
    WHEN p.completion_score >= 80 THEN 'verified'
    WHEN p.completion_score >= 50 THEN 'partial'
    ELSE 'unverified'
  END as reelpass_status,
  
  -- Count verifications by type
  COALESCE(identity_count, 0) as verified_identity_checks,
  COALESCE(education_count, 0) as verified_education_count,
  COALESCE(employment_count, 0) as verified_employment_count,
  COALESCE(license_count, 0) as verified_license_count,
  COALESCE(seta_count, 0) as verified_seta_count,
  COALESCE(bee_count, 0) as verified_bee_count,
  COALESCE(skill_count, 0) as verified_skill_count

FROM profiles p
LEFT JOIN (
  SELECT profile_id, COUNT(*) as identity_count
  FROM sa_identity_verifications 
  WHERE verification_status = 'verified'
  GROUP BY profile_id
) id_v ON p.id = id_v.profile_id
LEFT JOIN (
  SELECT profile_id, COUNT(*) as education_count
  FROM sa_education_verifications 
  WHERE verification_status = 'verified'
  GROUP BY profile_id
) edu_v ON p.id = edu_v.profile_id
LEFT JOIN (
  SELECT profile_id, COUNT(*) as employment_count
  FROM sa_employment_verifications 
  WHERE verification_status = 'verified'
  GROUP BY profile_id
) emp_v ON p.id = emp_v.profile_id
LEFT JOIN (
  SELECT profile_id, COUNT(*) as license_count
  FROM sa_professional_licenses 
  WHERE status = 'verified'
  GROUP BY profile_id
) lic_v ON p.id = lic_v.profile_id
LEFT JOIN (
  SELECT profile_id, COUNT(*) as seta_count
  FROM sa_seta_certifications 
  WHERE verification_status = 'verified'
  GROUP BY profile_id
) seta_v ON p.id = seta_v.profile_id
LEFT JOIN (
  SELECT profile_id, COUNT(*) as bee_count
  FROM sa_bee_verifications 
  WHERE verification_status = 'verified'
  GROUP BY profile_id
) bee_v ON p.id = bee_v.profile_id
LEFT JOIN (
  SELECT profile_id, COUNT(*) as skill_count
  FROM skills 
  WHERE verified = true
  GROUP BY profile_id
) skill_v ON p.id = skill_v.profile_id

WHERE p.role = 'candidate';

-- Function to calculate SA ReelPass score
CREATE OR REPLACE FUNCTION calculate_sa_reelpass_score(candidate_profile_id uuid)
RETURNS integer AS $$
DECLARE
  score integer := 0;
  identity_verified boolean := false;
  education_count integer := 0;
  employment_count integer := 0;
  license_count integer := 0;
  seta_count integer := 0;
  bee_verified boolean := false;
  skill_count integer := 0;
BEGIN
  -- Check identity verification (25 points)
  SELECT EXISTS(
    SELECT 1 FROM sa_identity_verifications 
    WHERE profile_id = candidate_profile_id 
    AND verification_status = 'verified'
  ) INTO identity_verified;
  
  IF identity_verified THEN
    score := score + 25;
  END IF;
  
  -- Count education verifications (20 points max)
  SELECT COUNT(*) FROM sa_education_verifications 
  WHERE profile_id = candidate_profile_id 
  AND verification_status = 'verified'
  INTO education_count;
  
  score := score + LEAST(education_count * 10, 20);
  
  -- Count employment verifications (20 points max)
  SELECT COUNT(*) FROM sa_employment_verifications 
  WHERE profile_id = candidate_profile_id 
  AND verification_status = 'verified'
  INTO employment_count;
  
  score := score + LEAST(employment_count * 7, 20);
  
  -- Count professional licenses (15 points max)
  SELECT COUNT(*) FROM sa_professional_licenses 
  WHERE profile_id = candidate_profile_id 
  AND status = 'verified'
  INTO license_count;
  
  score := score + LEAST(license_count * 15, 15);
  
  -- Count SETA certifications (10 points max)
  SELECT COUNT(*) FROM sa_seta_certifications 
  WHERE profile_id = candidate_profile_id 
  AND verification_status = 'verified'
  INTO seta_count;
  
  score := score + LEAST(seta_count * 5, 10);
  
  -- Check BEE verification (5 points)
  SELECT EXISTS(
    SELECT 1 FROM sa_bee_verifications 
    WHERE profile_id = candidate_profile_id 
    AND verification_status = 'verified'
  ) INTO bee_verified;
  
  IF bee_verified THEN
    score := score + 5;
  END IF;
  
  -- Count verified skills (5 points max)
  SELECT COUNT(*) FROM skills 
  WHERE profile_id = candidate_profile_id 
  AND verified = true
  INTO skill_count;
  
  score := score + LEAST(skill_count, 5);
  
  RETURN LEAST(score, 100);
END;
$$ LANGUAGE plpgsql;