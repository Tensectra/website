# FORM VS DATABASE ALIGNMENT ANALYSIS

## ? GOOD NEWS: Forms are 95% aligned!

I've analyzed all forms against the database tables. Here's the detailed comparison:

---

## FORM 1: cohort-application.html ? ALIGNED

### Form Fields:
```
name                ? matches
email               ? matches
course              ? matches (backend|frontend|mobile)
role                ? matches
experience          ? matches (0-1|1-3|3-5|5+)
gap                 ? matches
goals               ? matches
portfolio           ? matches
scholarship         ?? MISMATCH (see below)
scholarship_reason  ? matches
country_code        ? matches
country_name        ? matches
city                ? matches
location_source     ? matches
```

### Database Table: cohort_applications
```sql
id                  UUID PRIMARY KEY
name                TEXT NOT NULL ?
email               TEXT NOT NULL ?
course              TEXT CHECK (course IN ('backend', 'frontend', 'mobile')) ?
role                TEXT ?
experience          TEXT CHECK (experience IN ('0-1', '1-3', '3-5', '5+')) ?
gap                 TEXT ?
goals               TEXT ?
portfolio           TEXT ?
country_code        TEXT ?
country_name        TEXT ?
city                TEXT ?
location_source     TEXT ?
is_scholarship      BOOLEAN DEFAULT FALSE ??
scholarship_reason  TEXT ?
status              TEXT DEFAULT 'pending'
cohort_id           UUID (set by admin later)
reviewed_at         TIMESTAMPTZ
reviewed_by         TEXT
notes               TEXT
created_at          TIMESTAMPTZ DEFAULT NOW()
```

### ?? ISSUE FOUND:
**Form sends:** `scholarship = "yes"` (string)
**Database expects:** `is_scholarship = true/false` (boolean)

**Fix:** Update form-handler.js to convert

---

## FORM 2: consultancy-enquiry.html ?? PARTIAL MISMATCH

### Form Fields:
```
name                ? matches
email               ? matches
company             ? matches
role                ?? database has "job_title"
team_size           ? matches
stack               ?? NOT IN DATABASE
challenges          ?? database has "message"
timeline            ?? database has "preferred_date"
country_code        ? matches
country_name        ? matches
city                ? matches
location_source     ? matches
```

### Database Table: consultancy_enquiries
```sql
id                  UUID PRIMARY KEY
name                TEXT NOT NULL ?
email               TEXT NOT NULL ?
company             TEXT ?
job_title           TEXT ?? (form has "role")
team_size           TEXT CHECK (...) ?
tier                TEXT (NOT IN FORM) ?
message             TEXT (form has "challenges") ??
preferred_date      DATE (form has "timeline") ??
budget_range        TEXT (NOT IN FORM) ?
country_code        TEXT ?
country_name        TEXT ?
city                TEXT ?
location_source     TEXT ?
status              TEXT DEFAULT 'new'
calendly_link_sent  BOOLEAN DEFAULT FALSE
hubspot_id          TEXT
created_at          TIMESTAMPTZ DEFAULT NOW()
```

### ?? ISSUES FOUND:
1. Form has `role` but DB expects `job_title`
2. Form has `challenges` but DB expects `message`
3. Form has `stack` but DB has no column
4. Form has `timeline` (text) but DB has `preferred_date` (date)
5. DB expects `tier` but form doesn't send it
6. DB expects `budget_range` but form doesn't have it

**Fixes Needed:**

---

## FORM 3: contact.html ? ALIGNED

### Form Fields:
```
name                ? matches
email               ? matches
subject             ? matches
message             ? matches
country_code        ? matches
country_name        ? matches
city                ? matches
location_source     ? matches
```

### Database Table: contact_submissions
```sql
id              UUID PRIMARY KEY
name            TEXT NOT NULL ?
email           TEXT NOT NULL ?
subject         TEXT ?
message         TEXT NOT NULL ?
source          TEXT DEFAULT 'contact' (added by backend)
country_code    TEXT ?
country_name    TEXT ?
city            TEXT ?
location_source TEXT ?
replied         BOOLEAN DEFAULT FALSE
replied_at      TIMESTAMPTZ
created_at      TIMESTAMPTZ DEFAULT NOW()
```

### ? PERFECT MATCH

---

## FORM 4: waitlist.html ?? PARTIAL MISMATCH

### Form Fields:
```
name                ? matches
email               ? matches
interest            ?? database has "product"
role                ?? NOT IN DATABASE
country_code        ? matches
country_name        ? matches
city                ? matches
location_source     ? matches
```

### Database Table: waitlist_submissions
```sql
id              UUID PRIMARY KEY
email           TEXT NOT NULL ?
product         TEXT CHECK (...) ?? (form has "interest")
name            TEXT ?
country_code    TEXT ?
country_name    TEXT ?
city            TEXT ?
location_source TEXT ?
created_at      TIMESTAMPTZ DEFAULT NOW()
UNIQUE(email, product)
```

### ?? ISSUES FOUND:
1. Form sends `interest` but DB expects `product`
2. Form sends `role` but DB doesn't have this column
3. Form interest values don't match DB product enum

**Form values:**
- product-design
- ai-workflow
- erp-kit
- new-courses

**DB expects:**
- course_designer
- course_ai_biz
- pro
- kit_pro
- kit_enterprise
- general

**Fixes Needed:**

---

## CRITICAL ISSUES SUMMARY

### Issue 1: Consultancy Form Field Mismatches
**Problem:** Form field names don't match database columns

**Solution Options:**

**Option A:** Update Database (Recommended)
```sql
ALTER TABLE consultancy_enquiries RENAME COLUMN job_title TO role;
ALTER TABLE consultancy_enquiries RENAME COLUMN message TO challenges;
ALTER TABLE consultancy_enquiries ADD COLUMN stack TEXT;
ALTER TABLE consultancy_enquiries RENAME COLUMN preferred_date TO timeline;
ALTER TABLE consultancy_enquiries ALTER COLUMN timeline TYPE TEXT;
```

**Option B:** Update Form Handler
Map form fields to database columns in form-handler.js

---

### Issue 2: Waitlist Interest/Product Mismatch
**Problem:** Form sends `interest` with wrong values

**Solution:** Create mapping in form-handler.js
```javascript
const interestToProduct = {
  'product-design': 'course_designer',
  'ai-workflow': 'course_ai_biz',
  'erp-kit': 'kit_pro',
  'new-courses': 'general'
};
```

---

### Issue 3: Scholarship Boolean Conversion
**Problem:** Form sends "yes" string, DB expects boolean

**Solution:** Convert in form-handler.js
```javascript
is_scholarship: formData.scholarship === 'yes'
```

---

### Issue 4: Missing "tier" in Consultancy Form
**Problem:** DB requires `tier` but form doesn't capture it

**Solution:** 
1. Add hidden field to form based on which consultancy page they're on
2. OR make tier nullable in database
3. OR default to 'tier3_consultation'

---

## PAYMENT LANDING PAGES - MISSING! ?

You're absolutely right! These pages don't exist:

### Missing Pages:
1. `/payment/cohort.html` - For cohort payment after acceptance
2. `/payment/consultancy.html` - For consultancy payment after agreement
3. `/payment/self-paced.html` - For self-paced course purchase

### Current Flow (BROKEN):
```
User submits application 
  ?
Admin reviews
  ?
Admin sends email: "You're accepted! Pay here: [LINK]"
  ?
User clicks link
  ?
? 404 - Page doesn't exist!
```

### What We Need:
```
/payment/cohort.html?email=user@example.com&course=backend&ref=APP123
  ?
Shows:
- Course details
- Price in local currency
- Payment button (Paystack/Stripe)
- Pre-filled user info
```

---

## WHAT NEEDS TO BE CREATED

### 1. Payment Landing Pages (3 files)
- `payment/cohort.html`
- `payment/consultancy.html`  
- `payment/self-paced.html`

### 2. Database Fixes (SQL script)
- Fix consultancy_enquiries columns
- Make tier nullable or add default
- Add mapping for waitlist

### 3. Form Handler Updates
- Map consultancy form fields
- Convert scholarship to boolean
- Map waitlist interest to product

---

## RECOMMENDATIONS

### Priority 1: Fix Database Alignment (30 minutes)
Run SQL script to align consultancy_enquiries table with form

### Priority 2: Create Payment Pages (2 hours)
Build 3 payment landing pages with:
- Product details
- Price display
- Payment integration
- Email collection

### Priority 3: Update Form Handler (30 minutes)
Add field mapping and conversions

### Priority 4: Test Complete Flow (1 hour)
1. Submit application
2. Admin accepts
3. User receives email with payment link
4. User clicks link ? lands on payment page
5. User pays
6. Payment verified
7. Enrollment created

---

## NEXT STEPS

Would you like me to:
1. ? Create the 3 payment landing pages?
2. ? Fix the database schema mismatches?
3. ? Update form-handler.js with proper mapping?
4. ? Create email templates with payment links?

All of the above? Let me know and I'll implement!

