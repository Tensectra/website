-- CRM Tracking Tables for Tensectra
-- Run this in Supabase SQL Editor
-- Location: forms/MDoc/Dbs/Step4_CRM_Tracking.sql

-- Drop existing tables and policies (if they exist)
DROP POLICY IF EXISTS "Anyone can submit kit request" ON kit_purchase_requests;
DROP POLICY IF EXISTS "Admins can view kit requests" ON kit_purchase_requests;
DROP POLICY IF EXISTS "Admins can update kit requests" ON kit_purchase_requests;
DROP POLICY IF EXISTS "Anyone can submit refcard download" ON reference_card_downloads;
DROP POLICY IF EXISTS "Admins can view refcard downloads" ON reference_card_downloads;
DROP POLICY IF EXISTS "Admins can update refcard downloads" ON reference_card_downloads;

DROP TABLE IF EXISTS kit_purchase_requests CASCADE;
DROP TABLE IF EXISTS reference_card_downloads CASCADE;

-- Table 1: Kit Purchase Requests
CREATE TABLE kit_purchase_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  phone TEXT,
  message TEXT,
  ip_address TEXT,
  country TEXT,
  city TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'quote_sent', 'converted', 'lost')),
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  contacted_at TIMESTAMPTZ,
  contacted_by TEXT,
  notes TEXT
);

-- Table 2: Reference Card Downloads
CREATE TABLE reference_card_downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  role TEXT,
  ip_address TEXT,
  country TEXT,
  city TEXT,
  status TEXT DEFAULT 'downloaded' CHECK (status IN ('downloaded', 'followed_up', 'engaged', 'unresponsive')),
  downloaded_at TIMESTAMPTZ DEFAULT NOW(),
  followed_up_at TIMESTAMPTZ,
  followed_up_by TEXT,
  notes TEXT
);

-- Indexes for performance
CREATE INDEX idx_kit_requests_email ON kit_purchase_requests(email);
CREATE INDEX idx_kit_requests_status ON kit_purchase_requests(status);
CREATE INDEX idx_kit_requests_submitted ON kit_purchase_requests(submitted_at DESC);

CREATE INDEX idx_refcard_email ON reference_card_downloads(email);
CREATE INDEX idx_refcard_status ON reference_card_downloads(status);
CREATE INDEX idx_refcard_downloaded ON reference_card_downloads(downloaded_at DESC);

-- Enable RLS (Row Level Security)
ALTER TABLE kit_purchase_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE reference_card_downloads ENABLE ROW LEVEL SECURITY;

-- Policies: Public can insert, admins can view and update
CREATE POLICY "Anyone can submit kit request" 
  ON kit_purchase_requests
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Admins can view kit requests" 
  ON kit_purchase_requests
  FOR SELECT 
  USING (
    auth.jwt() IS NOT NULL AND 
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE email = auth.jwt()->>'email' 
      AND active = true
    )
  );

CREATE POLICY "Admins can update kit requests" 
  ON kit_purchase_requests
  FOR UPDATE 
  USING (
    auth.jwt() IS NOT NULL AND 
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE email = auth.jwt()->>'email' 
      AND active = true
    )
  );

CREATE POLICY "Anyone can submit refcard download" 
  ON reference_card_downloads
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Admins can view refcard downloads" 
  ON reference_card_downloads
  FOR SELECT 
  USING (
    auth.jwt() IS NOT NULL AND 
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE email = auth.jwt()->>'email' 
      AND active = true
    )
  );

CREATE POLICY "Admins can update refcard downloads" 
  ON reference_card_downloads
  FOR UPDATE 
  USING (
    auth.jwt() IS NOT NULL AND 
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE email = auth.jwt()->>'email' 
      AND active = true
    )
  );

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON kit_purchase_requests TO authenticated;
GRANT SELECT, INSERT, UPDATE ON reference_card_downloads TO authenticated;
GRANT SELECT, INSERT ON kit_purchase_requests TO anon;
GRANT SELECT, INSERT ON reference_card_downloads TO anon;

-- Success message
SELECT 
  'CRM tracking tables created successfully!' as message,
  (SELECT COUNT(*) FROM kit_purchase_requests) as kit_requests_count,
  (SELECT COUNT(*) FROM reference_card_downloads) as refcard_downloads_count;

