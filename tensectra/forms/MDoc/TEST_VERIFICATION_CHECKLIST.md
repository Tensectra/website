# TEST VERIFICATION CHECKLIST

Run through this checklist to verify all fixes are working correctly.

---

## ?? STEP 1: Database Migration (5 minutes)

**Action:** Run SQL script in Supabase

1. [ ] Open Supabase Dashboard
2. [ ] Go to SQL Editor
3. [ ] Open file: `forms/MDoc/Dbs/DatabaseAlignmentFix.sql`
4. [ ] Copy entire content
5. [ ] Paste in SQL Editor
6. [ ] Click "Run"
7. [ ] Verify success message

**Expected Result:**
```
? consultancy_enquiries table updated
? waitlist_submissions table updated
? No errors
```

**Verification Query:**
```sql
-- Check consultancy_enquiries columns
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'consultancy_enquiries';

-- Should see: role, challenges, timeline (NOT job_title, message, preferred_date)
```

---

## ?? STEP 2: Test Form Handler Updates (10 minutes)

### Test 1: Cohort Application Form

1. [ ] Open browser DevTools Console
2. [ ] Navigate to `/forms/cohort-application`
3. [ ] Fill out form:
   - Name: Test User
   - Email: test@example.com
   - Course: Backend Engineer
   - Check "Apply for Scholarship"
   - Fill scholarship reason
4. [ ] Submit form
5. [ ] Check Supabase `cohort_applications` table

**Expected Result:**
```
? New row inserted
? is_scholarship = true (boolean, not "yes" string)
? scholarship_reason has text
? No errors in console
```

---

### Test 2: Consultancy Enquiry Form

1. [ ] Navigate to `/forms/consultancy-enquiry`
2. [ ] Fill out form:
   - Name: Test Client
   - Email: client@company.com
   - Company: TestCorp
   - Role: CTO
   - Team Size: 5-15
   - Tech Stack: .NET, React
   - Challenges: Test challenges
   - Timeline: ASAP
3. [ ] Submit form
4. [ ] Check Supabase `consultancy_enquiries` table

**Expected Result:**
```
? New row inserted
? role column has "CTO" (not job_title)
? challenges column has text (not message)
? timeline = "ASAP" (text, not date)
? tier = "tier3_consultation" (default)
? stack column does NOT exist (removed by handler)
? No errors in console
```

---

### Test 3: Waitlist Form

1. [ ] Navigate to `/forms/waitlist`
2. [ ] Fill out form:
   - Name: Test Wait
   - Email: wait@example.com
   - Interest: Product Design Course
   - Role: Developer
3. [ ] Submit form
4. [ ] Check Supabase `waitlist_submissions` table

**Expected Result:**
```
? New row inserted
? product = "course_designer" (converted from "product-design")
? role = "Developer"
? No errors in console
```

---

### Test 4: Contact Form

1. [ ] Navigate to `/forms/contact`
2. [ ] Fill out form
3. [ ] Submit
4. [ ] Check Supabase `contact_submissions` table

**Expected Result:**
```
? New row inserted
? All fields match
? No errors
```

---

## ?? STEP 3: Test Payment Pages (15 minutes)

### Test 1: Cohort Payment Page

**URL to test:**
```
http://localhost:3000/payment/cohort.html?email=test@example.com&course=backend&ref=TEST123&name=Test%20User
```
(Or use your deployed URL)

**Checklist:**
1. [ ] Page loads without errors
2. [ ] Loading spinner shows briefly
3. [ ] Course name displays: "Backend Engineer Cohort"
4. [ ] Price displays in local currency
5. [ ] Email field pre-filled with "test@example.com"
6. [ ] Name field pre-filled with "Test User"
7. [ ] "Pay Now" button visible
8. [ ] Click button (don't complete payment yet)
9. [ ] Check console for analytics tracking

**Expected Result:**
```
? No console errors
? Page view tracked in GA
? All data displays correctly
? Responsive on mobile
```

---

### Test 2: Consultancy Payment Page

**URL to test:**
```
http://localhost:3000/payment/consultancy.html?invoice=TEST-001&amount=250000&currency=USD&email=client@company.com&name=Test%20Client&company=TestCorp&service=Architecture%20Review
```

**Checklist:**
1. [ ] Page loads without errors
2. [ ] Invoice number shows: "TEST-001"
3. [ ] Amount shows: "$2,500" (250000 cents = $2,500)
4. [ ] Service shows: "Architecture Review"
5. [ ] Company shows: "TestCorp"
6. [ ] Email pre-filled
7. [ ] Name pre-filled
8. [ ] Pay button visible

**Expected Result:**
```
? No console errors
? All invoice details correct
? Amount formatted properly
? Responsive layout
```

---

### Test 3: Self-Paced Payment Page

**URL to test:**
```
http://localhost:3000/payment/self-paced.html?product=architecture-playbook
```

**Checklist:**
1. [ ] Page loads without errors
2. [ ] Product title: "Architecture Playbook Bundle"
3. [ ] Price: "$49"
4. [ ] Category: "Ebook Bundle"
5. [ ] What's included list shows 6 items
6. [ ] Email input field present
7. [ ] "Buy Now" button visible
8. [ ] Money-back guarantee section shows

**Expected Result:**
```
? Product loads from catalog
? Price displays correctly
? All details visible
? Responsive design
```

---

### Test 4: Invalid Payment Links

**Test error handling:**

1. [ ] Visit cohort page without parameters:
   ```
   /payment/cohort.html
   ```
   **Expected:** Error state shows "Invalid payment link"

2. [ ] Visit consultancy page without invoice:
   ```
   /payment/consultancy.html
   ```
   **Expected:** Error state shows

3. [ ] Visit self-paced with invalid product:
   ```
   /payment/self-paced.html?product=invalid-product
   ```
   **Expected:** Error state shows "Product not found"

---

## ?? STEP 4: Test Email Templates (5 minutes)

### Test 1: Cohort Acceptance Email

1. [ ] Open file: `email-templates/cohort-acceptance-with-payment-link.txt`
2. [ ] Verify all placeholders present:
   - {{NAME}}
   - {{EMAIL}}
   - {{COURSE_NAME}}
   - {{COURSE_ID}}
   - {{APPLICATION_ID}}
   - {{PRICE}}
   - {{CURRENCY}}
   - {{START_DATE}}
   - {{END_DATE}}
3. [ ] Verify payment link is correct format
4. [ ] Check for typos

---

### Test 2: Consultancy Invoice Email

1. [ ] Open file: `email-templates/consultancy-invoice-with-payment-link.txt`
2. [ ] Verify all placeholders
3. [ ] Check payment link format
4. [ ] Verify professional tone

---

## ?? STEP 5: Test Complete User Flow (20 minutes)

### Flow 1: Cohort Application ? Payment

**Steps:**
1. [ ] Submit cohort application (as user)
2. [ ] View submission in Supabase (as admin)
3. [ ] Update status to "accepted"
4. [ ] Generate payment link:
   ```
   https://your-site.com/payment/cohort.html?email=USER_EMAIL&course=COURSE&ref=APP_ID&name=USER_NAME
   ```
5. [ ] Copy email template
6. [ ] Replace placeholders with real data
7. [ ] Send email (or test locally)
8. [ ] Click payment link
9. [ ] Verify payment page loads correctly
10. [ ] Complete test payment (if testing payment gateway)

**Expected Result:**
```
? Application submitted
? Admin can view
? Payment link generated
? Email sent
? Payment page loads
? User can complete payment
```

---

### Flow 2: Consultancy Enquiry ? Invoice

**Steps:**
1. [ ] Submit consultancy enquiry
2. [ ] View in Supabase
3. [ ] Generate invoice payment link
4. [ ] Test link opens correctly
5. [ ] Verify invoice details

---

### Flow 3: Direct Product Purchase

**Steps:**
1. [ ] Visit courses page
2. [ ] Click "Buy Now" on product
3. [ ] Should redirect to payment/self-paced.html
4. [ ] Product loads
5. [ ] User can enter email
6. [ ] Can complete purchase

---

## ?? STEP 6: Mobile Testing (10 minutes)

**Test on mobile devices:**

1. [ ] Open payment pages on mobile
2. [ ] Check responsive layout
3. [ ] Forms are usable
4. [ ] Buttons are tappable
5. [ ] Text is readable
6. [ ] No horizontal scroll

**Test browsers:**
- [ ] Chrome mobile
- [ ] Safari iOS
- [ ] Samsung Internet

---

## ?? STEP 7: Cross-Browser Testing (10 minutes)

**Test on desktop:**

- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge

**Check:**
1. [ ] Forms submit correctly
2. [ ] Payment pages load
3. [ ] No JavaScript errors
4. [ ] Analytics tracking works

---

## ?? STEP 8: Analytics Verification (5 minutes)

1. [ ] Open Google Analytics
2. [ ] Go to Realtime ? Events
3. [ ] Open payment pages in another tab
4. [ ] Verify events tracked:
   - [ ] page_view
   - [ ] payment_initiated (when clicking pay button)
5. [ ] Check custom parameters logged

---

## ?? STEP 9: Performance Check (5 minutes)

**Run Lighthouse audit:**

1. [ ] Open Chrome DevTools
2. [ ] Go to Lighthouse tab
3. [ ] Run audit on payment pages
4. [ ] Check scores:
   - [ ] Performance > 80
   - [ ] Accessibility > 90
   - [ ] Best Practices > 90
   - [ ] SEO > 80

---

## ?? STEP 10: Security Check (5 minutes)

**Verify:**

1. [ ] Payment pages use HTTPS
2. [ ] No API keys exposed in frontend
3. [ ] Forms validate input
4. [ ] Email validation works
5. [ ] SQL injection not possible (using Supabase RLS)
6. [ ] CORS properly configured

---

## ?? COMMON ISSUES & FIXES

### Issue: Form submission fails
**Fix:** Check Supabase credentials in config.js

### Issue: Payment page shows error
**Fix:** Check URL parameters are correct

### Issue: Analytics not tracking
**Fix:** Verify GA measurement ID in config.js

### Issue: Price shows $0
**Fix:** Wait for pricing.js to load location data

### Issue: Database insert fails
**Fix:** Run DatabaseAlignmentFix.sql script

---

## ? SUCCESS CRITERIA

**All tests passing means:**

- [x] Forms aligned with database
- [x] Field mapping works correctly
- [x] Payment pages load
- [x] Links generate properly
- [x] Email templates ready
- [x] Analytics tracking
- [x] Mobile responsive
- [x] Cross-browser compatible

---

## ?? TESTING RECORD

Date tested: _______________

Tester: _______________

Results:
- [ ] All tests passed
- [ ] Some issues found (document below)
- [ ] Major issues (needs fixing)

Issues found:
```
1. 
2. 
3. 
```

Actions taken:
```
1. 
2. 
3. 
```

---

## ?? READY FOR PRODUCTION?

If all tests pass:
- [x] Database aligned
- [x] Forms working
- [x] Payment pages ready
- [x] Email templates ready
- [x] Analytics tracking
- [x] Mobile responsive
- [x] No console errors

**Status:** 
- [ ] ? READY FOR PRODUCTION
- [ ] ?? NEEDS MINOR FIXES
- [ ] ? NEEDS MAJOR WORK

---

## ?? HELP NEEDED?

If any tests fail, check:
1. FIXES_COMPLETED_SUMMARY.md
2. FORM_DATABASE_ALIGNMENT.md
3. PAYMENT_LINKS_QUICK_REFERENCE.md
4. Console logs in browser

Or contact: hello@tensectra.com

