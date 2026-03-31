-- =============================================================
-- TENSECTRA — COMPLETE DATABASE SCHEMA (Aligned with DATA_MODELS.txt)
-- Supabase Implementation with Row Level Security
-- Version: 2.0
-- Last Updated: 2024
-- =============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================
-- 1. COHORT MASTER TABLE
-- =============================================================
CREATE TABLE cohorts (
  id                  UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
  name                TEXT        NOT NULL,
  course              TEXT        NOT NULL CHECK (course IN ('backend', 'frontend', 'mobile')),
  start_date          DATE        NOT NULL,
  end_date            DATE        NOT NULL,
  seats_total         INTEGER     NOT NULL DEFAULT 15,
  seats_remaining     INTEGER     NOT NULL DEFAULT 15,
  scholarship_slots   INTEGER     NOT NULL DEFAULT 5,
  scholarship_filled  INTEGER     NOT NULL DEFAULT 0,
  status              TEXT        NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed', 'in_progress', 'completed')),
  price_usd           INTEGER     NOT NULL, -- in cents
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_cohorts_status ON cohorts(status);
CREATE INDEX idx_cohorts_course ON cohorts(course);

-- =============================================================
-- 2. COHORT APPLICATIONS
-- =============================================================
CREATE TABLE cohort_applications (
  id                  UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
  name                TEXT        NOT NULL,
  email               TEXT        NOT NULL,
  course              TEXT        NOT NULL CHECK (course IN ('backend', 'frontend', 'mobile')),
  role                TEXT,
  experience          TEXT        CHECK (experience IN ('0-1', '1-3', '3-5', '5+')),
  gap                 TEXT,
  goals               TEXT,
  portfolio           TEXT,
  country_code        TEXT,
  country_name        TEXT,
  city                TEXT,
  location_source     TEXT        DEFAULT 'auto_detected' CHECK (location_source IN ('user_selected', 'auto_detected')),
  is_scholarship      BOOLEAN     DEFAULT FALSE,
  scholarship_reason  TEXT,
  status              TEXT        DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'waitlisted')),
  cohort_id           UUID        REFERENCES cohorts(id) ON DELETE SET NULL,
  reviewed_at         TIMESTAMPTZ,
  reviewed_by         TEXT,
  notes               TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_cohort_apps_email ON cohort_applications(email);
CREATE INDEX idx_cohort_apps_status ON cohort_applications(status);
CREATE INDEX idx_cohort_apps_course ON cohort_applications(course);
CREATE INDEX idx_cohort_apps_cohort_id ON cohort_applications(cohort_id);

ALTER TABLE cohort_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_insert_cohort_app" ON cohort_applications FOR INSERT TO anon WITH CHECK (true);

-- =============================================================
-- 3. PAYMENTS
-- =============================================================
CREATE TABLE payments (
  id                  UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
  stripe_payment_id   TEXT        UNIQUE,
  paystack_reference  TEXT        UNIQUE,
  stripe_customer_id  TEXT,
  paystack_customer_code TEXT,
  payer_name          TEXT        NOT NULL,
  payer_email         TEXT        NOT NULL,
  product_type        TEXT        NOT NULL CHECK (product_type IN ('cohort', 'kit', 'pro_monthly', 'pro_annual', 'materials_only', 'consultancy')),
  product_ref         TEXT,
  amount_cents        INTEGER     NOT NULL,
  currency            TEXT        DEFAULT 'USD',
  payment_method      TEXT        DEFAULT 'stripe' CHECK (payment_method IN ('stripe', 'paystack', 'manual')),
  status              TEXT        DEFAULT 'pending' CHECK (status IN ('pending', 'succeeded', 'refunded', 'failed')),
  refunded_at         TIMESTAMPTZ,
  metadata            JSONB,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_payments_email ON payments(payer_email);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_product_type ON payments(product_type);
CREATE INDEX idx_payments_stripe_id ON payments(stripe_payment_id);
CREATE INDEX idx_payments_paystack_ref ON payments(paystack_reference);

-- =============================================================
-- 4. ENROLMENTS
-- =============================================================
CREATE TABLE enrolments (
  id                  UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
  application_id      UUID        NOT NULL REFERENCES cohort_applications(id) ON DELETE CASCADE,
  cohort_id           UUID        NOT NULL REFERENCES cohorts(id) ON DELETE CASCADE,
  payment_id          UUID        REFERENCES payments(id) ON DELETE SET NULL,
  is_scholarship      BOOLEAN     DEFAULT FALSE,
  discord_invited     BOOLEAN     DEFAULT FALSE,
  materials_sent      BOOLEAN     DEFAULT FALSE,
  status              TEXT        DEFAULT 'active' CHECK (status IN ('active', 'dropped', 'completed')),
  enrolled_at         TIMESTAMPTZ DEFAULT NOW(),
  completed_at        TIMESTAMPTZ
);

CREATE INDEX idx_enrolments_cohort_id ON enrolments(cohort_id);
CREATE INDEX idx_enrolments_application_id ON enrolments(application_id);

-- =============================================================
-- 5. SCHOLARSHIP APPLICATIONS
-- =============================================================
CREATE TABLE scholarship_applications (
  id                  UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
  application_id      UUID        UNIQUE NOT NULL REFERENCES cohort_applications(id) ON DELETE CASCADE,
  reason              TEXT        NOT NULL,
  status              TEXT        DEFAULT 'pending' CHECK (status IN ('pending', 'awarded', 'declined')),
  awarded_at          TIMESTAMPTZ,
  awarded_by          TEXT,
  notes               TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_scholarship_apps_status ON scholarship_applications(status);

-- =============================================================
-- 6. CONSULTANCY ENQUIRIES
-- =============================================================
CREATE TABLE consultancy_enquiries (
  id                  UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
  name                TEXT        NOT NULL,
  email               TEXT        NOT NULL,
  company             TEXT,
  job_title           TEXT,
  team_size           TEXT        CHECK (team_size IN ('1-5', '6-20', '21-50', '50+')),
  tier                TEXT        NOT NULL CHECK (tier IN ('tier1_cohort', 'tier2_workshop', 'tier3_consultation', 'retainer')),
  message             TEXT,
  preferred_date      DATE,
  budget_range        TEXT,
  country_code        TEXT,
  country_name        TEXT,
  city                TEXT,
  location_source     TEXT        DEFAULT 'auto_detected',
  status              TEXT        DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'proposal_sent', 'won', 'lost')),
  calendly_link_sent  BOOLEAN     DEFAULT FALSE,
  hubspot_id          TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_consultancy_email ON consultancy_enquiries(email);
CREATE INDEX idx_consultancy_status ON consultancy_enquiries(status);

ALTER TABLE consultancy_enquiries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_insert_consultancy" ON consultancy_enquiries FOR INSERT TO anon WITH CHECK (true);

-- =============================================================
-- 7. CONTACT SUBMISSIONS
-- =============================================================
CREATE TABLE contact_submissions (
  id              UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
  name            TEXT        NOT NULL,
  email           TEXT        NOT NULL,
  subject         TEXT,
  message         TEXT        NOT NULL,
  source          TEXT        DEFAULT 'contact',
  country_code    TEXT,
  country_name    TEXT,
  city            TEXT,
  location_source TEXT        DEFAULT 'auto_detected',
  replied         BOOLEAN     DEFAULT FALSE,
  replied_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_contact_email ON contact_submissions(email);
CREATE INDEX idx_contact_replied ON contact_submissions(replied);

ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_insert_contact" ON contact_submissions FOR INSERT TO anon WITH CHECK (true);

-- =============================================================
-- 8. KIT PURCHASE REQUESTS
-- =============================================================
CREATE TABLE kit_purchase_requests (
  id                  UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
  name                TEXT        NOT NULL,
  email               TEXT        NOT NULL,
  payment_id          UUID        REFERENCES payments(id) ON DELETE SET NULL,
  kit_tier            TEXT        DEFAULT 'starter' CHECK (kit_tier IN ('starter', 'pro', 'enterprise')),
  status              TEXT        DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'delivered', 'refunded')),
  delivery_sent_at    TIMESTAMPTZ,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_kit_purchases_email ON kit_purchase_requests(email);
CREATE INDEX idx_kit_purchases_status ON kit_purchase_requests(status);

ALTER TABLE kit_purchase_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_insert_kit_purchase" ON kit_purchase_requests FOR INSERT TO anon WITH CHECK (true);

-- =============================================================
-- 9. PRO MEMBERS
-- =============================================================
CREATE TABLE pro_members (
  id                  UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
  stripe_customer_id  TEXT        UNIQUE,
  paystack_customer_code TEXT     UNIQUE,
  stripe_sub_id       TEXT        UNIQUE,
  paystack_sub_code   TEXT        UNIQUE,
  name                TEXT        NOT NULL,
  email               TEXT        UNIQUE NOT NULL,
  plan                TEXT        NOT NULL CHECK (plan IN ('monthly', 'annual')),
  status              TEXT        DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'past_due', 'paused')),
  cohort_alumni       BOOLEAN     DEFAULT FALSE,
  discord_invited     BOOLEAN     DEFAULT FALSE,
  digest_subscribed   BOOLEAN     DEFAULT TRUE,
  started_at          TIMESTAMPTZ DEFAULT NOW(),
  renews_at           TIMESTAMPTZ,
  cancelled_at        TIMESTAMPTZ
);

CREATE INDEX idx_pro_members_email ON pro_members(email);
CREATE INDEX idx_pro_members_status ON pro_members(status);

-- =============================================================
-- 10. WAITLIST
-- =============================================================
CREATE TABLE waitlist_submissions (
  id              UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
  email           TEXT        NOT NULL,
  product         TEXT        NOT NULL CHECK (product IN ('course_designer', 'course_ai_biz', 'pro', 'kit_pro', 'kit_enterprise', 'general')),
  name            TEXT,
  country_code    TEXT,
  country_name    TEXT,
  city            TEXT,
  location_source TEXT        DEFAULT 'auto_detected',
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(email, product)
);

CREATE INDEX idx_waitlist_product ON waitlist_submissions(product);

ALTER TABLE waitlist_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_insert_waitlist" ON waitlist_submissions FOR INSERT TO anon WITH CHECK (true);

-- =============================================================
-- 11. NEWSLETTER SUBSCRIBERS
-- =============================================================
CREATE TABLE newsletter_subscribers (
  id              UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
  email           TEXT        NOT NULL UNIQUE,
  name            TEXT,
  list_type       TEXT        DEFAULT 'general' CHECK (list_type IN ('general', 'pro_members', 'alumni', 'kit_owners', 'waitlist')),
  source          TEXT,
  mailchimp_id    TEXT,
  subscribed      BOOLEAN     DEFAULT TRUE,
  subscribed_at   TIMESTAMPTZ DEFAULT NOW(),
  unsubscribed_at TIMESTAMPTZ
);

CREATE INDEX idx_newsletter_email ON newsletter_subscribers(email);
CREATE INDEX idx_newsletter_list ON newsletter_subscribers(list_type);

-- =============================================================
-- 12. USERS (For future admin/student login)
-- =============================================================
CREATE TABLE users (
  id              UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
  email           TEXT        UNIQUE NOT NULL,
  password_hash   TEXT,
  name            TEXT        NOT NULL,
  role            TEXT        DEFAULT 'student' CHECK (role IN ('admin', 'instructor', 'student', 'corporate')),
  status          TEXT        DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  last_login      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- =============================================================
-- 13. ADMIN ACTIVITY LOG
-- =============================================================
CREATE TABLE admin_activity_log (
  id              UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id         UUID        REFERENCES users(id) ON DELETE CASCADE,
  action          TEXT        NOT NULL,
  entity_type     TEXT,
  entity_id       UUID,
  metadata        JSONB,
  ip_address      TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_admin_log_user_id ON admin_activity_log(user_id);
CREATE INDEX idx_admin_log_created_at ON admin_activity_log(created_at);

-- =============================================================
-- 14. PRICING TIERS (Location-based pricing)
-- =============================================================
CREATE TABLE pricing_tiers (
  id              UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
  country_code    TEXT        NOT NULL,
  country_name    TEXT        NOT NULL,
  currency        TEXT        NOT NULL,
  cohort_price    INTEGER     NOT NULL, -- in minor units (cents/kobo)
  pro_monthly     INTEGER     NOT NULL,
  pro_annual      INTEGER     NOT NULL,
  active          BOOLEAN     DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(country_code)
);

-- Insert default pricing
INSERT INTO pricing_tiers (country_code, country_name, currency, cohort_price, pro_monthly, pro_annual) VALUES
('NG', 'Nigeria', 'NGN', 15000000, 750000, 6000000),  -- ?150,000, ?7,500, ?60,000
('GH', 'Ghana', 'GHS', 180000, 9000, 72000),         -- GH?1,800, GH?90, GH?720
('KE', 'Kenya', 'KES', 3800000, 190000, 1520000),     -- KSh38,000, KSh1,900, KSh15,200
('ZA', 'South Africa', 'ZAR', 540000, 27000, 216000), -- R5,400, R270, R2,160
('US', 'United States', 'USD', 29900, 1500, 12000),   -- $299, $15, $120
('GB', 'United Kingdom', 'GBP', 23900, 1200, 9600),   -- £239, £12, £96
('CA', 'Canada', 'CAD', 39900, 2000, 16000),          -- CA$399, CA$20, CA$160
('AE', 'United Arab Emirates', 'AED', 109900, 5500, 44000), -- AED1,099, AED55, AED440
('DE', 'Germany', 'EUR', 27900, 1400, 11200),         -- €279, €14, €112
('NL', 'Netherlands', 'EUR', 27900, 1400, 11200),     -- €279, €14, €112
('DEFAULT', 'International', 'USD', 29900, 1500, 12000); -- Default fallback

-- =============================================================
-- TRIGGERS FOR AUTO-UPDATING
-- =============================================================

-- Update cohort seats on enrolment
CREATE OR REPLACE FUNCTION update_cohort_seats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE cohorts 
  SET seats_remaining = seats_remaining - 1
  WHERE id = NEW.cohort_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_seats_on_enrolment
AFTER INSERT ON enrolments
FOR EACH ROW
EXECUTE FUNCTION update_cohort_seats();

-- Update scholarship count
CREATE OR REPLACE FUNCTION update_scholarship_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'awarded' AND OLD.status != 'awarded' THEN
    UPDATE cohorts 
    SET scholarship_filled = scholarship_filled + 1
    WHERE id = (SELECT cohort_id FROM cohort_applications WHERE id = NEW.application_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_scholarship_count
AFTER UPDATE ON scholarship_applications
FOR EACH ROW
EXECUTE FUNCTION update_scholarship_count();

-- =============================================================
-- VIEWS FOR DASHBOARD
-- =============================================================

-- Active cohorts with availability
CREATE VIEW v_active_cohorts AS
SELECT 
  c.*,
  c.seats_total - c.seats_remaining AS seats_filled,
  c.scholarship_slots - c.scholarship_filled AS scholarship_remaining,
  COUNT(ca.id) AS total_applications,
  COUNT(CASE WHEN ca.status = 'pending' THEN 1 END) AS pending_applications
FROM cohorts c
LEFT JOIN cohort_applications ca ON c.id = ca.cohort_id
WHERE c.status IN ('open', 'in_progress')
GROUP BY c.id;

-- Revenue summary
CREATE VIEW v_revenue_summary AS
SELECT 
  DATE_TRUNC('month', created_at) AS month,
  product_type,
  currency,
  COUNT(*) AS transaction_count,
  SUM(amount_cents) AS total_amount_cents
FROM payments
WHERE status = 'succeeded'
GROUP BY month, product_type, currency
ORDER BY month DESC;

-- =============================================================
-- SEED DATA: Create first cohort
-- =============================================================
INSERT INTO cohorts (name, course, start_date, end_date, price_usd) VALUES
('Cohort 1 — Backend June 2024', 'backend', '2024-06-01', '2024-07-15', 29900),
('Cohort 1 — Frontend June 2024', 'frontend', '2024-06-01', '2024-07-15', 29900),
('Cohort 1 — Mobile June 2024', 'mobile', '2024-06-01', '2024-07-15', 29900);

-- =============================================================
-- COMPLETED
-- =============================================================
-- Run this script in Supabase SQL Editor
-- Then verify tables: SELECT * FROM information_schema.tables WHERE table_schema = 'public';
