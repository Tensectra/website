-- ============================================================
-- Tensectra Careers — Supabase Setup
-- Run this in: Supabase ? SQL Editor ? New Query ? Run
-- ============================================================

CREATE TABLE IF NOT EXISTS public.jobs (
  id               UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  title            TEXT        NOT NULL,
  department       TEXT,
  employment_type  TEXT        NOT NULL DEFAULT 'FULL_TIME',
  work_model       TEXT        NOT NULL DEFAULT 'REMOTE',
  location_city    TEXT        NOT NULL DEFAULT 'Remote',
  location_country TEXT        NOT NULL DEFAULT 'NG',
  valid_through    DATE,
  salary_min       NUMERIC,
  salary_max       NUMERIC,
  salary_currency  TEXT        NOT NULL DEFAULT 'NGN',
  salary_unit      TEXT        NOT NULL DEFAULT 'YEAR',
  short_description TEXT,
  description      TEXT        NOT NULL,
  requirements     TEXT,
  responsibilities TEXT,
  benefits         TEXT,
  apply_url        TEXT,
  is_active        BOOLEAN     NOT NULL DEFAULT TRUE,
  date_posted      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

-- Public: read active jobs only
CREATE POLICY "Public read active jobs"
  ON public.jobs FOR SELECT
  USING (is_active = TRUE);

-- Authenticated admins: full access
CREATE POLICY "Admins full access on jobs"
  ON public.jobs FOR ALL
  USING (auth.role() = 'authenticated');

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_jobs_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER jobs_updated_at
  BEFORE UPDATE ON public.jobs
  FOR EACH ROW EXECUTE FUNCTION update_jobs_updated_at();
