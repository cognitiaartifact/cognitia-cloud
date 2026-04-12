// Vercel Serverless Function: Stripe Checkout
// POST /api/checkout — creates a Stripe Checkout session

import type { VercelRequest, VercelResponse } from '@vercel/node'
import Stripe from 'stripe'

interface PricingTier {
  id: string
  name: string
  description: string
  priceAmountCents: number
  currency: string
  mode: 'payment' | 'subscription'
  interval?: 'month' | 'year'
}

const PRICING_TIERS: PricingTier[] = [
  {
    id: 'starter',
    name: 'Cognitia AI — Starter',
    description: '1 custom AI automation workflow, CRM or email integration, 30-day post-launch support, performance dashboard, documentation & training.',
    priceAmountCents: 150000,
    currency: 'usd',
    mode: 'payment',
  },
  {
    id: 'growth',
    name: 'Cognitia AI — Growth',
    description: 'Up to 5 AI automation workflows, custom AI chatbot or voice agent, lead generation automation, multi-platform integrations, weekly performance reports.',
    priceAmountCents: 350000,
    currency: 'usd',
    mode: 'subscription',
    interval: 'month',
  },
]

const priceCache = new Map<string, { productId: string; priceId: string }>()

async function getOrCreatePrice(stripe: Stripe, tierId: string) {
  if (priceCache.has(tierId)) return priceCache.get(tierId)!

  const tier = PRICING_TIERS.find((t) => t.id === tierId)
  if (!tier) throw new Error(`Unknown tier: ${tierId}`)

  // Search for existing product
  const existing = await stripe.products.search({ query: `metadata["tier_id"]:"${tierId}"` })

  let productId: string
  let priceId: string

  if (existing.data.length > 0) {
    productId = existing.data[0].id
    const product = existing.data[0]
    if (product.default_price) {
      priceId = typeof product.default_price === 'string' ? product.default_price : product.default_price.id
    } else {
      const price = await stripe.prices.create({
        product: productId,
        unit_amount: tier.priceAmountCents,
        currency: tier.currency,
        ...(tier.mode === 'subscription' && tier.interval ? { recurring: { interval: tier.interval } } : {}),
      })
      priceId = price.id
      await stripe.products.update(productId, { default_price: priceId })
    }
  } else {
    const product = await stripe.products.create({
      name: tier.name,
      description: tier.description,
      metadata: { tier_id: tierId },
    })
    productId = product.id

    const price = await stripe.prices.create({
      product: productId,
      unit_amount: tier.priceAmountCents,
      currency: tier.currency,
      ...(tier.mode === 'subscription' && tier.interval ? { recurring: { interval: tier.interval } } : {}),
    })
    priceId = price.id
    await stripe.products.update(productId, { default_price: priceId })
  }

  priceCache.set(tierId, { productId, priceId })
  return { productId, priceId }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const key = process.env.STRIPE_SECRET_KEY
  if (!key) return res.status(500).json({ error: 'Stripe is not configured' })

  const stripe = new Stripe(key)
  const { tierId, customerEmail } = req.body || {}

  if (!tierId || !['starter', 'growth'].includes(tierId)) {
    return res.status(400).json({ error: 'Invalid tier' })
  }

  try {
    const tier = PRICING_TIERS.find((t) => t.id === tierId)!
    const { priceId } = await getOrCreatePrice(stripe, tierId)

    const origin = req.headers.origin || req.headers.referer?.replace(/\/$/, '') || 'https://cognitia.cloud'

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: tier.mode,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/payment-success?tier=${tierId}`,
      cancel_url: `${origin}/payment-cancel`,
      allow_promotion_codes: true,
      metadata: { tier_id: tierId },
    }

    if (customerEmail) sessionParams.customer_email = customerEmail

    const session = await stripe.checkout.sessions.create(sessionParams)
    return res.status(200).json({ url: session.url })
  } catch (err: any) {
    console.error('[Checkout] Error:', err.message)
    return res.status(500).json({ error: err.message || 'Failed to create checkout session' })
  }
}
