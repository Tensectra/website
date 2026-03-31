# QUICK START TESTING GUIDE

## ?? Test Everything in 15 Minutes

### Step 1: Environment Setup (2 minutes)
```bash
# 1. Open .env file
# 2. Add your Paystack TEST key
PAYSTACK_PUBLIC_KEY=pk_test_xxxxx

# 3. Add your Mailchimp key (optional for now)
MAILCHIMP_API_KEY=xxxxx
```

### Step 2: Test Google Analytics (3 minutes)
1. Open https://analytics.google.com
2. Go to: Realtime ? Overview
3. Open your website in a new tab
4. **Expected:** You should see "1 active user"
5. Click any button on your site
6. **Expected:** Event appears in Realtime ? Events
7. Scroll down the page
8. **Expected:** Scroll events appear (scroll_25, scroll_50, etc.)

? **Success:** You see your activity tracked in real-time

---

### Step 3: Test Location & Pricing (2 minutes)
1. Open your website
2. Open browser DevTools (F12)
3. Go to Console tab
4. **Expected to see:**
```
?? Location detected: {countryCode: "NG", countryName: "Nigeria"...}
?? Pricing loaded: {currency: "NGN", symbol: "?", cohort: 150000...}
```

5. Check any price on the page
6. **Expected:** Prices show in your local currency

**Test with VPN (Optional):**
1. Enable VPN ? Select US
2. Refresh website
3. **Expected:** Prices change to USD ($299)

? **Success:** Prices auto-update based on location

---

### Step 4: Test Scholarship Tracker (2 minutes)
1. Go to Supabase Dashboard
2. Open SQL Editor
3. Run the TensectraSchema_v2.sql (if not done)
4. Verify cohorts exist:
```sql
SELECT * FROM cohorts WHERE status = 'open';
```

5. If no cohorts, insert one:
```sql
INSERT INTO cohorts (name, course, start_date, end_date, price_usd, scholarship_filled)
VALUES ('Test Cohort', 'backend', '2024-06-01', '2024-07-15', 29900, 3);
```

6. Open your website
7. Open DevTools Console
8. **Expected:** Scholarship numbers appear on page

9. Update scholarship count:
```sql
UPDATE cohorts 
SET scholarship_filled = 4 
WHERE course = 'backend';
```

10. Wait 30 seconds (auto-refresh)
11. **Expected:** Numbers update on page

? **Success:** Real-time scholarship tracking works

---

### Step 5: Test Calendly (2 minutes)
1. Click any "Book a Call" button
2. **Expected:** Calendly popup opens
3. Check DevTools Console
4. **Expected:** See "?? Calendly loaded"
5. Close popup

**Test inline embed:**
1. Create a test page with:
```html
<div id="calendly-inline" style="min-height:630px;"></div>
<script src="js/calendly.js"></script>
<script>
  window.addEventListener('load', () => {
    TensectraCalendly.initInlineWidget('calendly-inline');
  });
</script>
```

? **Success:** Calendly integration works

---

### Step 6: Test Paystack Payment (4 minutes)

**IMPORTANT: Use Paystack TEST mode**

1. Get TEST key from Paystack Dashboard
2. Add to .env:
```
PAYSTACK_PUBLIC_KEY=pk_test_xxxxx
```

3. Open your website
4. Click "Pay Now" for cohort
5. Enter test email: test@example.com
6. **Expected:** Paystack popup opens

7. Use Paystack test card:
```
Card Number: 5060 6666 6666 6666 6666
CVV: 123
Expiry: 12/25
PIN: 1234
OTP: 123456
```

8. Complete payment
9. **Expected in Console:**
```
? Payment successful: TEN-123456789
```

10. Check Supabase payments table
11. **Expected:** No entry yet (need backend webhook)

**What's Missing:**
- Backend API to verify payment
- Webhook to receive notifications
- Database update logic

? **Success:** Payment popup works, needs backend to complete

---

### Step 7: Test Mailchimp (2 minutes - SKIP if no API key)

**Only if you have Mailchimp API key**

1. Click newsletter subscribe
2. Enter test email
3. Check Mailchimp dashboard
4. **Expected:** New subscriber appears

**Without API key:**
- Subscription will fail (expected)
- You'll see error in console
- That's OK for now!

? **Success:** Form works, integration pending API key

---

## ?? Known Issues (Expected)

### 1. Payment Verification Fails
**Symptom:** Payment succeeds but no database update
**Reason:** No backend webhook handler yet
**Fix:** Create `/api/verify-payment` endpoint (see IMPLEMENTATION_GUIDE.md)

### 2. Mailchimp Subscription Fails
**Symptom:** Error on subscribe
**Reason:** No Mailchimp API key OR no backend endpoint
**Fix:** Add API key + create `/api/mailchimp` endpoint

### 3. Scholarship Numbers Don't Show
**Symptom:** Blank numbers on page
**Reason:** No cohorts in database OR Supabase connection failed
**Fix:** 
- Run SQL to create cohorts
- Check Supabase credentials in .env
- Check browser console for errors

### 4. Location Shows "International"
**Symptom:** Prices in USD instead of local currency
**Reason:** IP detection failed OR VPN blocking
**Fix:** 
- Disable VPN
- Check ipapi.co is accessible
- Fallback to USD is expected behavior

---

## ?? Debugging Tips

### Check If Scripts Loaded
Open DevTools ? Console and type:
```javascript
// Should all return objects
window.TensectraConfig
window.TensectraAnalytics
window.TensectraPricing
window.TensectraCalendly
window.TensectraMailchimp
window.ScholarshipTracker
```

If any is `undefined`, check:
1. Script tag in HTML
2. File path is correct
3. No JavaScript errors

---

### Check Supabase Connection
```javascript
// In console
supabase
  .from('cohorts')
  .select('*')
  .then(data => console.log(data));
```

**Expected:** List of cohorts
**If error:** Check Supabase credentials

---

### Check Payment Gateway Selection
```javascript
// In console
window.TensectraPricing.getPaymentGateway()
```

**Expected:**
- Nigeria/Ghana/Kenya/SA: `"paystack"`
- Others: `"stripe"`

---

### Force Refresh Scripts
If changes don't appear:
1. Hard refresh: `Ctrl + Shift + R`
2. Clear cache
3. Check script version number (`?v=3`)

---

## ? Success Criteria

After testing, you should have:
- [x] Google Analytics tracking events
- [x] Prices showing in local currency
- [x] Scholarship numbers updating
- [x] Calendly popup opening
- [x] Paystack payment flow working
- [ ] Payment verification (needs backend)
- [ ] Email sending (needs backend)

**90% Complete!**

---

## ?? Next: Build Backend API

You need 4 endpoints:

### 1. POST /api/verify-payment
Verify Paystack/Stripe payment and update database

### 2. POST /api/webhooks/paystack
Receive Paystack payment notifications

### 3. POST /api/webhooks/stripe
Receive Stripe payment notifications

### 4. POST /api/mailchimp
Handle Mailchimp subscriptions

**Recommended Stack:**
- Vercel Serverless Functions (already have vercel.json)
- Node.js/TypeScript
- Supabase Client
- Mailchimp API
- Paystack/Stripe APIs

**Files to Create:**
```
/api
  /verify-payment.js
  /webhooks
    /paystack.js
    /stripe.js
  /mailchimp.js
```

See IMPLEMENTATION_GUIDE.md for detailed specs.

---

## ?? Need Help?

Common errors and solutions:

| Error | Cause | Solution |
|-------|-------|----------|
| "Supabase not loaded" | Script order wrong | Move supabase-config.js after CDN |
| "Paystack is not defined" | Paystack script not loaded | Check Paystack CDN in `<head>` |
| "Cannot read property 'get'" | Config not initialized | Check js/config.js loaded first |
| "ipapi.co blocked" | Network/VPN issue | Disable VPN, check network |
| Prices show $0 | Pricing map missing | Check country code in pricing.js |

---

## ?? You're Ready!

Once all green checkmarks above:
1. Test the complete user flow
2. Fix any backend integration issues
3. Switch to production keys
4. Go live!

**Test User Flow:**
1. User visits site (tracked ?)
2. Sees price in local currency (working ?)
3. Checks scholarship availability (working ?)
4. Clicks enroll ? Fills form (working ?)
5. Pays via Paystack (working ?)
6. Backend verifies payment (TODO)
7. Email sent (TODO)
8. Added to Mailchimp (TODO)
9. Invited to Discord (TODO)
10. Access granted (TODO)

**5/10 Complete - Halfway there!** ??
