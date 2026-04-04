/**
 * POST /api/send-payment-link
 * Admin action: creates a Paystack payment link and emails it to the client.
 * Mirrors the consultancy-invoice-with-payment-link.txt and
 * cohort-acceptance-with-payment-link.txt templates.
 *
 * Headers: Authorization: Bearer <supabase_jwt>
 * Body: { record_id, record_type, email, name, amount, currency, product_name, note? }
 */

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY;
const PAYSTACK_KEY = process.env.PAYSTACK_SECRET_KEY;
const RESEND_KEY   = process.env.RESEND_API_KEY;
const APP_URL      = process.env.APP_URL || 'https://www.tensectra.com';
const FROM         = 'Tensectra <hello@tensectra.com>';

// ?? Supabase helpers ???????????????????????????????????????????????????????
function sb(path, options = {}) {
  return fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: options.prefer || 'return=representation',
      ...options.headers,
    },
  });
}

async function verifyAdmin(token) {
  const r = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${token}` },
  });
  if (!r.ok) return null;
  const user = await r.json();
  if (!user?.email) return null;
  const check = await sb(`admin_users?email=eq.${encodeURIComponent(user.email)}&active=eq.true&select=email,role,name&limit=1`);
  if (!check.ok) return null;
  const rows = await check.json();
  return rows[0] ? { ...rows[0], jwt_email: user.email } : null;
}

function fmtAmount(amount, currency) {
  const divisor = 100;
  const n = (amount / divisor).toLocaleString('en-NG', { minimumFractionDigits: 0 });
  const sym = { NGN:'?', USD:'$', GHS:'GH?', KES:'KSh', ZAR:'R' };
  return (sym[currency] || currency + ' ') + n;
}

// ?? Email template — matches consultancy-invoice / cohort-acceptance styles ?
function paymentLinkEmail({ type, name, product_name, amount, currency, paymentUrl, note, cohortDetails }) {
  const fmtAmt = fmtAmount(amount, currency);
  const isCohort = type === 'cohort';

  const heroContent = isCohort
    ? `<h1 style="margin:0;font-size:28px;font-weight:bold;color:#000">You're Accepted! Complete Your Enrolment ??</h1>
       <p style="margin:10px 0 0;font-size:16px;color:#003">Your spot is reserved for 48 hours</p>`
    : `<h1 style="margin:0;font-size:28px;font-weight:bold;color:#000">Your Invoice is Ready</h1>
       <p style="margin:10px 0 0;font-size:15px;color:#003">${product_name}</p>`;

  const cohortBox = cohortDetails ? `
    <div style="background:#2a2a2a;border-radius:6px;padding:16px 20px;margin:20px 0;border-left:4px solid #00CCFF">
      <p style="margin:0 0 8px;color:#00CCFF;font-weight:bold;font-size:14px">?? Cohort Details</p>
      <table cellpadding="0" cellspacing="0" border="0"><tbody>
        ${cohortDetails.start_date ? `<tr><td style="color:#888;font-size:13px;width:100px;padding:3px 0">Start Date</td><td style="color:#e6edf3;font-size:13px">${cohortDetails.start_date}</td></tr>` : ''}
        <tr><td style="color:#888;font-size:13px;padding:3px 0">Duration</td><td style="color:#e6edf3;font-size:13px">6 weeks</td></tr>
        <tr><td style="color:#888;font-size:13px;padding:3px 0">Format</td><td style="color:#e6edf3;font-size:13px">Live sessions + self-paced</td></tr>
      </tbody></table>
    </div>` : '';

  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;font-family:Arial,Helvetica,sans-serif;background:#0a0a0a;color:#fff">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#0a0a0a">
<tr><td align="center" style="padding:40px 20px">
<table width="600" cellpadding="0" cellspacing="0" border="0" style="background:#1a1a1a;border-radius:8px;overflow:hidden">
  <tr><td align="center" style="padding:30px 20px;background:linear-gradient(135deg,#1a1a1a,#2a2a2a)">
    <img src="https://www.tensectra.com/images/logo2.png" alt="Tensectra" width="160" style="display:block">
  </td></tr>
  <tr><td align="center" style="padding:32px 24px;background:#00CCFF">${heroContent}</td></tr>
  <tr><td style="padding:36px 30px">
    <p style="font-size:16px;line-height:1.6;color:#ccc;margin:0 0 16px">Hey <strong style="color:#fff">${(name||'').split(' ')[0]}</strong>,</p>
    <p style="font-size:15px;line-height:1.6;color:#ccc;margin:0 0 20px">
      ${isCohort
        ? 'Your application has been reviewed and accepted. Complete your payment to confirm your enrolment.'
        : 'Please find your invoice details below. Click the button to pay online securely.'}
    </p>
    <div style="background:#2a2a2a;border-radius:6px;padding:20px 24px;margin:20px 0;text-align:center;border:1px solid #333">
      <p style="margin:0 0 4px;color:#888;font-size:13px">Amount Due</p>
      <p style="margin:0;font-size:2rem;font-weight:bold;color:#fff;font-family:monospace">${fmtAmt}</p>
      <p style="margin:6px 0 0;color:#888;font-size:13px">${product_name}</p>
    </div>
    ${cohortBox}
    <a href="${paymentUrl}" style="display:block;background:#00CCFF;color:#000;font-weight:bold;padding:16px 32px;border-radius:6px;text-decoration:none;font-size:16px;text-align:center;margin:24px 0">
      ${isCohort ? '? Complete Enrolment' : '?? Pay Invoice'} — ${fmtAmt}
    </a>
    ${note ? `<div style="background:rgba(245,158,11,.1);border-left:3px solid #F59E0B;padding:12px 16px;border-radius:0 6px 6px 0;margin:16px 0">
      <p style="margin:0;color:#F59E0B;font-size:14px"><strong>Note from our team:</strong> ${note}</p>
    </div>` : ''}
    <hr style="border:none;border-top:1px solid #333;margin:24px 0">
    <p style="font-size:13px;color:#555">If the button doesn't work, copy this link: <span style="color:#888;word-break:break-all">${paymentUrl}</span></p>
    ${isCohort ? `<div style="background:#2a2a2a;border-radius:6px;padding:16px 20px;margin:16px 0">
      <p style="margin:0 0 8px;color:#e6edf3;font-weight:bold;font-size:13px">? After payment you'll receive:</p>
      <p style="margin:3px 0;color:#aaa;font-size:13px">• Instant confirmation email</p>
      <p style="margin:3px 0;color:#aaa;font-size:13px">• Discord community invite (within 24 hours)</p>
      <p style="margin:3px 0;color:#aaa;font-size:13px">• Welcome pack + session calendar</p>
      <p style="margin:3px 0;color:#aaa;font-size:13px">• Course platform access</p>
    </div>` : `<p style="font-size:13px;color:#888">Payment terms: Due within 15 days. A receipt will be sent on payment confirmation.</p>`}
    <p style="font-size:13px;color:#555;margin-top:16px">Questions? Reply to this email — <a href="mailto:hello@tensectra.com" style="color:#00CCFF">hello@tensectra.com</a> or <a href="https://calendly.com/tensectra-office/30min" style="color:#00CCFF">book a call</a>.</p>
  </td></tr>
  <tr><td align="center" style="padding:20px;background:#111;color:#555;font-size:12px">
    <p style="margin:0">Tensectra &middot; <a href="https://tensectra.com" style="color:#00CCFF;text-decoration:none">tensectra.com</a></p>
  </td></tr>
</table></td></tr></table></body></html>`;
}

export default async function handler(req, res) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const token = (req.headers.authorization || '').replace('Bearer ', '').trim();
    if (!token) {
      return res.status(401).json({ error: 'Missing Authorization header' });
    }

    const admin = await verifyAdmin(token);
    if (!admin) {
      return res.status(403).json({ error: 'Not authorised as admin' });
    }

    const { record_id, record_type, email, name, amount, currency = 'NGN', product_name, note = '', cohort_details } = req.body || {};
    
    if (!record_id || !record_type || !email || !amount || !product_name) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['record_id', 'record_type', 'email', 'amount', 'product_name']
      });
    }

    // Validate environment variables
    if (!PAYSTACK_KEY || !RESEND_KEY || !SERVICE_KEY) {
      console.error('Missing environment variables:', {
        hasPaystack: !!PAYSTACK_KEY,
        hasResend: !!RESEND_KEY,
        hasSupabase: !!SERVICE_KEY
      });
      return res.status(500).json({ error: 'Server configuration error - missing API keys' });
    }

    // Create Paystack transaction
    const reference = `TEN-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
    
    console.log('[Payment Link] Creating Paystack transaction:', { email, amount, currency, reference });
    
    const psRes = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: { Authorization: `Bearer ${PAYSTACK_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email, amount, currency, reference,
        callback_url: `${APP_URL}/payment/success`,
        metadata: {
          custom_fields: [{ display_name: 'Product', variable_name: 'product', value: product_name }],
          record_id, record_type, product_name, sent_by: admin.email,
          payer_name: name,
        },
      }),
    });
    
    const psData = await psRes.json();
    
    if (!psData.status) {
      console.error('[Payment Link] Paystack error:', psData);
      throw new Error(`Paystack: ${psData.message || 'Unknown error'}`);
    }
    
    const paymentUrl = psData.data.authorization_url;
    console.log('[Payment Link] Paystack URL created:', paymentUrl);

    // Send email
    console.log('[Payment Link] Sending email to:', email);
    
    const emailSubject = record_type === 'cohort'
      ? `You're accepted - complete your enrolment for ${product_name}`
      : `Invoice ready - ${product_name}`;
    
    const emailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: FROM, 
        to: [email],
        subject: emailSubject,
        html: paymentLinkEmail({ type: record_type, name, product_name, amount, currency, paymentUrl, note, cohort_details }),
      }),
    });
    
    if (!emailRes.ok) {
      const emailError = await emailRes.text();
      console.error('[Payment Link] Resend error:', emailError);
      throw new Error(`Email failed: ${emailError}`);
    }
    
    console.log('[Payment Link] Email sent successfully');

    // Update record status + log note
    const table = record_type === 'consultancy' ? 'consultancy_enquiries' : 'cohort_applications';
    const status = record_type === 'consultancy' ? 'proposal_sent' : 'waitlisted';
    
    await sb(`${table}?id=eq.${record_id}`, {
      method: 'PATCH', 
      prefer: 'return=minimal',
      body: JSON.stringify({ 
        status, 
        notes: `Payment link sent ${new Date().toISOString().slice(0,10)} by ${admin.email}. Ref: ${reference}` 
      }),
    });

    // Log payment_link record
    await sb('payment_links', {
      method: 'POST', 
      prefer: 'return=minimal',
      body: JSON.stringify({ 
        record_type, 
        record_id, 
        payer_email: email, 
        payer_name: name, 
        product_name, 
        amount, 
        currency, 
        paystack_reference: reference, 
        paystack_link: paymentUrl, 
        sent_by: admin.email 
      }),
    });

    console.log('[Payment Link] Success!', { reference, email });
    
    return res.status(200).json({ 
      ok: true, 
      paymentUrl, 
      reference,
      message: 'Payment link sent successfully'
    });
    
  } catch (err) {
    console.error('[api/send-payment-link] Error:', err);
    return res.status(500).json({ 
      error: err.message || 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
}

 *
 * Headers:
 *   Authorization: Bearer <supabase_jwt>
 *
 * Body:
 *   record_id     string   UUID of consultancy_enquiry or cohort_application
 *   record_type   string   'consultancy' | 'cohort'
 *   email         string   recipient email
 *   name          string   recipient name
 *   amount        number   amount in smallest currency unit (kobo or cents)
 *   currency      string   'NGN' | 'USD' | 'GHS'
 *   product_name  string   human-readable product name
 *   note          string   optional admin note to include in email
 */

const SUPABASE_URL  = process.env.SUPABASE_URL;
const SERVICE_KEY   = process.env.SUPABASE_SERVICE_ROLE_KEY;
const PAYSTACK_KEY  = process.env.PAYSTACK_SECRET_KEY;
const RESEND_KEY    = process.env.RESEND_API_KEY;
const APP_URL       = process.env.APP_URL || 'https://www.tensectra.com';
const FROM          = 'Tensectra <hello@tensectra.com>';
const CYAN          = '#00CCFF';
const BRAND_BG      = '#050A14';
const CARD_BG       = '#0A1628';

// ?? Helpers ???????????????????????????????????????????????????????????????
function sbFetch(path, options = {}) {
  return fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...options,
    headers: {
      'apikey':        SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'Content-Type':  'application/json',
      'Prefer':        options.prefer || 'return=representation',
      ...options.headers,
    },
  });
}

async function verifyAdminJwt(token) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: {
      'apikey':        SERVICE_KEY,
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!res.ok) return null;
  const { email } = (await res.json()) || {};
  if (!email) return null;

  const check = await sbFetch(`admin_users?email=eq.${encodeURIComponent(email)}&active=eq.true&select=email,role&limit=1`);
  if (!check.ok) return null;
  const rows = await check.json();
  return rows[0] || null;
}

function formatAmount(amount, currency) {
  const divisor = currency === 'NGN' || currency === 'GHS' ? 100 : 100;
  const num = (amount / divisor).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  const symbols = { NGN: '?', USD: '$', GHS: 'GH?', KES: 'KSh', ZAR: 'R' };
  return (symbols[currency] || currency + ' ') + num;
}

function emailHtml({ name, product_name, amount, currency, paymentUrl, note }) {
  const fmtAmt = formatAmount(amount, currency);
  return `<!DOCTYPE html><html><head><meta charset="UTF-8">
<style>
  *{box-sizing:border-box}body{font-family:-apple-system,'Inter',sans-serif;background:${BRAND_BG};margin:0;padding:0}
  .w{max-width:600px;margin:0 auto;padding:40px 16px}
  .card{background:${CARD_BG};border:1px solid #0D2040;border-radius:12px;padding:40px}
  .logo{font-size:1rem;font-weight:700;color:${CYAN};letter-spacing:.15em;margin-bottom:28px}
  h2{color:#fff;font-size:1.5rem;margin:0 0 12px}
  p{color:#8892A0;line-height:1.7;margin:0 0 16px}
  .hi{color:#E6EDF3}
  .amount-box{background:rgba(0,204,255,.06);border:1px solid rgba(0,204,255,.2);border-radius:8px;padding:20px 24px;margin:20px 0;text-align:center}
  .amount{font-size:2.2rem;font-weight:700;color:#fff;font-family:monospace}
  .product{color:#6E7D9A;font-size:.9rem;margin-top:4px}
  .btn{display:block;background:${CYAN};color:#050A14;font-weight:700;padding:16px 32px;border-radius:8px;text-decoration:none;text-align:center;font-size:1.05rem;margin:24px 0}
  .note{background:rgba(245,158,11,.06);border-left:3px solid #F59E0B;padding:12px 16px;border-radius:0 8px 8px 0;margin:16px 0}
  .note p{color:#F59E0B;margin:0;font-size:.9rem}
  hr{border:none;border-top:1px solid #0D2040;margin:24px 0}
  .foot{text-align:center;padding:24px;color:#4A5568;font-size:.8rem}
  .foot a{color:${CYAN};text-decoration:none}
</style></head><body>
<div class="w">
  <div class="card">
    <div class="logo">TENSECTRA</div>
    <h2>Your payment link is ready, ${name.split(' ')[0]}.</h2>
    <p class="hi">Please use the link below to complete your payment. It is unique to you and securely generated.</p>
    <div class="amount-box">
      <div class="amount">${fmtAmt}</div>
      <div class="product">${product_name}</div>
    </div>
    <a href="${paymentUrl}" class="btn">Pay Now — ${fmtAmt}</a>
    ${note ? `<div class="note"><p><strong>Note from our team:</strong> ${note}</p></div>` : ''}
    <hr>
    <p style="font-size:.85rem">If the button above doesn't work, copy and paste this link into your browser:</p>
    <p style="font-size:.8rem;color:#4A5568;word-break:break-all">${paymentUrl}</p>
    <hr>
    <p>Questions? Reply to this email or write to <a href="mailto:hello@tensectra.com" style="color:${CYAN}">hello@tensectra.com</a></p>
  </div>
  <div class="foot"><p>Tensectra · <a href="https://tensectra.com">tensectra.com</a></p></div>
</div></body></html>`;
}

// ?? Main handler ??????????????????????????????????????????????????????????
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  // Auth
  const token = (req.headers.authorization || '').replace('Bearer ', '').trim();
  if (!token) return res.status(401).json({ error: 'Missing Authorization header' });

  const admin = await verifyAdminJwt(token);
  if (!admin) return res.status(403).json({ error: 'Not authorised as admin' });

  const { record_id, record_type, email, name, amount, currency = 'NGN', product_name, note = '' } = req.body || {};
  if (!record_id || !record_type || !email || !amount || !product_name) {
    return res.status(400).json({ error: 'Missing required fields: record_id, record_type, email, amount, product_name' });
  }

  try {
    // Create Paystack payment link
    const reference = `TEN-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
    const paystackRes = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PAYSTACK_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        amount,
        currency,
        reference,
        callback_url: `${APP_URL}/payment/success`,
        metadata: {
          custom_fields: [{ display_name: 'Product', variable_name: 'product', value: product_name }],
          record_id,
          record_type,
          product_name,
          sent_by: admin.email,
        },
      }),
    });

    const paystackData = await paystackRes.json();
    if (!paystackData.status) {
      throw new Error(`Paystack error: ${paystackData.message}`);
    }
    const paymentUrl = paystackData.data.authorization_url;

    // Send email
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: FROM,
        to: [email],
        subject: `Your payment link — ${product_name}`,
        html: emailHtml({ name, product_name, amount, currency, paymentUrl, note }),
      }),
    });

    // Update record status
    const table = record_type === 'consultancy' ? 'consultancy_enquiries' : 'cohort_applications';
    const statusPatch = record_type === 'consultancy'
      ? { status: 'proposal_sent' }
      : { status: 'waitlisted' };
    await sbFetch(`${table}?id=eq.${record_id}`, {
      method: 'PATCH',
      prefer: 'return=minimal',
      body: JSON.stringify({ ...statusPatch, notes: `Payment link sent ${new Date().toISOString()} by ${admin.email}` }),
    });

    // Log in payment_links
    await sbFetch('payment_links', {
      method: 'POST',
      prefer: 'return=minimal',
      body: JSON.stringify({
        record_type, record_id,
        payer_email: email, payer_name: name,
        product_name, amount, currency,
        paystack_reference: reference,
        paystack_link: paymentUrl,
        sent_by: admin.email,
      }),
    });

    return res.status(200).json({ ok: true, paymentUrl, reference });
  } catch (err) {
    console.error('[api/send-payment-link]', err);
    return res.status(500).json({ error: err.message });
  }
}
