-- =============================================================
-- TENSECTRA — DATABASE FIX FOR FORM SUBMISSIONS
-- Run this AFTER running SupabaseSetup.sql
-- This fixes the mismatch between forms and database
-- =============================================================

-- DIAGNOSTIC: Check current columns
-- Run this first to see what you have:
-- SELECT column_name FROM information_schema.columns WHERE table_name = 'cohort_applications';
-- SELECT column_name FROM information_schema.columns WHERE table_name = 'consultancy_enquiries';
-- SELECT column_name FROM information_schema.columns WHERE table_name = 'waitlist_submissions';

-- =============================================================
-- FIX 1: COHORT APPLICATIONS
-- =============================================================
-- The form sends 'scholarship' but after form-handler.js processes it,
-- it becomes 'is_scholarship' (boolean)
-- Your current table has 'scholarship' (text)

-- Add the boolean column
ALTER TABLE cohort_applications ADD COLUMN IF NOT EXISTS is_scholarship BOOLEAN DEFAULT FALSE;

-- Copy existing data (convert 'yes' to true, everything else to false)
UPDATE cohort_applications 
SET is_scholarship = CASE WHEN scholarship = 'yes' THEN TRUE ELSE FALSE END
WHERE scholarship IS NOT NULL;

-- Drop the old text column
ALTER TABLE cohort_applications DROP COLUMN IF EXISTS scholarship;

-- =============================================================
-- FIX 2: CONSULTANCY ENQUIRIES  
-- =============================================================
-- Your current table has: role, stack, challenges, timeline (CORRECT!)
-- form-handler.js sends: role, challenges, timeline, and removes 'stack'
-- Just need to make tier nullable with default

ALTER TABLE consultancy_enquiries ALTER COLUMN tier DROP NOT NULL;
ALTER TABLE consultancy_enquiries ALTER COLUMN tier SET DEFAULT 'tier3_consultation';

-- =============================================================
-- FIX 3: WAITLIST SUBMISSIONS
-- =============================================================
-- Your current table has: interest, role (CORRECT!)
-- form-handler.js converts 'interest' to 'product' and keeps 'role'

-- Rename interest to product
ALTER TABLE waitlist_submissions RENAME COLUMN interest TO product;

-- =============================================================
-- FIX 4: CONTACT SUBMISSIONS
-- =============================================================
-- Already correct! No changes needed.

-- =============================================================
-- VERIFICATION
-- =============================================================
-- Run these to verify your tables are now correct:

SELECT 'cohort_applications columns:' as info;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'cohort_applications' 
ORDER BY ordinal_position;

SELECT 'consultancy_enquiries columns:' as info;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'consultancy_enquiries' 
ORDER BY ordinal_position;

SELECT 'waitlist_submissions columns:' as info;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'waitlist_submissions' 
ORDER BY ordinal_position;

SELECT 'contact_submissions columns:' as info;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'contact_submissions' 
ORDER BY ordinal_position;

-- =============================================================
-- EXPECTED RESULTS
-- =============================================================
/*
cohort_applications should have:
- is_scholarship (boolean) ?
- NO scholarship column

waitlist_submissions should have:
- product (text) ?
- role (text) ?
- NO interest column

consultancy_enquiries should have:
- tier (text, nullable, default 'tier3_consultation') ?
- role (text) ?
- challenges (text) ?
- timeline (text) ?
- stack (text) ?

contact_submissions should have:
- All original columns ?
*/
