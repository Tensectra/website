# PAYMENT LINK EMAIL TESTING GUIDE

## ? **Fixes Applied**

### **Fix 1: Consultancy Page - Data Not Showing**

**Issues:**
1. Missing `showToast()` function ? Silent failures
2. No debug logging ? Can't see what's happening

**Solution:**
- ? Added `showToast()` function (alerts for now)
- ? Added console.log() to loadData()
- ? Added debug output to see query results

**Test:**
```
1. Open: http://localhost:49350/admin/consultancy
2. Open DevTools (F12) ? Console tab
3. Look for: "Loading consultancy enquiries..."
4. Look for: "Query result: { data: [...], count: 3 }"
5. Table should show 3 rows
```

---

### **Fix 2: Payment Link API - Authentication**

**Issues:**
1. API requires `Authorization` header
2. Frontend wasn't sending Supabase token
3. API field names mismatch (`recordType` vs `record_type`)

**Solution:**
- ? Added session token retrieval
- ? Fixed field names to match API spec:
  - `record_id` (not `recordId`)
  - `record_type` (not `recordType`)
  - `product_name` (not `productName`)
- ? Added better error handling with specific messages

---

## ?? **TESTING PAYMENT LINKS**

### **Prerequisites:**

1. **Vercel Environment Variables** (MUST be set):
```
RESEND_API_KEY=re_2cqgLRBK_NLK1SaJuchuXFsKmX1mKgt7n ?
PAYSTACK_SECRET_KEY=sk_test_42e267ba94e493687be820c5083991438dc9cd30 ?
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci... ?
APP_URL=https://www.tensectra.com ?
```

**How to verify:**
```
Vercel Dashboard ? tensectra project ? Settings ? Environment Variables
Check all 4 keys exist
```

2. **Domain Verified in Resend:**
```
Resend Dashboard ? Domains
Verify: tensectra.com is verified ?
```

3. **Admin User Logged In:**
```
Login at: http://localhost:49350/admin/
OR: https://www.tensectra.com/admin/
```

---

### **Test 1: Cohort Application Payment Link**

#### Step 1: Open Applications Page
```
http://localhost:49350/admin/applications
OR
https://www.tensectra.com/admin/applications
```

#### Step 2: See Your 2 Applications
- Should show 2 rows in table
- Each row has action buttons

#### Step 3: Click "Send Payment Link" (?? icon)
- Modal opens
- Pre-filled data:
  - Student name
  - Email
  - Course (Backend/Frontend/Mobile)
  - Amount (e.g., $299 or ?150,000)
  - Currency (USD or NGN)

#### Step 4: Adjust If Needed
- Change amount: e.g., 299 ? 250
- Change currency: USD ? NGN
- Leave student info as-is

#### Step 5: Click "Generate & Send Link"
- Button changes to "Sending..."
- After 2-3 seconds:
  - ? Toast notification: "Payment link sent to [email]"
  - Modal closes
  - Table reloads

#### Step 6: Check Email Inbox
- **To:** Student's email address
- **From:** Tensectra <hello@tensectra.com>
- **Subject:** "?? You're accepted — complete your enrolment for [Course Name]"
- **Body:** Beautiful HTML email with:
  - Tensectra logo
  - "You're Accepted!" hero section
  - Amount due (formatted with ? or $)
  - Big blue button: "?? Complete Enrolment — ?150,000"
  - Cohort details box
  - What you'll receive after payment
  - Payment link (clickable)

#### Step 7: Check Supabase Database
```sql
-- payment_links table should have new record
SELECT * FROM payment_links 
ORDER BY sent_at DESC 
LIMIT 1;

-- Should show:
-- record_type: cohort
-- payer_email: student@example.com
-- amount: 15000000 (kobo) or 29900 (cents)
-- paystack_reference: TEN-1234567890-XXXXX
-- sent_by: tensectra.office@gmail.com
```

---

### **Test 2: Consultancy Payment Link**

#### Step 1: Open Consultancy Page
```
http://localhost:49350/admin/consultancy
OR
https://www.tensectra.com/admin/consultancy
```

#### Step 2: See Your 3 Enquiries
- Check console for: "Query result: { count: 3 }"
- Table shows 3 rows

#### Step 3: Click "Pay Link" Button
- ?? Currently shows alert (placeholder)
- Full modal not yet implemented

**To add full functionality:**
1. Copy modal HTML from `applications.html` (lines 163-227)
2. Paste before consultancy's `</body>`
3. Replace alert with real `openPaymentLinkModal()` function

**For now:** Test shows alert with:
```
Payment link coming soon!
This will generate a payment link for:
[Client Name] (client@company.com)
Amount: NGN 2500000
```

---

## ?? **Sample Email Preview**

### Cohort Acceptance Email:

```
From: Tensectra <hello@tensectra.com>
To: student@example.com
Subject: ?? You're accepted — complete your enrolment for Backend Engineer Cohort

[Tensectra Logo]

??????????????????????????????????
  You're Accepted! Complete Your Enrolment ??
  Your spot is reserved for 48 hours
??????????????????????????????????

Hey John,

Your application has been reviewed and accepted. Complete your payment to confirm your enrolment.

??????????????????????????
?    Amount Due          ?
?   ?150,000            ?
? Backend Engineer Cohort?
??????????????????????????

?? Cohort Details
Start Date: February 15, 2025
Duration: 6 weeks
Format: Live sessions + self-paced

[?? Complete Enrolment — ?150,000]

? After payment you'll receive:
• Instant confirmation email
• Discord community invite (within 24 hours)
• Welcome pack + session calendar
• Course platform access

Questions? Reply to this email — hello@tensectra.com or book a call.
```

---

### Consultancy Invoice Email:

```
From: Tensectra <hello@tensectra.com>
To: cto@techcorp.com
Subject: Invoice ready — Architecture Review — ?250,000

[Tensectra Logo]

??????????????????????????????????
  Your Invoice is Ready
  Architecture Review
??????????????????????????????????

Hey Sarah,

Please find your invoice details below. Click the button to pay online securely.

??????????????????????????
?    Amount Due          ?
?   ?250,000            ?
? Architecture Review    ?
??????????????????????????

[?? Pay Invoice — ?250,000]

Payment terms: Due within 15 days. A receipt will be sent on payment confirmation.

Questions? Reply to this email — hello@tensectra.com or book a call.
```

---

## ?? **Troubleshooting**

### "Failed to send link: API call failed"

**Check:**
1. Vercel env vars set? (RESEND_API_KEY, PAYSTACK_SECRET_KEY)
2. Resend domain verified? (tensectra.com)
3. Console shows error details?

**Solution:**
```
F12 ? Console tab ? Look for:
"Payment link error: [specific error message]"
```

### "Failed to send link: Missing Authorization header"

**Issue:** Session token not found

**Solution:**
```
1. Logout
2. Clear browser cache (Ctrl+Shift+Delete)
3. Login again
4. Retry
```

### "Failed to send link: Not authorised as admin"

**Issue:** User not in admin_users table

**Solution:**
```sql
-- Check if admin user exists
SELECT * FROM admin_users 
WHERE email = 'tensectra.office@gmail.com' 
  AND active = true;

-- If missing, add:
INSERT INTO admin_users (email, name, role, active)
VALUES ('tensectra.office@gmail.com', 'Admin', 'admin', true);
```

### Email Not Received

**Check:**
1. Spam folder
2. Resend dashboard ? Logs
3. Email address correct?
4. Resend domain verified?

**Resend Logs:**
```
https://resend.com/emails
Look for latest send
Status should be: "Delivered"
```

---

## ?? **What Gets Created**

When you send a payment link:

### 1. Paystack Transaction
```
Reference: TEN-1234567890-XXXXX
Amount: 15000000 kobo (?150,000)
Status: pending
Callback URL: https://tensectra.com/payment/success
```

### 2. Database Record (payment_links)
```sql
{
  record_type: 'cohort',
  record_id: 'uuid-of-application',
  payer_email: 'student@example.com',
  payer_name: 'John Doe',
  product_name: 'Backend Engineer Cohort',
  amount: 15000000,
  currency: 'NGN',
  paystack_reference: 'TEN-...',
  paystack_link: 'https://checkout.paystack.com/...',
  sent_by: 'tensectra.office@gmail.com',
  sent_at: '2025-01-30T12:34:56Z'
}
```

### 3. Email via Resend
```
To: student@example.com
From: Tensectra <hello@tensectra.com>
Status: Delivered
Opens: 0
Clicks: 0
```

### 4. Status Update
```sql
-- cohort_applications or consultancy_enquiries
UPDATE cohort_applications
SET 
  status = 'waitlisted',  -- or 'proposal_sent' for consultancy
  notes = 'Payment link sent 2025-01-30 by tensectra.office@gmail.com. Ref: TEN-...'
WHERE id = 'record-id';
```

---

## ?? **Next Steps**

### After Testing:

1. **If emails work:** ? Ready for production!
2. **If emails fail:** Check Vercel env vars
3. **Add to consultancy:** Copy modal from applications.html

### Optional Enhancements:

1. **Add email preview** before sending
2. **Save draft** payment links
3. **Resend** if email bounced
4. **Track clicks** on payment links
5. **Auto-reminder** if not paid after 48 hours

---

## ? **Quick Test Checklist**

- [ ] Consultancy page shows 3 records
- [ ] Console shows "Query result: { count: 3 }"
- [ ] Applications page shows 2 records
- [ ] Click payment link button ? modal opens
- [ ] Modal shows pre-filled data
- [ ] Adjust amount ? works
- [ ] Click "Generate & Send Link"
- [ ] Toast notification appears
- [ ] Modal closes
- [ ] Check email inbox ? email received
- [ ] Email has correct formatting
- [ ] Payment link clickable
- [ ] Opens Paystack checkout
- [ ] Database has payment_links record

---

**Test both cohort and consultancy payment links and report results!** ??
