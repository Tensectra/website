# FIX: REFERENCE CARD & KIT PURCHASE NOT SAVING

## ? **THE PROBLEM:**
1. Reference Card form - not saving to database
2. Kit Purchase form - not saving to database

## ? **THE FIX:**

### **1. Added supabase-config.js to infrastructure.html**
- File: `pages/infrastructure.html`
- Issue: Was loading Supabase CDN but not config with ANON_KEY
- Fixed: Removed CDN, added `supabase-config.js` 

### **2. Created Test Page**
- File: `test-forms.html`
- Use this to test each form individually
- Shows exactly what error is happening

---

## ?? **TEST NOW:**

### **Step 1: Open Test Page**
```
http://localhost:49350/test-forms.html
```

### **Step 2: Click "Check Supabase Config"**
Should show:
```
URL: https://ahcfozfntvqbfgbinxwr.supabase.co
ANON_KEY: eyJhbGciOiJIUzI1NiIsInR5...
Config loaded: YES
```

### **Step 3: Test Reference Card**
```
1. Fill: Name + Email
2. Click "Test Reference Card"
3. Should show: SUCCESS! Data saved to reference_card_downloads
4. Check Supabase: reference_card_downloads table
```

### **Step 4: Test Kit Purchase**
```
1. Fill: Name + Email
2. Click "Test Kit Purchase"
3. Should show: SUCCESS! Data saved to kit_purchase_requests
4. Check Supabase: kit_purchase_requests table
```

---

## ??? **IF TABLES DON'T EXIST - RUN THESE SQL:**

### **In Supabase SQL Editor:**

```sql
-- 1. Create reference_card_downloads table
DROP TABLE IF EXISTS reference_card_downloads CASCADE;

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

CREATE INDEX idx_refcard_email ON reference_card_downloads(email);
CREATE INDEX idx_refcard_downloaded ON reference_card_downloads(downloaded_at DESC);

ALTER TABLE reference_card_downloads ENABLE ROW LEVEL SECURITY;

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

GRANT SELECT, INSERT ON reference_card_downloads TO authenticated;
GRANT INSERT ON reference_card_downloads TO anon;

-- 2. Create kit_purchase_requests table
DROP TABLE IF EXISTS kit_purchase_requests CASCADE;

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

CREATE INDEX idx_kit_requests_email ON kit_purchase_requests(email);
CREATE INDEX idx_kit_requests_submitted ON kit_purchase_requests(submitted_at DESC);

ALTER TABLE kit_purchase_requests ENABLE ROW LEVEL SECURITY;

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

GRANT SELECT, INSERT ON kit_purchase_requests TO authenticated;
GRANT INSERT ON kit_purchase_requests TO anon;

SELECT 'Tables created successfully!' as message;
```

---

## ?? **THEN TEST ACTUAL FORMS:**

### **1. Reference Card (Homepage)**
```
1. Go to: http://localhost:49350/
2. Click: "Free Reference Card" button (floating, bottom-right)
3. Fill: Name + Email
4. Submit
5. Check console: [RefCard] Saved to CRM
6. Check Supabase: reference_card_downloads table
```

### **2. Kit Purchase (Infrastructure Page)**
```
1. Go to: http://localhost:49350/pages/infrastructure
2. Click: "Get the Scaffold" button
3. Fill: Name + Email
4. Submit
5. Check console: [Kit Purchase] Saved to CRM
6. Check Supabase: kit_purchase_requests table
```

---

## ?? **IF STILL NOT WORKING:**

### **Check Browser Console (F12):**

**Look for these errors:**

1. **"window.SUPABASE_URL is undefined"**
   - Fix: Hard refresh (Ctrl + Shift + R)
   - supabase-config.js not loaded

2. **"No API key found in request"**
   - Fix: Check window.SUPABASE_ANON_KEY exists
   - Run: `console.log(window.SUPABASE_ANON_KEY)` in browser

3. **"Could not find the 'X' column"**
   - Fix: Table schema missing columns
   - Run SQL above to recreate tables

4. **"HTTP 404"**
   - Fix: Table doesn't exist
   - Run SQL above

---

## ?? **FILES MODIFIED:**

```
? pages/infrastructure.html (added supabase-config.js)
? test-forms.html (NEW - test page)
```

---

## ? **SUCCESS CHECKLIST:**

```
[ ] test-forms.html shows "Config loaded: YES"
[ ] Test Reference Card button shows "SUCCESS!"
[ ] Test Kit Purchase button shows "SUCCESS!"
[ ] SQL tables created in Supabase
[ ] Homepage reference card form saves to DB
[ ] Infrastructure kit form saves to DB
[ ] No console errors
[ ] Admin panel shows the data
```

---

**Test with test-forms.html first to see exact error, then fix!** ??
