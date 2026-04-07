-- Course Notification Requests Table
-- For the "Notify Me" form on courses page

DROP TABLE IF EXISTS course_notifications CASCADE;

CREATE TABLE course_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  country_code TEXT,
  country_name TEXT,
  city TEXT,
  location_source TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_course_notify_email ON course_notifications(email);
CREATE INDEX idx_course_notify_submitted ON course_notifications(submitted_at DESC);

ALTER TABLE course_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert course notification" 
  ON course_notifications 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Admins can view course notifications" 
  ON course_notifications 
  FOR SELECT 
  USING (
    auth.jwt() IS NOT NULL AND 
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE email = auth.jwt()->>'email' 
      AND active = true
    )
  );

GRANT SELECT, INSERT ON course_notifications TO authenticated;
GRANT INSERT ON course_notifications TO anon;

SELECT 'Course notifications table created!' as message;
