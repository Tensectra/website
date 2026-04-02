/**
 * POST /api/notify
 * Supabase Database Webhook receiver.
 * Triggered on INSERT to: consultancy_enquiries | cohort_applications | contact_submissions
 *
 * Supabase body: { type, table, schema, record, old_record }
 */

const FROM = 'Tensectra <hello@tensectra.com>';

async function send(apiKey, to, subject, html) {
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: FROM, to: [to], subject, html }),
  });
  if (!r.ok) throw new Error(`Resend ${r.status}: ${await r.text()}`);
}

// ?? Shared email shell (matches enrollment-confirmation.html style) ?????????
function shell(heroBg, heroHtml, bodyHtml) {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;font-family:Arial,Helvetica,sans-serif;background:#0a0a0a;color:#fff">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#0a0a0a">
<tr><td align="center" style="padding:40px 20px">
<table width="600" cellpadding="0" cellspacing="0" border="0" style="background:#1a1a1a;border-radius:8px;overflow:hidden">
  <tr><td align="center" style="padding:30px 20px;background:linear-gradient(135deg,#1a1a1a,#2a2a2a)">
    <img src="https://www.tensectra.com/images/logo2.png" alt="Tensectra" width="160" style="display:block">
  </td></tr>
  <tr><td align="center" style="padding:32px 24px;background:${heroBg}">${heroHtml}</td></tr>
  <tr><td style="padding:36px 30px">${bodyHtml}</td></tr>
  <tr><td align="center" style="padding:20px;background:#111;color:#555;font-size:12px">
    <p style="margin:0">Tensectra &middot; <a href="https://tensectra.com" style="color:#00CCFF;text-decoration:none">tensectra.com</a></p>
    <p style="margin:4px 0 0">hello@tensectra.com</p>
  </td></tr>
</table></td></tr></table></body></html>`;
}

function h1(text, color = '#000') {
  return `<h1 style="margin:0;font-size:28px;font-weight:bold;color:${color}">${text}</h1>`;
}
function p(text, color = '#ccc') {
  return `<p style="font-size:15px;line-height:1.7;color:${color};margin:0 0 16px">${text}</p>`;
}
function box(rows) {
  const inner = rows.map(([l, v]) => v
    ? `<tr><td style="padding:6px 0;color:#888;font-size:13px;width:130px">${l}</td>
       <td style="padding:6px 0;color:#e6edf3;font-size:13px">${v}</td></tr>`
    : '').join('');
  return `<table cellpadding="0" cellspacing="0" border="0"
    style="background:#2a2a2a;border-radius:6px;padding:16px 20px;margin:20px 0;width:100%">
    <tbody>${inner}</tbody></table>`;
}
function btn(label, href, bg = '#00CCFF', fg = '#000') {
  return `<a href="${href}" style="display:inline-block;background:${bg};color:${fg};font-weight:bold;
    padding:14px 32px;border-radius:6px;text-decoration:none;font-size:15px;margin:8px 4px 8px 0">${label}</a>`;
}

// ?? CONSULTANCY ? CLIENT ???????????????????????????????????????????????????
function consultancyClientEmail(r) {
  const tiers = { '1':'Corporate Cohort','2':'Architecture Workshop','3':'Architecture Consultation',retainer:'Architecture Retainer',unsure:'Consultation (TBD)' };
  const service = tiers[r.tier] || r.tier || 'our services';
  const first = (r.name || 'there').split(' ')[0];
  return shell(
    '#00CCFF',
    h1(`Got it, ${first}. We'll be in touch.`),
    p('Your enquiry has been received. Our team will review it and get back to you within <strong style="color:#fff">24–48 hours</strong>.') +
    box([['Service', service], ['Company', r.company], ['Timeline', r.timeline]]) +
    p('Prefer to speak sooner? Book a free 30-minute discovery call.') +
    btn('Book a Discovery Call', 'https://calendly.com/tensectra-office/30min') +
    `<hr style="border:none;border-top:1px solid #333;margin:24px 0">` +
    p('Questions? Reply to this email — <a href="mailto:hello@tensectra.com" style="color:#00CCFF">hello@tensectra.com</a>', '#888')
  );
}

// ?? CONSULTANCY ? INTERNAL (sales team) ???????????????????????????????????
function consultancyInternalEmail(r) {
  const tiers = { '1':'Corporate Cohort','2':'Architecture Workshop','3':'Architecture Consultation',retainer:'Architecture Retainer',unsure:'TBD' };
  return shell(
    'linear-gradient(135deg,#003d4d,#00CCFF)',
    h1('New Consultancy Enquiry', '#fff') + `<p style="margin:8px 0 0;color:#d0f5ff;font-size:14px">${tiers[r.tier]||r.tier} — ${r.company||'No company'}</p>`,
    box([
      ['Name',      r.name],
      ['Email',     `<a href="mailto:${r.email}" style="color:#00CCFF">${r.email}</a>`],
      ['Company',   r.company],
      ['Role',      r.role],
      ['Service',   tiers[r.tier]||r.tier],
      ['Team Size', r.team_size],
      ['Stack',     r.stack],
      ['Timeline',  r.timeline],
      ['Location',  [r.city, r.country_name].filter(Boolean).join(', ')],
    ]) +
    (r.challenges ? `<p style="color:#e6edf3;font-weight:bold;font-size:13px;margin:0 0 6px">Challenges:</p><p style="font-size:14px;line-height:1.6;color:#aaa;background:#222;padding:14px;border-radius:6px">${r.challenges}</p>` : '') +
    btn('Open in Admin Panel', 'https://tensectra.com/admin/consultancy', '#00CCFF', '#000')
  );
}

// ?? COHORT APPLICATION ? STUDENT ??????????????????????????????????????????
function cohortStudentEmail(r) {
  const courses = { backend:'AI-Powered Backend Engineer', frontend:'AI-Powered Frontend Engineer', mobile:'AI-Powered Mobile Builder' };
  const course = courses[r.course] || r.course || 'Engineering';
  const first = (r.name || 'there').split(' ')[0];
  return shell(
    '#00CCFF',
    h1(`Application received, ${first}! ??`),
    p(`Your application for <strong style="color:#fff">Become an ${course} in 6 Weeks</strong> is in. We'll review it and get back to you within <strong style="color:#fff">48 hours</strong>.`) +
    `<div style="background:#2a2a2a;border-radius:6px;padding:20px 24px;margin:20px 0;border-left:4px solid #00CCFF">
      <p style="margin:0 0 12px;font-size:15px;color:#e6edf3;font-weight:bold">While you wait — join the community ??</p>
      <p style="margin:0 0 12px;font-size:14px;color:#aaa">This is where we share resources, answer questions, and build in public.</p>
      <a href="https://discord.gg/tensectra" style="display:inline-block;background:#5865F2;color:#fff;font-weight:bold;padding:12px 24px;border-radius:6px;text-decoration:none;font-size:14px;margin:0 8px 8px 0">Join Discord</a>
      <a href="https://wa.me/1234567890" style="display:inline-block;background:#25D366;color:#fff;font-weight:bold;padding:12px 24px;border-radius:6px;text-decoration:none;font-size:14px">Join WhatsApp</a>
    </div>` +
    box([['Course', course], ['Experience', r.experience], ['Scholarship', r.is_scholarship ? '? Requested' : 'No']]) +
    p('Questions? Reply to this email — <a href="mailto:hello@tensectra.com" style="color:#00CCFF">hello@tensectra.com</a>', '#888')
  );
}

// ?? COHORT APPLICATION ? INTERNAL (HR) ????????????????????????????????????
function cohortInternalEmail(r) {
  const courses = { backend:'Backend', frontend:'Frontend', mobile:'Mobile' };
  const scholarship = r.is_scholarship ? ' <span style="background:#F59E0B;color:#000;padding:2px 8px;border-radius:4px;font-size:11px">SCHOLARSHIP</span>' : '';
  return shell(
    'linear-gradient(135deg,#1a0050,#7B2FFF)',
    h1(`New Application — ${courses[r.course]||r.course} Cohort`, '#fff') +
    `<p style="margin:8px 0 0;color:#d5c0ff;font-size:14px">${r.name}${scholarship}</p>`,
    box([
      ['Name',        r.name],
      ['Email',       `<a href="mailto:${r.email}" style="color:#00CCFF">${r.email}</a>`],
      ['Course',      courses[r.course]||r.course],
      ['Experience',  r.experience],
      ['Role',        r.role],
      ['Scholarship', r.is_scholarship ? '? Yes — review needed' : 'No'],
      ['Portfolio',   r.portfolio],
      ['Location',    [r.city, r.country_name].filter(Boolean).join(', ')],
    ]) +
    (r.goals ? `<p style="color:#e6edf3;font-weight:bold;font-size:13px;margin:0 0 6px">Goals:</p><p style="font-size:14px;color:#aaa;background:#222;padding:14px;border-radius:6px;line-height:1.6">${r.goals}</p>` : '') +
    btn('Review in Admin Panel', 'https://tensectra.com/admin/applications', '#7B2FFF', '#fff')
  );
}

// ?? CONTACT ? INTERNAL ????????????????????????????????????????????????????
function contactInternalEmail(r) {
  return shell(
    'linear-gradient(135deg,#1a1a1a,#2a2a2a)',
    h1(`${r.name} — ${r.subject || 'General Enquiry'}`, '#00CCFF'),
    box([
      ['From',    `<a href="mailto:${r.email}" style="color:#00CCFF">${r.name}</a>`],
      ['Email',   r.email],
      ['Subject', r.subject],
      ['Source',  r.source || 'contact form'],
    ]) +
    (r.message ? `<p style="color:#e6edf3;font-weight:bold;font-size:13px;margin:16px 0 6px">Message:</p>
      <p style="font-size:14px;color:#aaa;background:#222;padding:16px;border-radius:6px;line-height:1.6">${r.message}</p>` : '') +
    btn(`Reply to ${(r.name||'').split(' ')[0]}`, `mailto:${r.email}`, '#00CCFF', '#000')
  );
}

// ?? Handler ????????????????????????????????????????????????????????????????
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'RESEND_API_KEY not configured' });

  const { type, table, record } = req.body || {};
  if (type !== 'INSERT' || !table || !record) return res.status(200).json({ ok: true, skipped: true });

  try {
    if (table === 'consultancy_enquiries') {
      await Promise.all([
        send(apiKey, record.email,
          `We received your enquiry, ${(record.name||'').split(' ')[0]}`,
          consultancyClientEmail(record)),
        send(apiKey, 'sales.tensectra@gmail.com',
          `New Enquiry — ${record.name}${record.company ? ' · ' + record.company : ''}`,
          consultancyInternalEmail(record)),
      ]);
    } else if (table === 'cohort_applications') {
      await Promise.all([
        send(apiKey, record.email,
          `Application received — ${record.course} cohort`,
          cohortStudentEmail(record)),
        send(apiKey, 'hr.tensectra@gmail.com',
          `New Application — ${record.name} · ${record.course}${record.is_scholarship ? ' ?' : ''}`,
          cohortInternalEmail(record)),
      ]);
    } else if (table === 'contact_submissions') {
      await send(apiKey, 'tensectra.office@gmail.com',
        `New Message — ${record.name}: ${record.subject || 'General'}`,
        contactInternalEmail(record));
    }
    return res.status(200).json({ ok: true, table });
  } catch (err) {
    console.error('[api/notify]', err.message);
    return res.status(500).json({ error: err.message });
  }
}

 *   - consultancy_enquiries
 *   - cohort_applications
 *   - contact_submissions
 *
 * Body shape from Supabase:
 *   { type: "INSERT", table: "table_name", schema: "public", record: {...}, old_record: null }
 */

const FROM     = 'Tensectra <hello@tensectra.com>';
const BRAND_BG = '#050A14';
const CARD_BG  = '#0A1628';
const CYAN     = '#00CCFF';

async function sendEmail(apiKey, { to, subject, html }) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from: FROM, to: Array.isArray(to) ? to : [to], subject, html }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Resend error ${res.status}: ${err}`);
  }
  return res.json();
}

// ?? Email base wrapper ??????????????????????????????????????????????????????
function wrap(body) {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8">
<style>
  *{box-sizing:border-box}body{font-family:-apple-system,BlinkMacSystemFont,'Inter',sans-serif;background:${BRAND_BG};margin:0;padding:0}
  .w{max-width:600px;margin:0 auto;padding:40px 16px}
  .card{background:${CARD_BG};border:1px solid #0D2040;border-radius:12px;padding:40px}
  .logo{font-size:1rem;font-weight:700;color:${CYAN};letter-spacing:.15em;margin-bottom:28px}
  h2{color:#fff;font-size:1.5rem;margin:0 0 12px}
  p{color:#8892A0;line-height:1.7;margin:0 0 16px}
  .hi{color:#E6EDF3}
  .btn{display:inline-block;background:${CYAN};color:#050A14;font-weight:700;padding:14px 32px;border-radius:8px;text-decoration:none;margin:20px 0}
  hr{border:none;border-top:1px solid #0D2040;margin:24px 0}
  .row{margin-bottom:8px}
  .lbl{color:#6E7D9A;font-size:.85rem}
  .val{color:#E6EDF3;font-size:.9rem;font-weight:500}
  .badge{display:inline-block;background:rgba(0,204,255,.1);color:${CYAN};border:1px solid rgba(0,204,255,.3);padding:3px 12px;border-radius:99px;font-size:.75rem;font-weight:600;margin-bottom:16px}
  .foot{text-align:center;padding:24px;color:#4A5568;font-size:.8rem}
  .foot a{color:${CYAN};text-decoration:none}
</style></head><body>
<div class="w">
  <div class="card">
    <div class="logo">TENSECTRA</div>
    ${body}
  </div>
  <div class="foot"><p>Tensectra · <a href="https://tensectra.com">tensectra.com</a></p>
  <p>hello@tensectra.com</p></div>
</div></body></html>`;
}

function field(label, value) {
  if (!value) return '';
  return `<div class="row"><div class="lbl">${label}</div><div class="val">${value}</div></div>`;
}

// ?? Template: Consultancy ? Client ?????????????????????????????????????????
function tplConsultancyClient(r, tierName) {
  return wrap(`
    <div class="badge">ENQUIRY RECEIVED</div>
    <h2>We'll be in touch soon, ${r.name.split(' ')[0]}.</h2>
    <p class="hi">Thank you for reaching out about our <strong style="color:#E6EDF3">${tierName}</strong> service. We've received your enquiry and our team will review it within <strong style="color:#E6EDF3">24–48 hours</strong>.</p>
    <p>In the meantime, you're welcome to book a free 30-minute discovery call to get started immediately.</p>
    <a href="https://calendly.com/tensectra-office/30min" class="btn">Book a Discovery Call</a>
    <hr>
    <p style="font-size:.85rem"><strong style="color:#E6EDF3">Your enquiry summary</strong></p>
    ${field('Service', tierName)}
    ${field('Company', r.company)}
    ${field('Timeline', r.timeline)}
    <hr>
    <p>Questions? Reply to this email or write to <a href="mailto:hello@tensectra.com" style="color:${CYAN}">hello@tensectra.com</a></p>
  `);
}

// ?? Template: Consultancy ? Internal ??????????????????????????????????????
function tplConsultancyInternal(r, tierName) {
  const adminUrl = 'https://tensectra.com/admin/consultancy';
  return wrap(`
    <div class="badge">NEW ENQUIRY · SALES</div>
    <h2>${r.name}${r.company ? ' · ' + r.company : ''}</h2>
    <p>A new consultancy enquiry has been submitted.</p>
    <hr>
    ${field('Name', r.name)}
    ${field('Email', r.email)}
    ${field('Company', r.company)}
    ${field('Role', r.role)}
    ${field('Service', tierName)}
    ${field('Team Size', r.team_size)}
    ${field('Timeline', r.timeline)}
    ${field('Stack', r.stack)}
    ${field('City', [r.city, r.country_name].filter(Boolean).join(', '))}
    <hr>
    ${r.challenges ? `<p style="font-size:.85rem;color:#E6EDF3"><strong>Challenges:</strong></p><p>${r.challenges}</p>` : ''}
    <a href="${adminUrl}" class="btn">View in Admin Panel</a>
  `);
}

// ?? Template: Cohort Application ? Student ????????????????????????????????
function tplCohortStudent(r) {
  const courseNames = { backend: 'AI-Powered Backend Engineer', frontend: 'AI-Powered Frontend Engineer', mobile: 'AI-Powered Mobile Builder' };
  const courseName = courseNames[r.course] || r.course;
  return wrap(`
    <div class="badge">APPLICATION RECEIVED</div>
    <h2>You're in the queue, ${r.name.split(' ')[0]}. ??</h2>
    <p class="hi">Your application for the <strong style="color:#E6EDF3">Become an ${courseName} in 6 Weeks</strong> cohort has been received.</p>
    <p>Our team will review your application and get back to you within <strong style="color:#E6EDF3">48 hours</strong>.</p>
    <hr>
    <p style="font-size:.9rem;color:#E6EDF3;font-weight:600;margin-bottom:8px">While you wait — join our communities.</p>
    <p>This is where we share resources, announce cohort dates, and build in public. Don't miss it.</p>
    <a href="https://discord.gg/tensectra" class="btn" style="margin-right:12px">Join Discord</a>
    <a href="https://wa.me/1234567890" class="btn" style="background:#25D366;color:#fff">Join WhatsApp</a>
    <hr>
    ${field('Course', courseName)}
    ${field('Experience', r.experience)}
    ${r.is_scholarship ? '<div class="row"><div class="val" style="color:#F59E0B">? Scholarship application noted</div></div>' : ''}
    <hr>
    <p>Questions? Reply to this email or write to <a href="mailto:hello@tensectra.com" style="color:${CYAN}">hello@tensectra.com</a></p>
  `);
}

// ?? Template: Cohort Application ? Internal ???????????????????????????????
function tplCohortInternal(r) {
  const adminUrl = 'https://tensectra.com/admin/applications';
  const courseNames = { backend: 'Backend', frontend: 'Frontend', mobile: 'Mobile' };
  return wrap(`
    <div class="badge">NEW APPLICATION · HR</div>
    <h2>${r.name} · ${courseNames[r.course] || r.course} Cohort</h2>
    <p>A new cohort application has been submitted${r.is_scholarship ? ' <strong style="color:#F59E0B">(scholarship requested)</strong>' : ''}.</p>
    <hr>
    ${field('Name', r.name)}
    ${field('Email', r.email)}
    ${field('Course', courseNames[r.course] || r.course)}
    ${field('Experience', r.experience)}
    ${field('Role', r.role)}
    ${field('Scholarship', r.is_scholarship ? 'Yes — review required' : 'No')}
    ${field('Portfolio', r.portfolio)}
    ${field('Location', [r.city, r.country_name].filter(Boolean).join(', '))}
    <hr>
    ${r.goals ? `<p style="font-size:.85rem;color:#E6EDF3"><strong>Goals:</strong></p><p>${r.goals}</p>` : ''}
    ${r.gap ? `<p style="font-size:.85rem;color:#E6EDF3"><strong>Gap addressed:</strong></p><p>${r.gap}</p>` : ''}
    <a href="${adminUrl}" class="btn">Review in Admin Panel</a>
  `);
}

// ?? Template: Contact ? Internal ??????????????????????????????????????????
function tplContactInternal(r) {
  return wrap(`
    <div class="badge">NEW CONTACT MESSAGE</div>
    <h2>${r.name} — ${r.subject || 'General'}</h2>
    <hr>
    ${field('Name', r.name)}
    ${field('Email', r.email)}
    ${field('Subject', r.subject)}
    ${field('Location', [r.city, r.country_name].filter(Boolean).join(', '))}
    <hr>
    ${r.message ? `<p style="color:#E6EDF3">${r.message}</p>` : ''}
    <a href="mailto:${r.email}" class="btn">Reply to ${r.name.split(' ')[0]}</a>
  `);
}

// ?? Main handler ??????????????????????????????????????????????????????????
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'RESEND_API_KEY not set' });

  const { type, table, record } = req.body || {};
  if (!type || !table || !record) return res.status(400).json({ error: 'Invalid webhook payload' });
  if (type !== 'INSERT') return res.status(200).json({ ok: true, skipped: true });

  const tierNames = { '1': 'Corporate Cohort', '2': 'Architecture Workshop', '3': 'Architecture Consultation', retainer: 'Architecture Retainer', unsure: 'Consultation — service TBD' };

  try {
    if (table === 'consultancy_enquiries') {
      const tierName = tierNames[record.tier] || record.tier;
      await Promise.all([
        sendEmail(apiKey, {
          to: record.email,
          subject: `We received your enquiry, ${record.name.split(' ')[0]}`,
          html: tplConsultancyClient(record, tierName),
        }),
        sendEmail(apiKey, {
          to: 'sales.tensectra@gmail.com',
          subject: `New Enquiry — ${record.name}${record.company ? ' · ' + record.company : ''} (${tierName})`,
          html: tplConsultancyInternal(record, tierName),
        }),
      ]);
    } else if (table === 'cohort_applications') {
      await Promise.all([
        sendEmail(apiKey, {
          to: record.email,
          subject: `Application received — ${(record.course || '').charAt(0).toUpperCase() + (record.course || '').slice(1)} Cohort`,
          html: tplCohortStudent(record),
        }),
        sendEmail(apiKey, {
          to: 'hr.tensectra@gmail.com',
          subject: `New Application — ${record.name} · ${record.course}${record.is_scholarship ? ' ? Scholarship' : ''}`,
          html: tplCohortInternal(record),
        }),
      ]);
    } else if (table === 'contact_submissions') {
      await sendEmail(apiKey, {
        to: 'tensectra.office@gmail.com',
        subject: `New Message — ${record.name}: ${record.subject || 'General'}`,
        html: tplContactInternal(record),
      });
    }

    return res.status(200).json({ ok: true, table });
  } catch (err) {
    console.error('[api/notify]', err);
    return res.status(500).json({ error: err.message });
  }
}
