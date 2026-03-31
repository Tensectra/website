# PAYMENT LINK QUICK REFERENCE

Use these URL templates when sending payment links to users:

---

## 1. COHORT PAYMENT LINK

**Template:**
```
https://www.tensectra.com/payment/cohort.html?email=USER_EMAIL&course=COURSE_ID&ref=APPLICATION_ID&name=USER_NAME
```

**Example:**
```
https://www.tensectra.com/payment/cohort.html?email=john@example.com&course=backend&ref=APP-12345&name=John%20Doe
```

**Parameters:**
- `email` (required) - Student's email
- `course` (required) - `backend` | `frontend` | `mobile`
- `ref` (required) - Application ID from database
- `name` (optional) - Pre-fills name field

**When to Send:**
After accepting a cohort application

---

## 2. CONSULTANCY INVOICE PAYMENT LINK

**Template:**
```
https://www.tensectra.com/payment/consultancy.html?invoice=INVOICE_ID&amount=AMOUNT_IN_CENTS&currency=CURRENCY&email=CLIENT_EMAIL&name=CLIENT_NAME&company=COMPANY_NAME&service=SERVICE_NAME
```

**Example:**
```
https://www.tensectra.com/payment/consultancy.html?invoice=INV-2024-001&amount=250000&currency=USD&email=cto@techcorp.com&name=Sarah%20Johnson&company=TechCorp&service=Architecture%20Review
```

**Parameters:**
- `invoice` (required) - Invoice number
- `amount` (required) - Amount in smallest currency unit (cents/kobo)
- `currency` (optional) - USD, NGN, etc. (default: USD)
- `email` (required) - Client email
- `name` (optional) - Client name
- `company` (optional) - Company name
- `service` (optional) - Service description

**When to Send:**
After agreement reached and invoice created

---

## 3. SELF-PACED COURSE/EBOOK PAYMENT LINK

**Template:**
```
https://www.tensectra.com/payment/self-paced.html?product=PRODUCT_ID
```

**Examples:**
```
https://www.tensectra.com/payment/self-paced.html?product=architecture-playbook
https://www.tensectra.com/payment/self-paced.html?product=reference-cards
https://www.tensectra.com/payment/self-paced.html?product=self-paced
```

**Available Products:**
- `architecture-playbook` - Architecture Playbook Bundle ($49)
- `reference-cards` - Reference Card Library ($19)
- `self-paced` - Self-Paced Course Access ($149)

**When to Send:**
Anytime a user wants to purchase digital products

---

## EMAIL TEMPLATES WITH LINKS

### Cohort Acceptance Email
**File:** `email-templates/cohort-acceptance-with-payment-link.txt`

**Replace placeholders:**
```
{{NAME}} - Student name
{{EMAIL}} - Student email
{{COURSE_NAME}} - "Backend Engineer Cohort"
{{COURSE_ID}} - backend|frontend|mobile
{{APPLICATION_ID}} - From database
{{PRICE}} - Price amount
{{CURRENCY}} - NGN, USD, etc.
{{START_DATE}} - Cohort start date
{{END_DATE}} - Cohort end date
{{PRICE_HALF}} - Half price (for installments)
```

---

### Consultancy Invoice Email
**File:** `email-templates/consultancy-invoice-with-payment-link.txt`

**Replace placeholders:**
```
{{INVOICE_NUMBER}} - INV-2024-001
{{CLIENT_NAME}} - Client's name
{{COMPANY_NAME}} - Client's company
{{EMAIL}} - Client email
{{SERVICE_NAME}} - Service provided
{{SERVICE_DESCRIPTION}} - Details
{{AMOUNT}} - Amount (formatted)
{{AMOUNT_CENTS}} - Amount in cents
{{CURRENCY}} - USD, NGN, etc.
{{INVOICE_DATE}} - Today
{{DUE_DATE}} - +15 days
```

---

## HOW TO GENERATE LINKS

### Option 1: Manual (Quick)
1. Copy template above
2. Replace parameters with actual values
3. URL encode spaces (%20)
4. Paste in email

### Option 2: Using JavaScript
```javascript
function generateCohortPaymentLink(email, course, applicationId, name) {
  const baseUrl = 'https://www.tensectra.com/payment/cohort.html';
  const params = new URLSearchParams({
    email: email,
    course: course,
    ref: applicationId,
    name: name
  });
  return `${baseUrl}?${params.toString()}`;
}

// Usage:
const link = generateCohortPaymentLink(
  'john@example.com',
  'backend',
  'APP-12345',
  'John Doe'
);
```

### Option 3: Backend Function (Recommended)
Create a backend function that:
1. Reads application from database
2. Generates payment link
3. Sends email with link
4. Logs action

---

## ADMIN WORKFLOW

### When Student is Accepted:

**1. Update Status in Supabase**
```sql
UPDATE cohort_applications 
SET status = 'accepted',
    reviewed_at = NOW(),
    reviewed_by = 'admin@tensectra.com'
WHERE id = 'APPLICATION_ID';
```

**2. Generate Payment Link**
```
https://www.tensectra.com/payment/cohort.html?email=STUDENT_EMAIL&course=COURSE&ref=APPLICATION_ID&name=STUDENT_NAME
```

**3. Send Email**
- Use template: `cohort-acceptance-with-payment-link.txt`
- Replace all placeholders
- Include payment link
- Send to student

**4. Track**
```sql
-- Optional: Log that link was sent
UPDATE cohort_applications 
SET notes = 'Payment link sent on ' || NOW()::date
WHERE id = 'APPLICATION_ID';
```

---

### When Consultancy Agreement Reached:

**1. Create Invoice Record**
```sql
INSERT INTO invoices (
  invoice_number,
  client_email,
  company,
  amount,
  currency,
  service,
  status
) VALUES (
  'INV-2024-001',
  'client@company.com',
  'TechCorp',
  2500,
  'USD',
  'Architecture Review',
  'pending'
);
```

**2. Generate Payment Link**
```
https://www.tensectra.com/payment/consultancy.html?invoice=INV-2024-001&amount=250000&currency=USD&email=client@company.com&name=Client%20Name&company=TechCorp&service=Architecture%20Review
```

**3. Send Invoice Email**
- Use template: `consultancy-invoice-with-payment-link.txt`
- Replace all placeholders
- Include payment link
- Send to client

---

## TESTING LINKS

### Test Cohort Link:
```
https://www.tensectra.com/payment/cohort.html?email=test@example.com&course=backend&ref=TEST123&name=Test%20User
```

### Test Consultancy Link:
```
https://www.tensectra.com/payment/consultancy.html?invoice=TEST-001&amount=100000&currency=USD&email=test@company.com&name=Test%20Client&company=TestCorp&service=Test%20Service
```

### Test Self-Paced Link:
```
https://www.tensectra.com/payment/self-paced.html?product=architecture-playbook
```

---

## URL ENCODING TIPS

**Spaces ? %20**
```
John Doe ? John%20Doe
```

**Special Characters:**
```
& ? %26
= ? %3D
? ? %3F
/ ? %2F
```

**Easy Way:**
Use `encodeURIComponent()` in JavaScript or URL encoder tools online

---

## TROUBLESHOOTING

### Link doesn't work?
- ? Check all required parameters present
- ? Check spelling of parameter names
- ? Ensure URL is properly encoded
- ? Test in incognito mode

### Payment page shows error?
- ? Verify course/product ID is valid
- ? Check amount format (cents not dollars)
- ? Ensure currency code is correct

### Email not received?
- ? Check spam folder
- ? Verify email address correct
- ? Check email service logs
- ? Try different email provider

---

## SHORTCUT LINKS (For Social/Marketing)

Create short links using bit.ly or your own URL shortener:

```
tensectra.com/pay/cohort ? payment/cohort.html
tensectra.com/pay/consult ? payment/consultancy.html
tensectra.com/buy/playbook ? payment/self-paced.html?product=architecture-playbook
```

---

## ANALYTICS TRACKING

All payment pages automatically track:
- Page views
- Payment initiated
- Payment completed
- Payment failed

View in Google Analytics:
1. Go to Events
2. Filter: `payment_`
3. See all payment events

---

## NEXT: AUTOMATE THIS

**Create admin dashboard to:**
1. View pending applications
2. Click "Accept" button
3. Auto-generate and send payment link
4. Track payments
5. Create enrollments

**Tech Stack:**
- Next.js admin panel
- Supabase for data
- SendGrid for emails
- Stripe/Paystack webhooks

See: `API_ENDPOINTS_SPEC.md` for backend implementation

