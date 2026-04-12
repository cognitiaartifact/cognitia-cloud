import { motion } from 'framer-motion'
import { Search, Lightbulb, Code2, Rocket } from 'lucide-react'

const steps = [
  {
    icon: Search,
    step: '01',
    title: 'Discovery',
    description: 'We audit your current workflows and identify the highest-impact automation opportunities.',
  },
  {
    icon: Lightbulb,
    step: '02',
    title: 'Strategy',
    description: 'We design a custom automation plan with clear ROI projections and implementation timeline.',
  },
  {
    icon: Code2,
    step: '03',
    title: 'Build',
    description: 'Our team builds, tests, and deploys your automation workflows with zero disruption to your operations.',
  },
  {
    icon: Rocket,
    step: '04',
    title: 'Launch & Optimize',
    description: 'We launch your automations, monitor performance, and continuously optimize for better results.',
  },
]

export default function ProcessSection() {
  return (
    <section id="process" className="py-24 lg:py-32 bg-card/30">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <span className="text-primary text-sm font-semibold tracking-widest uppercase mb-4 block">
            Our Process
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-6">
            From Idea to{' '}
            <span className="gradient-text">Automation</span> in Days
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Our proven 4-step process gets you from manual chaos to automated efficiency — fast.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="relative"
            >
              <div className="glass-card rounded-2xl p-8 h-full text-center">
                <div className="text-5xl font-heading font-bold text-primary/10 mb-4">
                  {step.step}
                </div>
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
                  <step.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-heading text-lg font-semibold text-foreground mb-3">
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-primary/20" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
