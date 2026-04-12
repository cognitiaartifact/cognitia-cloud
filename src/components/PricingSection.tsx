import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, ArrowRight, Sparkles, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

const plans = [
  {
    name: 'Starter',
    price: '$1,500',
    period: 'one-time setup',
    description: 'Perfect for businesses ready to automate their first workflow and see immediate results.',
    features: [
      '1 custom AI automation workflow',
      'CRM or email integration',
      '30-day post-launch support',
      'Performance dashboard',
      'Documentation & training',
    ],
    cta: 'Get Started',
    highlighted: false,
    tierId: 'starter',
  },
  {
    name: 'Growth',
    price: '$3,500',
    period: '/month',
    description: 'For businesses serious about scaling. Multiple automations, AI agents, and ongoing optimization.',
    features: [
      'Up to 5 AI automation workflows',
      'Custom AI chatbot or voice agent',
      'Lead generation automation',
      'Multi-platform integrations',
      'Weekly performance reports',
      'Priority support & optimization',
      'Dedicated account manager',
    ],
    cta: 'Start Growing',
    highlighted: true,
    tierId: 'growth',
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: 'tailored pricing',
    description: 'Full-scale AI transformation for established businesses. Custom agents, advanced analytics, and white-glove service.',
    features: [
      'Unlimited AI automations',
      'Custom AI agent development',
      'Advanced analytics & reporting',
      'API development & integration',
      'Compliance & security audit',
      '24/7 priority support',
      'Quarterly strategy reviews',
      'Dedicated engineering team',
    ],
    cta: 'Contact Us',
    highlighted: false,
    tierId: null,
  },
]

export default function PricingSection() {
  const [loadingTier, setLoadingTier] = useState<string | null>(null)

  const handlePlanClick = async (plan: (typeof plans)[number]) => {
    if (!plan.tierId) {
      document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })
      return
    }

    setLoadingTier(plan.tierId)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tierId: plan.tierId }),
      })
      const data = await res.json()
      if (data.url) {
        toast.success('Redirecting to checkout...')
        window.location.href = data.url
      } else {
        throw new Error(data.error || 'Failed to create checkout')
      }
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoadingTier(null)
    }
  }

  return (
    <section id="pricing" className="py-24 lg:py-32 bg-card/30">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <span className="text-primary text-sm font-semibold tracking-widest uppercase mb-4 block">
            Pricing
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-6">
            Invest in Growth,{' '}
            <span className="gradient-text">Not Overhead</span>
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Transparent pricing designed to deliver ROI from month one. No hidden fees.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
          {plans.map((plan, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              className={`relative rounded-2xl p-8 h-full flex flex-col ${
                plan.highlighted
                  ? 'glass-card gradient-border glow-teal'
                  : 'glass-card'
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-bold z-20">
                  <Sparkles size={12} />
                  Most Popular
                </div>
              )}

              <div className="mb-6">
                <h3 className="font-heading text-xl font-semibold text-foreground">{plan.name}</h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="font-heading text-4xl font-bold text-foreground">{plan.price}</span>
                  <span className="text-sm text-muted-foreground">/{plan.period}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{plan.description}</p>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature, j) => (
                  <li key={j} className="flex items-start gap-3 text-sm">
                    <Check size={16} className="text-primary mt-0.5 shrink-0" />
                    <span className="text-foreground/85">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handlePlanClick(plan)}
                disabled={loadingTier === plan.tierId}
                className={`w-full py-3 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                  plan.highlighted
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90 glow-teal'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                } disabled:opacity-50`}
              >
                {loadingTier === plan.tierId ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Creating checkout...
                  </>
                ) : (
                  <>
                    {plan.cta}
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
