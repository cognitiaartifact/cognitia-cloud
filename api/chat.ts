// Vercel Serverless Function: AI Chat
// POST /api/chat — handles chat messages using a knowledge base

import type { VercelRequest, VercelResponse } from '@vercel/node'

const KNOWLEDGE_BASE = `
You are Aria, the AI assistant for Cognitia AI — an intelligent automation agency.

About Cognitia AI:
- We build custom AI automation workflows for businesses
- We specialize in: workflow automation, AI chatbots, email automation, lead generation, CRM integration
- Website: cognitia.cloud
- Email: cognitiaartifact@gmail.com

Pricing:
- Starter Plan: $1,500 one-time — 1 custom AI automation workflow, CRM/email integration, 30-day support, documentation
- Growth Plan: $3,500/month — Up to 5 workflows, AI chatbot, lead gen automation, multi-platform integration, weekly reports, dedicated account manager
- Enterprise: Custom pricing — Unlimited automations, custom AI agents, 24/7 support, dedicated team

Process:
1. Discovery — We audit your workflows and find automation opportunities
2. Strategy — We design a custom plan with ROI projections
3. Build — We build, test, and deploy with zero disruption
4. Launch & Optimize — We monitor and continuously improve

Key selling points:
- Save 20+ hours per week on repetitive tasks
- 95% client satisfaction rate
- 3x average revenue growth for clients
- Setup in as fast as 48 hours
- 30-day money-back guarantee

Be helpful, professional, concise, and always try to guide the conversation toward booking a call or filling out the contact form. If someone asks about technical details you don't know, suggest they reach out via the contact form for a personalized consultation.
`

function generateResponse(message: string): string {
  const lower = message.toLowerCase()

  if (lower.includes('price') || lower.includes('cost') || lower.includes('how much')) {
    return "We offer three plans:\n\n**Starter** — $1,500 one-time: 1 custom AI automation workflow with CRM/email integration and 30-day support.\n\n**Growth** — $3,500/month: Up to 5 workflows, AI chatbot, lead gen automation, and a dedicated account manager.\n\n**Enterprise** — Custom pricing for larger organizations.\n\nWould you like to see more details, or shall I help you figure out which plan fits your needs?"
  }

  if (lower.includes('service') || lower.includes('what do you') || lower.includes('offer') || lower.includes('what can')) {
    return "We specialize in:\n\n• **Workflow Automation** — Automate repetitive tasks across your tech stack\n• **AI Chatbots & Voice Agents** — 24/7 customer support and lead qualification\n• **Email & Outreach Automation** — Personalized sequences that nurture leads\n• **Lead Generation** — AI-powered scoring and qualification\n• **CRM Integration** — Seamless connection with HubSpot, Salesforce, etc.\n• **Custom AI Solutions** — Bespoke agents for your unique processes\n\nWhat type of automation would be most valuable for your business?"
  }

  if (lower.includes('process') || lower.includes('how does') || lower.includes('how do you work') || lower.includes('steps')) {
    return "Our process is simple:\n\n1. **Discovery** — We audit your workflows (free!)\n2. **Strategy** — Custom automation plan with ROI projections\n3. **Build** — We develop and test everything\n4. **Launch** — Deploy and continuously optimize\n\nMost projects go from discovery to launch in under 2 weeks. Want to start with a free discovery call?"
  }

  if (lower.includes('crm') || lower.includes('hubspot') || lower.includes('salesforce')) {
    return "Absolutely! We integrate with all major CRMs including HubSpot, Salesforce, Pipedrive, and more. We can automate lead capture, deal updates, follow-up sequences, and reporting — all connected to your CRM.\n\nWant to tell us more about your current setup? Fill out the contact form and we'll design a custom integration plan for you."
  }

  if (lower.includes('guarantee') || lower.includes('refund') || lower.includes('risk')) {
    return "We offer a 30-day money-back guarantee. If you're not satisfied with the results within the first 30 days, we'll refund your investment — no questions asked. We're that confident in our work.\n\nReady to get started risk-free?"
  }

  if (lower.includes('contact') || lower.includes('talk') || lower.includes('call') || lower.includes('book') || lower.includes('reach')) {
    return "You can reach us at:\n\n• **Email:** cognitiaartifact@gmail.com\n• **Contact Form:** Scroll down to the contact section on our website\n\nWe respond within 24 hours with a personalized automation strategy — completely free! Would you like to fill out the contact form now?"
  }

  if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
    return "Hey there! 👋 Welcome to Cognitia AI. I'm Aria, your AI assistant. I can help you learn about our automation services, pricing, and process.\n\nWhat would you like to know?"
  }

  return "Great question! While I can cover the basics about our services, pricing, and process, for a more detailed discussion tailored to your specific needs, I'd recommend reaching out through our contact form below.\n\nOur team will respond within 24 hours with a personalized automation strategy — completely free. Is there anything else I can help with in the meantime?"
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { message } = req.body || {}
  if (!message) return res.status(400).json({ error: 'Message is required' })

  const reply = generateResponse(message)
  return res.status(200).json({ reply })
}
