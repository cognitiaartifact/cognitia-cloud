/**
 * Cognitia AI — Standalone Express Server
 * Run: node server.js
 * This serves both the static frontend and API endpoints.
 * Works on any Node.js host (VPS, Railway, Render, DigitalOcean, etc.)
 */

import express from 'express'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import Stripe from 'stripe'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const app = express()
const PORT = process.env.PORT || 3000

const BREVO_API_BASE = 'https://api.brevo.com/v3'

// --- Middleware ---
// Webhook route needs raw body
app.post('/api/webhook', express.raw({ type: 'application/json' }), handleWebhook)
app.use(express.json())
app.use(express.static(join(__dirname, 'dist')))

// --- Pricing Tiers ---
const PRICING_TIERS = [
  { id: 'starter', name: 'Cognitia AI — Starter', description: '1 custom AI automation workflow + support', priceAmountCents: 150000, currency: 'usd', mode: 'payment' },
  { id: 'growth', name: 'Cognitia AI — Growth', description: 'Up to 5 workflows + AI chatbot + dedicated manager', priceAmountCents: 350000, currency: 'usd', mode: 'subscription', interval: 'month' },
]

const priceCache = new Map()

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

// --- API: Lead Capture ---
app.post('/api/leads', async (req, res) => {
  const { name, email, company, message } = req.body
  if (!name || !email || !message) return res.status(400).json({ error: 'Name, email, and message required' })

  const lead = { name, email, company: company || '', message }
  const apiKey = process.env.BREVO_API_KEY

  const tasks = []

  // 1. Email owner
  if (apiKey) {
    const now = new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })
    tasks.push(fetch(`${BREVO_API_BASE}/smtp/email`, {
      method: 'POST',
      headers: { 'accept': 'application/json', 'content-type': 'application/json', 'api-key': apiKey },
      body: JSON.stringify({
        sender: { name: 'Cognitia AI Leads', email: 'cognitiaartifact@gmail.com' },
        to: [{ email: 'cognitiaartifact@gmail.com' }],
        replyTo: { email: lead.email, name: lead.name },
        subject: `New Lead: ${lead.name}${lead.company ? ` (${lead.company})` : ''}`,
        htmlContent: `<div style="font-family:Arial;max-width:600px;margin:0 auto;"><h2 style="color:#0d9488;">New Lead — ${now}</h2><p><b>Name:</b> ${escapeHtml(lead.name)}</p><p><b>Email:</b> ${escapeHtml(lead.email)}</p>${lead.company ? `<p><b>Company:</b> ${escapeHtml(lead.company)}</p>` : ''}<p><b>Message:</b> ${escapeHtml(lead.message)}</p></div>`,
      }),
    }).catch(e => console.error('Owner email failed:', e)))

    // 2. Auto-reply to lead
    const firstName = name.split(' ')[0]
    tasks.push(fetch(`${BREVO_API_BASE}/smtp/email`, {
      method: 'POST',
      headers: { 'accept': 'application/json', 'content-type': 'application/json', 'api-key': apiKey },
      body: JSON.stringify({
        sender: { name: 'Cognitia AI', email: 'cognitiaartifact@gmail.com' },
        to: [{ email, name }],
        subject: `Thanks for reaching out, ${firstName} — Cognitia AI`,
        htmlContent: `<div style="font-family:Arial;max-width:600px;margin:0 auto;padding:20px;"><h2 style="color:#0d9488;">Hi ${escapeHtml(firstName)},</h2><p>Thanks for reaching out! We've received your message and will be in touch within <b>24 hours</b>.</p><p>Best,<br><b>The Cognitia AI Team</b></p></div>`,
      }),
    }).catch(e => console.error('Auto-reply failed:', e)))

    // 3. Add to Brevo contacts
    tasks.push(fetch(`${BREVO_API_BASE}/contacts`, {
      method: 'POST',
      headers: { 'accept': 'application/json', 'content-type': 'application/json', 'api-key': apiKey },
      body: JSON.stringify({ email, attributes: { FIRSTNAME: name.split(' ')[0], LASTNAME: name.split(' ').slice(1).join(' '), COMPANY: company || '' }, updateEnabled: true }),
    }).catch(e => console.error('Brevo contact failed:', e)))
  }

  await Promise.allSettled(tasks)
  console.log(`[Lead] Captured: ${name} <${email}>`)
  res.json({ success: true })
})

// --- API: Stripe Checkout ---
app.post('/api/checkout', async (req, res) => {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) return res.status(500).json({ error: 'Stripe not configured' })

  const stripe = new Stripe(key)
  const { tierId } = req.body
  if (!tierId || !['starter', 'growth'].includes(tierId)) return res.status(400).json({ error: 'Invalid tier' })

  try {
    const tier = PRICING_TIERS.find(t => t.id === tierId)
    let cached = priceCache.get(tierId)

    if (!cached) {
      const existing = await stripe.products.search({ query: `metadata["tier_id"]:"${tierId}"` })
      let productId, priceId

      if (existing.data.length > 0) {
        productId = existing.data[0].id
        const dp = existing.data[0].default_price
        priceId = dp ? (typeof dp === 'string' ? dp : dp.id) : null
        if (!priceId) {
          const price = await stripe.prices.create({ product: productId, unit_amount: tier.priceAmountCents, currency: tier.currency, ...(tier.mode === 'subscription' ? { recurring: { interval: tier.interval } } : {}) })
          priceId = price.id
        }
      } else {
        const product = await stripe.products.create({ name: tier.name, description: tier.description, metadata: { tier_id: tierId } })
        productId = product.id
        const price = await stripe.prices.create({ product: productId, unit_amount: tier.priceAmountCents, currency: tier.currency, ...(tier.mode === 'subscription' ? { recurring: { interval: tier.interval } } : {}) })
        priceId = price.id
        await stripe.products.update(productId, { default_price: priceId })
      }

      cached = { productId, priceId }
      priceCache.set(tierId, cached)
    }

    const origin = req.headers.origin || 'https://cognitia.cloud'
    const session = await stripe.checkout.sessions.create({
      mode: tier.mode,
      line_items: [{ price: cached.priceId, quantity: 1 }],
      success_url: `${origin}/payment-success?tier=${tierId}`,
      cancel_url: `${origin}/payment-cancel`,
      allow_promotion_codes: true,
      metadata: { tier_id: tierId },
    })

    res.json({ url: session.url })
  } catch (err) {
    console.error('[Checkout]', err.message)
    res.status(500).json({ error: err.message })
  }
})

// --- API: Stripe Webhook ---
async function handleWebhook(req, res) {
  const key = process.env.STRIPE_SECRET_KEY
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!key || !secret) return res.status(500).json({ error: 'Not configured' })

  const stripe = new Stripe(key)
  const sig = req.headers['stripe-signature']
  if (!sig) return res.status(400).json({ error: 'Missing signature' })

  let event
  try { event = stripe.webhooks.constructEvent(req.body, sig, secret) }
  catch (err) { return res.status(400).json({ error: err.message }) }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    const tierId = session.metadata?.tier_id || 'unknown'
    const email = session.customer_email || session.customer_details?.email || 'unknown'
    const amount = session.amount_total ? `$${(session.amount_total / 100).toFixed(2)}` : 'unknown'
    console.log(`[Payment] ${email} — ${tierId} — ${amount}`)

    const apiKey = process.env.BREVO_API_KEY
    if (apiKey) {
      await Promise.allSettled([
        fetch(`${BREVO_API_BASE}/smtp/email`, {
          method: 'POST',
          headers: { 'accept': 'application/json', 'content-type': 'application/json', 'api-key': apiKey },
          body: JSON.stringify({
            sender: { name: 'Cognitia AI', email: 'cognitiaartifact@gmail.com' },
            to: [{ email }],
            subject: `Welcome to Cognitia AI — Let's Get Started!`,
            htmlContent: `<div style="font-family:Arial;max-width:600px;margin:0 auto;padding:20px;"><h2 style="color:#0d9488;">Welcome aboard! 🎉</h2><p>Your <b>${tierId}</b> plan is active. We'll reach out within 24 hours to schedule your onboarding call.</p><p>Best,<br><b>The Cognitia AI Team</b></p></div>`,
          }),
        }).catch(() => {}),
        fetch(`${BREVO_API_BASE}/smtp/email`, {
          method: 'POST',
          headers: { 'accept': 'application/json', 'content-type': 'application/json', 'api-key': apiKey },
          body: JSON.stringify({
            sender: { name: 'Cognitia AI Payments', email: 'cognitiaartifact@gmail.com' },
            to: [{ email: 'cognitiaartifact@gmail.com' }],
            subject: `💰 Payment: ${tierId} — ${amount} from ${email}`,
            htmlContent: `<div style="font-family:Arial;"><h2 style="color:#0d9488;">New Payment!</h2><p>${email} — ${tierId} — ${amount}</p></div>`,
          }),
        }).catch(() => {}),
      ])
    }
  }

  res.json({ received: true })
}

// --- API: Chat ---
app.post('/api/chat', (req, res) => {
  const { message } = req.body
  if (!message) return res.status(400).json({ error: 'Message required' })

  const lower = message.toLowerCase()
  let reply

  if (lower.includes('price') || lower.includes('cost') || lower.includes('how much')) {
    reply = "We offer three plans:\n\n• Starter — $1,500 one-time: 1 custom AI workflow + 30-day support\n• Growth — $3,500/month: Up to 5 workflows + AI chatbot + dedicated manager\n• Enterprise — Custom pricing\n\nWhich plan interests you?"
  } else if (lower.includes('service') || lower.includes('offer') || lower.includes('what can') || lower.includes('what do')) {
    reply = "We specialize in: Workflow Automation, AI Chatbots, Email Automation, Lead Generation, CRM Integration, and Custom AI Solutions. What would help your business most?"
  } else if (lower.includes('process') || lower.includes('how does') || lower.includes('how do you work')) {
    reply = "Our 4-step process: 1) Discovery — audit your workflows, 2) Strategy — custom plan with ROI projections, 3) Build — develop & test, 4) Launch — deploy & optimize. Most projects launch in under 2 weeks!"
  } else if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
    reply = "Hey there! 👋 I'm Aria, Cognitia AI's assistant. I can help with info about our services, pricing, and process. What would you like to know?"
  } else {
    reply = "Great question! For a detailed answer tailored to your needs, I'd recommend filling out our contact form below. Our team responds within 24 hours with a free automation strategy. Anything else I can help with?"
  }

  res.json({ reply })
})

// --- SPA Fallback ---
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'))
})

app.listen(PORT, () => {
  console.log(`\n🚀 Cognitia AI running at http://localhost:${PORT}`)
  console.log(`   Stripe: ${process.env.STRIPE_SECRET_KEY ? '✅ configured' : '❌ not set'}`)
  console.log(`   Brevo:  ${process.env.BREVO_API_KEY ? '✅ configured' : '❌ not set'}\n`)
})
