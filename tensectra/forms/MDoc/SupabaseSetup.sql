-- =============================================================
-- TENSECTRA — SUPABASE SCHEMA + RLS
-- Run this in: Supabase dashboard ? SQL Editor ? New query
-- =============================================================

-- ?? 1. CONTACT SUBMISSIONS ????????????????????????????????????
CREATE TABLE contact_submissions (
  id              UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  name            TEXT        NOT NULL,
  email           TEXT        NOT NULL,
  subject         TEXT,
  message         TEXT,
  country_code    TEXT,
  country_name    TEXT,
  city            TEXT,
  location_source TEXT,
  source          TEXT        DEFAULT 'contact',   -- 'contact' | 'about'
  submitted_at    TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_insert" ON contact_submissions FOR INSERT TO anon WITH CHECK (true);

-- ?? 2. WAITLIST SUBMISSIONS ????????????????????????????????????
CREATE TABLE waitlist_submissions (
  id              UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  name            TEXT        NOT NULL,
  email           TEXT        NOT NULL,
  interest        TEXT,
  role            TEXT,
  country_code    TEXT,
  country_name    TEXT,
  city            TEXT,
  location_source TEXT,
  submitted_at    TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE waitlist_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_insert" ON waitlist_submissions FOR INSERT TO anon WITH CHECK (true);

-- ?? 3. COHORT APPLICATIONS ?????????????????????????????????????
CREATE TABLE cohort_applications (
  id                  UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  name                TEXT        NOT NULL,
  email               TEXT        NOT NULL,
  course              TEXT,
  role                TEXT,
  experience          TEXT,
  gap                 TEXT,
  goals               TEXT,
  portfolio           TEXT,
  scholarship         TEXT        DEFAULT 'no',
  scholarship_reason  TEXT,
  country_code        TEXT,
  country_name        TEXT,
  city                TEXT,
  location_source     TEXT,
  submitted_at        TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE cohort_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_insert" ON cohort_applications FOR INSERT TO anon WITH CHECK (true);

-- ?? 4. CONSULTANCY ENQUIRIES ???????????????????????????????????
CREATE TABLE consultancy_enquiries (
  id              UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  tier            TEXT,
  name            TEXT        NOT NULL,
  email           TEXT        NOT NULL,
  company         TEXT,
  role            TEXT,
  team_size       TEXT,
  stack           TEXT,
  challenges      TEXT,
  timeline        TEXT,
  country_code    TEXT,
  country_name    TEXT,
  city            TEXT,
  location_source TEXT,
  submitted_at    TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE consultancy_enquiries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_insert" ON consultancy_enquiries FOR INSERT TO anon WITH CHECK (true);

-- =============================================================
-- OPTIONAL: Email notifications via Supabase webhooks
-- Supabase dashboard ? Database ? Webhooks ? Create new webhook
-- Trigger: INSERT on each table
-- URL: your Resend / SendGrid endpoint (or n8n / Make)
-- =============================================================
