-- =============================================================
-- DIAGNOSTIC: Check What's Wrong
-- Run this to see exactly what columns you have
-- =============================================================

-- Check cohort_applications
SELECT 
  'cohort_applications' as table_name,
  column_name, 
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'cohort_applications' 
AND column_name IN ('scholarship', 'is_scholarship')
ORDER BY ordinal_position;

-- Check consultancy_enquiries
SELECT 
  'consultancy_enquiries' as table_name,
  column_name, 
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'consultancy_enquiries' 
AND column_name IN ('role', 'job_title', 'challenges', 'message', 'timeline', 'preferred_date', 'stack', 'tier')
ORDER BY ordinal_position;

-- Check waitlist_submissions  
SELECT 
  'waitlist_submissions' as table_name,
  column_name, 
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'waitlist_submissions' 
AND column_name IN ('interest', 'product', 'role')
ORDER BY ordinal_position;

-- Check contact_submissions
SELECT 
  'contact_submissions' as table_name,
  column_name, 
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'contact_submissions' 
AND column_name IN ('name', 'email', 'subject', 'message')
ORDER BY ordinal_position;

-- =============================================================
-- EXPECTED RESULTS BASED ON YOUR CURRENT SUPABASESETUP.SQL:
-- =============================================================
/*
cohort_applications should show:
- scholarship | text | (you have this NOW)

After running QuickFix_FormSubmissions.sql it should show:
- is_scholarship | boolean | ?

---

consultancy_enquiries should show:
- role | text | ?
- challenges | text | ?
- timeline | text | ?
- stack | text | ?
- tier | text | (might show NOT NULL)

After running QuickFix it should show:
- tier with DEFAULT and nullable ?

---

waitlist_submissions should show:
- interest | text | (you have this NOW)
- role | text | ?

After running QuickFix it should show:
- product | text | ? (renamed from interest)
- role | text | ?

---

contact_submissions:
- Should be fine as-is ?
*/
