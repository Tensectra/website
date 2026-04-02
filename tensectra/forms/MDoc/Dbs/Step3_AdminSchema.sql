-- =============================================================
-- TENSECTRA — STEP 3: ADMIN SCHEMA
-- Run AFTER Step2_TensectraSchema_v3.sql
-- Adds: admin_users, consultancy_pricing, payment_links
-- And: RLS policies that allow authenticated admins to read/update
-- =============================================================

-- =============================================================
-- TABLE A: admin_users
-- Manually populated — insert your team emails here
-- =============================================================
CREATE TABLE IF NOT EXISTS admin_users (
  id         UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
  email      TEXT        UNIQUE NOT NULL,
  name       TEXT,
  role       TEXT        NOT NULL DEFAULT 'sales'
               CHECK (role IN ('admin', 'sales', 'hr')),
  active     BOOLEAN     DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "admin_users_self_read" ON admin_users;

-- Any authenticated user can check their own admin record
CREATE POLICY "admin_users_self_read"
  ON admin_users FOR SELECT TO authenticated
  USING (email = auth.jwt()->>'email');

-- =============================================================
-- TABLE B: consultancy_pricing
-- Default prices per tier — admin can override per client
-- Amounts stored in smallest unit: USD = cents, NGN = kobo
-- =============================================================
CREATE TABLE IF NOT EXISTS consultancy_pricing (
  id          UUID    DEFAULT uuid_generate_v4() PRIMARY KEY,
  tier        TEXT    UNIQUE NOT NULL,
  name        TEXT    NOT NULL,
  currency    TEXT    NOT NULL DEFAULT 'NGN',
  amount      BIGINT  NOT NULL,  -- kobo or cents
  description TEXT,
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO consultancy_pricing (tier, name, currency, amount, description) VALUES
  ('3',        'Architecture Consultation', 'NGN', 25000000,  '2-hour targeted session · ?250,000'),
  ('2',        'Architecture Workshop',     'NGN', 100000000, 'Full-day intensive · ?1,000,000'),
  ('1',        'Corporate Cohort',          'NGN', 500000000, '6-week private cohort · ?5,000,000'),
  ('retainer', 'Architecture Retainer',     'NGN', 75000000,  'Monthly retainer · ?750,000/mo'),
  ('unsure',   'Consultation TBD',          'NGN', 25000000,  'To be confirmed')
ON CONFLICT (tier) DO NOTHING;

ALTER TABLE consultancy_pricing ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_read_pricing" ON consultancy_pricing;
DROP POLICY IF EXISTS "admin_update_pricing" ON consultancy_pricing;

CREATE POLICY "admin_read_pricing"
  ON consultancy_pricing FOR SELECT TO authenticated
  USING ((SELECT role FROM admin_users WHERE email = auth.jwt()->>'email' AND active = TRUE) IS NOT NULL);
CREATE POLICY "admin_update_pricing"
  ON consultancy_pricing FOR UPDATE TO authenticated
  USING ((SELECT role FROM admin_users WHERE email = auth.jwt()->>'email' AND active = TRUE) IS NOT NULL)
  WITH CHECK ((SELECT role FROM admin_users WHERE email = auth.jwt()->>'email' AND active = TRUE) IS NOT NULL);

-- =============================================================
-- TABLE C: payment_links
-- Tracks every payment link sent from admin panel
-- =============================================================
CREATE TABLE IF NOT EXISTS payment_links (
  id                  UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
  record_type         TEXT        NOT NULL CHECK (record_type IN ('consultancy', 'cohort')),
  record_id           UUID        NOT NULL,
  payer_email         TEXT        NOT NULL,
  payer_name          TEXT,
  product_name        TEXT,
  amount              BIGINT      NOT NULL,
  currency            TEXT        NOT NULL DEFAULT 'NGN',
  paystack_reference  TEXT,
  paystack_link       TEXT,
  sent_by             TEXT,
  sent_at             TIMESTAMPTZ DEFAULT NOW(),
  used_at             TIMESTAMPTZ
);

DROP INDEX IF EXISTS idx_payment_links_record;
DROP INDEX IF EXISTS idx_payment_links_email;

CREATE INDEX idx_payment_links_record ON payment_links(record_id);
CREATE INDEX idx_payment_links_email  ON payment_links(payer_email);

ALTER TABLE payment_links ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_read_payment_links" ON payment_links;
DROP POLICY IF EXISTS "admin_insert_payment_links" ON payment_links;

CREATE POLICY "admin_read_payment_links"
  ON payment_links FOR SELECT TO authenticated
  USING ((SELECT role FROM admin_users WHERE email = auth.jwt()->>'email' AND active = TRUE) IS NOT NULL);
CREATE POLICY "admin_insert_payment_links"
  ON payment_links FOR INSERT TO authenticated
  WITH CHECK ((SELECT role FROM admin_users WHERE email = auth.jwt()->>'email' AND active = TRUE) IS NOT NULL);

-- =============================================================
-- RLS — ADMIN READ/UPDATE POLICIES on existing tables
-- Drop existing policies first to avoid conflicts
-- =============================================================

-- consultancy_enquiries
DROP POLICY IF EXISTS "admin_select_consultancy" ON consultancy_enquiries;
DROP POLICY IF EXISTS "admin_update_consultancy" ON consultancy_enquiries;

CREATE POLICY "admin_select_consultancy"
  ON consultancy_enquiries FOR SELECT TO authenticated
  USING ((SELECT role FROM admin_users WHERE email = auth.jwt()->>'email' AND active = TRUE) IS NOT NULL);
CREATE POLICY "admin_update_consultancy"
  ON consultancy_enquiries FOR UPDATE TO authenticated
  USING ((SELECT role FROM admin_users WHERE email = auth.jwt()->>'email' AND active = TRUE) IS NOT NULL)
  WITH CHECK (TRUE);

-- cohort_applications
DROP POLICY IF EXISTS "admin_select_applications" ON cohort_applications;
DROP POLICY IF EXISTS "admin_update_applications" ON cohort_applications;

CREATE POLICY "admin_select_applications"
  ON cohort_applications FOR SELECT TO authenticated
  USING ((SELECT role FROM admin_users WHERE email = auth.jwt()->>'email' AND active = TRUE) IS NOT NULL);
CREATE POLICY "admin_update_applications"
  ON cohort_applications FOR UPDATE TO authenticated
  USING ((SELECT role FROM admin_users WHERE email = auth.jwt()->>'email' AND active = TRUE) IS NOT NULL)
  WITH CHECK (TRUE);

-- payments (read-only for admin)
DROP POLICY IF EXISTS "admin_select_payments" ON payments;

CREATE POLICY "admin_select_payments"
  ON payments FOR SELECT TO authenticated
  USING ((SELECT role FROM admin_users WHERE email = auth.jwt()->>'email' AND active = TRUE) IS NOT NULL);

-- newsletter_subscribers
DROP POLICY IF EXISTS "admin_select_newsletter" ON newsletter_subscribers;

CREATE POLICY "admin_select_newsletter"
  ON newsletter_subscribers FOR SELECT TO authenticated
  USING ((SELECT role FROM admin_users WHERE email = auth.jwt()->>'email' AND active = TRUE) IS NOT NULL);

-- contact_submissions
DROP POLICY IF EXISTS "admin_select_contact" ON contact_submissions;
DROP POLICY IF EXISTS "admin_update_contact" ON contact_submissions;

CREATE POLICY "admin_select_contact"
  ON contact_submissions FOR SELECT TO authenticated
  USING ((SELECT role FROM admin_users WHERE email = auth.jwt()->>'email' AND active = TRUE) IS NOT NULL);
CREATE POLICY "admin_update_contact"
  ON contact_submissions FOR UPDATE TO authenticated
  USING ((SELECT role FROM admin_users WHERE email = auth.jwt()->>'email' AND active = TRUE) IS NOT NULL)
  WITH CHECK (TRUE);

-- cohorts (admin can read + update)
DROP POLICY IF EXISTS "admin_select_cohorts" ON cohorts;
DROP POLICY IF EXISTS "admin_update_cohorts" ON cohorts;

CREATE POLICY "admin_select_cohorts"
  ON cohorts FOR SELECT TO authenticated
  USING ((SELECT role FROM admin_users WHERE email = auth.jwt()->>'email' AND active = TRUE) IS NOT NULL);
CREATE POLICY "admin_update_cohorts"
  ON cohorts FOR UPDATE TO authenticated
  USING ((SELECT role FROM admin_users WHERE email = auth.jwt()->>'email' AND active = TRUE) IS NOT NULL)
  WITH CHECK (TRUE);

-- =============================================================
-- SEED: Insert your admin user (replace email if different)
-- =============================================================
INSERT INTO admin_users (email, name, role) VALUES
  ('tensectra.office@gmail.com', 'Admin', 'admin'),
  ('sales.tensectra@gmail.com',  'Sales', 'sales'),
  ('hr.tensectra@gmail.com',     'HR',    'hr')
ON CONFLICT (email) DO NOTHING;

-- =============================================================
-- VERIFY
-- =============================================================
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' ORDER BY table_name;
