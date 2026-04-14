/**
 * POST /api/send-email
 * Admin-only endpoint. Sends an email from a chosen template to a chosen recipient.
 * Used by the admin panel "Send Email" modal.
 *
 * Body: {
 *   to_email    : string  -- recipient email
 *   to_name     : string  -- recipient first name (for {{name}} substitution)
 *   template_key: string  -- key from TEMPLATES below
 *   extra_html  : string  -- optional extra HTML appended before footer (admin edits in UI)
 * }
 */

import { sendMail, validateMailConfig } from './_mailer.js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY;

// ---------------------------------------------------------------------------
// Verify the request comes from a logged-in admin
// ---------------------------------------------------------------------------
async function verifyAdmin(token) {
  if (!token) return null;
  const userRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${token}` }
  });
  if (!userRes.ok) return null;
  const user = await userRes.json();
  if (!user?.email) return null;
  const adminRes = await fetch(
    `${SUPABASE_URL}/rest/v1/admin_users?email=eq.${encodeURIComponent(user.email)}&active=eq.true&select=email,role,name&limit=1`,
    { headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` } }
  );
  if (!adminRes.ok) return null;
  const rows = await adminRes.json();
  return rows[0] || null;
}

// ---------------------------------------------------------------------------
// Shared HTML shell (same style as notify.js)
// ---------------------------------------------------------------------------
function shell(heroBg, heroHtml, bodyHtml) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<style>
  * { box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Inter', Arial, sans-serif; background: #050A14; margin: 0; padding: 0; }
  .w { max-width: 600px; margin: 0 auto; padding: 40px 16px; }
  .card { background: #0A1628; border: 1px solid #0D2040; border-radius: 12px; overflow: hidden; }
  .logo { padding: 20px 28px; border-bottom: 1px solid #0D2040; font-size: .9rem; font-weight: 700; color: #00CCFF; letter-spacing: .15em; }
  .hero { padding: 28px; background: ${heroBg}; }
  .body { padding: 32px 28px; }
  h2 { margin: 0 0 8px; font-size: 1.35rem; color: #fff; }
  p { font-size: 14px; line-height: 1.8; color: #8892A0; margin: 0 0 14px; }
  .hi { color: #E6EDF3; }
  .cta { display: inline-block; font-weight: 700; padding: 13px 28px; border-radius: 8px; text-decoration: none; font-size: 14px; margin: 8px 0; background: #00CCFF; color: #050A14; }
  .note { background: #0D1B2A; border-left: 3px solid #F59E0B; border-radius: 0 8px 8px 0; padding: 13px 16px; margin: 14px 0; }
  .note p { color: #F59E0B; margin: 0; font-size: 12px; }
  hr { border: none; border-top: 1px solid #0D2040; margin: 20px 0; }
  .foot { text-align: center; padding: 16px; background: #060E1A; border-top: 1px solid #0D2040; color: #4A5568; font-size: 11px; }
  .foot a { color: #00CCFF; text-decoration: none; }
</style>
</head>
<body>
<div class="w">
  <div class="card">
    <div class="logo">TENSECTRA</div>
    <div class="hero">${heroHtml}</div>
    <div class="body">${bodyHtml}</div>
    <div class="foot">
      <p>Tensectra &middot; <a href="https://tensectra.com">tensectra.com</a> &middot; hello@tensectra.com</p>
    </div>
  </div>
</div>
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// Template definitions
// {{name}} is replaced with the recipient's first name before sending.
// extra_html from admin is appended inside .body before the footer.
// ---------------------------------------------------------------------------
const TEMPLATES = {

  'community-invite': {
    label:   'Community Group Invite',
    subject: 'Join the Tensectra developer community',
    build: (first) => shell(
      '#0A1628',
      `<h2 style="color:#00CCFF;margin:0">You are in.</h2>`,
      `<p class="hi">Hey ${first} &#128075;</p>
       <p>I saw you filled the Tensectra waitlist - appreciate that.</p>
       <p>I am adding you to our developer community group where I share architecture insights,
          AI workflow tips, and updates on the cohort before they go public.</p>
       <p>It is a small group intentionally. No spam, no noise. Just useful things for
          developers who are serious about levelling up.</p>
       <a href="https://bit.ly/3OnYYjz" class="cta">Join the Community Group</a>
       <div class="note">
         <p><strong>One thing - when you join:</strong> Drop a message with your <strong>name</strong>,
            what you are currently <strong>building or working on</strong>, and the
            <strong>one thing you wish you understood better</strong> about your codebase.
            It helps me know who is in the room.</p>
       </div>
       <p>See you inside.</p>
       <p style="color:#E6EDF3;font-weight:600">
         - Ayodele<br>
         <span style="font-weight:400;color:#6E7D9A;font-size:12px">Founder, Tensectra</span>
       </p>`
    )
  },

  'send-pay-link': {
    label:   'Send Payment Link',
    subject: 'Your payment link from Tensectra',
    build: (first) => shell(
      '#00CCFF',
      `<h2 style="color:#050A14;margin:0">Your payment link is ready, ${first}.</h2>`,
      `<p class="hi">Hey ${first},</p>
       <p>Please use the link below to complete your payment. If you have any questions,
          reply to this email and we will sort it out.</p>
       <p style="color:#6E7D9A;font-size:13px">Your payment link and details will be added here by the admin before sending.</p>
       <hr>
       <p style="font-size:12px;color:#6E7D9A">
         Questions? Write to <a href="mailto:hello@tensectra.com" style="color:#00CCFF">hello@tensectra.com</a>
       </p>`
    )
  },

  'acceptance': {
    label:   'Cohort Acceptance',
    subject: 'You have been accepted into the Tensectra Cohort',
    build: (first) => shell(
      '#00CCFF',
      `<h2 style="color:#050A14;margin:0">Congratulations, ${first}! You are accepted.</h2>`,
      `<p class="hi">Hey ${first},</p>
       <p>We have reviewed your application and we are pleased to offer you a spot in the
          upcoming Tensectra cohort.</p>
       <p>Your next step is to complete your enrolment by making payment. We will send you
          the payment link separately.</p>
       <hr>
       <p style="font-size:12px;color:#6E7D9A">
         Questions? Write to <a href="mailto:hello@tensectra.com" style="color:#00CCFF">hello@tensectra.com</a>
       </p>`
    )
  },

  'rejection': {
    label:   'Application Not Successful',
    subject: 'Your Tensectra application update',
    build: (first) => shell(
      'linear-gradient(135deg,#0D1B2A,#1a1a2e)',
      `<h2 style="color:#fff;margin:0">Application Update</h2>`,
      `<p class="hi">Hey ${first},</p>
       <p>Thank you for applying to the Tensectra cohort. After careful review, we are
          not able to offer you a spot in this cohort.</p>
       <p>This does not mean you are not good enough. Cohort spots are limited and we
          make difficult decisions. We encourage you to apply again for the next cohort.</p>
       <p>In the meantime, our self-paced materials and community group are available to
          help you continue building.</p>
       <a href="https://tensectra.com/pages/courses" class="cta" style="background:#7B2FFF;color:#fff">
         Explore Self-Paced Options
       </a>
       <hr>
       <p style="font-size:12px;color:#6E7D9A">
         Questions? Write to <a href="mailto:hello@tensectra.com" style="color:#00CCFF">hello@tensectra.com</a>
       </p>`
    )
  },

  'follow-up': {
    label:   'General Follow-up',
    subject: 'Following up from Tensectra',
    build: (first) => shell(
      '#0A1628',
      `<h2 style="color:#00CCFF;margin:0">Quick follow-up, ${first}.</h2>`,
      `<p class="hi">Hey ${first},</p>
       <p>Just following up on your recent enquiry with us. We want to make sure you have
          everything you need.</p>
       <p style="color:#6E7D9A;font-size:13px">The admin will add specific details before sending.</p>
       <hr>
       <p style="font-size:12px;color:#6E7D9A">
         Reply to this email or write to
         <a href="mailto:hello@tensectra.com" style="color:#00CCFF">hello@tensectra.com</a>
       </p>`
    )
  }

};

// ---------------------------------------------------------------------------
// Handler -- single export default
// ---------------------------------------------------------------------------
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST')   return res.status(405).json({ error: 'Method not allowed' });

  try {

    // 1. Auth check
    const token = (req.headers.authorization || '').replace('Bearer ', '').trim();
    const admin = await verifyAdmin(token);
    if (!admin) return res.status(403).json({ error: 'Not authorised as admin' });

    // 2. Email config check
    try { validateMailConfig(); } catch (err) {
      return res.status(500).json({ error: err.message });
    }

    // 3. Validate body
    const { to_email, to_name, template_key, extra_html = '' } = req.body || {};

    if (!to_email || !template_key) {
      return res.status(400).json({ error: 'Missing required fields: to_email, template_key' });
    }

    const tpl = TEMPLATES[template_key];
    if (!tpl) {
      return res.status(400).json({
        error: 'Unknown template_key: "' + template_key + '"',
        available: Object.keys(TEMPLATES)
      });
    }

    // 4. Build HTML
    const first = (to_name || to_email.split('@')[0]).split(' ')[0];
    let   html  = tpl.build(first);

    // Inject any extra HTML the admin typed, right before the footer
    if (extra_html && extra_html.trim()) {
      html = html.replace(
        '<div class="foot">',
        '<div class="body" style="padding-top:0;border-top:1px solid #0D2040">' + extra_html + '</div><div class="foot">'
      );
    }

    // 5. Send
    await sendMail({ to: to_email, subject: tpl.subject, html });
    console.log('[send-email] Sent "' + template_key + '" to ' + to_email + ' by ' + admin.email);
    return res.status(200).json({ ok: true, template: template_key, to: to_email });

  } catch (err) {
    console.error('[send-email] Unhandled error:', err.message);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
