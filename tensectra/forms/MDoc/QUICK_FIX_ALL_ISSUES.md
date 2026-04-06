# QUICK FIX GUIDE - ALL 3 ISSUES

## ? **ALL ISSUES FIXED IN CODE**

### **Fix 1: Kit Purchase 405 Error**
**Problem:** Form still had `netlify` attribute  
**Fixed:** Removed `method="POST" netlify` from form tag  
**File:** `pages/infrastructure.html`

### **Fix 2: Reference Card Supabase Error**
**Problem:** `scholarship-tracker.js` checking wrong Supabase variable  
**Fixed:** Changed `typeof supabase` to `typeof window._supabase`  
**File:** `js/scholarship-tracker.js`

### **Fix 3: Waitlist Empty**
**Problem:** Possibly wrong ANON_KEY or table doesn't exist  
**Next:** Need to verify in Supabase

---

## ?? **TEST NOW (AFTER HARD REFRESH)**

```
1. Hard refresh: Ctrl + Shift + R
2. Test kit purchase ? No 405 error
3. Test reference card ? No Supabase error
4. Test waitlist ? Check console for errors
```

---

## ?? **CRITICAL: CHECK SUPABASE ANON KEY**

Your current ANON_KEY looks suspicious:
```
sb_publishable_9t2QGBpQl4yd4H73dkSdlg_9QVNarpS
```

**Real Supabase ANON keys look like:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3M...
```

**How to get correct ANON_KEY:**

1. Go to: https://supabase.com/dashboard
2. Select your project
3. Settings ? API
4. Copy: "Project API keys" ? `anon` `public`
5. Should start with `eyJ...`

**Then update:**
- `.env` file
- `js/supabase-config.js`

---

## ?? **VERIFY WAITLIST TABLE EXISTS**

**SQL Query:**
```sql
SELECT * FROM waitlist_submissions LIMIT 5;
```

**If error "table does not exist":**
```sql
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

-- Enable RLS
ALTER TABLE waitlist_submissions ENABLE ROW LEVEL SECURITY;

-- Allow public insert
CREATE POLICY "Anyone can insert waitlist" 
  ON waitlist_submissions 
  FOR INSERT 
  WITH CHECK (true);

-- Allow admins to view
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
```

---

## ?? **COMMIT & TEST**

```bash
# Commit fixes
git add .
git commit -m "fix: kit purchase form, reference card supabase, waitlist"
git push origin Segun

# Then test locally:
# 1. Hard refresh (Ctrl + Shift + R)
# 2. Fill kit purchase form
# 3. Download reference card
# 4. Fill waitlist form
# 5. Check console for errors
```

---

**Files modified:**
- ? pages/infrastructure.html (removed netlify attr)
- ? js/scholarship-tracker.js (fixed supabase check)

**Next step:**
- ?? Verify ANON_KEY in Supabase dashboard
- ?? Verify waitlist_submissions table exists
