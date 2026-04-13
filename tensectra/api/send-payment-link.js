/**
 * Vercel Serverless Function: POST /api/send-payment-link
 * Creates Paystack payment link and sends email to client
 */

import { sendMail, validateMailConfig } from './_mailer.js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY;
const PAYSTACK_KEY = process.env.PAYSTACK_SECRET_KEY;
const APP_URL      = process.env.APP_URL || 'https://www.tensectra.com';

async function verifyAdmin(token) {
  const userRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: { 
      apikey: SERVICE_KEY, 
      Authorization: `Bearer ${token}` 
    }
  });
  if (!userRes.ok) return null;
  
  const user = await userRes.json();
  if (!user?.email) return null;
  
  const adminRes = await fetch(`${SUPABASE_URL}/rest/v1/admin_users?email=eq.${encodeURIComponent(user.email)}&active=eq.true&select=email,role,name&limit=1`, {
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!adminRes.ok) return null;
  const rows = await adminRes.json();
  return rows[0] || null;
}

function formatAmount(amount, currency) {
  const num = (amount / 100).toLocaleString('en-NG', { minimumFractionDigits: 0 });
  const symbols = { NGN: '\u20A6', USD: '$', GHS: 'GH\u20B5', KES: 'KSh', ZAR: 'R' };
  return (symbols[currency] || currency + ' ') + num;
}

function emailTemplate({ name, product_name, amount, currency, paymentUrl, note, record_type }) {
  const fmtAmount = formatAmount(amount, currency);
  const isCohort = record_type === 'cohort';
  const subject = isCohort 
    ? `You're accepted - complete your enrolment for ${product_name}`
    : `Invoice ready - ${product_name}`;
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; padding: 0; font-family: -apple-system, 'Inter', sans-serif; background: #0a0a0a; color: #fff; }
    .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
    .card { background: #1a1a1a; border: 1px solid #2a2a2a; border-radius: 12px; padding: 40px; }
    .logo { font-size: 1rem; font-weight: 700; color: #00CCFF; letter-spacing: 0.15em; margin-bottom: 24px; }
    h2 { margin: 0 0 12px; font-size: 1.5rem; color: #fff; }
    p { color: #8892A0; line-height: 1.7; margin: 0 0 16px; }
    .amount-box { background: rgba(0,204,255,0.06); border: 1px solid rgba(0,204,255,0.2); border-radius: 8px; padding: 20px; margin: 24px 0; text-align: center; }
    .amount { font-size: 2.2rem; font-weight: 700; color: #fff; font-family: monospace; }
    .product { color: #6E7D9A; font-size: 0.9rem; margin-top: 4px; }
    .btn { display: block; background: #00CCFF; color: #000; font-weight: 700; padding: 16px 32px; border-radius: 8px; text-decoration: none; text-align: center; font-size: 1.05rem; margin: 24px 0; }
    .note { background: rgba(245,158,11,0.06); border-left: 3px solid #F59E0B; padding: 12px 16px; border-radius: 0 8px 8px 0; margin: 16px 0; }
    .note p { color: #F59E0B; margin: 0; font-size: 0.9rem; }
    hr { border: none; border-top: 1px solid #2a2a2a; margin: 24px 0; }
    .footer { text-align: center; padding: 24px; color: #555; font-size: 0.8rem; }
    .footer a { color: #00CCFF; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="logo">TENSECTRA</div>
      <h2>${isCohort ? 'You are accepted!' : 'Your invoice is ready'}</h2>
      <p>Hey ${name.split(' ')[0]},</p>
      <p>${isCohort 
        ? 'Your application has been reviewed and accepted. Complete your payment to confirm your enrolment.'
        : 'Please find your invoice details below. Click the button to pay online securely.'
      }</p>
      <div class="amount-box">
        <div class="amount">${fmtAmount}</div>
        <div class="product">${product_name}</div>
      </div>
      <a href="${paymentUrl}" class="btn">${isCohort ? 'Complete Enrolment' : 'Pay Invoice'} - ${fmtAmount}</a>
      ${note ? `<div class="note"><p><strong>Note from our team:</strong> ${note}</p></div>` : ''}
      <hr>
      <p style="font-size: 0.85rem;">If the button does not work, copy this link: <span style="color:#555;word-break:break-all">${paymentUrl}</span></p>
      <hr>
      <p style="font-size: 0.9rem;">Questions? Reply to this email or contact <a href="mailto:hello@tensectra.com">hello@tensectra.com</a></p>
    </div>
    <div class="footer">
      <p>Tensectra &middot; <a href="https://tensectra.com">tensectra.com</a></p>
    </div>
  </div>
</body>
</html>`;
}

export default async function handler(req, res) {
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

    const { record_id, record_type, email, name, amount, currency = 'NGN', product_name, note = '' } = req.body || {};
    
    if (!record_id || !record_type || !email || !amount || !product_name) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['record_id', 'record_type', 'email', 'amount', 'product_name']
      });
    }

    if (!PAYSTACK_KEY || !SERVICE_KEY) {
      console.error('Missing environment variables');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    try { validateMailConfig(); } catch (err) {
      return res.status(500).json({ error: err.message });
    }

    const reference = `TEN-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
    
    console.log('[Payment] Creating Paystack transaction:', { email, amount, currency });
    
    const paystackRes = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: { 
        Authorization: `Bearer ${PAYSTACK_KEY}`, 
        'Content-Type': 'application/json' 
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
          payer_name: name
        }
      })
    });
    
    const paystackData = await paystackRes.json();
    
    if (!paystackData.status) {
      console.error('[Payment] Paystack error:', paystackData);
      return res.status(500).json({ error: `Paystack: ${paystackData.message || 'Unknown error'}` });
    }
    
    const paymentUrl = paystackData.data.authorization_url;
    console.log('[Payment] Paystack URL created');

    const emailHtml = emailTemplate({ name, product_name, amount, currency, paymentUrl, note, record_type });
    const emailSubject = record_type === 'cohort'
      ? 'You are accepted - complete your enrolment for ' + product_name
      : 'Invoice ready - ' + product_name;

    console.log('[Payment] Sending email to:', email);
    await sendMail({ to: email, subject: emailSubject, html: emailHtml });
    console.log('[Payment] Email sent');

    const table = record_type === 'consultancy' ? 'consultancy_enquiries' : 'cohort_applications';
    const status = record_type === 'consultancy' ? 'proposal_sent' : 'waitlisted';
    
    await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${record_id}`, {
      method: 'PATCH',
      headers: {
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal'
      },
      body: JSON.stringify({ 
        status,
        notes: `Payment link sent ${new Date().toISOString().slice(0,10)} by ${admin.email}. Ref: ${reference}`
      })
    });

    await fetch(`${SUPABASE_URL}/rest/v1/payment_links`, {
      method: 'POST',
      headers: {
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal'
      },
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
      })
    });

    console.log('[Payment] Success!', { reference, email });
    
    return res.status(200).json({ 
      ok: true,
      paymentUrl,
      reference,
      message: 'Payment link sent successfully'
    });
    
  } catch (err) {
    console.error('[Payment] Error:', err);
    return res.status(500).json({ 
      error: err.message || 'Internal server error'
    });
  }
}
