-- Waitlist Submissions Table
-- Run this in Supabase SQL Editor if table doesn't exist or needs recreation

-- Drop existing (if recreating)
DROP TABLE IF EXISTS waitlist_submissions CASCADE;

-- Create table
CREATE TABLE waitlist_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  city_text TEXT,
  country_code TEXT,
  country_name TEXT,
  city TEXT,
  location_source TEXT,
  product TEXT,
  has_built_api TEXT,
  skill_level TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_waitlist_email ON waitlist_submissions(email);
CREATE INDEX idx_waitlist_submitted ON waitlist_submissions(submitted_at DESC);

-- Enable RLS
ALTER TABLE waitlist_submissions ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can insert (public form submissions)
CREATE POLICY "Anyone can insert waitlist" 
  ON waitlist_submissions 
  FOR INSERT 
  WITH CHECK (true);

-- Policy: Admins can view all
CREATE POLICY "Admins can view waitlist" 
  ON waitlist_submissions 
  FOR SELECT 
  USING (
    auth.jwt() IS NOT NULL AND 
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE email = auth.jwt()->>'email' 
      AND active = true
    )
  );

-- Grant permissions
GRANT SELECT, INSERT ON waitlist_submissions TO authenticated;
GRANT INSERT ON waitlist_submissions TO anon;

-- Verify creation
SELECT 
  'Waitlist table created!' as message,
  COUNT(*) as existing_records
FROM waitlist_submissions;
