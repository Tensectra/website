/**
 * api/_mailer.js
 * Dual-provider email helper. Supports Resend API and Gmail SMTP.
 *
 * Provider selection (set in .env / Vercel environment variables):
 *
 *   EMAIL_PROVIDER=resend   -> uses Resend API  (recommended, free 3000/month)
 *   EMAIL_PROVIDER=gmail    -> uses Gmail SMTP  (free 500/day personal, 2000/day Workspace)
 *
 * If EMAIL_PROVIDER is not set, auto-detects:
 *   -> uses Resend  if RESEND_API_KEY is present
 *   -> uses Gmail   if SMTP_USER + SMTP_PASSWORD are present
 *
 * Resend setup:
 *   RESEND_API_KEY = re_xxxxxxxxxxxxxxxx   (from resend.com, free tier)
 *
 * Gmail SMTP setup:
 *   SMTP_USER     = tensectra.office@gmail.com
 *   SMTP_PASSWORD = xxxx xxxx xxxx xxxx    (Gmail App Password, not your login password)
 *   Generate at: myaccount.google.com > Security > App passwords
 */

import nodemailer from 'nodemailer';

// ---------------------------------------------------------------------------
// Provider detection
// ---------------------------------------------------------------------------
function getProvider() {
  if (process.env.EMAIL_PROVIDER) return process.env.EMAIL_PROVIDER.toLowerCase();
  if (process.env.RESEND_API_KEY) return 'resend';
  if (process.env.SMTP_USER && process.env.SMTP_PASSWORD) return 'gmail';
  return 'resend'; // default — will throw at validateMailConfig if key missing
}

// ---------------------------------------------------------------------------
// Validate config early so the handler returns JSON, not an HTML crash page
// ---------------------------------------------------------------------------
export function validateMailConfig() {
  const provider = getProvider();
  if (provider === 'resend') {
    if (!process.env.RESEND_API_KEY) {
      throw new Error('EMAIL: RESEND_API_KEY is not set. Add it to environment variables or switch EMAIL_PROVIDER=gmail');
    }
  } else if (provider === 'gmail') {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
      throw new Error('EMAIL: SMTP_USER or SMTP_PASSWORD is not set. Add Gmail credentials to environment variables');
    }
  } else {
    throw new Error('EMAIL: Unknown EMAIL_PROVIDER "' + provider + '". Use "resend" or "gmail"');
  }
}

// ---------------------------------------------------------------------------
// Send via Resend API (https://resend.com — free 3000 emails/month)
// ---------------------------------------------------------------------------
async function sendViaResend({ to, subject, html, replyTo }) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + process.env.RESEND_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from:     'Tensectra <hello@tensectra.com>',
      to:       Array.isArray(to) ? to : [to],
      reply_to: replyTo || 'hello@tensectra.com',
      subject,
      html
    })
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error('Resend error ' + res.status + ': ' + body);
  }
  return res.json();
}

// ---------------------------------------------------------------------------
// Send via Gmail SMTP (nodemailer — free 500/day personal, 2000/day Workspace)
// ---------------------------------------------------------------------------
function createGmailTransport() {
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // STARTTLS
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD
    }
  });
}

async function sendViaGmail({ to, subject, html, replyTo }) {
  const transport = createGmailTransport();
  return transport.sendMail({
    from:    '"Tensectra" <' + process.env.SMTP_USER + '>',
    to:      Array.isArray(to) ? to.join(', ') : to,
    replyTo: replyTo || 'hello@tensectra.com',
    subject,
    html
  });
}

// ---------------------------------------------------------------------------
// Public interface — same API regardless of provider
// ---------------------------------------------------------------------------

/**
 * Send a single email.
 * @param {{ to: string, subject: string, html: string, replyTo?: string }} opts
 */
export async function sendMail(opts) {
  const provider = getProvider();
  if (provider === 'resend') return sendViaResend(opts);
  return sendViaGmail(opts);
}

/**
 * Send multiple emails in parallel.
 * @param {Array<{ to: string, subject: string, html: string, replyTo?: string }>} mails
 */
export async function sendMails(mails) {
  return Promise.all(mails.map(m => sendMail(m)));
}
