# ALL FORMS FIXED - DEPLOYMENT GUIDE

## ? **COMPLETED: 4 FORMS USING CONSULTANCY PATTERN**

All forms now use the exact same working pattern as consultancy-enquiry:
- No Supabase CDN
- REST API calls via form-handler.js
- Use window.SUPABASE_URL + window.SUPABASE_ANON_KEY
- Call initForm() for simple forms

---

## ?? **FORMS FIXED:**

### 1. **Waitlist Form** ?
- **File:** `forms/waitlist.html`
- **Table:** `waitlist_submissions`
- **SQL:** `forms/MDoc/Dbs/waitlist_table.sql`
- **Pattern:** initForm('waitlist-form', 'waitlist_submissions', 'message')

### 2. **Reference Card Download** ?
- **File:** `js/main.js`
- **Table:** `reference_card_downloads`
- **SQL:** `forms/MDoc/Dbs/Step4_CRM_Tracking.sql`
- **Pattern:** Direct REST API (async/await in modal)

### 3. **Kit Purchase Request** ?
- **File:** `pages/infrastructure.html`
- **Table:** `kit_purchase_requests`
- **SQL:** `forms/MDoc/Dbs/Step4_CRM_Tracking.sql`
- **Pattern:** Direct REST API (async/await in modal)

### 4. **Course Notifications** ?
- **File:** `pages/courses.html`
- **Table:** `course_notifications`
- **SQL:** `forms/MDoc/Dbs/course_notifications.sql`
- **Pattern:** initForm('course-notify-form', 'course_notifications', 'message')

---

## ??? **SQL FILES TO RUN IN SUPABASE:**

```sql
1. forms/MDoc/Dbs/Step4_CRM_Tracking.sql
   - Creates: kit_purchase_requests
   - Creates: reference_card_downloads

2. forms/MDoc/Dbs/waitlist_table.sql
   - Creates: waitlist_submissions

3. forms/MDoc/Dbs/course_notifications.sql
   - Creates: course_notifications
```

---

## ?? **DEPLOYMENT STEPS:**

### Step 1: Commit & Push
```bash
cd C:\Websites\t2\tensectra
git add .
git commit -m "fix: all 5 forms - REST API pattern, no Supabase CDN"
git push origin Segun
```

### Step 2: Run SQL in Supabase
```
1. https://supabase.com/dashboard
2. SQL Editor ? New Query
3. Run each SQL file one by one
4. Verify: All 4 tables created
```

### Step 3: Test Locally
```
1. Hard refresh: Ctrl + Shift + R
2. Test each form:
   - Waitlist: http://localhost:49350/forms/waitlist
   - Ref Card: http://localhost:49350/ (floating button)
   - Kit Purchase: http://localhost:49350/pages/infrastructure
   - Course Notify: http://localhost:49350/pages/courses
```

### Step 4: Verify Database
```
1. Supabase ? Table Editor
2. Check each table has new rows
3. Check admin panels show data:
   - /admin/leads (kit + refcard)
   - /admin/newsletter > Waitlist tab
```

---

## ?? **FILES MODIFIED:**

```
? forms/waitlist.html (removed Supabase CDN, added initForm)
? js/main.js (ref card REST API pattern)
? pages/infrastructure.html (kit purchase REST API pattern)
? pages/courses.html (added course notify form with initForm)
? js/supabase-config.js (console log for debugging)
? js/form-handler.js (better error messages)
? js/scholarship-tracker.js (fixed window._supabase check)
```

---

## ?? **ADMIN PANELS TO VIEW DATA:**

| Form | Admin Page | Table | Filter/Tab |
|------|------------|-------|-----------|
| Waitlist | /admin/newsletter | waitlist_submissions | Waitlist tab |
| Ref Card | /admin/leads | reference_card_downloads | Cards filter |
| Kit Purchase | /admin/leads | kit_purchase_requests | Kit filter |
| Course Notify | (create new) | course_notifications | N/A |

---

## ?? **NOTES:**

### Pro Members & Alumni:
- **Pro membership buttons** currently show "Coming soon" notification
- **Alumni link** goes to contact form
- No separate Pro/Alumni signup forms exist yet
- Newsletter subscribers table already exists for general signups

### If you want Pro/Alumni signup:
1. Create forms (similar to waitlist pattern)
2. Add fields: name, email, type (pro/alumni)
3. Save to newsletter_subscribers with list_type

---

## ?? **TESTING CHECKLIST:**

```
[ ] SQL: All 4 tables created in Supabase
[ ] Waitlist form submits successfully
[ ] Reference card downloads and saves to DB
[ ] Kit purchase request saves to DB
[ ] Course notify form submits successfully
[ ] Admin leads page shows kit + refcard data
[ ] Admin newsletter page shows waitlist data
[ ] No console errors on any page
[ ] Hard refresh tested (Ctrl + Shift + R)
```

---

## ? **SUCCESS CRITERIA:**

After deployment, all 4 forms should:
- ? Submit without errors
- ? Save to correct Supabase table
- ? Show success notification
- ? Appear in admin panel
- ? Work exactly like consultancy-enquiry form

---

**READY TO DEPLOY!** Run the SQL, push the code, test! ??
