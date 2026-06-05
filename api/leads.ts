// Vercel Serverless Function: Lead Capture
// POST /api/leads — captures lead, sends email notifications via Resend

import type { VercelRequest, VercelResponse } from '@vercel/node'

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

async function sendViaResend(
  apiKey: string,
  from: string,
  to: string,
  subject: string,
  html: string,
  replyTo?: string,
): Promise<void> {
  const body: Record<string, unknown> = { from, to: [to], subject, html }
  if (replyTo) body.reply_to = replyTo

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Resend error ${res.status}: ${err}`)
  }
}

async function sendOwnerNotification(
  apiKey: string,
  fromEmail: string,
  notifyEmail: string,
  lead: { name: string; email: string; company?: string; message?: string },
): Promise<void> {
  const now = new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#13131a;color:#e2e8f0;border-radius:12px;overflow:hidden;border:1px solid #1e293b;">
      <div style="background:linear-gradient(135deg,#0d9488,#6366f1);padding:24px 32px;">
        <h1 style="margin:0;color:#fff;font-size:22px;">New Lead Received 🔥</h1>
        <p style="margin:4px 0 0;color:rgba(255,255,255,0.8);font-size:14px;">Cognitia AI — ${now}</p>
      </div>
      <div style="padding:32px;">
        <div style="margin-bottom:20px;">
          <div style="font-size:11px;font-weight:600;text-transform:uppercase;color:#64748b;margin-bottom:4px;">Name</div>
          <div style="font-size:16px;background:#1e293b;padding:12px 16px;border-radius:8px;border-left:3px solid #0d9488;">${escapeHtml(lead.name)}</div>
        </div>
        <div style="margin-bottom:20px;">
          <div style="font-size:11px;font-weight:600;text-transform:uppercase;color:#64748b;margin-bottom:4px;">Email</div>
          <div style="font-size:16px;background:#1e293b;padding:12px 16px;border-radius:8px;border-left:3px solid #0d9488;">${escapeHtml(lead.email)}</div>
        </div>
        ${lead.company ? `<div style="margin-bottom:20px;"><div style="font-size:11px;font-weight:600;text-transform:uppercase;color:#64748b;margin-bottom:4px;">Company</div><div style="font-size:16px;background:#1e293b;padding:12px 16px;border-radius:8px;border-left:3px solid #0d9488;">${escapeHtml(lead.company)}</div></div>` : ''}
        ${lead.message ? `<div style="margin-bottom:20px;"><div style="font-size:11px;font-weight:600;text-transform:uppercase;color:#64748b;margin-bottom:4px;">Message</div><div style="font-size:14px;background:#1e293b;padding:12px 16px;border-radius:8px;border-left:3px solid #0d9488;white-space:pre-wrap;">${escapeHtml(lead.message)}</div></div>` : ''}
        <a href="mailto:${escapeHtml(lead.email)}" style="display:inline-block;margin-top:16px;padding:12px 24px;background:linear-gradient(135deg,#0d9488,#6366f1);color:#fff;text-decoration:none;border-radius:8px;font-weight:600;font-size:14px;">Reply to Lead →</a>
      </div>
    </div>
  `

  await sendViaResend(apiKey, fromEmail, notifyEmail, `🔥 New Lead: ${lead.name}${lead.company ? ` (${lead.company})` : ''}`, html, lead.email)
}

async function sendLeadAutoReply(
  apiKey: string,
  fromEmail: string,
  lead: { name: string; email: string },
): Promise<void> {
  const firstName = lead.name.split(' ')[0] || 'there'

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
      <h2 style="color:#0d9488;">Hi ${escapeHtml(firstName)},</h2>
      <p>Thanks for reaching out to <strong>Cognitia AI</strong>! We've received your message and our team will be in touch within <strong>24 hours</strong>.</p>
      <p>In the meantime, feel free to:</p>
      <ul>
        <li><a href="https://cognitia.cloud/#pricing" style="color:#0d9488;">View our pricing plans</a></li>
        <li><a href="https://cognitia.cloud/#services" style="color:#0d9488;">Explore our services</a></li>
        <li>Reply to this email with any questions</li>
      </ul>
      <p>Looking forward to helping you automate your business!</p>
      <p>Best regards,<br><strong>The Cognitia AI Team</strong></p>
      <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;">
      <p style="font-size:12px;color:#6b7280;">Cognitia AI — Intelligent Automation Agency<br><a href="https://cognitia.cloud" style="color:#0d9488;">cognitia.cloud</a></p>
    </div>
  `

  await sendViaResend(apiKey, fromEmail, lead.email, `Thanks for reaching out, ${firstName} — Cognitia AI`, html)
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { name, email, company, message } = req.body || {}

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required' })
  }

  const apiKey = process.env.RESEND_API_KEY
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'Cognitia AI <onboarding@resend.dev>'
  const notifyEmail = process.env.RESEND_NOTIFY_EMAIL || 'cognitiaartifact@gmail.com'

  if (!apiKey) {
    console.error('RESEND_API_KEY not configured')
    return res.status(200).json({ success: true, message: 'Lead captured (email delivery pending setup)' })
  }

  const lead = { name, email, company: company || '', message }

  // Fire both in parallel — never let one failure block the other
  const results = await Promise.allSettled([
    sendOwnerNotification(apiKey, fromEmail, notifyEmail, lead),
    sendLeadAutoReply(apiKey, fromEmail, lead),
  ])

  results.forEach((r, i) => {
    if (r.status === 'rejected') {
      console.error(`Lead action ${i} failed:`, r.reason)
    }
  })

  return res.status(200).json({ success: true, message: 'Lead captured successfully' })
}
