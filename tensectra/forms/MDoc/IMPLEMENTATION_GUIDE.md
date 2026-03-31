# TENSECTRA WEBSITE - BATCH 1 IMPLEMENTATION COMPLETE ?

## What Has Been Done

### 1. ? Environment Variables & Configuration (.env)
**Files Created:**
- `.env` - Your actual credentials (DO NOT commit to Git!)
- `.env.example` - Template for others
- `.gitignore` - Protects sensitive files
- `js/config.js` - Configuration loader

**Action Required:**
- Update `.env` with your actual API keys:
  - Paystack keys
  - Stripe keys
  - Mailchimp API key
  - Supabase service role key (if needed)

---

### 2. ? Google Analytics 4 Integration
**File Created:** `js/analytics.js`

**Features Implemented:**
- Automatic page view tracking
- Form submission tracking
- Button click tracking
- Payment initiation & success tracking
- Scroll depth tracking (25%, 50%, 75%, 100%)
- Outbound link tracking
- Calendly booking tracking
- Newsletter signup tracking
- Scholarship application tracking
- Video play tracking
- Custom event tracking

**Usage Examples:**
```javascript
// Track button click
TensectraAnalytics.trackButtonClick('enroll_backend');

// Track form submission
TensectraAnalytics.trackFormSubmit('cohort_application', 'cohort');

// Track payment
TensectraAnalytics.trackPaymentSuccess('Backend Cohort', 299, 'ref_123', 'USD');
```

**Measurement ID:** G-Y75Q7F95P4 (already configured)

---

### 3. ? Updated Database Schema
**File Created:** `forms/MDoc/Dbs/TensectraSchema_v2.sql`

**Major Improvements:**
- Fully aligned with DATA_MODELS.txt
- All missing tables added:
  - `cohorts` - Master cohort records
  - `enrolments` - Links applications to cohorts
  - `scholarship_applications` - Separate scholarship tracking
  - `payments` - Unified payment tracking (Stripe + Paystack)
  - `pro_members` - Pro membership management
  - `users` - For future admin/student login
  - `admin_activity_log` - Audit trail
  - `pricing_tiers` - Location-based pricing
  - `newsletter_subscribers` - Email list management
  - `kit_purchase_requests` - Infrastructure kit orders
- Row Level Security (RLS) policies
- Triggers for automatic updates:
  - Decrease cohort seats on enrolment
  - Update scholarship count
- Database views for analytics
- Seed data for first cohorts

**Action Required:**
- Run this SQL in your Supabase SQL Editor
- Backup existing data first if needed

---

### 4. ? Location-Based Pricing with Paystack
**File Created:** `js/pricing.js`

**Features:**
- Auto-detects user location (IP-based)
- Shows prices in local currency:
  - Nigeria: ?150,000
  - Ghana: GH?1,800
  - Kenya: KSh38,000
  - South Africa: R5,400
  - US/International: $299
  - UK: £239
  - Canada: CA$399
  - UAE: AED1,099
  - Germany/Netherlands: €279
- Automatically selects payment gateway:
  - Paystack for African countries (NG, GH, KE, ZA)
  - Stripe for international
- Integrated with Google Analytics

**Usage:**
```html
<!-- Prices auto-update based on location -->
<span data-price="cohort">$299</span>
<span data-price="pro-monthly">$15</span>
<span data-currency>USD</span>

<!-- Payment button -->
<button onclick="initiateTensectraPayment('Backend Cohort', 'cohort')">
  Pay Now
</button>
```

**Action Required:**
- Add your Paystack public key to `.env`
- Test payment flow with test keys first
- Set up Paystack webhook for payment verification

---

### 5. ? Dynamic Scholarship Tracking
**File Created:** `js/scholarship-tracker.js`

**Features:**
- Real-time scholarship availability from Supabase
- Auto-refreshes every 30 seconds
- Course-specific tracking
- Progress bar visualization
- Availability messaging

**Usage:**
```html
<!-- Overall scholarship status -->
<span data-scholarship-overall="filled">3</span> of 
<span data-scholarship-overall="total">5</span> slots filled — 
<span data-scholarship-overall="remaining">2</span> remaining

<!-- Course-specific -->
<div data-scholarship-course="backend">
  <span data-scholarship="filled">2</span> of 
  <span data-scholarship="total">5</span> filled
  
  <!-- Progress bar -->
  <div class="progress-bar">
    <div data-scholarship="progress" style="width: 0%"></div>
  </div>
  
  <!-- Conditional messages -->
  <p data-scholarship="available">Scholarships still available!</p>
  <p data-scholarship="unavailable" style="display: none;">All slots filled</p>
</div>
```

---

### 6. ? Calendly Integration
**File Created:** `js/calendly.js`

**Features:**
- Popup widget support
- Inline embed support
- Pre-fill user data
- Multiple event types:
  - Discovery calls (30min)
  - Consultations
  - Workshops
- Tracks bookings in Google Analytics
- Success notifications

**Usage:**
```html
<!-- Simple button -->
<button onclick="openTensectraCalendly('discovery')">
  Book a Call
</button>

<!-- With pre-filled data -->
<button onclick="TensectraCalendly.openDiscoveryCall({
  name: 'John Doe',
  email: 'john@example.com'
})">
  Book Discovery Call
</button>

<!-- Inline embed -->
<div id="calendly-inline"></div>
<script>
  TensectraCalendly.initInlineWidget('calendly-inline');
</script>
```

**Calendly URL:** https://calendly.com/tensectra-office/30min

---

### 7. ? Mailchimp Integration
**File Created:** `js/mailchimp.js`

**Features:**
- Newsletter subscription
- Multiple lists:
  - General newsletter
  - Pro members
  - Course alumni
  - Infrastructure kit waitlist
  - Leads
- Tag management
- Popup subscription form
- Inline form support
- Auto-subscribe after payment

**Usage:**
```html
<!-- Inline form -->
<form class="newsletter-subscribe-form" data-list-type="general">
  <input type="email" name="email" placeholder="Your email" required>
  <input type="text" name="name" placeholder="Your name">
  <button type="submit">Subscribe</button>
  <div class="subscription-message"></div>
</form>

<!-- Popup form -->
<button onclick="TensectraMailchimp.showSubscriptionForm('general')">
  Subscribe
</button>

<!-- Programmatic -->
<script>
  TensectraMailchimp.subscribe('email@example.com', 'John Doe', 'general', ['lead']);
</script>
```

**Action Required:**
- Add Mailchimp API credentials to `.env`
- Create backend endpoint at `/api/mailchimp` (see below)
- Set up email lists in Mailchimp dashboard

---

### 8. ? Email Templates
**Directory Created:** `email-templates/`

**Templates Created:**
1. `README.md` - Complete email strategy guide
2. `welcome-general.html` - Welcome email for newsletter subscribers
3. `enrollment-confirmation.html` - Cohort enrollment confirmation
4. `payment-confirmation.txt` - Payment receipt
5. `scholarship-application-received.txt` - Scholarship application acknowledgment

**Templates Needed (You should create):**
- `pro-welcome.html` - Pro membership welcome
- `cohort-welcome.html` - Week 1 kickoff email
- `scholarship-awarded.html` - Scholarship acceptance
- `consultancy-inquiry-received.html` - Consultancy acknowledgment
- `alumni-updates.html` - Monthly alumni digest
- `pro-member-digest.html` - Pro member monthly content

**Mailchimp Lists to Create:**
1. General Newsletter
2. Pro Members
3. Course Alumni
4. Infrastructure Kit Waitlist
5. Leads

**Automation Workflows:**
- Welcome sequence (Days 0, 3, 7, 14)
- Course enrollment sequence
- Pro member onboarding
- Payment followup

---

### 9. ? Logo Fixed Across All Forms
**Updated Files:**
- `forms/cohort-application.html`
- `forms/consultancy-enquiry.html`
- `forms/contact.html`
- `forms/waitlist.html`

All forms now use `logo2.png` instead of `tensectra-logo.png`

---

### 10. ? Scripts Integrated into Website
**Updated:** `index.html`

**Added Scripts:**
- Config loader
- Supabase client
- Google Analytics
- Pricing system
- Scholarship tracker
- Calendly
- Mailchimp
- Paystack

**Meta Tags Added:**
- Environment configuration
- Supabase credentials
- Google Analytics ID
- Calendly URL

---

## NEXT STEPS - BATCH 2 (Payment Integration)

### Backend API Endpoints Needed

You'll need to create these backend endpoints (can use Netlify Functions, Vercel Serverless, or your own backend):

#### 1. `/api/mailchimp` - Mailchimp Operations
```javascript
// POST /api/mailchimp
// Body: { action, email, name, list, tags }
// Actions: 'subscribe', 'update_tags'
```

#### 2. `/api/verify-payment` - Payment Verification
```javascript
// POST /api/verify-payment
// Body: { reference, gateway }
// Verifies payment with Paystack/Stripe
// Updates database
// Sends confirmation email
// Adds to Mailchimp
```

#### 3. `/api/webhooks/paystack` - Paystack Webhook
```javascript
// POST /api/webhooks/paystack
// Receives payment notifications
// Verifies signature
// Updates database
// Triggers email sequences
```

#### 4. `/api/webhooks/stripe` - Stripe Webhook
```javascript
// POST /api/webhooks/stripe
// Receives payment notifications
// Verifies signature
// Updates database
// Triggers email sequences
```

---

## TESTING CHECKLIST

### Google Analytics
- [ ] Open website in browser
- [ ] Go to GA4 dashboard ? Realtime
- [ ] Verify you see active user
- [ ] Click buttons and check events appear
- [ ] Submit a form and check conversion

### Pricing System
- [ ] Open website
- [ ] Check browser console for location detection
- [ ] Verify prices show in correct currency
- [ ] Use VPN to test different countries
- [ ] Click payment button (test mode)

### Scholarship Tracker
- [ ] Add cohort in Supabase
- [ ] Open website with devtools
- [ ] Check network tab for Supabase queries
- [ ] Verify numbers update on page
- [ ] Update scholarship_filled in database
- [ ] Refresh page and verify changes

### Calendly
- [ ] Click "Book a Call" button
- [ ] Verify Calendly popup opens
- [ ] Complete a test booking
- [ ] Check GA4 for booking event
- [ ] Verify email confirmation received

### Mailchimp
- [ ] Click subscribe button
- [ ] Enter test email
- [ ] Check Mailchimp dashboard for new subscriber
- [ ] Verify welcome email sent
- [ ] Check tags applied correctly

---

## CONFIGURATION SUMMARY

### Environment Variables (.env)
```
SUPABASE_URL=https://ahcfozfntvqbfgbinxwr.supabase.co
SUPABASE_ANON_KEY=sb_publishable_9t2QGBpQl4yd4H73dkSdlg_9QVNarpS
GA_MEASUREMENT_ID=G-Y75Q7F95P4
CALENDLY_URL=https://calendly.com/tensectra-office/30min
PAYSTACK_PUBLIC_KEY=[ADD YOUR KEY]
STRIPE_PUBLIC_KEY=[ADD YOUR KEY]
MAILCHIMP_API_KEY=[ADD YOUR KEY]
```

### Supabase Database
- Run `TensectraSchema_v2.sql` in Supabase SQL Editor
- Enable Row Level Security
- Create API policies as needed

### Google Analytics
- Already configured with ID: G-Y75Q7F95P4
- Events automatically tracked
- Mark conversions in GA4 dashboard

### Calendly
- URL: https://calendly.com/tensectra-office/30min
- Already integrated
- No additional setup needed

### Paystack
- Sign up at https://paystack.com
- Get test keys from dashboard
- Add public key to `.env`
- Set up webhook URL
- Replace with live keys when ready

### Mailchimp
- Sign up at https://mailchimp.com
- Create 5 audience lists
- Get API key from Account ? Extras ? API keys
- Get server prefix (e.g., us1, us2)
- Get audience IDs for each list

---

## SUPPORT & TROUBLESHOOTING

### Common Issues

**Prices not updating:**
- Check browser console for location API errors
- Verify `js/pricing.js` loaded
- Check network tab for ipapi.co request

**Scholarship numbers not showing:**
- Verify Supabase connection
- Check cohorts exist in database
- Verify cohorts.status = 'open'
- Check browser console for errors

**Payment button not working:**
- Verify Paystack script loaded
- Check Paystack public key in .env
- Verify payment gateway selection logic
- Test with Paystack test card: 5060 6666 6666 6666 6666

**Analytics not tracking:**
- Verify GA4 script loaded
- Check correct Measurement ID
- Wait 30 seconds for events to appear
- Use GA4 DebugView for real-time debugging

---

## FILES CREATED/MODIFIED SUMMARY

### New Files:
1. `.env` - Environment variables
2. `.env.example` - Environment template
3. `.gitignore` - Git ignore rules
4. `js/config.js` - Configuration loader
5. `js/analytics.js` - Google Analytics integration
6. `js/pricing.js` - Location-based pricing
7. `js/scholarship-tracker.js` - Scholarship tracking
8. `js/calendly.js` - Calendly integration
9. `js/mailchimp.js` - Mailchimp integration
10. `forms/MDoc/Dbs/TensectraSchema_v2.sql` - Updated database schema
11. `email-templates/README.md` - Email strategy guide
12. `email-templates/welcome-general.html` - Welcome email
13. `email-templates/enrollment-confirmation.html` - Enrollment email
14. `email-templates/payment-confirmation.txt` - Payment receipt
15. `email-templates/scholarship-application-received.txt` - Scholarship ack

### Modified Files:
1. `index.html` - Added scripts and meta tags
2. `forms/cohort-application.html` - Fixed logo
3. `forms/consultancy-enquiry.html` - Fixed logo
4. `forms/contact.html` - Fixed logo
5. `forms/waitlist.html` - Fixed logo

---

## REMAINING TASKS (Next Batches)

### Batch 2: Admin Panel
- [ ] Admin login system
- [ ] Role-based access control
- [ ] Dashboard with analytics
- [ ] Application review interface
- [ ] Payment management
- [ ] Scholarship approval workflow

### Batch 3: Additional Features
- [ ] Light/dark mode toggle
- [ ] Live chat/WhatsApp integration
- [ ] Custom CRM implementation
- [ ] SEO optimization
- [ ] Backend API endpoints
- [ ] Payment webhook handlers

---

## DEPLOYMENT

### Before Going Live:
1. Replace all test keys with production keys
2. Run full database schema in production Supabase
3. Verify all environment variables set correctly
4. Test payment flow end-to-end
5. Set up SSL certificate (Vercel/Netlify does this automatically)
6. Configure custom domain DNS
7. Set up Paystack/Stripe webhooks with production URLs
8. Test all integrations with production keys
9. Import Mailchimp templates
10. Create all automation workflows

### Domain Configuration:
- Domain: www.tensectra.com
- Already live according to your notes
- Verify DNS settings
- Check SSL certificate

---

## QUESTIONS TO ANSWER

1. **Payment Gateway Priority:**
   - Should Paystack be primary for all African countries?
   - Or offer both Paystack and Stripe as options?

2. **Scholarship Application:**
   - Should it be a separate form or checkbox in main application?
   - Currently: checkbox in cohort application form

3. **Email Sending:**
   - Use Mailchimp for all emails?
   - Or separate transactional email service (SendGrid, Resend)?
   - Recommendation: Mailchimp for marketing, Resend for transactional

4. **Admin Access:**
   - Who needs admin access?
   - What permissions needed?
   - Use Supabase Auth or custom solution?

5. **Backend Hosting:**
   - Where to host API endpoints?
   - Options: Netlify Functions, Vercel Serverless, separate backend
   - Recommendation: Vercel Serverless (matches your vercel.json)

---

## CONCLUSION

**Batch 1 is COMPLETE! ?**

You now have:
- Professional configuration management
- Google Analytics tracking everything
- Location-based pricing with Paystack
- Dynamic scholarship tracking
- Calendly integration
- Mailchimp foundation
- Email template strategy
- Updated database schema
- Fixed logos across all forms

**Next:** Set up backend API endpoints and test the complete payment flow.

**Priority:** Get Paystack test keys and test a complete payment ? verification ? email flow.

