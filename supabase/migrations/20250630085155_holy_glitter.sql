/*
  # Add ReelPersona Assessment Integration to SA ReelPass

  1. New Scoring Structure
    - Skills Demonstration: 50% (reduced from 60%)
    - ReelPersona Assessment: 20% (NEW)
    - Government Trust & Compliance: 20% (reduced from 25%)
    - Traditional Credentials: 10% (reduced from 15%)

  2. ReelPersona Components
    - Communication Skills: 5 points
    - Problem Solving: 5 points
    - Leadership Potential: 5 points
    - Cultural Adaptability: 5 points

  3. Updated View
    - Include persona assessment scores
    - Maintain skills-first philosophy while adding personality insights
*/

-- Drop existing view to recreate with persona integration
DROP VIEW IF EXISTS sa_reelpass_status;

-- Update SA ReelPass scoring function to include ReelPersona assessments
CREATE OR REPLACE FUNCTION calculate_sa_reelpass_score(candidate_profile_id uuid)
RETURNS integer AS $$
DECLARE
  score integer := 0;
  
  -- Skills variables (50% total - reduced from 60%)
  total_skills integer := 0;
  verified_skills integer := 0;
  video_skills integer := 0;
  
  -- ReelPersona variables (20% total - NEW)
  persona_exists boolean := false;
  communication_score integer := 0;
  problem_solving_score integer := 0;
  leadership_score integer := 0;
  adaptability_score integer := 0;
  
  -- Government verification variables (20% total - reduced from 25%)
  identity_verified boolean := false;
  bee_verified boolean := false;
  
  -- Traditional credentials variables (10% total - reduced from 15%)
  education_count integer := 0;
  employment_count integer := 0;
  license_count integer := 0;
  seta_count integer := 0;
BEGIN
  -- SKILLS DEMONSTRATION - 50% of total score (50 points)
  
  -- Basic Skills Portfolio: 8 points (1.6 points per skill, max 5 skills)
  SELECT COUNT(*) FROM skills 
  WHERE profile_id = candidate_profile_id
  INTO total_skills;
  
  score := score + LEAST(ROUND(total_skills * 1.6), 8);
  
  -- Verified Technical Skills: 30 points (4.3 points per verified skill, max 7 skills)
  SELECT COUNT(*) FROM skills 
  WHERE profile_id = candidate_profile_id 
  AND verified = true
  INTO verified_skills;
  
  score := score + LEAST(ROUND(verified_skills * 4.3), 30);
  
  -- Video Skill Proofs: 12 points (2.4 points per video demo, max 5 videos)
  SELECT COUNT(*) FROM skills 
  WHERE profile_id = candidate_profile_id 
  AND video_verified = true
  AND video_demo_url IS NOT NULL
  INTO video_skills;
  
  score := score + LEAST(ROUND(video_skills * 2.4), 12);
  
  -- REELPERSONA ASSESSMENT - 20% of total score (20 points)
  
  -- Check if persona analysis exists
  SELECT EXISTS(
    SELECT 1 FROM persona_analyses 
    WHERE profile_id = candidate_profile_id
  ) INTO persona_exists;
  
  IF persona_exists THEN
    -- Communication Skills: 5 points (based on communication_style assessment)
    SELECT COALESCE(
      CASE 
        WHEN (assessment_data->>'communication_effectiveness')::integer >= 80 THEN 5
        WHEN (assessment_data->>'communication_effectiveness')::integer >= 60 THEN 4
        WHEN (assessment_data->>'communication_effectiveness')::integer >= 40 THEN 3
        WHEN (assessment_data->>'communication_effectiveness')::integer >= 20 THEN 2
        ELSE 1
      END, 3
    ) FROM persona_analyses 
    WHERE profile_id = candidate_profile_id
    INTO communication_score;
    
    score := score + communication_score;
    
    -- Problem Solving: 5 points (based on work_style assessment)
    SELECT COALESCE(
      CASE 
        WHEN (work_style->>'analytical_thinking')::integer >= 80 THEN 5
        WHEN (work_style->>'analytical_thinking')::integer >= 60 THEN 4
        WHEN (work_style->>'analytical_thinking')::integer >= 40 THEN 3
        WHEN (work_style->>'analytical_thinking')::integer >= 20 THEN 2
        ELSE 1
      END, 3
    ) FROM persona_analyses 
    WHERE profile_id = candidate_profile_id
    INTO problem_solving_score;
    
    score := score + problem_solving_score;
    
    -- Leadership Potential: 5 points (based on cultural_fit assessment)
    SELECT COALESCE(
      CASE 
        WHEN (cultural_fit->>'leadership_potential')::integer >= 80 THEN 5
        WHEN (cultural_fit->>'leadership_potential')::integer >= 60 THEN 4
        WHEN (cultural_fit->>'leadership_potential')::integer >= 40 THEN 3
        WHEN (cultural_fit->>'leadership_potential')::integer >= 20 THEN 2
        ELSE 1
      END, 3
    ) FROM persona_analyses 
    WHERE profile_id = candidate_profile_id
    INTO leadership_score;
    
    score := score + leadership_score;
    
    -- Cultural Adaptability: 5 points (based on emotional_intelligence)
    SELECT COALESCE(
      CASE 
        WHEN (emotional_intelligence->>'adaptability')::integer >= 80 THEN 5
        WHEN (emotional_intelligence->>'adaptability')::integer >= 60 THEN 4
        WHEN (emotional_intelligence->>'adaptability')::integer >= 40 THEN 3
        WHEN (emotional_intelligence->>'adaptability')::integer >= 20 THEN 2
        ELSE 1
      END, 3
    ) FROM persona_analyses 
    WHERE profile_id = candidate_profile_id
    INTO adaptability_score;
    
    score := score + adaptability_score;
  END IF;
  
  -- GOVERNMENT TRUST & COMPLIANCE - 20% of total score (20 points)
  
  -- Home Affairs ID Verification: 12 points (reduced from 15)
  SELECT EXISTS(
    SELECT 1 FROM sa_identity_verifications 
    WHERE profile_id = candidate_profile_id 
    AND verification_status = 'verified'
  ) INTO identity_verified;
  
  IF identity_verified THEN
    score := score + 12;
  END IF;
  
  -- BEE Status Verification: 8 points (reduced from 10)
  SELECT EXISTS(
    SELECT 1 FROM sa_bee_verifications 
    WHERE profile_id = candidate_profile_id 
    AND verification_status = 'verified'
  ) INTO bee_verified;
  
  IF bee_verified THEN
    score := score + 8;
  END IF;
  
  -- TRADITIONAL CREDENTIALS - 10% of total score (10 points)
  
  -- Education (SAQA): 4 points max (2 points each, max 2 qualifications)
  SELECT COUNT(*) FROM sa_education_verifications 
  WHERE profile_id = candidate_profile_id 
  AND verification_status = 'verified'
  INTO education_count;
  
  score := score + LEAST(education_count * 2, 4);
  
  -- Employment (SARS): 4 points max (2 points each, max 2 positions)
  SELECT COUNT(*) FROM sa_employment_verifications 
  WHERE profile_id = candidate_profile_id 
  AND verification_status = 'verified'
  INTO employment_count;
  
  score := score + LEAST(employment_count * 2, 4);
  
  -- Professional Licenses: 1 point max (1 point each, max 1 license)
  SELECT COUNT(*) FROM sa_professional_licenses 
  WHERE profile_id = candidate_profile_id 
  AND status = 'verified'
  INTO license_count;
  
  score := score + LEAST(license_count * 1, 1);
  
  -- SETA Certifications: 1 point max (1 point each, max 1 certification)
  SELECT COUNT(*) FROM sa_seta_certifications 
  WHERE profile_id = candidate_profile_id 
  AND verification_status = 'verified'
  INTO seta_count;
  
  score := score + LEAST(seta_count * 1, 1);
  
  -- Ensure score doesn't exceed 100
  RETURN LEAST(score, 100);
END;
$$ LANGUAGE plpgsql;

-- Recreate SA ReelPass status view with ReelPersona integration
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
  
  -- Skills metrics (highest priority - 50%)
  COALESCE(skill_count, 0) as verified_skill_count,
  COALESCE(video_skill_count, 0) as video_verified_skills,
  
  -- ReelPersona metrics (NEW - 20%)
  CASE WHEN persona_v.profile_id IS NOT NULL THEN true ELSE false END as persona_assessed,
  COALESCE(persona_v.confidence_score, 0) as persona_confidence_score,
  
  -- Government verification metrics (trust layer - 20%)
  COALESCE(identity_count, 0) as verified_identity_checks,
  COALESCE(bee_count, 0) as verified_bee_count,
  
  -- Traditional credentials (supporting evidence - 10%)
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
  SELECT profile_id, confidence_score
  FROM persona_analyses
) persona_v ON p.id = persona_v.profile_id
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

-- Update function comment to reflect new scoring with ReelPersona
COMMENT ON FUNCTION calculate_sa_reelpass_score IS 
'Skills-first SA ReelPass with ReelPersona integration: 50% skills demonstration, 20% personality assessment, 20% government verification, 10% traditional credentials. Maximum 100 points total.';

COMMENT ON VIEW sa_reelpass_status IS 
'Comprehensive SA ReelPass status integrating ReelPersona assessments. Balances technical skills (50%) with personality insights (20%) and compliance verification.';

-- Update detailed scoring breakdown function to include ReelPersona
CREATE OR REPLACE FUNCTION get_sa_reelpass_breakdown(candidate_profile_id uuid)
RETURNS jsonb AS $$
DECLARE
  breakdown jsonb := '{}';
  
  -- Skills scores (50%)
  basic_skills_score integer := 0;
  verified_skills_score integer := 0;
  video_skills_score integer := 0;
  
  -- ReelPersona scores (20%)
  communication_score integer := 0;
  problem_solving_score integer := 0;
  leadership_score integer := 0;
  adaptability_score integer := 0;
  persona_exists boolean := false;
  
  -- Government scores (20%)
  identity_score integer := 0;
  bee_score integer := 0;
  
  -- Traditional scores (10%)
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
  -- Calculate skills scores (50%)
  SELECT COUNT(*) FROM skills WHERE profile_id = candidate_profile_id INTO total_skills;
  basic_skills_score := LEAST(ROUND(total_skills * 1.6), 8);
  
  SELECT COUNT(*) FROM skills WHERE profile_id = candidate_profile_id AND verified = true INTO verified_skills;
  verified_skills_score := LEAST(ROUND(verified_skills * 4.3), 30);
  
  SELECT COUNT(*) FROM skills WHERE profile_id = candidate_profile_id AND video_verified = true AND video_demo_url IS NOT NULL INTO video_skills;
  video_skills_score := LEAST(ROUND(video_skills * 2.4), 12);
  
  -- Calculate ReelPersona scores (20%)
  SELECT EXISTS(SELECT 1 FROM persona_analyses WHERE profile_id = candidate_profile_id) INTO persona_exists;
  
  IF persona_exists THEN
    -- Get persona scores from assessment data
    SELECT 
      COALESCE(CASE 
        WHEN (assessment_data->>'communication_effectiveness')::integer >= 80 THEN 5
        WHEN (assessment_data->>'communication_effectiveness')::integer >= 60 THEN 4
        WHEN (assessment_data->>'communication_effectiveness')::integer >= 40 THEN 3
        WHEN (assessment_data->>'communication_effectiveness')::integer >= 20 THEN 2
        ELSE 1
      END, 3),
      COALESCE(CASE 
        WHEN (work_style->>'analytical_thinking')::integer >= 80 THEN 5
        WHEN (work_style->>'analytical_thinking')::integer >= 60 THEN 4
        WHEN (work_style->>'analytical_thinking')::integer >= 40 THEN 3
        WHEN (work_style->>'analytical_thinking')::integer >= 20 THEN 2
        ELSE 1
      END, 3),
      COALESCE(CASE 
        WHEN (cultural_fit->>'leadership_potential')::integer >= 80 THEN 5
        WHEN (cultural_fit->>'leadership_potential')::integer >= 60 THEN 4
        WHEN (cultural_fit->>'leadership_potential')::integer >= 40 THEN 3
        WHEN (cultural_fit->>'leadership_potential')::integer >= 20 THEN 2
        ELSE 1
      END, 3),
      COALESCE(CASE 
        WHEN (emotional_intelligence->>'adaptability')::integer >= 80 THEN 5
        WHEN (emotional_intelligence->>'adaptability')::integer >= 60 THEN 4
        WHEN (emotional_intelligence->>'adaptability')::integer >= 40 THEN 3
        WHEN (emotional_intelligence->>'adaptability')::integer >= 20 THEN 2
        ELSE 1
      END, 3)
    FROM persona_analyses 
    WHERE profile_id = candidate_profile_id
    INTO communication_score, problem_solving_score, leadership_score, adaptability_score;
  END IF;
  
  -- Calculate government scores (20%)
  IF EXISTS(SELECT 1 FROM sa_identity_verifications WHERE profile_id = candidate_profile_id AND verification_status = 'verified') THEN
    identity_score := 12;
  END IF;
  
  IF EXISTS(SELECT 1 FROM sa_bee_verifications WHERE profile_id = candidate_profile_id AND verification_status = 'verified') THEN
    bee_score := 8;
  END IF;
  
  -- Calculate traditional credential scores (10%)
  SELECT COUNT(*) FROM sa_education_verifications WHERE profile_id = candidate_profile_id AND verification_status = 'verified' INTO education_count;
  education_score := LEAST(education_count * 2, 4);
  
  SELECT COUNT(*) FROM sa_employment_verifications WHERE profile_id = candidate_profile_id AND verification_status = 'verified' INTO employment_count;
  employment_score := LEAST(employment_count * 2, 4);
  
  SELECT COUNT(*) FROM sa_professional_licenses WHERE profile_id = candidate_profile_id AND status = 'verified' INTO license_count;
  license_score := LEAST(license_count * 1, 1);
  
  SELECT COUNT(*) FROM sa_seta_certifications WHERE profile_id = candidate_profile_id AND verification_status = 'verified' INTO seta_count;
  seta_score := LEAST(seta_count * 1, 1);
  
  total_score := basic_skills_score + verified_skills_score + video_skills_score + 
                 communication_score + problem_solving_score + leadership_score + adaptability_score +
                 identity_score + bee_score + education_score + employment_score + license_score + seta_score;
  
  -- Build breakdown JSON
  breakdown := jsonb_build_object(
    'total_score', LEAST(total_score, 100),
    'skills_demonstration', jsonb_build_object(
      'total_possible', 50,
      'total_earned', basic_skills_score + verified_skills_score + video_skills_score,
      'basic_skills', jsonb_build_object('count', total_skills, 'score', basic_skills_score, 'max', 8),
      'verified_skills', jsonb_build_object('count', verified_skills, 'score', verified_skills_score, 'max', 30),
      'video_skills', jsonb_build_object('count', video_skills, 'score', video_skills_score, 'max', 12)
    ),
    'reelpersona_assessment', jsonb_build_object(
      'total_possible', 20,
      'total_earned', communication_score + problem_solving_score + leadership_score + adaptability_score,
      'assessed', persona_exists,
      'communication', jsonb_build_object('score', communication_score, 'max', 5),
      'problem_solving', jsonb_build_object('score', problem_solving_score, 'max', 5),
      'leadership', jsonb_build_object('score', leadership_score, 'max', 5),
      'adaptability', jsonb_build_object('score', adaptability_score, 'max', 5)
    ),
    'government_trust', jsonb_build_object(
      'total_possible', 20,
      'total_earned', identity_score + bee_score,
      'identity_verification', jsonb_build_object('verified', identity_score > 0, 'score', identity_score, 'max', 12),
      'bee_verification', jsonb_build_object('verified', bee_score > 0, 'score', bee_score, 'max', 8)
    ),
    'traditional_credentials', jsonb_build_object(
      'total_possible', 10,
      'total_earned', education_score + employment_score + license_score + seta_score,
      'education', jsonb_build_object('count', education_count, 'score', education_score, 'max', 4),
      'employment', jsonb_build_object('count', employment_count, 'score', employment_score, 'max', 4),
      'licenses', jsonb_build_object('count', license_count, 'score', license_score, 'max', 1),
      'seta', jsonb_build_object('count', seta_count, 'score', seta_score, 'max', 1)
    )
  );
  
  RETURN breakdown;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_sa_reelpass_breakdown IS 
'Returns detailed scoring breakdown for SA ReelPass including ReelPersona assessment scores across all categories.';