# Tensectra Email Templates

This directory contains all email templates used in Mailchimp campaigns and automated sequences.

## Email Lists

### 1. General Newsletter
- **Purpose**: Monthly updates, blog posts, industry insights
- **Frequency**: Monthly
- **Template**: `newsletter-monthly.html`

### 2. Pro Members
- **Purpose**: Exclusive content for Pro members
- **Frequency**: Monthly digest
- **Template**: `pro-member-digest.html`

### 3. Course Alumni
- **Purpose**: Alumni updates, job board, community events
- **Frequency**: Bi-weekly
- **Template**: `alumni-updates.html`

### 4. Infrastructure Kit Waitlist
- **Purpose**: Product updates and launch notifications
- **Frequency**: As needed
- **Template**: `waitlist-update.html`

### 5. Leads
- **Purpose**: Nurture sequence for general inquiries
- **Frequency**: Drip campaign
- **Templates**: `lead-welcome.html`, `lead-nurture-*.html`

## Automation Workflows

### Welcome Sequence (General Newsletter)
1. **Day 0**: Welcome email (`welcome-general.html`)
2. **Day 3**: Introduction to Tensectra (`intro-tensectra.html`)
3. **Day 7**: Cohort information (`cohort-info.html`)
4. **Day 14**: Pro membership offer (`pro-offer.html`)

### Course Enrollment Sequence
1. **Immediate**: Enrollment confirmation (`enrollment-confirmation.html`)
2. **Day -7**: Pre-cohort preparation (`pre-cohort-prep.html`)
3. **Day 0**: Welcome to cohort (`cohort-welcome.html`)
4. **Weekly**: Progress check-ins (`cohort-week-*.html`)
5. **Day 42**: Completion certificate (`cohort-completion.html`)

### Pro Member Onboarding
1. **Immediate**: Welcome to Pro (`pro-welcome.html`)
2. **Day 1**: Getting started guide (`pro-getting-started.html`)
3. **Day 7**: First week check-in (`pro-check-in.html`)
4. **Monthly**: Pro digest (`pro-member-digest.html`)

### Payment Followup
1. **Immediate**: Payment confirmation (`payment-confirmation.html`)
2. **Day 1**: Access details (`access-details.html`)
3. **Day 3**: Getting started (`getting-started.html`)

## Transactional Emails

- `scholarship-application-received.html` - Scholarship application confirmation
- `scholarship-awarded.html` - Scholarship acceptance
- `scholarship-declined.html` - Scholarship decline (with alternatives)
- `consultancy-inquiry-received.html` - Consultancy inquiry confirmation
- `discovery-call-confirmed.html` - Calendly booking confirmation
- `invoice.html` - Payment invoice
- `receipt.html` - Payment receipt

## Tags Used in Mailchimp

- `lead` - General inquiry
- `waitlist` - On waitlist for product
- `cohort_student` - Enrolled in cohort
- `pro_member` - Pro membership active
- `alumni` - Completed cohort
- `scholarship` - Scholarship applicant
- `paid` - Has made payment
- `nigeria`, `ghana`, etc. - Location-based tags

## Merge Tags

Available in all templates:
- `*|FNAME|*` - First name
- `*|EMAIL|*` - Email address
- `*|COHORT|*` - Cohort name (if applicable)
- `*|COURSE|*` - Course type (backend/frontend/mobile)
- `*|PRICE|*` - Price in local currency
- `*|CURRENCY|*` - Currency symbol

## Styling Guidelines

- Use dark mode (#1a1a1a background, white text)
- Brand color: #00CCFF (cyan)
- Secondary color: #FFD700 (gold)
- Font: System fonts (Arial, Helvetica, sans-serif)
- Mobile-responsive
- Max width: 600px
- Padding: 20px

## Testing

Before sending:
1. Test with Mailchimp preview
2. Send test to multiple email clients
3. Check mobile responsiveness
4. Verify all merge tags populate correctly
5. Test all links
