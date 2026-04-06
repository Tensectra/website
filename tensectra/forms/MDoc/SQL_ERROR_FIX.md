# SQL ERROR FIX - Step4_CRM_Tracking.sql

## ERROR MESSAGE
```
ERROR: 42703: column "submitted_at" does not exist
```

## CAUSE
The table `kit_purchase_requests` or `reference_card_downloads` already exists in your database with a different schema (old version without the `submitted_at` column).

## SOLUTION

### ? **FIXED FILE**
Updated: `forms/MDoc/Dbs/Step4_CRM_Tracking.sql`

**Changes Made:**
1. Added `DROP TABLE IF EXISTS` statements at the beginning
2. Added `DROP POLICY IF EXISTS` for all policies
3. Removed `IF NOT EXISTS` from `CREATE TABLE` (clean recreate)
4. Added UPDATE policy for admins
5. Added row counts in success message

---

## HOW TO RUN (UPDATED)

### Step 1: Open Supabase SQL Editor
```
1. Login to: https://supabase.com/dashboard
2. Select your project
3. Go to: SQL Editor (left sidebar)
```

### Step 2: Copy Updated SQL
```
1. Open: forms/MDoc/Dbs/Step4_CRM_Tracking.sql
2. Copy entire contents (Ctrl+A, Ctrl+C)
```

### Step 3: Paste and Run
```
1. Paste into SQL Editor
2. Click "Run" button (or Ctrl+Enter)
3. Wait for execution
```

### Step 4: Verify Success
**Expected Output:**
```
message: "CRM tracking tables created successfully!"
kit_requests_count: 0
refcard_downloads_count: 0
```

---

## WHAT THE UPDATED SQL DOES

### 1. Clean Slate (Drops Old Tables)
```sql
DROP POLICY IF EXISTS "Anyone can submit kit request" ON kit_purchase_requests;
DROP POLICY IF EXISTS "Admins can view kit requests" ON kit_purchase_requests;
-- ... (all policies)

DROP TABLE IF EXISTS kit_purchase_requests CASCADE;
DROP TABLE IF EXISTS reference_card_downloads CASCADE;
```

### 2. Create Fresh Tables
```sql
CREATE TABLE kit_purchase_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  -- ... all fields including submitted_at
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  -- ...
);
```

### 3. Add Indexes
```sql
CREATE INDEX idx_kit_requests_submitted ON kit_purchase_requests(submitted_at DESC);
-- ... (all indexes)
```

### 4. Enable RLS + Policies
```sql
ALTER TABLE kit_purchase_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit kit request" 
  ON kit_purchase_requests
  FOR INSERT 
  WITH CHECK (true);
-- ... (all policies)
```

---

## VERIFICATION STEPS

### Check Tables Created:
```sql
-- Run in Supabase SQL Editor
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('kit_purchase_requests', 'reference_card_downloads');
```

**Expected:** 2 rows returned

---

### Check Table Schema:
```sql
-- Verify kit_purchase_requests columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'kit_purchase_requests'
ORDER BY ordinal_position;
```

**Expected Columns:**
- id (uuid)
- name (text)
- email (text)
- company (text)
- phone (text)
- message (text)
- ip_address (text)
- country (text)
- city (text)
- status (text)
- submitted_at (timestamp with time zone)
- contacted_at (timestamp with time zone)
- contacted_by (text)
- notes (text)

---

### Check Policies Created:
```sql
-- Verify RLS policies
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE tablename IN ('kit_purchase_requests', 'reference_card_downloads');
```

**Expected:** 6 policies total
- Anyone can submit kit request
- Admins can view kit requests
- Admins can update kit requests
- Anyone can submit refcard download
- Admins can view refcard downloads
- Admins can update refcard downloads

---

## TROUBLESHOOTING

### Error: "permission denied for table admin_users"
**Cause:** Policy tries to check admin_users table but can't access it

**Fix:**
```sql
-- Run this first if admin_users doesn't exist:
-- See forms/MDoc/Dbs/Step3_AdminSchema.sql
```

---

### Error: "relation "kit_purchase_requests" already exists"
**Cause:** Old DROP TABLE didn't work (maybe running from wrong account)

**Fix:**
```sql
-- Manually drop tables first:
DROP TABLE IF EXISTS kit_purchase_requests CASCADE;
DROP TABLE IF EXISTS reference_card_downloads CASCADE;

-- Then run full Step4_CRM_Tracking.sql again
```

---

### Error: "function auth.jwt() does not exist"
**Cause:** Not using Supabase PostgreSQL (using standard PostgreSQL)

**Fix:** You MUST run this on Supabase, not local PostgreSQL

---

## POST-INSTALLATION TEST

### Test 1: Public Insert (Anon User)
```sql
-- This should work (anyone can insert)
INSERT INTO kit_purchase_requests (name, email, country, city)
VALUES ('Test User', 'test@example.com', 'Nigeria', 'Lagos');

-- Check it was inserted
SELECT * FROM kit_purchase_requests WHERE email = 'test@example.com';
```

**Expected:** 1 row returned

---

### Test 2: Admin Select (Authenticated Admin)
```
1. Login to: https://tensectra.com/admin/leads
2. Should see: 1 record (test user)
3. Filter by: "Kit Requests"
4. Verify: Shows Test User row
```

**Expected:** Table displays correctly

---

### Test 3: Frontend Form Submission
```
1. Go to: https://tensectra.com/pages/infrastructure
2. Click: "Get the Scaffold" button
3. Fill: Name + Email
4. Submit
5. Check Supabase: kit_purchase_requests table
6. Should see: New row
```

**Expected:** Form submission saves to database

---

## CLEANUP (Remove Test Data)

After verifying everything works:

```sql
-- Delete test records
DELETE FROM kit_purchase_requests WHERE email = 'test@example.com';
DELETE FROM reference_card_downloads WHERE email = 'test@example.com';

-- Verify cleanup
SELECT COUNT(*) FROM kit_purchase_requests;
SELECT COUNT(*) FROM reference_card_downloads;
```

**Expected:** Both return 0

---

## FILES AFFECTED

```
? forms/MDoc/Dbs/Step4_CRM_Tracking.sql (UPDATED)
? forms/MDoc/CRM_TRACKING_COMPLETE.md (updated file path)
? forms/MDoc/CRM_DEPLOYMENT_GUIDE.md (updated file path)
? forms/MDoc/SQL_ERROR_FIX.md (NEW - this file)
```

---

## SUCCESS CRITERIA

After running the updated SQL, you should have:

```
? 2 new tables created
? 6 RLS policies active
? 6 indexes created
? Public can INSERT (anon role)
? Admins can SELECT + UPDATE (authenticated role)
? No errors in SQL Editor
? Frontend forms can save data
? Admin panel can view data
```

---

## NEXT STEPS

1. ? Run updated SQL in Supabase
2. ? Verify tables created
3. ? Test frontend form submissions
4. ? Check admin panel displays data
5. ? Deploy frontend code
6. ? Monitor for new leads

---

**SQL FILE FIXED! Run it now in Supabase SQL Editor.** ??
