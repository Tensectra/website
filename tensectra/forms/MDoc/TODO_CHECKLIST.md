# TENSECTRA - YOUR ACTION ITEMS CHECKLIST

Use this checklist to track your progress implementing the remaining features.

---

## ?? CRITICAL - Do This First (Today)

### 1. Test Current Implementation
- [ ] Open https://www.tensectra.com
- [ ] Open browser DevTools (F12) ? Console tab
- [ ] Verify no JavaScript errors
- [ ] Check for success messages:
  - `?? Location detected: ...`
  - `?? Pricing loaded: ...`
  - `?? Google Analytics initialized`
  - `?? Calendly loaded`
- [ ] Go to Google Analytics ? Realtime
- [ ] Verify you see "1 active user"
- [ ] Click a button and check event appears in GA4

**Time Estimate:** 10 minutes

---

### 2. Set Up Supabase Database
- [ ] Login to Supabase Dashboard
- [ ] Go to SQL Editor
- [ ] Click "New Query"
- [ ] Copy entire contents of `forms/MDoc/Dbs/TensectraSchema_v2.sql`
- [ ] Paste and click "Run"
- [ ] Wait for completion (should say "Success")
- [ ] Go to Table Editor
- [ ] Verify all tables exist:
  - cohorts
  - cohort_applications
  - payments
  - enrolments
  - scholarship_applications
  - pro_members
  - users
  - pricing_tiers
  - etc.
- [ ] Check pricing_tiers has 11 rows (default pricing inserted)
- [ ] Insert test cohort:
```sql
INSERT INTO cohorts (name, course, start_date, end_date, price_usd, scholarship_filled)
VALUES ('Backend Cohort June 2024', 'backend', '2024-06-01', '2024-07-15', 29900, 2);
```
- [ ] Refresh website
- [ ] Check scholarship section shows "2 of 5 slots filled — 3 remaining"

**Time Estimate:** 15 minutes

---

### 3. Get API Keys

#### Paystack (Payment Gateway)
- [ ] Go to https://paystack.com
- [ ] Click "Get Started"
- [ ] Sign up with business email
- [ ] Verify email
- [ ] Complete KYC (business details)
- [ ] Go to Settings ? API Keys & Webhooks
- [ ] Copy "Test Public Key" (starts with `pk_test_`)
- [ ] Copy "Test Secret Key" (starts with `sk_test_`)
- [ ] Open `.env` file in your project
- [ ] Update:
```
PAYSTACK_PUBLIC_KEY=pk_test_your_actual_key_here
PAYSTACK_SECRET_KEY=sk_test_your_actual_key_here
```
- [ ] Save file

**Time Estimate:** 15 minutes

---

#### Mailchimp (Email Marketing)
- [ ] Go to https://mailchimp.com
- [ ] Click "Sign Up Free"
- [ ] Create account
- [ ] Go to Audience ? Manage Audience ? Settings
- [ ] Click "Audience name and defaults"
- [ ] Note the "Audience ID" (you'll need this)
- [ ] Create 5 audiences:
  1. General Newsletter
  2. Pro Members
  3. Course Alumni
  4. Infrastructure Kit Waitlist
  5. Leads
- [ ] For each, note the Audience ID
- [ ] Go to Account ? Extras ? API keys
- [ ] Click "Create A Key"
- [ ] Copy the key
- [ ] Note your server prefix (e.g., us1, us12) from the key
- [ ] Update `.env`:
```
MAILCHIMP_API_KEY=your_key_here-us1
MAILCHIMP_SERVER_PREFIX=us1
MAILCHIMP_GENERAL_ID=audience_id_1
MAILCHIMP_PRO_ID=audience_id_2
MAILCHIMP_ALUMNI_ID=audience_id_3
MAILCHIMP_WAITLIST_ID=audience_id_4
MAILCHIMP_LEADS_ID=audience_id_5
```

**Time Estimate:** 25 minutes

---

#### Resend (Transactional Email)
- [ ] Go to https://resend.com
- [ ] Click "Get Started"
- [ ] Sign up
- [ ] Go to API Keys
- [ ] Click "Create API Key"
- [ ] Give it a name: "Tensectra Production"
- [ ] Copy the key (shown only once!)
- [ ] Update `.env`:
```
RESEND_API_KEY=re_your_key_here
```
- [ ] Go to Domains
- [ ] Click "Add Domain"
- [ ] Enter: tensectra.com
- [ ] Follow DNS setup instructions
- [ ] Wait for verification (can take 24-48 hours)

**Time Estimate:** 20 minutes

---

## ?? HIGH PRIORITY - Do This Week

### 4. Build Backend API Endpoints

**Prerequisites:**
- [ ] Node.js installed
- [ ] Vercel account
- [ ] All API keys from Step 3

**Steps:**
- [ ] Open terminal in project root
- [ ] Run: `npm init -y`
- [ ] Run: `npm install @supabase/supabase-js @mailchimp/mailchimp_marketing resend stripe`
- [ ] Create `/api` directory
- [ ] Copy endpoint code from `API_ENDPOINTS_SPEC.md`:
  - [ ] Create `/api/verify-payment.js`
  - [ ] Create `/api/webhooks/paystack.js`
  - [ ] Create `/api/mailchimp.js`
  - [ ] Create `/api/send-email.js`
- [ ] Test locally: `vercel dev`
- [ ] Open http://localhost:3000
- [ ] Test endpoints with Postman or curl
- [ ] Deploy: `vercel --prod`
- [ ] Note the production URL
- [ ] Update frontend if needed

**Time Estimate:** 2-3 hours

---

### 5. Configure Paystack Webhook
- [ ] Go to Paystack Dashboard
- [ ] Settings ? API Keys & Webhooks
- [ ] Click "Webhooks" tab
- [ ] Click "Add Webhook"
- [ ] Enter URL: `https://www.tensectra.com/api/webhooks/paystack`
- [ ] Select events:
  - [x] charge.success
  - [x] refund.processed
- [ ] Save
- [ ] Test webhook with test payment

**Time Estimate:** 10 minutes

---

### 6. Import Email Templates to Mailchimp
- [ ] Go to Mailchimp Dashboard
- [ ] Campaigns ? Email templates
- [ ] Click "Create Template"
- [ ] Choose "Code your own"
- [ ] Copy HTML from `email-templates/welcome-general.html`
- [ ] Paste and save
- [ ] Name it: "Welcome - General Newsletter"
- [ ] Repeat for:
  - [ ] `enrollment-confirmation.html` ? "Enrollment Confirmation"
  - [ ] Create others as needed
- [ ] Test each template by sending to yourself

**Time Estimate:** 30 minutes

---

### 7. Set Up Email Automation in Mailchimp
- [ ] Go to Automations
- [ ] Click "Create" ? "Custom"
- [ ] Create "Welcome Sequence":
  - Trigger: New subscriber to General Newsletter
  - Day 0: Send "Welcome - General Newsletter"
  - Day 3: Send "Introduction to Tensectra"
  - Day 7: Send "Cohort Information"
  - Day 14: Send "Pro Membership Offer"
- [ ] Create "Enrollment Sequence":
  - Trigger: New subscriber with tag "cohort_student"
  - Immediate: Send "Enrollment Confirmation"
  - Day 7: Send "Pre-Cohort Preparation"
- [ ] Create "Pro Member Onboarding":
  - Trigger: New subscriber with tag "pro_member"
  - Immediate: Send "Welcome to Pro"
  - Day 7: Send "Getting Started Guide"
- [ ] Test each automation with test email

**Time Estimate:** 1 hour

---

### 8. Test Complete Payment Flow
- [ ] Open website
- [ ] Click "Enroll" for Backend Cohort
- [ ] Fill out application form
- [ ] Click "Pay Now"
- [ ] Use Paystack test card:
  - Card: 5060 6666 6666 6666 6666
  - CVV: 123
  - Expiry: 12/25
  - PIN: 1234
  - OTP: 123456
- [ ] Complete payment
- [ ] Check you receive confirmation email
- [ ] Check Supabase payments table (should have new row)
- [ ] Check Mailchimp (should be subscribed)
- [ ] Verify Google Analytics tracked payment

**Expected Flow:**
1. Payment popup opens ?
2. Payment succeeds ?
3. Backend verifies ?
4. Database updated ?
5. Email sent ?
6. Mailchimp subscriber added ?
7. GA4 conversion tracked ?

**Time Estimate:** 30 minutes

---

## ?? MEDIUM PRIORITY - Do This Month

### 9. Create Remaining Email Templates
- [ ] `pro-welcome.html` - Pro membership welcome
- [ ] `cohort-welcome.html` - Week 1 kickoff
- [ ] `scholarship-awarded.html` - Scholarship acceptance
- [ ] `scholarship-declined.html` - Scholarship decline (with alternatives)
- [ ] `consultancy-inquiry-received.html` - Consultancy acknowledgment
- [ ] `discovery-call-confirmed.html` - Calendly booking confirmation
- [ ] `invoice.html` - Payment invoice
- [ ] `receipt.html` - Payment receipt
- [ ] `alumni-updates.html` - Monthly alumni digest
- [ ] `pro-member-digest.html` - Pro member monthly content
- [ ] Use templates in `email-templates/` as examples

**Time Estimate:** 2-3 hours

---

### 10. Build Admin Dashboard (Basic)
- [ ] Create `/admin` directory
- [ ] Create `admin/index.html` - Dashboard home
- [ ] Create `admin/applications.html` - Review applications
- [ ] Create `admin/payments.html` - Payment management
- [ ] Create `admin/scholarships.html` - Scholarship approvals
- [ ] Add authentication (Supabase Auth)
- [ ] Create role-based access control
- [ ] Add analytics charts
- [ ] Test full admin workflow

**OR:** Use Supabase Dashboard directly for now

**Time Estimate:** 4-6 hours (or $0 using Supabase)

---

### 11. SEO Optimization
- [ ] Create `sitemap.xml`
- [ ] Create `robots.txt`
- [ ] Add structured data (JSON-LD) to all pages
- [ ] Optimize meta descriptions
- [ ] Add alt text to all images
- [ ] Improve page load speed
- [ ] Submit to Google Search Console
- [ ] Submit to Bing Webmaster Tools
- [ ] Create content blog (optional)
- [ ] Build backlinks

**Time Estimate:** 2-3 hours

---

### 12. Light/Dark Mode Toggle (Optional)
- [ ] Create `js/theme-toggle.js`
- [ ] Add toggle button to navbar
- [ ] Create CSS variables for light theme
- [ ] Save preference to localStorage
- [ ] Respect system preference
- [ ] Smooth transition animation
- [ ] Test all pages in both modes

**Time Estimate:** 2-3 hours

---

## ?? LOW PRIORITY - Future Enhancements

### 13. Live Chat Integration
**Option A: Tawk.to (Free)**
- [ ] Sign up at tawk.to
- [ ] Create property
- [ ] Copy widget code
- [ ] Add to all pages
- [ ] Customize appearance
- [ ] Set up mobile app

**Option B: WhatsApp Business**
- [ ] Create WhatsApp Business account
- [ ] Get WhatsApp Business API access
- [ ] Add click-to-chat button
- [ ] Create auto-responses
- [ ] Set business hours

**Time Estimate:** 1-2 hours

---

### 14. Custom CRM
- [ ] Design database schema
- [ ] Create contacts table
- [ ] Create leads table
- [ ] Create deals/pipeline table
- [ ] Build frontend UI
- [ ] Add filtering and search
- [ ] Create kanban board
- [ ] Add email integration
- [ ] Add payment integration
- [ ] Add reporting dashboard

**OR:** Use existing CRM (HubSpot Free, Zoho CRM)

**Time Estimate:** 20-40 hours (or $0 using HubSpot)

---

## ?? PROGRESS TRACKING

Mark items as you complete them. Update this regularly.

### Overall Progress:
- **Critical Items:** ???????? (0/8 completed)
- **High Priority:** ????? (0/5 completed)
- **Medium Priority:** ???? (0/4 completed)
- **Low Priority:** ?? (0/2 completed)

**Total: 0/19 tasks completed (0%)**

---

## ?? WEEKLY GOALS

### Week 1: Foundation
- [ ] Complete all Critical items (1-3)
- [ ] Test everything works
- [ ] Get first test payment through

### Week 2: Backend
- [ ] Build all API endpoints (4)
- [ ] Configure webhooks (5)
- [ ] Set up email automation (6-7)
- [ ] Test complete flow (8)

### Week 3: Polish
- [ ] Create remaining templates (9)
- [ ] Optimize SEO (11)
- [ ] Launch first cohort!

### Week 4: Scale
- [ ] Build admin dashboard (10)
- [ ] Add live chat (13)
- [ ] Plan custom CRM (14)

---

## ?? BLOCKERS / HELP NEEDED

Use this section to track issues:

| Issue | Description | Status | Solution |
|-------|-------------|--------|----------|
| - | - | - | - |

---

## ?? NOTES

Use this space for notes as you work:

**Date:** _______
**What I did:**

**Date:** _______
**What I did:**

---

## ? DEFINITION OF DONE

You can consider implementation complete when:

- [x] All scripts load without errors
- [ ] Google Analytics tracking all events
- [ ] Prices display in correct currency
- [ ] Scholarship numbers update dynamically
- [ ] Payment flow works end-to-end
- [ ] User receives confirmation email
- [ ] User added to Mailchimp automatically
- [ ] Admin can see payment in database
- [ ] Complete user journey tested
- [ ] Website live at www.tensectra.com
- [ ] First cohort enrolled
- [ ] Revenue generated!

**Current Status:** 10% complete
**Target: 100% in 2-3 weeks**

---

## ?? SUPPORT

If stuck on any item:

1. Check relevant documentation file:
   - IMPLEMENTATION_GUIDE.md
   - API_ENDPOINTS_SPEC.md
   - PRICING_STRATEGY.md
   - QUICK_START_TESTING.md

2. Check external docs:
   - Paystack: https://paystack.com/docs
   - Mailchimp: https://mailchimp.com/developer
   - Supabase: https://supabase.com/docs
   - Resend: https://resend.com/docs

3. Test in isolation before integrating

4. Use browser DevTools to debug

---

## ?? CELEBRATE WINS

Mark your milestones:

- [ ] First successful local test
- [ ] Database deployed
- [ ] First API endpoint working
- [ ] First test payment successful
- [ ] First real payment received
- [ ] First student enrolled
- [ ] First cohort completed
- [ ] First $1,000 revenue
- [ ] First $10,000 revenue

**You got this! ??**

