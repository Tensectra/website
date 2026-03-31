# URGENT FIX: Form Submission Errors

## Problem
Getting "Something went wrong" error when submitting forms.

## Root Cause
Database columns don't match what the updated `form-handler.js` is sending.

---

## ? STEP-BY-STEP FIX (5 minutes)

### Step 1: Check Current State (1 min)

In Supabase SQL Editor, run:
```sql
SELECT column_name FROM information_schema.columns WHERE table_name = 'cohort_applications';
```

**Expected to see:** `scholarship` (text column)
**Need:** `is_scholarship` (boolean column)

---

### Step 2: Run Diagnostic (1 min)

Run this file in Supabase SQL Editor:
```
forms/MDoc/Dbs/Diagnostic_CheckColumns.sql
```

This will show you exactly what columns exist vs what you need.

---

### Step 3: Run the Fix (2 mins)

Run this file in Supabase SQL Editor:
```
forms/MDoc/Dbs/QuickFix_FormSubmissions.sql
```

This will:
- ? Convert `scholarship` (text) ? `is_scholarship` (boolean) in cohort_applications
- ? Rename `interest` ? `product` in waitlist_submissions
- ? Make `tier` nullable with default in consultancy_enquiries
- ? Leave contact_submissions as-is (already correct)

---

### Step 4: Verify Fix (1 min)

Run diagnostic again:
```sql
forms/MDoc/Dbs/Diagnostic_CheckColumns.sql
```

**Should now show:**
- cohort_applications: `is_scholarship` (boolean) ?
- waitlist_submissions: `product` (text) ?
- consultancy_enquiries: all correct ?

---

### Step 5: Test Forms

1. **Test Cohort Application:**
   - Go to `/forms/cohort-application`
   - Fill out form
   - Check "Apply for Scholarship"
   - Submit
   - **Expected:** Success message ?

2. **Test Consultancy Enquiry:**
   - Go to `/forms/consultancy-enquiry`
   - Fill out form
   - Submit
   - **Expected:** Success message ?

3. **Test Waitlist:**
   - Go to `/forms/waitlist`
   - Fill out form
   - Select "Product Design Course"
   - Submit
   - **Expected:** Success message ?

4. **Test Contact:**
   - Go to `/forms/contact`
   - Fill out form
   - Submit
   - **Expected:** Success message ?

---

## Alternative: If Still Getting Errors

### Check Browser Console

1. Open form page
2. Press F12 ? Console tab
3. Try to submit form
4. Look for error message
5. Copy the exact error here

**Common errors:**

**Error: "column 'scholarship' does not exist"**
? You didn't run QuickFix_FormSubmissions.sql yet

**Error: "column 'is_scholarship' does not exist"**
? QuickFix_FormSubmissions.sql failed. Check Supabase logs.

**Error: "HTTP 400" or "HTTP 401"**
? Check your Supabase credentials in `js/supabase-config.js`

**Error: "Network request failed"**
? Check internet connection, check Supabase URL is correct

---

## Verify Supabase Credentials

Check file: `js/supabase-config.js`

Should have:
```javascript
window.SUPABASE_URL = 'https://ahcfozfntvqbfgbinxwr.supabase.co';
window.SUPABASE_ANON_KEY = 'sb_publishable_9t2QGBpQl4yd4H73dkSdlg_9QVNarpS';
```

If different, update from:
- Supabase Dashboard ? Project Settings ? API

---

## Check RLS Policies

In Supabase:
1. Go to Authentication ? Policies
2. For each table, should have policy:
   - Name: "anon_insert"
   - Operation: INSERT
   - Target: anon
   - Check: true

If missing, run:
```sql
ALTER TABLE cohort_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_insert" ON cohort_applications FOR INSERT TO anon WITH CHECK (true);

ALTER TABLE consultancy_enquiries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_insert" ON consultancy_enquiries FOR INSERT TO anon WITH CHECK (true);

ALTER TABLE waitlist_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_insert" ON waitlist_submissions FOR INSERT TO anon WITH CHECK (true);

ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_insert" ON contact_submissions FOR INSERT TO anon WITH CHECK (true);
```

---

## Still Not Working?

### Enable Detailed Error Logging

Update `js/form-handler.js` temporarily for debugging:

Find this line:
```javascript
} catch (err) {
  console.error('[form-handler]', err);
```

Change to:
```javascript
} catch (err) {
  console.error('[form-handler] Full Error:', err);
  console.error('[form-handler] Payload was:', payload);
  console.error('[form-handler] Table was:', table);
```

Then submit form and check console for detailed error.

---

## Quick Test Without Browser

You can test insert directly in Supabase SQL Editor:

```sql
-- Test cohort insert
INSERT INTO cohort_applications (
  name, 
  email, 
  course, 
  is_scholarship
) VALUES (
  'Test User',
  'test@example.com',
  'backend',
  true
);

-- If this works, your table is correct!
-- If this fails, check the error message
```

---

## Summary

**Files to run in order:**
1. ? `Diagnostic_CheckColumns.sql` (see current state)
2. ? `QuickFix_FormSubmissions.sql` (fix mismatches)
3. ? `Diagnostic_CheckColumns.sql` again (verify fix)
4. ? Test forms in browser

**Time:** 5 minutes total

**Expected result:** All forms working ?

---

## After Fix Complete

Once working, verify data is inserting:

```sql
-- Check recent submissions
SELECT * FROM cohort_applications ORDER BY submitted_at DESC LIMIT 5;
SELECT * FROM consultancy_enquiries ORDER BY submitted_at DESC LIMIT 5;
SELECT * FROM waitlist_submissions ORDER BY submitted_at DESC LIMIT 5;
SELECT * FROM contact_submissions ORDER BY submitted_at DESC LIMIT 5;
```

Should see your test submissions! ?

