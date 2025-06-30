-- Update SA ReelPass scoring to prioritize verified skills over paper credentials
-- This migration focuses on practical skills demonstration over traditional qualifications

-- Function to calculate SA ReelPass score with skills-first approach
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
  verified_skill_count integer := 0;
  video_skill_count integer := 0;
BEGIN
  -- SKILLS FIRST APPROACH - 60% of total score
  
  -- Count total skills (10 points max)
  SELECT COUNT(*) FROM skills 
  WHERE profile_id = candidate_profile_id
  INTO skill_count;
  
  score := score + LEAST(skill_count * 2, 10);
  
  -- Count verified skills - HIGHEST PRIORITY (35 points max)
  SELECT COUNT(*) FROM skills 
  WHERE profile_id = candidate_profile_id 
  AND verified = true
  INTO verified_skill_count;
  
  score := score + LEAST(verified_skill_count * 5, 35);
  
  -- Count video-demonstrated skills - PREMIUM SCORING (15 points max)
  SELECT COUNT(*) FROM skills 
  WHERE profile_id = candidate_profile_id 
  AND video_verified = true
  AND video_demo_url IS NOT NULL
  INTO video_skill_count;
  
  score := score + LEAST(video_skill_count * 3, 15);
  
  -- GOVERNMENT VERIFICATION - 25% of total score (for trust/compliance)
  
  -- Check identity verification (15 points - reduced from 25)
  SELECT EXISTS(
    SELECT 1 FROM sa_identity_verifications 
    WHERE profile_id = candidate_profile_id 
    AND verification_status = 'verified'
  ) INTO identity_verified;
  
  IF identity_verified THEN
    score := score + 15;
  END IF;
  
  -- Check BEE verification (10 points - increased for SA market relevance)
  SELECT EXISTS(
    SELECT 1 FROM sa_bee_verifications 
    WHERE profile_id = candidate_profile_id 
    AND verification_status = 'verified'
  ) INTO bee_verified;
  
  IF bee_verified THEN
    score := score + 10;
  END IF;
  
  -- TRADITIONAL CREDENTIALS - 15% of total score (supporting evidence only)
  
  -- Count education verifications (5 points max - significantly reduced)
  SELECT COUNT(*) FROM sa_education_verifications 
  WHERE profile_id = candidate_profile_id 
  AND verification_status = 'verified'
  INTO education_count;
  
  score := score + LEAST(education_count * 2, 5);
  
  -- Count employment verifications (5 points max - reduced)
  SELECT COUNT(*) FROM sa_employment_verifications 
  WHERE profile_id = candidate_profile_id 
  AND verification_status = 'verified'
  INTO employment_count;
  
  score := score + LEAST(employment_count * 2, 5);
  
  -- Count professional licenses (3 points max - minimal)
  SELECT COUNT(*) FROM sa_professional_licenses 
  WHERE profile_id = candidate_profile_id 
  AND status = 'verified'
  INTO license_count;
  
  score := score + LEAST(license_count * 3, 3);
  
  -- Count SETA certifications (2 points max - minimal)
  SELECT COUNT(*) FROM sa_seta_certifications 
  WHERE profile_id = candidate_profile_id 
  AND verification_status = 'verified'
  INTO seta_count;
  
  score := score + LEAST(seta_count * 1, 2);
  
  RETURN LEAST(score, 100);
END;
$$ LANGUAGE plpgsql;

-- Update the view to reflect skills-first approach
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
    WHEN p.completion_score >= 60 THEN 'partial'
    ELSE 'unverified'
  END as reelpass_status,
  
  -- Count verifications by type (reordered by importance)
  COALESCE(skill_count, 0) as verified_skill_count,
  COALESCE(video_skill_count, 0) as video_verified_skills,
  COALESCE(identity_count, 0) as verified_identity_checks,
  COALESCE(bee_count, 0) as verified_bee_count,
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

-- Add comment explaining the skills-first philosophy
COMMENT ON FUNCTION calculate_sa_reelpass_score IS 
'Skills-first ReelPass scoring: 60% skills demonstration, 25% government verification for trust, 15% traditional credentials as supporting evidence. Prioritizes practical ability over paper qualifications.';