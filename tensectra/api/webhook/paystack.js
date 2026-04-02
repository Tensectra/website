/**
 * POST /api/webhook/paystack
 * Receives charge.success events from Paystack.
 * Verifies HMAC signature ? inserts payment ? sends receipt emails.
 * Matches payment-confirmation.txt and enrollment-confirmation.html templates.
 */

export const config = { api: { bodyParser: false } };

import crypto from 'crypto';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY;
const RESEND_KEY   = process.env.RESEND_API_KEY;
const PAYSTACK_KEY = process.env.PAYSTACK_SECRET_KEY;
const FROM         = 'Tensectra <hello@tensectra.com>';

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

async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.setEncoding('utf8');
    req.on('data', chunk => { raw += chunk; });
    req.on('end', () => resolve(raw));
    req.on('error', reject);
  });
}

function fmtAmount(amount, currency) {
  const n = (amount / 100).toLocaleString('en-NG', { minimumFractionDigits: 0 });
  const sym = { NGN:'?', USD:'$', GHS:'GH?', KES:'KSh', ZAR:'R' };
  return (sym[currency] || currency + ' ') + n;
}

// ?? Receipt email ? client (matches payment-confirmation.txt + enrollment-confirmation.html) ??
function receiptEmail({ name, product_name, product_type, amount, currency, reference, date }) {
  const fmtAmt   = fmtAmount(amount, currency);
  const isCohort = product_type === 'cohort';
  const nextSteps = isCohort ? `
    <div style="background:#2a2a2a;border-radius:6px;padding:16px 20px;margin:20px 0;border-left:4px solid #00CCFF">
      <p style="margin:0 0 10px;color:#00CCFF;font-weight:bold;font-size:14px">What happens next?</p>
      <p style="margin:3px 0;color:#aaa;font-size:13px">? Discord community invite (within 24 hours)</p>
      <p style="margin:3px 0;color:#aaa;font-size:13px">?? Welcome pack + prep materials (7 days before start)</p>
      <p style="margin:3px 0;color:#aaa;font-size:13px">?? Calendar invite for all sessions (48 hours before)</p>
      <p style="margin:3px 0;color:#aaa;font-size:13px">??? Course platform access activated</p>
    </div>` : `
    <div style="background:#2a2a2a;border-radius:6px;padding:16px 20px;margin:20px 0">
      <p style="margin:0 0 6px;color:#e6edf3;font-weight:bold;font-size:13px">What happens next?</p>
      <p style="margin:3px 0;color:#aaa;font-size:13px">? Kickoff call scheduled within 48 hours</p>
      <p style="margin:3px 0;color:#aaa;font-size:13px">?? Project timeline and deliverables sent</p>
      <p style="margin:3px 0;color:#aaa;font-size:13px">?? Weekly progress updates throughout</p>
    </div>`;

  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;font-family:Arial,Helvetica,sans-serif;background:#0a0a0a;color:#fff">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#0a0a0a">
<tr><td align="center" style="padding:40px 20px">
<table width="600" cellpadding="0" cellspacing="0" border="0" style="background:#1a1a1a;border-radius:8px;overflow:hidden">
  <tr><td align="center" style="padding:30px 20px;background:linear-gradient(135deg,#1a1a1a,#2a2a2a)">
    <img src="https://www.tensectra.com/images/logo2.png" alt="Tensectra" width="160" style="display:block">
  </td></tr>
  <tr><td align="center" style="padding:32px 24px;background:#00CCFF">
    <h1 style="margin:0;font-size:28px;font-weight:bold;color:#000">Payment Confirmed ?</h1>
    <p style="margin:8px 0 0;font-size:16px;color:#003">Welcome to Tensectra${isCohort ? ', cohort member!' : '!'}</p>
  </td></tr>
  <tr><td style="padding:36px 30px">
    <p style="font-size:16px;line-height:1.6;color:#ccc;margin:0 0 4px">Hey <strong style="color:#fff">${(name||'').split(' ')[0]}</strong>,</p>
    <p style="font-size:15px;line-height:1.6;color:#ccc;margin:0 0 20px">Your payment has been successfully processed. Here's your receipt.</p>
    <div style="background:#2a2a2a;border-radius:6px;padding:20px 24px;margin:0 0 20px;border:1px solid #333">
      <p style="margin:0 0 12px;color:#00CCFF;font-weight:bold;font-size:13px;text-transform:uppercase;letter-spacing:.05em">Payment Receipt</p>
      <table cellpadding="0" cellspacing="0" border="0" width="100%"><tbody>
        <tr><td style="padding:5px 0;color:#888;font-size:13px;width:140px">Product</td><td style="padding:5px 0;color:#e6edf3;font-size:13px">${product_name}</td></tr>
        <tr><td style="padding:5px 0;color:#888;font-size:13px">Amount</td><td style="padding:5px 0;color:#e6edf3;font-size:15px;font-weight:bold">${fmtAmt}</td></tr>
        <tr><td style="padding:5px 0;color:#888;font-size:13px">Reference</td><td style="padding:5px 0;color:#e6edf3;font-size:12px;font-family:monospace">${reference}</td></tr>
        <tr><td style="padding:5px 0;color:#888;font-size:13px">Date</td><td style="padding:5px 0;color:#e6edf3;font-size:13px">${date}</td></tr>
        <tr><td style="padding:5px 0;color:#888;font-size:13px">Gateway</td><td style="padding:5px 0;color:#e6edf3;font-size:13px">Paystack</td></tr>
      </tbody></table>
    </div>
    ${nextSteps}
    <hr style="border:none;border-top:1px solid #333;margin:24px 0">
    <p style="font-size:13px;color:#555">Keep this email as your official receipt. Questions? <a href="mailto:hello@tensectra.com" style="color:#00CCFF">hello@tensectra.com</a> or <a href="https://calendly.com/tensectra-office/30min" style="color:#00CCFF">book a call</a>.</p>
  </td></tr>
  <tr><td align="center" style="padding:20px;background:#111;color:#555;font-size:12px">
    <p style="margin:0">Tensectra &middot; <a href="https://tensectra.com" style="color:#00CCFF;text-decoration:none">tensectra.com</a></p>
  </td></tr>
</table></td></tr></table></body></html>`;
}

// ?? Internal payment alert ?????????????????????????????????????????????????
function internalEmail({ name, email, product_name, amount, currency, reference, record_type }) {
  const fmtAmt = fmtAmount(amount, currency);
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
<body style="font-family:Arial,sans-serif;background:#0a0a0a;padding:0;margin:0">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#0a0a0a">
<tr><td align="center" style="padding:40px 20px">
<table width="600" cellpadding="0" cellspacing="0" border="0" style="background:#1a1a1a;border-radius:8px;overflow:hidden">
  <tr><td align="center" style="padding:30px 20px;background:linear-gradient(135deg,#1a1a1a,#2a2a2a)">
    <img src="https://www.tensectra.com/images/logo2.png" alt="Tensectra" width="160" style="display:block">
  </td></tr>
  <tr><td align="center" style="padding:28px 24px;background:linear-gradient(135deg,#003d1a,#28C840)">
    <h1 style="margin:0;font-size:26px;font-weight:bold;color:#fff">?? Payment Received</h1>
    <p style="margin:8px 0 0;font-size:16px;color:#b3ffcc">${fmtAmt} from ${name}</p>
  </td></tr>
  <tr><td style="padding:32px 30px">
    <table cellpadding="0" cellspacing="0" border="0" style="background:#2a2a2a;border-radius:6px;padding:16px 20px;width:100%"><tbody>
      <tr><td style="padding:5px 0;color:#888;font-size:13px;width:130px">Customer</td><td style="padding:5px 0;color:#e6edf3;font-size:13px">${name}</td></tr>
      <tr><td style="padding:5px 0;color:#888;font-size:13px">Email</td><td style="padding:5px 0;font-size:13px"><a href="mailto:${email}" style="color:#00CCFF">${email}</a></td></tr>
      <tr><td style="padding:5px 0;color:#888;font-size:13px">Product</td><td style="padding:5px 0;color:#e6edf3;font-size:13px">${product_name}</td></tr>
      <tr><td style="padding:5px 0;color:#888;font-size:13px">Amount</td><td style="padding:5px 0;color:#28C840;font-size:15px;font-weight:bold">${fmtAmt}</td></tr>
      <tr><td style="padding:5px 0;color:#888;font-size:13px">Reference</td><td style="padding:5px 0;color:#e6edf3;font-size:12px;font-family:monospace">${reference}</td></tr>
      <tr><td style="padding:5px 0;color:#888;font-size:13px">Type</td><td style="padding:5px 0;color:#e6edf3;font-size:13px">${record_type||'—'}</td></tr>
    </tbody></table>
    <a href="https://tensectra.com/admin/payments" style="display:inline-block;background:#00CCFF;color:#000;font-weight:bold;padding:12px 28px;border-radius:6px;text-decoration:none;font-size:14px;margin-top:20px">View in Admin Panel</a>
  </td></tr>
  <tr><td align="center" style="padding:20px;background:#111;color:#555;font-size:12px">
    <p style="margin:0">Tensectra · tensectra.com</p>
  </td></tr>
</table></td></tr></table></body></html>`;
}

// ?? Main handler ???????????????????????????????????????????????????????????
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  let rawBody, body;
  try {
    rawBody = await getRawBody(req);
    body    = JSON.parse(rawBody);
  } catch {
    return res.status(400).json({ error: 'Invalid JSON body' });
  }

  // Verify Paystack signature
  const sig  = req.headers['x-paystack-signature'];
  const hash = crypto.createHmac('sha512', PAYSTACK_KEY).update(rawBody).digest('hex');
  if (!sig || hash !== sig) {
    console.warn('[paystack-webhook] Signature mismatch');
    return res.status(401).json({ error: 'Invalid signature' });
  }

  const { event, data } = body;
  if (event !== 'charge.success') return res.status(200).json({ ok: true, event });

  const { reference, customer, amount, currency, metadata = {} } = data;
  const customerName = metadata.payer_name || customer?.name || (customer?.email || '').split('@')[0];
  const productName  = metadata.product_name || 'Tensectra Service';
  const productType  = metadata.record_type  || 'consultancy';
  const recordId     = metadata.record_id;
  const now          = new Date();
  const dateStr      = now.toLocaleDateString('en-GB', { day:'2-digit', month:'long', year:'numeric' });

  try {
    // Idempotency check
    const existing = await sb(`payments?paystack_reference=eq.${encodeURIComponent(reference)}&select=id&limit=1`);
    const existRows = await existing.json();
    if (existRows?.length) return res.status(200).json({ ok: true, msg: 'already processed' });

    // Insert payment record
    const insertRes = await sb('payments', {
      method: 'POST', prefer: 'return=representation',
      body: JSON.stringify({
        paystack_reference: reference,
        payer_name: customerName,
        payer_email: customer.email,
        product_type: productType,
        product_ref: productName,
        amount_cents: amount,
        currency,
        payment_method: 'paystack',
        status: 'succeeded',
        metadata: { ...metadata, paystack_data: { customer, reference } },
      }),
    });
    const [payment] = await insertRes.json();

    // Mark payment_links record as used
    if (metadata.record_id) {
      await sb(`payment_links?record_id=eq.${recordId}&select=id`, {});
      await sb(`payment_links?paystack_reference=eq.${encodeURIComponent(reference)}`, {
        method: 'PATCH', prefer: 'return=minimal',
        body: JSON.stringify({ used_at: now.toISOString() }),
      });
    }

    // Update linked enquiry/application status
    if (recordId && productType) {
      const table     = productType === 'consultancy' ? 'consultancy_enquiries' : 'cohort_applications';
      const newStatus = productType === 'consultancy' ? 'won' : 'accepted';
      await sb(`${table}?id=eq.${recordId}`, {
        method: 'PATCH', prefer: 'return=minimal',
        body: JSON.stringify({ status: newStatus, notes: `Payment confirmed. Ref: ${reference}` }),
      });
    }

    // Send receipt to client
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: FROM, to: [customer.email],
        subject: `Payment confirmed ? — ${productName}`,
        html: receiptEmail({
          name: customerName, product_name: productName,
          product_type: productType, amount, currency, reference, date: dateStr,
        }),
      }),
    });

    // Send internal confirmation
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: FROM, to: ['tensectra.office@gmail.com'],
        subject: `?? Payment received — ${customerName} · ${(amount/100).toLocaleString()} ${currency}`,
        html: internalEmail({ name: customerName, email: customer.email, product_name: productName, amount, currency, reference, record_type: productType }),
      }),
    });

    return res.status(200).json({ ok: true, paymentId: payment?.id });
  } catch (err) {
    console.error('[api/webhook/paystack]', err.message);
    return res.status(500).json({ error: err.message });
  }
}
