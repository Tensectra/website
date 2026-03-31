-- =============================================================
-- TENSECTRA — DATABASE ALIGNMENT FIX
-- Run this to align database with existing forms
-- =============================================================

-- FIX 1: Consultancy Enquiries Table
-- Align column names with form fields
ALTER TABLE consultancy_enquiries RENAME COLUMN job_title TO role;
ALTER TABLE consultancy_enquiries RENAME COLUMN message TO challenges;
ALTER TABLE consultancy_enquiries ADD COLUMN stack TEXT;

-- Make tier nullable (form doesn't always send it)
ALTER TABLE consultancy_enquiries ALTER COLUMN tier DROP NOT NULL;

-- Add default for tier
ALTER TABLE consultancy_enquiries ALTER COLUMN tier SET DEFAULT 'tier3_consultation';

-- Convert preferred_date to timeline (text instead of date)
ALTER TABLE consultancy_enquiries ADD COLUMN timeline TEXT;
-- Copy data if any exists
UPDATE consultancy_enquiries SET timeline = CAST(preferred_date AS TEXT) WHERE preferred_date IS NOT NULL;
-- Drop old column
ALTER TABLE consultancy_enquiries DROP COLUMN preferred_date;

-- FIX 2: Waitlist Submissions
-- Add role column (form sends it but DB doesn't have it)
ALTER TABLE waitlist_submissions ADD COLUMN role TEXT;

-- Update product enum to match form values (if using CHECK constraint)
-- Remove old constraint
ALTER TABLE waitlist_submissions DROP CONSTRAINT IF EXISTS waitlist_submissions_product_check;

-- Add new constraint with correct values
ALTER TABLE waitlist_submissions ADD CONSTRAINT waitlist_submissions_product_check 
  CHECK (product IN ('course_designer', 'course_ai_biz', 'pro', 'kit_pro', 'kit_enterprise', 'general'));

-- FIX 3: Cohort Applications
-- Ensure is_scholarship has proper default
ALTER TABLE cohort_applications ALTER COLUMN is_scholarship SET DEFAULT FALSE;

-- =============================================================
-- VERIFICATION QUERIES
-- =============================================================

-- Verify consultancy_enquiries structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'consultancy_enquiries'
ORDER BY ordinal_position;

-- Verify waitlist_submissions structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'waitlist_submissions'
ORDER BY ordinal_position;

-- Verify cohort_applications structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'cohort_applications'
WHERE column_name = 'is_scholarship';

-- =============================================================
-- COMPLETED
-- =============================================================
-- All tables should now match form fields exactly
