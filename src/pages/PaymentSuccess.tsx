import { motion } from 'framer-motion'
import { CheckCircle2, ArrowRight, Calendar, Mail } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'

const TIER_LABELS: Record<string, { name: string; next: string }> = {
  starter: {
    name: 'Starter',
    next: "Our team will reach out within 24 hours to schedule your onboarding call.",
  },
  growth: {
    name: 'Growth',
    next: "Your subscription is now active. Expect a welcome email with your dedicated account manager's details.",
  },
}

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams()
  const tier = searchParams.get('tier') || 'starter'
  const tierInfo = TIER_LABELS[tier] || TIER_LABELS.starter

  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/10 blur-[120px]" />
      </div>

      <div className="container max-w-2xl py-16 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="flex justify-center"
          >
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-xl scale-150" />
              <CheckCircle2 className="h-20 w-20 text-emerald-400 relative z-10" />
            </div>
          </motion.div>

          <div className="space-y-3">
            <h1 className="font-heading text-4xl sm:text-5xl font-bold text-foreground">Payment Confirmed!</h1>
            <p className="text-xl text-muted-foreground">Welcome to Cognitia AI — {tierInfo.name} Plan</p>
          </div>

          <div className="glass-card rounded-2xl p-8 text-left space-y-6">
            <h2 className="text-lg font-semibold text-foreground">What happens next?</h2>
            <div className="space-y-4">
              {[
                { icon: Mail, title: 'Confirmation email sent', desc: 'Check your inbox for your receipt and account details.' },
                { icon: Calendar, title: 'Onboarding call', desc: tierInfo.next },
                { icon: CheckCircle2, title: 'Automation build begins', desc: "We'll start building your custom AI automation within 2 business days." },
              ].map((step, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                    <step.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{step.title}</p>
                    <p className="text-sm text-muted-foreground mt-0.5">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition">
              Back to Home <ArrowRight size={16} />
            </a>
            <a href="mailto:cognitiaartifact@gmail.com" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-secondary text-secondary-foreground font-semibold hover:bg-secondary/80 transition">
              <Mail size={16} /> Contact Support
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
