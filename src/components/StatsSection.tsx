import { motion } from 'framer-motion'

const stats = [
  { value: '20+', label: 'Hours Saved Weekly', suffix: '' },
  { value: '95', label: 'Client Satisfaction', suffix: '%' },
  { value: '3x', label: 'Revenue Growth', suffix: '' },
  { value: '48h', label: 'Setup Time', suffix: '' },
]

export default function StatsSection() {
  return (
    <section className="py-16 border-y border-border/30">
      <div className="container">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="text-center"
            >
              <div className="font-heading text-3xl sm:text-4xl font-bold text-foreground mb-1">
                {stat.value}
                <span className="text-primary">{stat.suffix}</span>
              </div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
