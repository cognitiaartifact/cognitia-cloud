import { motion } from 'framer-motion'
import { ArrowRight, Calendar, Sparkles } from 'lucide-react'

export default function CTASection() {
  return (
    <section className="relative py-24 lg:py-32 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] rounded-full bg-primary/10 blur-[100px]" />
        <div className="absolute bottom-1/3 right-1/4 w-[250px] h-[250px] rounded-full bg-accent/8 blur-[80px]" />
      </div>

      <div className="container relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="max-w-3xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card text-sm font-medium text-primary mb-8">
            <Sparkles size={14} />
            Limited Availability — Book This Week
          </div>

          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-6">
            Ready to Put Your Business on{' '}
            <span className="gradient-text">Autopilot?</span>
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed mb-10 max-w-2xl mx-auto">
            Book a free 30-minute strategy call. We'll audit your current workflows, identify
            your biggest automation opportunities, and show you exactly how much you could save.
          </p>

          <a
            href="#contact"
            className="inline-flex items-center gap-2 px-10 py-4 rounded-lg bg-primary text-primary-foreground font-semibold text-base hover:bg-primary/90 transition glow-pulse group"
          >
            <Calendar size={18} />
            Book Your Free Strategy Call
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </a>

          <p className="text-sm text-muted-foreground mt-6">
            No commitment required. We'll show you the ROI before you spend a dime.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
