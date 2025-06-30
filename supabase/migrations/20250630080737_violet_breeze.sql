/*
  # Government Verification System for ReelPass

  1. New Tables
    - `government_verifications` - Store government ID verifications
    - `professional_licenses` - Track professional licenses and certifications
    - `education_verifications` - Verify educational credentials
    - `employment_verifications` - Verify work history
    - `verification_requests` - Track verification request status

  2. Security
    - Enable RLS on all new tables
    - Add policies for user access control
    - Encrypt sensitive government data

  3. Integration Points
    - SSA (Social Security Administration) for identity verification
    - Department of Education for degree verification
    - State licensing boards for professional certifications
    - Previous employers for work history verification
*/

-- Create enum types for verification systems
DO $$ BEGIN
  CREATE TYPE verification_status AS ENUM ('pending', 'verified', 'failed', 'expired', 'revoked');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE government_agency AS ENUM ('ssa', 'dhs', 'dol', 'education', 'state_licensing', 'irs');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE verification_type AS ENUM ('identity', 'education', 'employment', 'license', 'security_clearance', 'background_check');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Government verifications table
CREATE TABLE IF NOT EXISTS government_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  verification_type verification_type NOT NULL,
  agency government_agency NOT NULL,
  verification_id text NOT NULL, -- External verification ID
  status verification_status NOT NULL DEFAULT 'pending',
  verified_data jsonb DEFAULT '{}', -- Encrypted verified information
  verification_date timestamptz,
  expiry_date timestamptz,
  verification_score integer CHECK (verification_score >= 0 AND verification_score <= 100),
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Professional licenses table
CREATE TABLE IF NOT EXISTS professional_licenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  license_type text NOT NULL,
  license_number text NOT NULL,
  issuing_authority text NOT NULL,
  state_code text,
  issue_date date,
  expiry_date date,
  status verification_status NOT NULL DEFAULT 'pending',
  verification_id uuid REFERENCES government_verifications(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Education verifications table
CREATE TABLE IF NOT EXISTS education_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  institution_name text NOT NULL,
  degree_type text NOT NULL,
  field_of_study text,
  graduation_date date,
  gpa decimal(3,2),
  honors text,
  verification_status verification_status NOT NULL DEFAULT 'pending',
  clearinghouse_id text, -- National Student Clearinghouse ID
  verification_id uuid REFERENCES government_verifications(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Employment verifications table
CREATE TABLE IF NOT EXISTS employment_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  employer_name text NOT NULL,
  job_title text NOT NULL,
  start_date date NOT NULL,
  end_date date,
  employment_type text DEFAULT 'full-time',
  salary_verified boolean DEFAULT false,
  verification_status verification_status NOT NULL DEFAULT 'pending',
  verification_method text, -- 'employer_contact', 'tax_records', 'third_party'
  verification_id uuid REFERENCES government_verifications(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Verification requests tracking
CREATE TABLE IF NOT EXISTS verification_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  verification_type verification_type NOT NULL,
  agency government_agency NOT NULL,
  request_data jsonb NOT NULL,
  status verification_status NOT NULL DEFAULT 'pending',
  external_request_id text,
  callback_url text,
  retry_count integer DEFAULT 0,
  max_retries integer DEFAULT 3,
  last_attempt_at timestamptz,
  completed_at timestamptz,
  error_details jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_gov_verifications_profile_id ON government_verifications(profile_id);
CREATE INDEX IF NOT EXISTS idx_gov_verifications_status ON government_verifications(status);
CREATE INDEX IF NOT EXISTS idx_gov_verifications_type ON government_verifications(verification_type);
CREATE INDEX IF NOT EXISTS idx_gov_verifications_agency ON government_verifications(agency);

CREATE INDEX IF NOT EXISTS idx_licenses_profile_id ON professional_licenses(profile_id);
CREATE INDEX IF NOT EXISTS idx_licenses_status ON professional_licenses(status);
CREATE INDEX IF NOT EXISTS idx_licenses_expiry ON professional_licenses(expiry_date);

CREATE INDEX IF NOT EXISTS idx_education_profile_id ON education_verifications(profile_id);
CREATE INDEX IF NOT EXISTS idx_education_status ON education_verifications(verification_status);

CREATE INDEX IF NOT EXISTS idx_employment_profile_id ON employment_verifications(profile_id);
CREATE INDEX IF NOT EXISTS idx_employment_status ON employment_verifications(verification_status);

CREATE INDEX IF NOT EXISTS idx_verification_requests_status ON verification_requests(status);
CREATE INDEX IF NOT EXISTS idx_verification_requests_profile ON verification_requests(profile_id);

-- Enable RLS on all tables
ALTER TABLE government_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE professional_licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE education_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE employment_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_requests ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own government verifications"
  ON government_verifications
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = government_verifications.profile_id 
      AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view own professional licenses"
  ON professional_licenses
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = professional_licenses.profile_id 
      AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view own education verifications"
  ON education_verifications
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = education_verifications.profile_id 
      AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view own employment verifications"
  ON employment_verifications
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = employment_verifications.profile_id 
      AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view own verification requests"
  ON verification_requests
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = verification_requests.profile_id 
      AND p.user_id = auth.uid()
    )
  );

-- Recruiters can view verified candidate information
CREATE POLICY "Recruiters can view candidate verifications"
  ON government_verifications
  FOR SELECT
  TO authenticated
  USING (
    status = 'verified' AND
    EXISTS (
      SELECT 1 FROM profiles candidate 
      WHERE candidate.id = government_verifications.profile_id 
      AND candidate.role = 'candidate'
    ) AND
    EXISTS (
      SELECT 1 FROM profiles recruiter 
      WHERE recruiter.user_id = auth.uid() 
      AND recruiter.role = 'recruiter'
    )
  );

-- Service role can manage all verifications
CREATE POLICY "Service role can manage all verifications"
  ON government_verifications
  FOR ALL
  TO service_role
  USING (true);

CREATE POLICY "Service role can manage all licenses"
  ON professional_licenses
  FOR ALL
  TO service_role
  USING (true);

CREATE POLICY "Service role can manage all education verifications"
  ON education_verifications
  FOR ALL
  TO service_role
  USING (true);

CREATE POLICY "Service role can manage all employment verifications"
  ON employment_verifications
  FOR ALL
  TO service_role
  USING (true);

CREATE POLICY "Service role can manage all verification requests"
  ON verification_requests
  FOR ALL
  TO service_role
  USING (true);

-- Create trigger functions for updated_at
CREATE OR REPLACE FUNCTION update_government_verifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_professional_licenses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_education_verifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_employment_verifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_verification_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER update_government_verifications_updated_at
  BEFORE UPDATE ON government_verifications
  FOR EACH ROW
  EXECUTE FUNCTION update_government_verifications_updated_at();

CREATE TRIGGER update_professional_licenses_updated_at
  BEFORE UPDATE ON professional_licenses
  FOR EACH ROW
  EXECUTE FUNCTION update_professional_licenses_updated_at();

CREATE TRIGGER update_education_verifications_updated_at
  BEFORE UPDATE ON education_verifications
  FOR EACH ROW
  EXECUTE FUNCTION update_education_verifications_updated_at();

CREATE TRIGGER update_employment_verifications_updated_at
  BEFORE UPDATE ON employment_verifications
  FOR EACH ROW
  EXECUTE FUNCTION update_employment_verifications_updated_at();

CREATE TRIGGER update_verification_requests_updated_at
  BEFORE UPDATE ON verification_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_verification_requests_updated_at();

-- Function to calculate overall ReelPass score
CREATE OR REPLACE FUNCTION calculate_reelpass_score(candidate_profile_id uuid)
RETURNS integer AS $$
DECLARE
  identity_score integer := 0;
  education_score integer := 0;
  employment_score integer := 0;
  license_score integer := 0;
  skill_score integer := 0;
  total_score integer := 0;
BEGIN
  -- Identity verification (25% weight)
  SELECT CASE 
    WHEN COUNT(*) > 0 AND COUNT(*) FILTER (WHERE status = 'verified') > 0 THEN 25
    ELSE 0
  END INTO identity_score
  FROM government_verifications 
  WHERE profile_id = candidate_profile_id 
  AND verification_type = 'identity';
  
  -- Education verification (20% weight)
  SELECT CASE 
    WHEN COUNT(*) > 0 AND COUNT(*) FILTER (WHERE verification_status = 'verified') > 0 THEN 20
    ELSE 0
  END INTO education_score
  FROM education_verifications 
  WHERE profile_id = candidate_profile_id;
  
  -- Employment verification (25% weight)
  SELECT CASE 
    WHEN COUNT(*) > 0 AND COUNT(*) FILTER (WHERE verification_status = 'verified') > 0 THEN 25
    ELSE 0
  END INTO employment_score
  FROM employment_verifications 
  WHERE profile_id = candidate_profile_id;
  
  -- Professional licenses (15% weight)
  SELECT CASE 
    WHEN COUNT(*) > 0 AND COUNT(*) FILTER (WHERE status = 'verified') > 0 THEN 15
    ELSE 0
  END INTO license_score
  FROM professional_licenses 
  WHERE profile_id = candidate_profile_id;
  
  -- Skill verification (15% weight)
  SELECT CASE 
    WHEN COUNT(*) > 0 AND COUNT(*) FILTER (WHERE verified = true) > 0 THEN 15
    ELSE 0
  END INTO skill_score
  FROM skills 
  WHERE profile_id = candidate_profile_id;
  
  total_score := identity_score + education_score + employment_score + license_score + skill_score;
  
  RETURN total_score;
END;
$$ LANGUAGE plpgsql;

-- Create view for ReelPass status
CREATE OR REPLACE VIEW reelpass_status AS
SELECT 
  p.id as profile_id,
  p.user_id,
  p.first_name,
  p.last_name,
  p.email,
  calculate_reelpass_score(p.id) as reelpass_score,
  CASE 
    WHEN calculate_reelpass_score(p.id) >= 80 THEN 'verified'
    WHEN calculate_reelpass_score(p.id) >= 50 THEN 'partial'
    ELSE 'unverified'
  END as reelpass_status,
  (
    SELECT COUNT(*) 
    FROM government_verifications gv 
    WHERE gv.profile_id = p.id AND gv.status = 'verified'
  ) as verified_government_checks,
  (
    SELECT COUNT(*) 
    FROM education_verifications ev 
    WHERE ev.profile_id = p.id AND ev.verification_status = 'verified'
  ) as verified_education_count,
  (
    SELECT COUNT(*) 
    FROM employment_verifications empv 
    WHERE empv.profile_id = p.id AND empv.verification_status = 'verified'
  ) as verified_employment_count,
  (
    SELECT COUNT(*) 
    FROM professional_licenses pl 
    WHERE pl.profile_id = p.id AND pl.status = 'verified'
  ) as verified_license_count,
  (
    SELECT COUNT(*) 
    FROM skills s 
    WHERE s.profile_id = p.id AND s.verified = true
  ) as verified_skill_count
FROM profiles p
WHERE p.role = 'candidate';