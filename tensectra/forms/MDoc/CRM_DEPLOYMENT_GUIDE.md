# DEPLOYMENT CHECKLIST - CRM TRACKING

## PRE-DEPLOYMENT

### 1. Run Pre-Commit Checks
```powershell
# Check for encoding errors
Select-String -Path "*.html","*.js" -Pattern "?|…|—" -Recursive
# Should return: NOTHING

# Check for duplicate exports
Select-String -Path "api/*.js" -Pattern "export default"
# Should return: ONE match per file

# Check for syntax errors
# Open each page in browser (F12 Console)
# Should show: NO red errors
```

---

## DEPLOYMENT STEPS

### Step 1: Database Setup (Supabase)

```sql
1. Login to Supabase Dashboard
2. Go to: SQL Editor
3. Copy/Paste: forms/MDoc/Dbs/Step4_CRM_Tracking.sql
4. Click "Run"
5. Verify output: "CRM tracking tables created successfully!"

6. Verify tables exist:
   - kit_purchase_requests (0 rows initially)
   - reference_card_downloads (0 rows initially)
```

**CRITICAL:** Do this BEFORE deploying frontend code!

---

### Step 2: Git Commit & Push

```bash
cd C:\Websites\t2\tensectra

# Stage all changes
git add .

# Commit with descriptive message
git commit -m "feat: CRM tracking for product leads (kit + refcard)"

# Push to main branch
git push origin main
```

---

### Step 3: Wait for Vercel Deployment

```
1. Go to: https://vercel.com/dashboard
2. Find: tensectra project
3. Check: Deployments tab
4. Wait for: Green checkmark (Ready)
5. Time: ~1-2 minutes
```

---

### Step 4: Verification Tests

#### Test 1: Reference Card Download

```
1. Open: https://tensectra.com/
2. Find: "Free Reference Card" button (bottom-right, floating)
3. Click button
4. Fill form:
   - Name: Test User
   - Email: test@example.com
5. Click "Download Free Reference Card"
6. Verify: File downloads
7. Check Supabase:
   - Go to: Table Editor > reference_card_downloads
   - Should see: 1 new row
   - name: "Test User"
   - email: "test@example.com"
   - status: "downloaded"
   - downloaded_at: current timestamp
```

#### Test 2: Kit Purchase Request

```
1. Open: https://tensectra.com/pages/infrastructure
2. Click: "Get the Scaffold" button (hero section)
3. Fill form:
   - Name: Test Buyer
   - Email: buyer@company.com
4. Click "Send Purchase Request"
5. Verify: Success message shows
6. Check Supabase:
   - Go to: Table Editor > kit_purchase_requests
   - Should see: 1 new row
   - name: "Test Buyer"
   - email: "buyer@company.com"
   - status: "new"
   - submitted_at: current timestamp
```

#### Test 3: Admin Panel View

```
1. Open: https://tensectra.com/admin/
2. Login with admin account
3. Click: "Leads" in sidebar
4. Verify:
   - Shows 2 leads (test + kit)
   - Filter buttons work
   - Search works
   - "View" button shows details
5. Check Dashboard:
   - Go to: Dashboard
   - Verify: "Product Leads" card shows "2"
   - Detail shows: "1 kit / 1 cards"
```

---

## POST-DEPLOYMENT CLEANUP

### Remove Test Data

```sql
-- Delete test records from Supabase
DELETE FROM reference_card_downloads 
WHERE email = 'test@example.com';

DELETE FROM kit_purchase_requests 
WHERE email = 'buyer@company.com';
```

---

## MONITORING

### Check Daily

```
1. Login: https://tensectra.com/admin/leads
2. Review new leads
3. Follow up within 24 hours
```

### Email Follow-Up Process

**For Kit Purchase Requests:**
1. Open template: forms/email-templates/kit-purchase-followup.txt
2. Replace {{name}} with customer name
3. Send from: hello@tensectra.com
4. Mark status: "contacted" in admin panel

**For Reference Card Downloads:**
1. Open template: forms/email-templates/refcard-download-followup.txt
2. Replace {{name}} with customer name
3. Send from: hello@tensectra.com
4. Mark status: "followed_up" in admin panel

---

## TROUBLESHOOTING

### No data showing in admin panel

**Check:**
1. SQL tables created? (Supabase > Table Editor)
2. Forms submitting? (Browser console for errors)
3. Admin logged in? (Session valid)
4. RLS policies correct? (Supabase > Authentication)

**Fix:**
```sql
-- Re-run policies if needed
DROP POLICY IF EXISTS "Anyone can submit kit request" ON kit_purchase_requests;
DROP POLICY IF EXISTS "Admins can view kit requests" ON kit_purchase_requests;

-- Run full Step4_CRM_Tracking.sql again
```

---

### Form submits but no Supabase record

**Check Browser Console:**
```
F12 > Console tab
Look for: "[Kit Purchase] Saved to CRM" or "[RefCard] Saved to CRM"
```

**If missing:**
- Supabase client not loaded? (Check window._supabase exists)
- RLS policy blocking insert? (Check Supabase logs)

**Fix:**
```javascript
// Test in browser console:
window._supabase.from('kit_purchase_requests').insert({
  name: 'Test',
  email: 'test@test.com'
}).then(console.log).catch(console.error);

// Should return: { data: [...], error: null }
```

---

### Admin panel shows "Loading..." forever

**Check:**
```
F12 > Console tab
Look for errors
```

**Common Issues:**
- Session expired ? Logout and login again
- Table doesn't exist ? Run SQL script
- Admin user not in admin_users table ? Add to table

---

## SUCCESS METRICS

After deployment, you should see:

```
? 2 new database tables
? Forms capture data to both Netlify + Supabase
? Admin panel shows leads
? Dashboard shows lead count
? Filter/search works
? No console errors
? Mobile menu responsive
? Email templates ready
```

---

## MAINTENANCE

### Weekly Tasks

1. Review new leads in admin panel
2. Send follow-up emails
3. Update lead status (contacted, converted, lost)
4. Export monthly reports (future feature)

### Monthly Tasks

1. Review conversion rates
2. Update email templates if needed
3. Clean up old unresponsive leads
4. Optimize landing page CTAs

---

## ROLLBACK PLAN

If something breaks:

```bash
# 1. Revert Git commit
git revert HEAD
git push origin main

# 2. Drop tables in Supabase (if needed)
DROP TABLE IF EXISTS kit_purchase_requests CASCADE;
DROP TABLE IF EXISTS reference_card_downloads CASCADE;

# 3. Redeploy previous version
# Vercel will automatically deploy the reverted code
```

---

## SUPPORT

**Issues?**
1. Check this guide first
2. Check Supabase logs
3. Check Vercel function logs
4. Check browser console

**Still stuck?**
- Review: forms/MDoc/CODING_STANDARDS.md
- Review: forms/MDoc/CRM_TRACKING_COMPLETE.md

---

**DEPLOYMENT COMPLETE!** ??

Your CRM tracking is now live.  
All product leads flow into Supabase.  
Admin can view and manage from one place.
