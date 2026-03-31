# BACKEND API ENDPOINTS SPECIFICATION

This document specifies the backend APIs needed to complete the Tensectra payment and integration flow.

## Technology Stack Recommendations

### Option 1: Vercel Serverless Functions (RECOMMENDED)
- Already using Vercel (vercel.json exists)
- Node.js/TypeScript
- Zero configuration
- Free tier: 100GB bandwidth, 100k requests/month
- Auto-scales

### Option 2: Netlify Functions
- Similar to Vercel
- Good integration with Netlify Forms
- 125k requests/month free

### Option 3: Dedicated Backend
- Node.js/Express
- Deploy to Railway, Render, or Heroku
- More control, more complexity

**We'll use Vercel Serverless for this spec.**

---

## ENDPOINT 1: Verify Payment

### `POST /api/verify-payment`

**Purpose:** Verify a payment after user completes Paystack/Stripe checkout

**Request Body:**
```json
{
  "reference": "TEN-123456789",
  "gateway": "paystack",
  "email": "user@example.com",
  "product": "Backend Cohort",
  "productType": "cohort"
}
```

**Response:**
```json
{
  "success": true,
  "verified": true,
  "amount": 150000,
  "currency": "NGN",
  "paymentId": "uuid-here",
  "message": "Payment verified successfully"
}
```

**Implementation:**

```javascript
// /api/verify-payment.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { reference, gateway, email, product, productType } = req.body;

  try {
    let paymentData;

    // Verify with payment gateway
    if (gateway === 'paystack') {
      paymentData = await verifyPaystack(reference);
    } else if (gateway === 'stripe') {
      paymentData = await verifyStripe(reference);
    } else {
      return res.status(400).json({ error: 'Invalid gateway' });
    }

    // Check if already verified
    const { data: existing } = await supabase
      .from('payments')
      .select('id')
      .eq(gateway === 'paystack' ? 'paystack_reference' : 'stripe_payment_id', reference)
      .single();

    if (existing) {
      return res.json({ 
        success: true, 
        verified: true,
        message: 'Payment already verified',
        paymentId: existing.id
      });
    }

    // Insert payment record
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        [gateway === 'paystack' ? 'paystack_reference' : 'stripe_payment_id']: reference,
        payer_email: paymentData.email,
        payer_name: paymentData.name,
        product_type: productType,
        product_ref: product,
        amount_cents: paymentData.amount,
        currency: paymentData.currency,
        payment_method: gateway,
        status: 'succeeded'
      })
      .select()
      .single();

    if (paymentError) throw paymentError;

    // Trigger post-payment actions
    await handlePostPayment(payment, productType, email);

    return res.json({
      success: true,
      verified: true,
      amount: payment.amount_cents,
      currency: payment.currency,
      paymentId: payment.id,
      message: 'Payment verified successfully'
    });

  } catch (error) {
    console.error('Payment verification error:', error);
    return res.status(500).json({ 
      error: 'Verification failed',
      message: error.message 
    });
  }
}

async function verifyPaystack(reference) {
  const response = await fetch(
    `https://api.paystack.co/transaction/verify/${reference}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
      }
    }
  );

  const data = await response.json();

  if (!data.status || data.data.status !== 'success') {
    throw new Error('Payment verification failed');
  }

  return {
    email: data.data.customer.email,
    name: data.data.customer.first_name + ' ' + data.data.customer.last_name,
    amount: data.data.amount,
    currency: data.data.currency
  };
}

async function verifyStripe(paymentIntentId) {
  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

  if (paymentIntent.status !== 'succeeded') {
    throw new Error('Payment not successful');
  }

  return {
    email: paymentIntent.receipt_email,
    name: paymentIntent.shipping?.name || 'Customer',
    amount: paymentIntent.amount,
    currency: paymentIntent.currency.toUpperCase()
  };
}

async function handlePostPayment(payment, productType, email) {
  // 1. Send confirmation email
  await sendPaymentConfirmation(payment);

  // 2. Add to Mailchimp
  if (productType === 'cohort') {
    await addToMailchimp(email, payment.payer_name, 'alumni', ['paid', 'cohort_student']);
  } else if (productType === 'pro_monthly' || productType === 'pro_annual') {
    await addToMailchimp(email, payment.payer_name, 'pro', ['paid', 'pro_member']);
  }

  // 3. Update cohort enrollment (if applicable)
  if (productType === 'cohort') {
    await createEnrollment(payment);
  }

  // 4. Update Pro membership (if applicable)
  if (productType === 'pro_monthly' || productType === 'pro_annual') {
    await createProMembership(payment);
  }
}
```

---

## ENDPOINT 2: Paystack Webhook

### `POST /api/webhooks/paystack`

**Purpose:** Receive real-time payment notifications from Paystack

**Headers:**
```
x-paystack-signature: <signature>
```

**Request Body:** (Paystack event object)
```json
{
  "event": "charge.success",
  "data": {
    "id": 123456,
    "status": "success",
    "reference": "TEN-123456789",
    "amount": 15000000,
    "currency": "NGN",
    "customer": {
      "email": "user@example.com",
      "first_name": "John",
      "last_name": "Doe"
    },
    "metadata": {
      "product": "Backend Cohort",
      "product_type": "cohort"
    }
  }
}
```

**Implementation:**

```javascript
// /api/webhooks/paystack.js
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Verify webhook signature
  const hash = crypto
    .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
    .update(JSON.stringify(req.body))
    .digest('hex');

  if (hash !== req.headers['x-paystack-signature']) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  const { event, data } = req.body;

  try {
    if (event === 'charge.success') {
      // Check if payment already processed
      const { data: existing } = await supabase
        .from('payments')
        .select('id')
        .eq('paystack_reference', data.reference)
        .single();

      if (existing) {
        return res.json({ message: 'Already processed' });
      }

      // Insert payment record
      const { data: payment, error } = await supabase
        .from('payments')
        .insert({
          paystack_reference: data.reference,
          payer_email: data.customer.email,
          payer_name: `${data.customer.first_name} ${data.customer.last_name}`,
          product_type: data.metadata.product_type,
          product_ref: data.metadata.product,
          amount_cents: data.amount,
          currency: data.currency,
          payment_method: 'paystack',
          status: 'succeeded',
          metadata: data.metadata
        })
        .select()
        .single();

      if (error) throw error;

      // Trigger post-payment actions
      await handlePostPayment(payment, data.metadata.product_type, data.customer.email);

      return res.json({ message: 'Webhook processed' });
    }

    // Handle refund events
    if (event === 'refund.processed') {
      await supabase
        .from('payments')
        .update({ 
          status: 'refunded',
          refunded_at: new Date().toISOString()
        })
        .eq('paystack_reference', data.transaction_reference);

      return res.json({ message: 'Refund processed' });
    }

    return res.json({ message: 'Event ignored' });

  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).json({ error: error.message });
  }
}
```

**Paystack Webhook Setup:**
1. Go to Paystack Dashboard ? Settings ? Webhooks
2. Add URL: `https://www.tensectra.com/api/webhooks/paystack`
3. Copy webhook secret (not needed - uses API secret)

---

## ENDPOINT 3: Mailchimp Integration

### `POST /api/mailchimp`

**Purpose:** Subscribe users to Mailchimp lists

**Request Body:**
```json
{
  "action": "subscribe",
  "email": "user@example.com",
  "name": "John Doe",
  "list": "general_newsletter",
  "tags": ["lead", "website_signup"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Subscribed successfully"
}
```

**Implementation:**

```javascript
// /api/mailchimp.js
import mailchimp from '@mailchimp/mailchimp_marketing';

mailchimp.setConfig({
  apiKey: process.env.MAILCHIMP_API_KEY,
  server: process.env.MAILCHIMP_SERVER_PREFIX
});

const AUDIENCE_IDS = {
  general_newsletter: process.env.MAILCHIMP_GENERAL_ID,
  pro_members: process.env.MAILCHIMP_PRO_ID,
  course_alumni: process.env.MAILCHIMP_ALUMNI_ID,
  infrastructure_waitlist: process.env.MAILCHIMP_WAITLIST_ID,
  leads: process.env.MAILCHIMP_LEADS_ID
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { action, email, name, list, tags } = req.body;

  try {
    if (action === 'subscribe') {
      const audienceId = AUDIENCE_IDS[list] || AUDIENCE_IDS.general_newsletter;

      // Add subscriber
      const response = await mailchimp.lists.addListMember(audienceId, {
        email_address: email,
        status: 'subscribed',
        merge_fields: {
          FNAME: name?.split(' ')[0] || '',
          LNAME: name?.split(' ').slice(1).join(' ') || ''
        },
        tags: tags || []
      });

      return res.json({ 
        success: true, 
        message: 'Subscribed successfully',
        id: response.id
      });

    } else if (action === 'update_tags') {
      const audienceId = AUDIENCE_IDS.general_newsletter;
      const subscriberHash = crypto
        .createHash('md5')
        .update(email.toLowerCase())
        .digest('hex');

      await mailchimp.lists.updateListMemberTags(audienceId, subscriberHash, {
        tags: tags.map(tag => ({ name: tag, status: 'active' }))
      });

      return res.json({ success: true, message: 'Tags updated' });

    } else {
      return res.status(400).json({ error: 'Invalid action' });
    }

  } catch (error) {
    console.error('Mailchimp error:', error);
    
    // Handle duplicate subscriber (already exists)
    if (error.status === 400 && error.response?.body?.title === 'Member Exists') {
      return res.json({ 
        success: true, 
        message: 'Already subscribed' 
      });
    }

    return res.status(500).json({ 
      error: 'Subscription failed',
      message: error.message 
    });
  }
}
```

---

## ENDPOINT 4: Send Emails

### `POST /api/send-email`

**Purpose:** Send transactional emails (confirmations, receipts, etc.)

**Request Body:**
```json
{
  "template": "payment-confirmation",
  "to": "user@example.com",
  "data": {
    "name": "John Doe",
    "product": "Backend Cohort",
    "amount": "?150,000",
    "reference": "TEN-123456789"
  }
}
```

**Implementation:**

```javascript
// /api/send-email.js
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const TEMPLATES = {
  'payment-confirmation': {
    subject: 'Payment Received - Welcome to Tensectra! ??',
    html: (data) => `
      <h1>Payment Confirmed!</h1>
      <p>Hi ${data.name},</p>
      <p>Your payment of ${data.amount} has been received.</p>
      <p><strong>Reference:</strong> ${data.reference}</p>
      <p>Check your email within 24 hours for Discord invite.</p>
    `
  },
  'enrollment-confirmation': {
    subject: "You're In! Welcome to Tensectra Cohort ??",
    html: (data) => {
      // Load HTML template from email-templates/enrollment-confirmation.html
      // Replace merge tags with data
      return enrollmentTemplate.replace('*|FNAME|*', data.name);
    }
  }
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { template, to, data } = req.body;

  try {
    const emailTemplate = TEMPLATES[template];

    if (!emailTemplate) {
      return res.status(400).json({ error: 'Invalid template' });
    }

    const result = await resend.emails.send({
      from: 'Tensectra <hello@tensectra.com>',
      to: [to],
      subject: emailTemplate.subject,
      html: emailTemplate.html(data)
    });

    return res.json({ 
      success: true, 
      messageId: result.id 
    });

  } catch (error) {
    console.error('Email error:', error);
    return res.status(500).json({ 
      error: 'Failed to send email',
      message: error.message 
    });
  }
}
```

**Email Service Options:**
1. **Resend** (Recommended) - Modern, simple API, free 3,000 emails/month
2. **SendGrid** - Enterprise, complex, free 100 emails/day
3. **Postmark** - Transactional focus, free 100 emails/month
4. **Mailgun** - Powerful, complex, free 5,000 emails/month

---

## Environment Variables Required

Add to `.env`:

```bash
# Supabase
SUPABASE_URL=https://ahcfozfntvqbfgbinxwr.supabase.co
SUPABASE_ANON_KEY=sb_publishable_9t2QGBpQl4yd4H73dkSdlg_9QVNarpS
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Paystack
PAYSTACK_PUBLIC_KEY=pk_test_xxxxx
PAYSTACK_SECRET_KEY=sk_test_xxxxx

# Stripe
STRIPE_PUBLIC_KEY=pk_test_xxxxx
STRIPE_SECRET_KEY=sk_test_xxxxx

# Mailchimp
MAILCHIMP_API_KEY=xxxxx-us1
MAILCHIMP_SERVER_PREFIX=us1
MAILCHIMP_GENERAL_ID=xxxxx
MAILCHIMP_PRO_ID=xxxxx
MAILCHIMP_ALUMNI_ID=xxxxx
MAILCHIMP_WAITLIST_ID=xxxxx
MAILCHIMP_LEADS_ID=xxxxx

# Email (Resend)
RESEND_API_KEY=re_xxxxx

# Application
APP_URL=https://www.tensectra.com
```

---

## Deployment to Vercel

### 1. Install Vercel CLI
```bash
npm i -g vercel
```

### 2. Login
```bash
vercel login
```

### 3. Link Project
```bash
vercel link
```

### 4. Add Environment Variables
```bash
vercel env add PAYSTACK_SECRET_KEY
# Enter value when prompted
# Repeat for all variables
```

### 5. Deploy
```bash
vercel --prod
```

---

## Testing Endpoints

### Test Payment Verification:
```bash
curl -X POST https://www.tensectra.com/api/verify-payment \
  -H "Content-Type: application/json" \
  -d '{
    "reference": "TEN-123456789",
    "gateway": "paystack",
    "email": "test@example.com",
    "product": "Backend Cohort",
    "productType": "cohort"
  }'
```

### Test Mailchimp:
```bash
curl -X POST https://www.tensectra.com/api/mailchimp \
  -H "Content-Type: application/json" \
  -d '{
    "action": "subscribe",
    "email": "test@example.com",
    "name": "Test User",
    "list": "general_newsletter",
    "tags": ["test", "api"]
  }'
```

---

## Security Checklist

- [ ] Verify webhook signatures
- [ ] Use environment variables for secrets
- [ ] Validate all inputs
- [ ] Use HTTPS only
- [ ] Rate limit endpoints
- [ ] Log errors (not sensitive data)
- [ ] Handle duplicate payments
- [ ] Test refund flow
- [ ] Set up monitoring (Sentry, LogRocket)

---

## Complete Payment Flow

```
User clicks "Pay Now"
  ?
Frontend: TensectraPricing.initiatePayment()
  ?
Paystack popup opens
  ?
User completes payment
  ?
Frontend callback: trackPaymentSuccess()
  ?
Call: POST /api/verify-payment
  ?
Backend verifies with Paystack API
  ?
Insert payment record in Supabase
  ?
Send confirmation email
  ?
Add to Mailchimp
  ?
Create enrollment/membership
  ?
Return success to frontend
  ?
Redirect to thank-you page
  ?
[Later] Paystack webhook fires (duplicate check)
```

---

## Next Steps

1. Create `/api` directory in your project
2. Install dependencies:
```bash
npm init -y
npm install @supabase/supabase-js
npm install @mailchimp/mailchimp_marketing
npm install resend
npm install stripe
```

3. Copy endpoint code above into separate files
4. Test locally with `vercel dev`
5. Deploy to Vercel
6. Update frontend to use new endpoints
7. Test complete payment flow
8. Set up Paystack webhook
9. Go live!

