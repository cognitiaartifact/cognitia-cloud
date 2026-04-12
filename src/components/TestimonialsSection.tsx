import { motion } from 'framer-motion'
import { Star, Quote } from 'lucide-react'

const testimonials = [
  {
    name: 'Sarah Mitchell',
    role: 'CEO, RealVista Properties',
    content: 'Cognitia automated our entire lead qualification process. We went from manually sorting 200+ leads per week to having AI handle it instantly. Our close rate jumped 40%.',
    rating: 5,
  },
  {
    name: 'David Chen',
    role: 'Marketing Director, ScaleUp Agency',
    content: 'The AI chatbot they built handles 80% of our customer inquiries without human intervention. Our response time dropped from hours to seconds.',
    rating: 5,
  },
  {
    name: 'Priya Sharma',
    role: 'Founder, EcoShop DTC',
    content: 'Within 2 weeks of launch, our automated email sequences generated $47K in recovered cart revenue. The ROI was immediate and undeniable.',
    rating: 5,
  },
]

export default function TestimonialsSection() {
  return (
    <section className="py-24 lg:py-32">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <span className="text-primary text-sm font-semibold tracking-widest uppercase mb-4 block">
            Client Results
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-6">
            Real Results from{' '}
            <span className="gradient-text">Real Businesses</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="glass-card rounded-2xl p-8"
            >
              <Quote className="w-8 h-8 text-primary/30 mb-4" />
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} size={14} className="text-amber-400 fill-amber-400" />
                ))}
              </div>
              <p className="text-foreground/85 text-sm leading-relaxed mb-6">"{t.content}"</p>
              <div className="border-t border-border/30 pt-4">
                <p className="font-semibold text-foreground text-sm">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
