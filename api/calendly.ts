// Vercel Serverless Function: Calendly Webhook
// POST /api/calendly — receives invitee.created and invitee.canceled events,
// signs-in the lead to Brevo list 9 (Warm Leads), and pings the owner.
//
// Register this webhook once via Calendly API (see scripts/register-calendly-webhook.mjs)
// with scope=user, events=["invitee.created","invitee.canceled"], signing key set to
// process.env.CALENDLY_SIGNING_KEY.

import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createHmac, timingSafeEqual } from 'node:crypto'

const BREVO_API_BASE = 'https://api.brevo.com/v3'
const WARM_LEADS_LIST_ID = Number(process.env.BREVO_WARM_LEADS_LIST_ID || 9)

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

// Calendly signs webhooks with "t=<unix>,v1=<hmac-sha256>". Verify both the
// signature and the timestamp freshness to reject replays.
function verifyCalendlySignature(rawBody: string, header: string | undefined, signingKey: string): boolean {
  if (!header) return false
  const parts = Object.fromEntries(header.split(',').map((p) => p.split('=') as [string, string]))
  const t = parts['t']
  const v1 = parts['v1']
  if (!t || !v1) return false

  // Reject if older than 5 minutes.
  const age = Math.abs(Math.floor(Date.now() / 1000) - Number(t))
  if (!Number.isFinite(age) || age > 300) return false

  const expected = createHmac('sha256', signingKey)
    .update(`${t}.${rawBody}`)
    .digest('hex')

  // Compare as Uint8Array to sidestep the Buffer ↔ Uint8Array type friction
  // on newer @types/node; timingSafeEqual accepts ArrayBufferView.
  const a = new Uint8Array(Buffer.from(expected, 'hex'))
  const b = new Uint8Array(Buffer.from(v1, 'hex'))
  if (a.length !== b.length) return false
  try {
    return timingSafeEqual(a, b)
  } catch {
    return false
  }
}

async function getRawBody(req: VercelRequest): Promise<string> {
  const chunks: Buffer[] = []
  return new Promise((resolve, reject) => {
    req.on('data', (c: Buffer) => chunks.push(c))
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    req.on('error', reject)
  })
}

async function upsertContactToWarmLeads(payload: {
  email: string
  firstName: string
  lastName: string
  eventName: string
  scheduledAt: string
}) {
  const apiKey = process.env.BREVO_API_KEY
  if (!apiKey) return

  await fetch(`${BREVO_API_BASE}/contacts`, {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'content-type': 'application/json',
      'api-key': apiKey,
    },
    body: JSON.stringify({
      email: payload.email,
      attributes: {
        FIRSTNAME: payload.firstName,
        LASTNAME: payload.lastName,
        LAST_BOOKED_EVENT: payload.eventName,
        LAST_BOOKED_AT: payload.scheduledAt,
        SOURCE: 'calendly_booking',
      },
      listIds: [WARM_LEADS_LIST_ID],
      updateEnabled: true,
    }),
  })
}

async function notifyOwnerOfBooking(payload: {
  action: 'created' | 'canceled'
  email: string
  fullName: string
  eventName: string
  scheduledAt: string
  eventUri?: string
}) {
  const apiKey = process.env.BREVO_API_KEY
  if (!apiKey) return

  const verb = payload.action === 'created' ? 'booked' : 'canceled'
  const emoji = payload.action === 'created' ? '📅' : '⚠️'
  const whenLocal = new Date(payload.scheduledAt).toLocaleString('en-US', { timeZone: 'America/New_York' })

  await fetch(`${BREVO_API_BASE}/smtp/email`, {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'content-type': 'application/json',
      'api-key': apiKey,
    },
    body: JSON.stringify({
      sender: { name: 'Cognitia AI Calendly', email: 'cognitiaartifact@gmail.com' },
      to: [{ email: 'cognitiaartifact@gmail.com', name: 'Cognitia AI' }],
      replyTo: { email: payload.email, name: payload.fullName },
      subject: `${emoji} Discovery call ${verb}: ${payload.fullName}`,
      htmlContent: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#13131a;color:#e2e8f0;border-radius:12px;">
          <h2 style="color:#0d9488;margin-top:0;">${emoji} ${escapeHtml(payload.fullName)} ${verb} a call</h2>
          <p><strong>Email:</strong> ${escapeHtml(payload.email)}</p>
          <p><strong>Event:</strong> ${escapeHtml(payload.eventName)}</p>
          <p><strong>When:</strong> ${escapeHtml(whenLocal)} (America/New_York)</p>
          ${payload.eventUri ? `<p><a href="${escapeHtml(payload.eventUri)}" style="color:#0d9488;">Open in Calendly →</a></p>` : ''}
        </div>
      `,
    }),
  })
}

export const config = {
  api: { bodyParser: false },
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const signingKey = process.env.CALENDLY_SIGNING_KEY
  if (!signingKey) {
    console.error('[Calendly] CALENDLY_SIGNING_KEY not set — refusing webhook.')
    return res.status(500).json({ error: 'Not configured' })
  }

  const raw = await getRawBody(req)
  const sigHeader = req.headers['calendly-webhook-signature'] as string | undefined
  if (!verifyCalendlySignature(raw, sigHeader, signingKey)) {
    console.error('[Calendly] Bad signature.')
    return res.status(400).json({ error: 'Invalid signature' })
  }

  let body: any
  try {
    body = JSON.parse(raw)
  } catch {
    return res.status(400).json({ error: 'Invalid JSON' })
  }

  const eventType: string = body.event
  if (eventType !== 'invitee.created' && eventType !== 'invitee.canceled') {
    // Unknown event — acknowledge so Calendly doesn't retry, but take no action.
    return res.status(200).json({ ok: true, ignored: eventType })
  }

  const action: 'created' | 'canceled' = eventType === 'invitee.created' ? 'created' : 'canceled'
  const payload = body.payload || {}
  const email: string = payload.email || ''
  const fullName: string = payload.name || email.split('@')[0] || 'Guest'
  const [firstName, ...rest] = fullName.split(' ')
  const lastName = rest.join(' ')
  const eventName: string = payload.scheduled_event?.name || 'AI Automation Discovery Call'
  const scheduledAt: string = payload.scheduled_event?.start_time || new Date().toISOString()
  const eventUri: string | undefined = payload.scheduled_event?.uri

  if (!email) return res.status(400).json({ error: 'Missing invitee email' })

  // Fire actions in parallel; surface failures in logs without blocking the ack to Calendly.
  const results = await Promise.allSettled([
    action === 'created'
      ? upsertContactToWarmLeads({ email, firstName, lastName, eventName, scheduledAt })
      : Promise.resolve(),
    notifyOwnerOfBooking({ action, email, fullName, eventName, scheduledAt, eventUri }),
  ])
  results.forEach((r, i) => {
    if (r.status === 'rejected') console.error(`[Calendly] action ${i} failed:`, r.reason)
  })

  return res.status(200).json({ ok: true, event: eventType })
}
