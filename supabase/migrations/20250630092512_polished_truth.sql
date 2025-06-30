/*
  # Core ReelHunter Features Implementation

  1. New Tables
    - `recruiter_scorecards` - Public rating system for recruiters
    - `availability_updates` - Live availability status for candidates
    - `pipeline_stages` - Customizable recruitment pipeline stages
    - `candidate_pipeline_positions` - Candidate positions in recruitment pipeline
    - `candidate_communications` - Automated communication tracking

  2. Security
    - Enable RLS on all new tables
    - Add policies for proper access control
    - Use auth.uid() for user identification

  3. Automation
    - Auto-create default pipeline stages for new recruiters
    - Auto-send communications when candidates move stages
    - Track communication delivery and engagement

  4. Views
    - `recruiter_ratings_summary` - Aggregated recruiter ratings
    - `live_candidate_availability` - Real-time candidate availability status
*/

-- Recruiter Scorecard System
CREATE TABLE IF NOT EXISTS recruiter_scorecards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recruiter_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  candidate_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  communication_rating integer NOT NULL CHECK (communication_rating >= 1 AND communication_rating <= 5),
  professionalism_rating integer NOT NULL CHECK (professionalism_rating >= 1 AND professionalism_rating <= 5),
  role_accuracy_rating integer NOT NULL CHECK (role_accuracy_rating >= 1 AND role_accuracy_rating <= 5),
  overall_rating numeric(2,1) GENERATED ALWAYS AS ((communication_rating + professionalism_rating + role_accuracy_rating) / 3.0) STORED,
  feedback_text text,
  job_title text,
  company_name text,
  is_public boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(recruiter_id, candidate_id)
);

-- Availability Updates for Live Status
CREATE TABLE IF NOT EXISTS availability_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  availability_status availability_status NOT NULL,
  available_from date,
  notice_period_days integer DEFAULT 0,
  salary_expectation_min integer,
  salary_expectation_max integer,
  preferred_work_type text CHECK (preferred_work_type IN ('remote', 'hybrid', 'onsite', 'flexible')),
  location_preferences text[],
  notes text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Pipeline Stages (customizable per recruiter)
CREATE TABLE IF NOT EXISTS pipeline_stages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recruiter_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  stage_name text NOT NULL,
  stage_order integer NOT NULL,
  stage_color text DEFAULT '#6b7280',
  auto_email_template text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(recruiter_id, stage_name),
  UNIQUE(recruiter_id, stage_order)
);

-- Candidate Pipeline Positions
CREATE TABLE IF NOT EXISTS candidate_pipeline_positions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recruiter_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  candidate_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  job_posting_id uuid REFERENCES job_postings(id) ON DELETE SET NULL,
  current_stage_id uuid NOT NULL REFERENCES pipeline_stages(id) ON DELETE CASCADE,
  previous_stage_id uuid REFERENCES pipeline_stages(id),
  moved_at timestamptz DEFAULT now(),
  moved_by uuid REFERENCES profiles(id),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Communication Log
CREATE TABLE IF NOT EXISTS candidate_communications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recruiter_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  candidate_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  communication_type text NOT NULL CHECK (communication_type IN ('email', 'sms', 'call', 'system')),
  trigger_event text NOT NULL CHECK (trigger_event IN ('stage_move', 'manual', 'scheduled', 'availability_change')),
  subject text,
  message_content text NOT NULL,
  sent_at timestamptz DEFAULT now(),
  delivery_status text DEFAULT 'sent' CHECK (delivery_status IN ('sent', 'delivered', 'failed', 'pending')),
  opened_at timestamptz,
  clicked_at timestamptz,
  replied_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_recruiter_scorecards_recruiter_id ON recruiter_scorecards(recruiter_id);
CREATE INDEX IF NOT EXISTS idx_recruiter_scorecards_overall_rating ON recruiter_scorecards(overall_rating DESC);
CREATE INDEX IF NOT EXISTS idx_availability_updates_profile_id ON availability_updates(profile_id);
CREATE INDEX IF NOT EXISTS idx_availability_updates_active ON availability_updates(is_active, availability_status);
CREATE INDEX IF NOT EXISTS idx_pipeline_stages_recruiter_id ON pipeline_stages(recruiter_id, stage_order);
CREATE INDEX IF NOT EXISTS idx_candidate_pipeline_positions_recruiter ON candidate_pipeline_positions(recruiter_id);
CREATE INDEX IF NOT EXISTS idx_candidate_pipeline_positions_candidate ON candidate_pipeline_positions(candidate_id);
CREATE INDEX IF NOT EXISTS idx_candidate_communications_recruiter ON candidate_communications(recruiter_id, sent_at DESC);

-- Enable RLS
ALTER TABLE recruiter_scorecards ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipeline_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_pipeline_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_communications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Recruiter Scorecards
CREATE POLICY "Public can read public scorecards"
  ON recruiter_scorecards FOR SELECT
  TO public
  USING (is_public = true);

CREATE POLICY "Candidates can create scorecards"
  ON recruiter_scorecards FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = candidate_id AND user_id = auth.uid() AND role = 'candidate'
    )
  );

CREATE POLICY "Users can read own scorecards"
  ON recruiter_scorecards FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE (id = recruiter_id OR id = candidate_id) AND user_id = auth.uid()
    )
  );

-- RLS Policies for Availability Updates
CREATE POLICY "Users can manage own availability"
  ON availability_updates FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = profile_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Recruiters can read candidate availability"
  ON availability_updates FOR SELECT
  TO authenticated
  USING (
    is_active = true AND
    EXISTS (
      SELECT 1 FROM profiles recruiter
      WHERE recruiter.user_id = auth.uid() AND recruiter.role = 'recruiter'
    ) AND
    EXISTS (
      SELECT 1 FROM profiles candidate
      WHERE candidate.id = profile_id AND candidate.role = 'candidate'
    )
  );

-- RLS Policies for Pipeline Stages
CREATE POLICY "Recruiters can manage own pipeline stages"
  ON pipeline_stages FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = recruiter_id AND user_id = auth.uid() AND role = 'recruiter'
    )
  );

-- RLS Policies for Pipeline Positions
CREATE POLICY "Recruiters can manage own pipeline"
  ON candidate_pipeline_positions FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = recruiter_id AND user_id = auth.uid() AND role = 'recruiter'
    )
  );

CREATE POLICY "Candidates can read own pipeline status"
  ON candidate_pipeline_positions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = candidate_id AND user_id = auth.uid() AND role = 'candidate'
    )
  );

-- RLS Policies for Communications
CREATE POLICY "Recruiters can manage own communications"
  ON candidate_communications FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = recruiter_id AND user_id = auth.uid() AND role = 'recruiter'
    )
  );

CREATE POLICY "Candidates can read communications sent to them"
  ON candidate_communications FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = candidate_id AND user_id = auth.uid() AND role = 'candidate'
    )
  );

-- Insert default pipeline stages for new recruiters
CREATE OR REPLACE FUNCTION create_default_pipeline_stages()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role = 'recruiter' THEN
    INSERT INTO pipeline_stages (recruiter_id, stage_name, stage_order, stage_color, auto_email_template) VALUES
    (NEW.id, 'Applied', 1, '#3b82f6', 'Thank you for your application. We have received your profile and will review it shortly.'),
    (NEW.id, 'Screening', 2, '#f59e0b', 'Congratulations! Your profile has passed our initial review. We would like to schedule a screening call.'),
    (NEW.id, 'Interview', 3, '#8b5cf6', 'Great news! We would like to invite you for an interview. Please let us know your availability.'),
    (NEW.id, 'Final Review', 4, '#f97316', 'You have progressed to our final review stage. We will be in touch with next steps soon.'),
    (NEW.id, 'Offer', 5, '#10b981', 'Excellent! We are pleased to extend you an offer. Please review the attached details.'),
    (NEW.id, 'Hired', 6, '#059669', 'Welcome to the team! We are excited to have you on board.'),
    (NEW.id, 'Declined', 7, '#ef4444', 'Thank you for your time and interest. While we will not be moving forward at this time, we encourage you to apply for future opportunities.');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER create_default_pipeline_stages_trigger
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_default_pipeline_stages();

-- Function to automatically send communication when candidate moves stages
CREATE OR REPLACE FUNCTION send_stage_move_communication()
RETURNS TRIGGER AS $$
DECLARE
  stage_template text;
  stage_name text;
  candidate_email text;
  recruiter_name text;
BEGIN
  -- Get stage template and name
  SELECT ps.auto_email_template, ps.stage_name
  INTO stage_template, stage_name
  FROM pipeline_stages ps
  WHERE ps.id = NEW.current_stage_id;
  
  -- Get candidate email and recruiter name
  SELECT c.email, r.first_name || ' ' || r.last_name
  INTO candidate_email, recruiter_name
  FROM profiles c, profiles r
  WHERE c.id = NEW.candidate_id AND r.id = NEW.recruiter_id;
  
  -- Only send if template exists and this is a stage change (not initial insert)
  IF stage_template IS NOT NULL AND stage_template != '' AND (TG_OP = 'UPDATE' OR OLD.current_stage_id IS DISTINCT FROM NEW.current_stage_id) THEN
    INSERT INTO candidate_communications (
      recruiter_id,
      candidate_id,
      communication_type,
      trigger_event,
      subject,
      message_content
    ) VALUES (
      NEW.recruiter_id,
      NEW.candidate_id,
      'email',
      'stage_move',
      'Application Update: ' || stage_name,
      stage_template
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER send_stage_move_communication_trigger
  AFTER INSERT OR UPDATE OF current_stage_id ON candidate_pipeline_positions
  FOR EACH ROW
  EXECUTE FUNCTION send_stage_move_communication();

-- Function to update availability timestamp
CREATE OR REPLACE FUNCTION update_availability_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER update_availability_updated_at_trigger
  BEFORE UPDATE ON availability_updates
  FOR EACH ROW
  EXECUTE FUNCTION update_availability_updated_at();

-- View for recruiter ratings summary
CREATE OR REPLACE VIEW recruiter_ratings_summary AS
SELECT 
  r.id as recruiter_id,
  r.first_name,
  r.last_name,
  r.email,
  COUNT(rs.id) as total_reviews,
  ROUND(AVG(rs.communication_rating), 1) as avg_communication,
  ROUND(AVG(rs.professionalism_rating), 1) as avg_professionalism,
  ROUND(AVG(rs.role_accuracy_rating), 1) as avg_role_accuracy,
  ROUND(AVG(rs.overall_rating), 1) as overall_rating,
  COUNT(CASE WHEN rs.overall_rating >= 4.0 THEN 1 END) as positive_reviews,
  COUNT(CASE WHEN rs.overall_rating < 3.0 THEN 1 END) as negative_reviews
FROM profiles r
LEFT JOIN recruiter_scorecards rs ON r.id = rs.recruiter_id AND rs.is_public = true
WHERE r.role = 'recruiter'
GROUP BY r.id, r.first_name, r.last_name, r.email;

-- View for live candidate availability
CREATE OR REPLACE VIEW live_candidate_availability AS
SELECT 
  p.id as candidate_id,
  p.first_name,
  p.last_name,
  p.email,
  p.headline,
  p.completion_score as reelpass_score,
  au.availability_status,
  au.available_from,
  au.notice_period_days,
  au.salary_expectation_min,
  au.salary_expectation_max,
  au.preferred_work_type,
  au.location_preferences,
  au.updated_at as availability_updated_at,
  CASE 
    WHEN p.completion_score >= 80 THEN 'verified'
    WHEN p.completion_score >= 60 THEN 'partial'
    ELSE 'unverified'
  END as verification_status
FROM profiles p
LEFT JOIN availability_updates au ON p.id = au.profile_id AND au.is_active = true
WHERE p.role = 'candidate'
ORDER BY au.updated_at DESC NULLS LAST, p.completion_score DESC;