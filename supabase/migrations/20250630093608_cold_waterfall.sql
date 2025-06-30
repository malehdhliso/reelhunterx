/*
  # Add Rejected Stage to Pipeline

  1. Updates
    - Update default pipeline stages function to include "Rejected" stage
    - Ensure all recruiters get the rejected stage in their pipeline
    
  2. Changes
    - Modified create_default_pipeline_stages function
    - Added "Rejected" as stage 7 with appropriate styling and template
*/

-- Update the function to include Rejected stage
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
    (NEW.id, 'Rejected', 7, '#ef4444', 'Thank you for your time and interest in our company. While we will not be moving forward with your application at this time, we encourage you to apply for future opportunities that match your skills.');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add Rejected stage to existing recruiters who don't have it
INSERT INTO pipeline_stages (recruiter_id, stage_name, stage_order, stage_color, auto_email_template)
SELECT 
  p.id,
  'Rejected',
  7,
  '#ef4444',
  'Thank you for your time and interest in our company. While we will not be moving forward with your application at this time, we encourage you to apply for future opportunities that match your skills.'
FROM profiles p
WHERE p.role = 'recruiter'
AND NOT EXISTS (
  SELECT 1 FROM pipeline_stages ps 
  WHERE ps.recruiter_id = p.id AND ps.stage_name = 'Rejected'
);