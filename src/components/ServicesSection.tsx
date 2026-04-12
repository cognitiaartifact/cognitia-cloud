import { motion } from 'framer-motion'
import { Bot, Mail, BarChart3, Workflow, MessageSquare, Zap } from 'lucide-react'

const services = [
  {
    icon: Workflow,
    title: 'Workflow Automation',
    description: 'Automate repetitive tasks across your entire tech stack. CRM updates, data entry, reporting — all on autopilot.',
  },
  {
    icon: Bot,
    title: 'AI Chatbots & Voice Agents',
    description: 'Custom AI assistants that handle customer inquiries 24/7, qualify leads, and book meetings automatically.',
  },
  {
    icon: Mail,
    title: 'Email & Outreach Automation',
    description: 'Personalized email sequences, follow-ups, and drip campaigns that nurture leads while you sleep.',
  },
  {
    icon: BarChart3,
    title: 'Lead Generation Systems',
    description: 'AI-powered lead scoring, enrichment, and qualification that fills your pipeline with high-intent prospects.',
  },
  {
    icon: MessageSquare,
    title: 'CRM Integration',
    description: 'Seamless integration with HubSpot, Salesforce, and other CRMs. Every interaction logged automatically.',
  },
  {
    icon: Zap,
    title: 'Custom AI Solutions',
    description: 'Bespoke AI agents tailored to your unique business processes. If you can describe it, we can automate it.',
  },
]

export default function ServicesSection() {
  return (
    <section id="services" className="py-24 lg:py-32">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <span className="text-primary text-sm font-semibold tracking-widest uppercase mb-4 block">
            What We Build
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-6">
            AI Automation That{' '}
            <span className="gradient-text">Drives Revenue</span>
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            We don't just automate tasks — we build intelligent systems that grow your business.
            Every solution is custom-built for your specific workflows.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="glass-card rounded-2xl p-8 hover:border-primary/30 transition-all duration-300 group"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition">
                <service.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-heading text-lg font-semibold text-foreground mb-3">
                {service.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {service.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
