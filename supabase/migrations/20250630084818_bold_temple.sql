/*
  # Skills-First SA ReelPass Scoring System Update

  This migration implements the exact scoring system specified:
  
  ## 60% - Skills Demonstration
  - Basic Skills Portfolio: 10 points (2 points per skill, max 5 skills)
  - Verified Technical Skills: 35 points (5 points per verified skill, max 7 skills)  
  - Video Skill Proofs: 15 points (3 points per video demo, max 5 videos)
  
  ## 25% - Government Trust & Compliance
  - Home Affairs ID Verification: 15 points
  - BEE Status Verification: 10 points
  
  ## 15% - Traditional Credentials (Supporting Evidence)
  - Education (SAQA): 5 points max (2 points each)
  - Employment (SARS): 5 points max (2 points each)
  - Professional Licenses: 3 points max (3 points each)
  - SETA Certifications: 2 points max (1 point each)
*/

-- Drop existing view to recreate with updated structure
DROP VIEW IF EXISTS sa_reelpass_status;

-- Update SA ReelPass scoring function to match exact specifications
CREATE OR REPLACE FUNCTION calculate_sa_reelpass_score(candidate_profile_id uuid)
RETURNS integer AS $$
DECLARE
  score integer := 0;
  
  -- Skills variables (60% total)
  total_skills integer := 0;
  verified_skills integer := 0;
  video_skills integer := 0;
  
  -- Government verification variables (25% total)
  identity_verified boolean := false;
  bee_verified boolean := false;
  
  -- Traditional credentials variables (15% total)
  education_count integer := 0;
  employment_count integer := 0;
  license_count integer := 0;
  seta_count integer := 0;
BEGIN
  -- SKILLS DEMONSTRATION - 60% of total score (60 points)
  
  -- Basic Skills Portfolio: 10 points (2 points per skill, max 5 skills)
  SELECT COUNT(*) FROM skills 
  WHERE profile_id = candidate_profile_id
  INTO total_skills;
  
  score := score + LEAST(total_skills * 2, 10);
  
  -- Verified Technical Skills: 35 points (5 points per verified skill, max 7 skills)
  SELECT COUNT(*) FROM skills 
  WHERE profile_id = candidate_profile_id 
  AND verified = true
  INTO verified_skills;
  
  score := score + LEAST(verified_skills * 5, 35);
  
  -- Video Skill Proofs: 15 points (3 points per video demo, max 5 videos)
  SELECT COUNT(*) FROM skills 
  WHERE profile_id = candidate_profile_id 
  AND video_verified = true
  AND video_demo_url IS NOT NULL
  INTO video_skills;
  
  score := score + LEAST(video_skills * 3, 15);
  
  -- GOVERNMENT TRUST & COMPLIANCE - 25% of total score (25 points)
  
  -- Home Affairs ID Verification: 15 points
  SELECT EXISTS(
    SELECT 1 FROM sa_identity_verifications 
    WHERE profile_id = candidate_profile_id 
    AND verification_status = 'verified'
  ) INTO identity_verified;
  
  IF identity_verified THEN
    score := score + 15;
  END IF;
  
  -- BEE Status Verification: 10 points
  SELECT EXISTS(
    SELECT 1 FROM sa_bee_verifications 
    WHERE profile_id = candidate_profile_id 
    AND verification_status = 'verified'
  ) INTO bee_verified;
  
  IF bee_verified THEN
    score := score + 10;
  END IF;
  
  -- TRADITIONAL CREDENTIALS - 15% of total score (15 points)
  
  -- Education (SAQA): 5 points max (2 points each, max 2-3 qualifications)
  SELECT COUNT(*) FROM sa_education_verifications 
  WHERE profile_id = candidate_profile_id 
  AND verification_status = 'verified'
  INTO education_count;
  
  score := score + LEAST(education_count * 2, 5);
  
  -- Employment (SARS): 5 points max (2 points each, max 2-3 positions)
  SELECT COUNT(*) FROM sa_employment_verifications 
  WHERE profile_id = candidate_profile_id 
  AND verification_status = 'verified'
  INTO employment_count;
  
  score := score + LEAST(employment_count * 2, 5);
  
  -- Professional Licenses: 3 points max (3 points each, max 1 license)
  SELECT COUNT(*) FROM sa_professional_licenses 
  WHERE profile_id = candidate_profile_id 
  AND status = 'verified'
  INTO license_count;
  
  score := score + LEAST(license_count * 3, 3);
  
  -- SETA Certifications: 2 points max (1 point each, max 2 certifications)
  SELECT COUNT(*) FROM sa_seta_certifications 
  WHERE profile_id = candidate_profile_id 
  AND verification_status = 'verified'
  INTO seta_count;
  
  score := score + LEAST(seta_count * 1, 2);
  
  -- Ensure score doesn't exceed 100
  RETURN LEAST(score, 100);
END;
$$ LANGUAGE plpgsql;

-- Recreate SA ReelPass status view with skills-first priority
CREATE VIEW sa_reelpass_status AS
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
    WHEN p.completion_score >= 60 THEN 'partial'
    ELSE 'unverified'
  END as reelpass_status,
  
  -- Skills metrics (highest priority)
  COALESCE(skill_count, 0) as verified_skill_count,
  COALESCE(video_skill_count, 0) as video_verified_skills,
  
  -- Government verification metrics (trust layer)
  COALESCE(identity_count, 0) as verified_identity_checks,
  COALESCE(bee_count, 0) as verified_bee_count,
  
  -- Traditional credentials (supporting evidence)
  COALESCE(education_count, 0) as verified_education_count,
  COALESCE(employment_count, 0) as verified_employment_count,
  COALESCE(license_count, 0) as verified_license_count,
  COALESCE(seta_count, 0) as verified_seta_count

FROM profiles p
LEFT JOIN (
  SELECT profile_id, COUNT(*) as skill_count
  FROM skills 
  WHERE verified = true
  GROUP BY profile_id
) skill_v ON p.id = skill_v.profile_id
LEFT JOIN (
  SELECT profile_id, COUNT(*) as video_skill_count
  FROM skills 
  WHERE video_verified = true AND video_demo_url IS NOT NULL
  GROUP BY profile_id
) video_skill_v ON p.id = video_skill_v.profile_id
LEFT JOIN (
  SELECT profile_id, COUNT(*) as identity_count
  FROM sa_identity_verifications 
  WHERE verification_status = 'verified'
  GROUP BY profile_id
) id_v ON p.id = id_v.profile_id
LEFT JOIN (
  SELECT profile_id, COUNT(*) as bee_count
  FROM sa_bee_verifications 
  WHERE verification_status = 'verified'
  GROUP BY profile_id
) bee_v ON p.id = bee_v.profile_id
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

WHERE p.role = 'candidate';

-- Update function comment to reflect exact scoring breakdown
COMMENT ON FUNCTION calculate_sa_reelpass_score IS 
'Skills-first SA ReelPass scoring system: 60% skills (10+35+15), 25% government verification (15+10), 15% traditional credentials (5+5+3+2). Maximum 100 points total.';

COMMENT ON VIEW sa_reelpass_status IS 
'Comprehensive SA ReelPass status prioritizing verified skills over traditional credentials. Skills demonstration accounts for 60% of the total score.';

-- Create helper function to get detailed scoring breakdown for debugging/transparency
CREATE OR REPLACE FUNCTION get_sa_reelpass_breakdown(candidate_profile_id uuid)
RETURNS jsonb AS $$
DECLARE
  breakdown jsonb := '{}';
  
  -- Skills scores
  basic_skills_score integer := 0;
  verified_skills_score integer := 0;
  video_skills_score integer := 0;
  
  -- Government scores
  identity_score integer := 0;
  bee_score integer := 0;
  
  -- Traditional scores
  education_score integer := 0;
  employment_score integer := 0;
  license_score integer := 0;
  seta_score integer := 0;
  
  -- Counts for transparency
  total_skills integer := 0;
  verified_skills integer := 0;
  video_skills integer := 0;
  education_count integer := 0;
  employment_count integer := 0;
  license_count integer := 0;
  seta_count integer := 0;
  
  total_score integer := 0;
BEGIN
  -- Calculate skills scores
  SELECT COUNT(*) FROM skills WHERE profile_id = candidate_profile_id INTO total_skills;
  basic_skills_score := LEAST(total_skills * 2, 10);
  
  SELECT COUNT(*) FROM skills WHERE profile_id = candidate_profile_id AND verified = true INTO verified_skills;
  verified_skills_score := LEAST(verified_skills * 5, 35);
  
  SELECT COUNT(*) FROM skills WHERE profile_id = candidate_profile_id AND video_verified = true AND video_demo_url IS NOT NULL INTO video_skills;
  video_skills_score := LEAST(video_skills * 3, 15);
  
  -- Calculate government scores
  IF EXISTS(SELECT 1 FROM sa_identity_verifications WHERE profile_id = candidate_profile_id AND verification_status = 'verified') THEN
    identity_score := 15;
  END IF;
  
  IF EXISTS(SELECT 1 FROM sa_bee_verifications WHERE profile_id = candidate_profile_id AND verification_status = 'verified') THEN
    bee_score := 10;
  END IF;
  
  -- Calculate traditional credential scores
  SELECT COUNT(*) FROM sa_education_verifications WHERE profile_id = candidate_profile_id AND verification_status = 'verified' INTO education_count;
  education_score := LEAST(education_count * 2, 5);
  
  SELECT COUNT(*) FROM sa_employment_verifications WHERE profile_id = candidate_profile_id AND verification_status = 'verified' INTO employment_count;
  employment_score := LEAST(employment_count * 2, 5);
  
  SELECT COUNT(*) FROM sa_professional_licenses WHERE profile_id = candidate_profile_id AND status = 'verified' INTO license_count;
  license_score := LEAST(license_count * 3, 3);
  
  SELECT COUNT(*) FROM sa_seta_certifications WHERE profile_id = candidate_profile_id AND verification_status = 'verified' INTO seta_count;
  seta_score := LEAST(seta_count * 1, 2);
  
  total_score := basic_skills_score + verified_skills_score + video_skills_score + identity_score + bee_score + education_score + employment_score + license_score + seta_score;
  
  -- Build breakdown JSON
  breakdown := jsonb_build_object(
    'total_score', LEAST(total_score, 100),
    'skills_demonstration', jsonb_build_object(
      'total_possible', 60,
      'total_earned', basic_skills_score + verified_skills_score + video_skills_score,
      'basic_skills', jsonb_build_object('count', total_skills, 'score', basic_skills_score, 'max', 10),
      'verified_skills', jsonb_build_object('count', verified_skills, 'score', verified_skills_score, 'max', 35),
      'video_skills', jsonb_build_object('count', video_skills, 'score', video_skills_score, 'max', 15)
    ),
    'government_trust', jsonb_build_object(
      'total_possible', 25,
      'total_earned', identity_score + bee_score,
      'identity_verification', jsonb_build_object('verified', identity_score > 0, 'score', identity_score, 'max', 15),
      'bee_verification', jsonb_build_object('verified', bee_score > 0, 'score', bee_score, 'max', 10)
    ),
    'traditional_credentials', jsonb_build_object(
      'total_possible', 15,
      'total_earned', education_score + employment_score + license_score + seta_score,
      'education', jsonb_build_object('count', education_count, 'score', education_score, 'max', 5),
      'employment', jsonb_build_object('count', employment_count, 'score', employment_score, 'max', 5),
      'licenses', jsonb_build_object('count', license_count, 'score', license_score, 'max', 3),
      'seta', jsonb_build_object('count', seta_count, 'score', seta_score, 'max', 2)
    )
  );
  
  RETURN breakdown;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_sa_reelpass_breakdown IS 
'Returns detailed scoring breakdown for SA ReelPass showing exactly how points are calculated across all categories.';