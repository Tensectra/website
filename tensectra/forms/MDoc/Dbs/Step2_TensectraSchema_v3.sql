-- =============================================================
-- TENSECTRA — STEP 2: CORRECT SCHEMA (v3)
-- Run this AFTER Step1_DropAllTables.sql
-- Every column here has been verified against the actual HTML forms.
-- =============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================
-- TABLE 1: cohorts  (admin-managed, not a form)
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
  status              TEXT        NOT NULL DEFAULT 'open'
                        CHECK (status IN ('open', 'closed', 'in_progress', 'completed')),
  price_usd           INTEGER     NOT NULL,  -- in cents e.g. 29900 = $299
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_cohorts_status ON cohorts(status);
CREATE INDEX idx_cohorts_course  ON cohorts(course);

-- =============================================================
-- TABLE 2: cohort_applications
--
-- Form: forms/cohort-application.html
-- JS:   initForm('cohort-form', 'cohort_applications', '...')
--
-- Fields sent by form-handler.js (after processing):
--   submitted_at    ? added by JS
--   name            ? input[name="name"]
--   email           ? input[name="email"]
--   course          ? select[name="course"]  values: backend|frontend|mobile
--   role            ? input[name="role"]
--   experience      ? select[name="experience"] values: 0-1|1-3|3-5|5+
--   gap             ? textarea[name="gap"]
--   goals           ? textarea[name="goals"]
--   portfolio       ? input[name="portfolio"]
--   is_scholarship  ? converted from checkbox[name="scholarship" value="yes"]
--                     true if checked, false if unchecked
--   scholarship_reason ? textarea[name="scholarship_reason"]
--   country_code    ? hidden input
--   country_name    ? hidden input
--   city            ? hidden input
--   location_source ? hidden input  default: "auto_detected"
-- =============================================================
CREATE TABLE cohort_applications (
  id                  UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
  submitted_at        TIMESTAMPTZ,
  name                TEXT        NOT NULL,
  email               TEXT        NOT NULL,
  course              TEXT        CHECK (course IN ('backend', 'frontend', 'mobile')),
  role                TEXT,
  experience          TEXT        CHECK (experience IN ('0-1', '1-3', '3-5', '5+')),
  gap                 TEXT,
  goals               TEXT,
  portfolio           TEXT,
  is_scholarship      BOOLEAN     DEFAULT FALSE,
  scholarship_reason  TEXT,
  country_code        TEXT,
  country_name        TEXT,
  city                TEXT,
  location_source     TEXT,
  -- Admin-only fields (never sent by form, set by admin later)
  status              TEXT        DEFAULT 'pending'
                        CHECK (status IN ('pending', 'accepted', 'rejected', 'waitlisted')),
  cohort_id           UUID        REFERENCES cohorts(id) ON DELETE SET NULL,
  reviewed_at         TIMESTAMPTZ,
  reviewed_by         TEXT,
  notes               TEXT
);

CREATE INDEX idx_cohort_apps_email    ON cohort_applications(email);
CREATE INDEX idx_cohort_apps_status   ON cohort_applications(status);
CREATE INDEX idx_cohort_apps_course   ON cohort_applications(course);

ALTER TABLE cohort_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_insert_cohort_app"
  ON cohort_applications FOR INSERT TO anon WITH CHECK (true);

-- =============================================================
-- TABLE 3: consultancy_enquiries
--
-- Form: forms/consultancy-enquiry.html
-- JS:   initForm('consultancy-form', 'consultancy_enquiries', '...')
--
-- Fields sent by form-handler.js (after processing):
--   submitted_at  ? added by JS
--   tier          ? select[name="tier"]  values: 1|2|3|retainer|unsure
--                   JS sets default 'unsure' if empty
--   name          ? input[name="name"]
--   email         ? input[name="email"]
--   company       ? input[name="company"]
--   role          ? input[name="role"]       ? IS "role", NOT "job_title"
--   team_size     ? select[name="team_size"] values: 1-5|5-15|15-50|50+
--   stack         ? input[name="stack"]      ? IS "stack", IS sent to DB
--   challenges    ? textarea[name="challenges"] ? IS "challenges", NOT "message"
--   timeline      ? select[name="timeline"]  values: asap|1-3-months|3-6-months|flexible
--                   IS "timeline" TEXT, NOT "preferred_date" DATE
--   country_code  ? hidden input
--   country_name  ? hidden input
--   city          ? hidden input
--   location_source ? hidden input
-- =============================================================
CREATE TABLE consultancy_enquiries (
  id              UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
  submitted_at    TIMESTAMPTZ,
  tier            TEXT        DEFAULT 'unsure',  -- values: 1|2|3|retainer|unsure
  name            TEXT        NOT NULL,
  email           TEXT        NOT NULL,
  company         TEXT,
  role            TEXT,                          -- NOT job_title
  team_size       TEXT,                          -- values: 1-5|5-15|15-50|50+
  stack           TEXT,
  challenges      TEXT,                          -- NOT message
  timeline        TEXT,                          -- NOT preferred_date; values: asap|1-3-months|3-6-months|flexible
  country_code    TEXT,
  country_name    TEXT,
  city            TEXT,
  location_source TEXT,
  -- Admin-only fields
  status          TEXT        DEFAULT 'new'
                    CHECK (status IN ('new', 'contacted', 'proposal_sent', 'won', 'lost')),
  calendly_link_sent BOOLEAN  DEFAULT FALSE,
  notes           TEXT
);

CREATE INDEX idx_consultancy_email  ON consultancy_enquiries(email);
CREATE INDEX idx_consultancy_status ON consultancy_enquiries(status);

ALTER TABLE consultancy_enquiries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_insert_consultancy"
  ON consultancy_enquiries FOR INSERT TO anon WITH CHECK (true);

-- =============================================================
-- TABLE 4: waitlist_submissions
--
-- Form: forms/waitlist.html
-- JS:   initForm('waitlist-form', 'waitlist_submissions', '...')
--
-- Fields sent by form-handler.js (after processing):
--   submitted_at  ? added by JS
--   name          ? input[name="name"]
--   email         ? input[name="email"]
--   product       ? MAPPED from select[name="interest"] by FIELD_MAPPINGS in form-handler.js
--                   Values mapped: product-design?course_designer, ai-workflow?course_ai_biz,
--                                  erp-kit?kit_pro, new-courses?general
--   role          ? input[name="role"]  ? IS sent by form, MUST exist in DB
--   country_code  ? hidden input
--   country_name  ? hidden input
--   city          ? hidden input
--   location_source ? hidden input
-- =============================================================
CREATE TABLE waitlist_submissions (
  id              UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
  submitted_at    TIMESTAMPTZ,
  name            TEXT,
  email           TEXT        NOT NULL,
  product         TEXT        CHECK (product IN (
                    'course_designer', 'course_ai_biz', 'pro',
                    'kit_pro', 'kit_enterprise', 'general'
                  )),
  role            TEXT,                          -- form sends this, must be in DB
  country_code    TEXT,
  country_name    TEXT,
  city            TEXT,
  location_source TEXT
);

CREATE INDEX idx_waitlist_product ON waitlist_submissions(product);
CREATE INDEX idx_waitlist_email   ON waitlist_submissions(email);

ALTER TABLE waitlist_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_insert_waitlist"
  ON waitlist_submissions FOR INSERT TO anon WITH CHECK (true);

-- =============================================================
-- TABLE 5: contact_submissions
--
-- Forms: forms/contact.html  AND  pages/about.html
-- JS (contact.html):  initForm('contact-form',       'contact_submissions', '...')
-- JS (about.html):    initForm('contact-about-form', 'contact_submissions', '...')
--
-- Fields sent by contact.html:
--   submitted_at  ? added by JS
--   name          ? input[name="name"]
--   email         ? input[name="email"]
--   subject       ? select[name="subject"] values: general|courses|consultancy|partnership|other
--   message       ? textarea[name="message"]
--   country_code  ? hidden input
--   country_name  ? hidden input
--   city          ? hidden input
--   location_source ? hidden input
--
-- Fields sent by about.html (subset — no subject):
--   submitted_at, name, email, message, country_code, country_name, city, location_source
-- =============================================================
CREATE TABLE contact_submissions (
  id              UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
  submitted_at    TIMESTAMPTZ,
  name            TEXT        NOT NULL,
  email           TEXT        NOT NULL,
  subject         TEXT,
  message         TEXT,
  country_code    TEXT,
  country_name    TEXT,
  city            TEXT,
  location_source TEXT,
  -- Admin-only fields
  source          TEXT        DEFAULT 'contact',
  replied         BOOLEAN     DEFAULT FALSE,
  replied_at      TIMESTAMPTZ
);

CREATE INDEX idx_contact_email   ON contact_submissions(email);
CREATE INDEX idx_contact_replied ON contact_submissions(replied);

ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_insert_contact"
  ON contact_submissions FOR INSERT TO anon WITH CHECK (true);

-- =============================================================
-- TABLE 6: payments  (written by backend/webhooks, not forms)
-- =============================================================
CREATE TABLE payments (
  id                    UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
  paystack_reference    TEXT        UNIQUE,
  stripe_payment_id     TEXT        UNIQUE,
  payer_name            TEXT        NOT NULL,
  payer_email           TEXT        NOT NULL,
  product_type          TEXT        NOT NULL
                          CHECK (product_type IN (
                            'cohort', 'kit', 'pro_monthly', 'pro_annual',
                            'materials_only', 'consultancy'
                          )),
  product_ref           TEXT,
  amount_cents          INTEGER     NOT NULL,
  currency              TEXT        NOT NULL DEFAULT 'USD',
  payment_method        TEXT        DEFAULT 'stripe'
                          CHECK (payment_method IN ('stripe', 'paystack', 'manual')),
  status                TEXT        DEFAULT 'pending'
                          CHECK (status IN ('pending', 'succeeded', 'refunded', 'failed')),
  metadata              JSONB,
  created_at            TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_payments_email       ON payments(payer_email);
CREATE INDEX idx_payments_status      ON payments(status);
CREATE INDEX idx_payments_paystack    ON payments(paystack_reference);
CREATE INDEX idx_payments_stripe      ON payments(stripe_payment_id);

-- =============================================================
-- TABLE 7: enrolments  (created by backend after payment)
-- =============================================================
CREATE TABLE enrolments (
  id                  UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
  application_id      UUID        NOT NULL REFERENCES cohort_applications(id) ON DELETE CASCADE,
  cohort_id           UUID        NOT NULL REFERENCES cohorts(id) ON DELETE CASCADE,
  payment_id          UUID        REFERENCES payments(id) ON DELETE SET NULL,
  is_scholarship      BOOLEAN     DEFAULT FALSE,
  discord_invited     BOOLEAN     DEFAULT FALSE,
  materials_sent      BOOLEAN     DEFAULT FALSE,
  status              TEXT        DEFAULT 'active'
                        CHECK (status IN ('active', 'dropped', 'completed')),
  enrolled_at         TIMESTAMPTZ DEFAULT NOW(),
  completed_at        TIMESTAMPTZ
);

CREATE INDEX idx_enrolments_cohort_id      ON enrolments(cohort_id);
CREATE INDEX idx_enrolments_application_id ON enrolments(application_id);

-- =============================================================
-- TABLE 8: pro_members  (created by backend after subscription)
-- =============================================================
CREATE TABLE pro_members (
  id                    UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
  stripe_customer_id    TEXT        UNIQUE,
  paystack_customer_code TEXT       UNIQUE,
  stripe_sub_id         TEXT        UNIQUE,
  paystack_sub_code     TEXT        UNIQUE,
  name                  TEXT        NOT NULL,
  email                 TEXT        UNIQUE NOT NULL,
  plan                  TEXT        NOT NULL CHECK (plan IN ('monthly', 'annual')),
  status                TEXT        DEFAULT 'active'
                          CHECK (status IN ('active', 'cancelled', 'past_due', 'paused')),
  cohort_alumni         BOOLEAN     DEFAULT FALSE,
  discord_invited       BOOLEAN     DEFAULT FALSE,
  digest_subscribed     BOOLEAN     DEFAULT TRUE,
  started_at            TIMESTAMPTZ DEFAULT NOW(),
  renews_at             TIMESTAMPTZ,
  cancelled_at          TIMESTAMPTZ
);

CREATE INDEX idx_pro_members_email  ON pro_members(email);
CREATE INDEX idx_pro_members_status ON pro_members(status);

-- =============================================================
-- TABLE 9: newsletter_subscribers
-- =============================================================
CREATE TABLE newsletter_subscribers (
  id              UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
  email           TEXT        NOT NULL UNIQUE,
  name            TEXT,
  list_type       TEXT        DEFAULT 'general'
                    CHECK (list_type IN ('general', 'pro_members', 'alumni', 'kit_owners', 'waitlist')),
  source          TEXT,
  mailchimp_id    TEXT,
  subscribed      BOOLEAN     DEFAULT TRUE,
  subscribed_at   TIMESTAMPTZ DEFAULT NOW(),
  unsubscribed_at TIMESTAMPTZ
);

-- =============================================================
-- TABLE 10: kit_purchase_requests  (created by backend after payment)
-- =============================================================
CREATE TABLE kit_purchase_requests (
  id                  UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
  name                TEXT        NOT NULL,
  email               TEXT        NOT NULL,
  payment_id          UUID        REFERENCES payments(id) ON DELETE SET NULL,
  kit_tier            TEXT        DEFAULT 'starter'
                        CHECK (kit_tier IN ('starter', 'pro', 'enterprise')),
  status              TEXT        DEFAULT 'pending'
                        CHECK (status IN ('pending', 'paid', 'delivered', 'refunded')),
  delivery_sent_at    TIMESTAMPTZ,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_kit_purchases_email  ON kit_purchase_requests(email);
CREATE INDEX idx_kit_purchases_status ON kit_purchase_requests(status);

ALTER TABLE kit_purchase_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_insert_kit_purchase"
  ON kit_purchase_requests FOR INSERT TO anon WITH CHECK (true);

-- =============================================================
-- TRIGGER: auto-decrement seats when enrolment is created
-- =============================================================
CREATE OR REPLACE FUNCTION fn_decrement_cohort_seats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE cohorts
  SET seats_remaining = GREATEST(seats_remaining - 1, 0)
  WHERE id = NEW.cohort_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_decrement_seats
AFTER INSERT ON enrolments
FOR EACH ROW
EXECUTE FUNCTION fn_decrement_cohort_seats();

-- =============================================================
-- VIEW: active cohorts with seat counts (used by scholarship tracker JS)
-- =============================================================
CREATE VIEW v_active_cohorts AS
SELECT
  c.id,
  c.name,
  c.course,
  c.start_date,
  c.end_date,
  c.seats_total,
  c.seats_remaining,
  c.scholarship_slots,
  c.scholarship_filled,
  c.status,
  c.price_usd,
  (c.seats_total - c.seats_remaining)                AS seats_filled,
  (c.scholarship_slots - c.scholarship_filled)       AS scholarship_remaining,
  COUNT(ca.id)                                        AS total_applications,
  COUNT(ca.id) FILTER (WHERE ca.status = 'pending')   AS pending_applications
FROM cohorts c
LEFT JOIN cohort_applications ca ON ca.cohort_id = c.id
WHERE c.status IN ('open', 'in_progress')
GROUP BY c.id;

-- =============================================================
-- SEED DATA: Open cohorts (update dates before going live)
-- =============================================================
INSERT INTO cohorts (name, course, start_date, end_date, seats_total, seats_remaining, scholarship_slots, price_usd) VALUES
('Cohort 1 — Backend',  'backend',  '2025-09-01', '2025-10-15', 15, 15, 5, 29900),
('Cohort 1 — Frontend', 'frontend', '2025-09-01', '2025-10-15', 15, 15, 5, 29900),
('Cohort 1 — Mobile',   'mobile',   '2025-09-01', '2025-10-15', 15, 15, 5, 29900);

-- =============================================================
-- VERIFY: show all tables created
-- =============================================================
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Expected:
-- cohort_applications
-- cohorts
-- consultancy_enquiries
-- contact_submissions
-- enrolments
-- kit_purchase_requests
-- newsletter_subscribers
-- payments
-- pro_members
-- waitlist_submissions
