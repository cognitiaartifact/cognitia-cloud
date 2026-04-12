// Vercel Serverless Function: Stripe Webhook
// POST /api/webhook — handles Stripe events

import type { VercelRequest, VercelResponse } from '@vercel/node'
import Stripe from 'stripe'

const BREVO_API_BASE = 'https://api.brevo.com/v3'

async function sendWelcomeEmail(email: string, name: string, tierId: string) {
  const apiKey = process.env.BREVO_API_KEY
  if (!apiKey) return

  const firstName = name.split(' ')[0] || 'there'
  const tierName = tierId === 'growth' ? 'Growth' : 'Starter'

  await fetch(`${BREVO_API_BASE}/smtp/email`, {
    method: 'POST',
    headers: { 'accept': 'application/json', 'content-type': 'application/json', 'api-key': apiKey },
    body: JSON.stringify({
      sender: { name: 'Cognitia AI', email: 'cognitiaartifact@gmail.com' },
      to: [{ email, name }],
      subject: `Welcome to Cognitia AI ${tierName} — Let's Get Started! 🚀`,
      htmlContent: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
          <h2 style="color:#0d9488;">Welcome aboard, ${firstName}! 🎉</h2>
          <p>Your <strong>${tierName} Plan</strong> is now active. Here's what happens next:</p>
          <ol>
            <li><strong>Within 24 hours:</strong> You'll receive an email from your project lead to schedule your onboarding call.</li>
            <li><strong>During the call:</strong> We'll audit your workflows and finalize your automation plan.</li>
            <li><strong>Within 48 hours:</strong> Development begins on your custom AI automations.</li>
          </ol>
          <p>Have questions in the meantime? Just reply to this email — we're here to help.</p>
          <p>Excited to start transforming your business!</p>
          <p>Best,<br><strong>The Cognitia AI Team</strong></p>
        </div>
      `,
    }),
  })
}

async function notifyOwnerPayment(email: string, tierId: string, amount: string) {
  const apiKey = process.env.BREVO_API_KEY
  if (!apiKey) return

  await fetch(`${BREVO_API_BASE}/smtp/email`, {
    method: 'POST',
    headers: { 'accept': 'application/json', 'content-type': 'application/json', 'api-key': apiKey },
    body: JSON.stringify({
      sender: { name: 'Cognitia AI Payments', email: 'cognitiaartifact@gmail.com' },
      to: [{ email: 'cognitiaartifact@gmail.com', name: 'Cognitia AI' }],
      subject: `💰 New Payment: ${tierId} tier — ${amount}`,
      htmlContent: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#13131a;color:#e2e8f0;border-radius:12px;">
          <h2 style="color:#0d9488;">New Payment Received! 💰</h2>
          <p><strong>Customer:</strong> ${email}</p>
          <p><strong>Tier:</strong> ${tierId}</p>
          <p><strong>Amount:</strong> ${amount}</p>
          <p><strong>Time:</strong> ${new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })}</p>
          <p>Check your <a href="https://dashboard.stripe.com" style="color:#0d9488;">Stripe Dashboard</a> for details.</p>
        </div>
      `,
    }),
  })
}

export const config = {
  api: { bodyParser: false },
}

async function getRawBody(req: VercelRequest): Promise<Buffer> {
  const chunks: Buffer[] = []
  return new Promise((resolve, reject) => {
    req.on('data', (chunk: Buffer) => chunks.push(chunk))
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const key = process.env.STRIPE_SECRET_KEY
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!key || !webhookSecret) return res.status(500).json({ error: 'Not configured' })

  const stripe = new Stripe(key)
  const sig = req.headers['stripe-signature']
  if (!sig) return res.status(400).json({ error: 'Missing signature' })

  let event: Stripe.Event
  try {
    const rawBody = await getRawBody(req)
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret)
  } catch (err: any) {
    console.error('[Webhook] Signature verification failed:', err.message)
    return res.status(400).json({ error: `Webhook Error: ${err.message}` })
  }

  console.log(`[Webhook] ${event.type} (${event.id})`)

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session
      const tierId = session.metadata?.tier_id || 'unknown'
      const customerEmail = session.customer_email || session.customer_details?.email || 'unknown'
      const customerName = session.customer_details?.name || customerEmail.split('@')[0]
      const amount = session.amount_total ? `$${(session.amount_total / 100).toFixed(2)}` : 'unknown'

      await Promise.allSettled([
        sendWelcomeEmail(customerEmail, customerName, tierId),
        notifyOwnerPayment(customerEmail, tierId, amount),
      ])
    }
  } catch (err) {
    console.error(`[Webhook] Error processing ${event.type}:`, err)
  }

  return res.json({ received: true })
}
