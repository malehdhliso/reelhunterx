/*
  # Create interviews table for scheduling system

  1. New Tables
    - `interviews`
      - `id` (uuid, primary key)
      - `recruiter_id` (uuid, foreign key to profiles)
      - `candidate_name` (text)
      - `candidate_email` (text)
      - `interview_type` (enum: video, phone, in-person)
      - `scheduled_at` (timestamptz)
      - `duration_minutes` (integer)
      - `interviewers` (text array)
      - `location` (text, optional)
      - `notes` (text, optional)
      - `timezone` (text)
      - `meeting_url` (text, optional)
      - `meeting_id` (text, optional)
      - `status` (enum: scheduled, completed, cancelled, rescheduled)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `interviews` table
    - Add policies for recruiters to manage their own interviews
    - Add data validation constraints

  3. Indexes
    - Performance indexes for common queries
    - Email and scheduling lookups
*/

-- Create enum types
DO $$ BEGIN
  CREATE TYPE interview_type AS ENUM ('video', 'phone', 'in-person');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE interview_status AS ENUM ('scheduled', 'completed', 'cancelled', 'rescheduled');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create interviews table
CREATE TABLE IF NOT EXISTS interviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recruiter_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  candidate_name text NOT NULL,
  candidate_email text NOT NULL,
  interview_type interview_type NOT NULL,
  scheduled_at timestamptz NOT NULL,
  duration_minutes integer NOT NULL DEFAULT 60,
  interviewers text[] NOT NULL DEFAULT '{}',
  location text,
  notes text,
  timezone text NOT NULL DEFAULT 'UTC',
  meeting_url text,
  meeting_id text,
  status interview_status NOT NULL DEFAULT 'scheduled',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_interviews_recruiter_id ON interviews(recruiter_id);
CREATE INDEX IF NOT EXISTS idx_interviews_scheduled_at ON interviews(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_interviews_status ON interviews(status);
CREATE INDEX IF NOT EXISTS idx_interviews_candidate_email ON interviews(candidate_email);

-- Enable RLS
ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Recruiters can manage own interviews"
  ON interviews
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = interviews.recruiter_id 
      AND p.user_id = auth.uid() 
      AND p.role = 'recruiter'
    )
  );

CREATE POLICY "Recruiters can view own interviews"
  ON interviews
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = interviews.recruiter_id 
      AND p.user_id = auth.uid() 
      AND p.role = 'recruiter'
    )
  );

-- Add constraints
ALTER TABLE interviews ADD CONSTRAINT interviews_duration_check 
  CHECK (duration_minutes > 0 AND duration_minutes <= 480);

ALTER TABLE interviews ADD CONSTRAINT interviews_email_check 
  CHECK (candidate_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION update_interviews_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_interviews_updated_at
  BEFORE UPDATE ON interviews
  FOR EACH ROW
  EXECUTE FUNCTION update_interviews_updated_at();