-- =============================================================
-- TENSECTRA — STEP 1: DROP ALL TABLES
-- Run this FIRST to clear everything in Supabase
-- Supabase SQL Editor ? New query ? Paste ? Run
-- =============================================================

-- Drop views first
DROP VIEW IF EXISTS v_active_cohorts CASCADE;
DROP VIEW IF EXISTS v_revenue_summary CASCADE;

-- Drop functions/triggers
DROP FUNCTION IF EXISTS update_cohort_seats() CASCADE;
DROP FUNCTION IF EXISTS update_scholarship_count() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Drop all tables (CASCADE handles FK dependencies automatically)
DROP TABLE IF EXISTS admin_activity_log       CASCADE;
DROP TABLE IF EXISTS newsletter_subscribers   CASCADE;
DROP TABLE IF EXISTS pricing_tiers            CASCADE;
DROP TABLE IF EXISTS pro_members              CASCADE;
DROP TABLE IF EXISTS kit_purchase_requests    CASCADE;
DROP TABLE IF EXISTS scholarship_applications CASCADE;
DROP TABLE IF EXISTS enrolments               CASCADE;
DROP TABLE IF EXISTS payments                 CASCADE;
DROP TABLE IF EXISTS waitlist_submissions     CASCADE;
DROP TABLE IF EXISTS contact_submissions      CASCADE;
DROP TABLE IF EXISTS consultancy_enquiries    CASCADE;
DROP TABLE IF EXISTS cohort_applications      CASCADE;
DROP TABLE IF EXISTS cohorts                  CASCADE;
DROP TABLE IF EXISTS users                    CASCADE;

-- Confirm everything is gone
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
-- Expected result: 0 rows
