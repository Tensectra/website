/**
* POST /api/notify
* Supabase Database Webhook receiver. Single export default.
* Uses _mailer.js (dual provider: Resend or Gmail SMTP).
*
* Set EMAIL_PROVIDER=resend or EMAIL_PROVIDER=gmail in environment variables.
* See api/_mailer.js for full setup instructions.
*
* Supabase webhook body: { type, table, schema, record, old_record }
*
* Routes on INSERT:
*   cohort_applications   -> student auto-reply + community invite link + hr.tensectra@gmail.com
*   consultancy_enquiries -> client auto-reply + sales.tensectra@gmail.com
*   contact_submissions   -> tensectra.office@gmail.com (internal only)
*   waitlist_submissions  -> community invite to applicant
*/

import { sendMail, sendMails, validateMailConfig } from './_mailer.js';

// ---------------------------------------------------------------------------
// HTML shell — every email uses this wrapper
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
  .rows { background: #0D1B2A; border: 1px solid #0D2040; border-radius: 8px; padding: 4px 16px; margin: 16px 0; }
  .r { padding: 7px 0; border-bottom: 1px solid #0D2040; font-size: 12px; display: flex; }
  .r:last-child { border-bottom: none; }
  .lbl { color: #6E7D9A; width: 120px; flex-shrink: 0; }
  .val { color: #E6EDF3; font-weight: 500; word-break: break-word; }
  .cta { display: inline-block; font-weight: 700; padding: 13px 28px; border-radius: 8px; text-decoration: none; font-size: 14px; margin: 8px 0; }
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
// Helpers
// ---------------------------------------------------------------------------
function mkRows(pairs) {
  const inner = pairs
    .filter(([, v]) => !!v)
    .map(([l, v]) => `<div class="r"><div class="lbl">${l}</div><div class="val">${v}</div></div>`)
    .join('');
  return inner ? `<div class="rows">${inner}</div>` : '';
}

function mkBtn(label, href, bg, fg) {
  bg = bg || '#00CCFF';
  fg = fg || '#050A14';
  return `<a href="${href}" class="cta" style="background:${bg};color:${fg}">${label}</a>`;
}

function textBlock(label, text, color) {
  if (!text) return '';
  return `<p style="color:${color || '#E6EDF3'};font-weight:700;font-size:12px;margin:14px 0 4px">${label}</p>
          <p style="font-size:13px;color:#aaa;background:#0D1B2A;padding:14px;border-radius:6px;line-height:1.7;border:1px solid #0D2040">${text}</p>`;
}

// ---------------------------------------------------------------------------
// Email builders
// ---------------------------------------------------------------------------

function cohortStudentHtml(r) {
  const names = {
    backend:  'AI-Powered Backend Engineer',
    frontend: 'AI-Powered Frontend Engineer',
    mobile:   'AI-Powered Mobile Builder'
  };
  const course = names[r.course] || r.course || 'Engineering';
  const first  = (r.name || 'there').split(' ')[0];

  return shell(
    '#00CCFF',
    `<h2 style="color:#050A14;margin:0">Application received, ${first}!</h2>
     <p style="color:#003d4d;margin:6px 0 0;font-size:13px">We will review and respond within 48 hours</p>`,
    `<p class="hi">Hey ${first},</p>
     <p>Your application for <strong style="color:#fff">Become an ${course} in 6 Weeks</strong> is in.
        We will get back to you within 48 hours.</p>
     ${mkRows([
       ['Course',      course],
       ['Experience',  r.experience],
       ['Scholarship', r.is_scholarship ? 'Requested' : 'No'],
       ['Location',    [r.city, r.country_name].filter(Boolean).join(', ')]
     ])}
     <p>While you wait, join our developer community group where I share architecture insights
        and cohort updates before they go public.</p>
     ${mkBtn('Join the Community Group', 'https://bit.ly/3OnYYjz')}
     <hr>
     <p style="font-size:12px;color:#6E7D9A">
       Questions? Reply here or write to
       <a href="mailto:hello@tensectra.com" style="color:#00CCFF">hello@tensectra.com</a>
     </p>`
  );
}

function cohortInternalHtml(r) {
  const short = { backend: 'Backend', frontend: 'Frontend', mobile: 'Mobile' };
  const sch   = r.is_scholarship
    ? ' <span style="background:#F59E0B;color:#000;padding:2px 6px;border-radius:4px;font-size:10px;font-weight:700">SCHOLARSHIP</span>'
    : '';
  return shell(
    'linear-gradient(135deg,#1a0050,#7B2FFF)',
    `<h2 style="color:#fff;margin:0">New Application - ${short[r.course] || r.course} Cohort</h2>
     <p style="color:#d5c0ff;margin:6px 0 0;font-size:13px">${r.name || ''}${sch}</p>`,
    mkRows([
      ['Name',        r.name],
      ['Email',       `<a href="mailto:${r.email}" style="color:#00CCFF">${r.email}</a>`],
      ['Phone',       r.phone],
      ['Course',      short[r.course] || r.course],
      ['Experience',  r.experience],
      ['Role',        r.role],
      ['Scholarship', r.is_scholarship ? 'Yes - review needed' : 'No'],
      ['Portfolio',   r.portfolio],
      ['Location',    [r.city, r.country_name].filter(Boolean).join(', ')],
      ['Submitted',   r.submitted_at ? new Date(r.submitted_at).toLocaleString() : '']
    ]) +
    textBlock('Goals',               r.goals) +
    textBlock('Technical Gap',       r.gap) +
    textBlock('Scholarship Reason',  r.scholarship_reason, '#F59E0B') +
    mkBtn('Review in Admin Panel', 'https://tensectra.com/admin/applications', '#7B2FFF', '#fff')
  );
}

function consultancyClientHtml(r) {
  const tiers = {
    '1': 'Corporate Cohort', '2': 'Architecture Workshop',
    '3': 'Architecture Consultation', retainer: 'Architecture Retainer', unsure: 'Consultation (TBD)'
  };
  const service = tiers[r.tier] || r.tier || 'our services';
  const first   = (r.name || 'there').split(' ')[0];
  return shell(
    '#00CCFF',
    `<h2 style="color:#050A14;margin:0">Got it, ${first}. We will be in touch.</h2>`,
    `<p class="hi">Hey ${first},</p>
     <p>Your enquiry has been received. Our team will review it and get back to you within
        <strong style="color:#fff">24-48 hours</strong>.</p>
     ${mkRows([['Service', service], ['Company', r.company], ['Timeline', r.timeline]])}
     <p>Prefer to speak sooner? Book a free 30-minute discovery call.</p>
     ${mkBtn('Book a Discovery Call', 'https://calendly.com/tensectra-office/30min')}
     <hr>
     <p style="font-size:12px;color:#6E7D9A">
       Reply here or write to
       <a href="mailto:hello@tensectra.com" style="color:#00CCFF">hello@tensectra.com</a>
     </p>`
  );
}

function consultancyInternalHtml(r) {
  const tiers = {
    '1': 'Corporate Cohort', '2': 'Architecture Workshop',
    '3': 'Architecture Consultation', retainer: 'Architecture Retainer', unsure: 'TBD'
  };
  return shell(
    'linear-gradient(135deg,#003d4d,#00CCFF)',
    `<h2 style="color:#fff;margin:0">New Consultancy Enquiry</h2>
     <p style="color:#d0f5ff;margin:6px 0 0;font-size:13px">
       ${tiers[r.tier] || r.tier} - ${r.company || 'No company'}
     </p>`,
    mkRows([
      ['Name',      r.name],
      ['Email',     `<a href="mailto:${r.email}" style="color:#00CCFF">${r.email}</a>`],
      ['Company',   r.company],
      ['Role',      r.role],
      ['Service',   tiers[r.tier] || r.tier],
      ['Team Size', r.team_size],
      ['Stack',     r.stack],
      ['Timeline',  r.timeline],
      ['Location',  [r.city, r.country_name].filter(Boolean).join(', ')]
    ]) +
    textBlock('Challenges', r.challenges) +
    mkBtn('Open in Admin Panel', 'https://tensectra.com/admin/consultancy', '#00CCFF', '#050A14')
  );
}

function contactInternalHtml(r) {
  return shell(
    'linear-gradient(135deg,#0D1B2A,#0A2040)',
    `<h2 style="color:#00CCFF;margin:0">${r.name || ''} - ${r.subject || 'General Enquiry'}</h2>`,
    mkRows([
      ['From',     r.name],
      ['Email',    `<a href="mailto:${r.email}" style="color:#00CCFF">${r.email}</a>`],
      ['Subject',  r.subject],
      ['Location', [r.city, r.country_name].filter(Boolean).join(', ')],
      ['Source',   r.source || 'contact form']
    ]) +
    textBlock('Message', r.message) +
    mkBtn(`Reply to ${(r.name || '').split(' ')[0]}`, `mailto:${r.email}`, '#00CCFF', '#050A14')
  );
}

function communityInviteHtml(name) {
  const first = (name || 'there').split(' ')[0];
  return shell(
    '#0A1628',
    `<h2 style="color:#00CCFF;margin:0">You are in.</h2>`,
    `<p class="hi">Hey ${first} &#128075;</p>
     <p>I saw you filled the Tensectra waitlist - appreciate that.</p>
     <p>I am adding you to our developer community group where I share architecture insights,
        AI workflow tips, and updates on the cohort before they go public.</p>
     <p>It is a small group intentionally. No spam, no noise. Just useful things for developers
        who are serious about levelling up.</p>
     ${mkBtn('Join the Community Group', 'https://bit.ly/3OnYYjz')}
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
  );
}

// ---------------------------------------------------------------------------
// Handler — single export default
// ---------------------------------------------------------------------------
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST')   return res.status(405).json({ error: 'Method not allowed' });

  try {
    validateMailConfig();
  } catch (err) {
    console.error('[notify] SMTP config missing:', err.message);
    return res.status(500).json({ error: err.message });
  }

  const { type, table, record } = req.body || {};
  if (type !== 'INSERT' || !table || !record) {
    return res.status(200).json({ ok: true, skipped: true });
  }

  try {
    if (table === 'cohort_applications') {
      const shortMap = { backend: 'Backend', frontend: 'Frontend', mobile: 'Mobile' };
      const short    = shortMap[record.course] || record.course || 'Cohort';
      await sendMails([
        {
          to:      record.email,
          subject: `Application received - ${short} Cohort`,
          html:    cohortStudentHtml(record)
        },
        {
          to:      'hr.tensectra@gmail.com',
          subject: `New Application - ${record.name} - ${short}${record.is_scholarship ? ' [SCHOLARSHIP]' : ''}`,
          html:    cohortInternalHtml(record)
        }
      ]);

    } else if (table === 'consultancy_enquiries') {
      await sendMails([
        {
          to:      record.email,
          subject: `We received your enquiry, ${(record.name || '').split(' ')[0]}`,
          html:    consultancyClientHtml(record)
        },
        {
          to:      'sales.tensectra@gmail.com',
          subject: `New Enquiry - ${record.name}${record.company ? ' - ' + record.company : ''}`,
          html:    consultancyInternalHtml(record)
        }
      ]);

    } else if (table === 'contact_submissions') {
      await sendMail({
        to:      'tensectra.office@gmail.com',
        subject: `New Message - ${record.name}: ${record.subject || 'General'}`,
        html:    contactInternalHtml(record)
      });

    } else if (table === 'waitlist_submissions') {
      await sendMail({
        to:      record.email,
        subject: 'You are on the list - join the Tensectra developer community',
        html:    communityInviteHtml(record.name)
      });
    }

    return res.status(200).json({ ok: true, table });

  } catch (err) {
    console.error('[notify] Send failed:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
