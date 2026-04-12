import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, MapPin, Clock, Send, MessageSquare } from 'lucide-react'
import { toast } from 'sonner'

const contactInfo = [
  { icon: Mail, label: 'Email', value: 'hello@cognitia.cloud', href: 'mailto:hello@cognitia.cloud' },
  { icon: MapPin, label: 'Location', value: 'Remote-first, Global Clients', href: null },
  { icon: Clock, label: 'Response Time', value: 'Within 24 hours', href: null },
]

export default function ContactSection() {
  const [formData, setFormData] = useState({ name: '', email: '', company: '', message: '' })
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const data = await res.json()
      if (data.success) {
        toast.success("Message sent! We'll get back to you within 24 hours.")
        setFormData({ name: '', email: '', company: '', message: '' })
      } else {
        throw new Error(data.error || 'Something went wrong')
      }
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section id="contact" className="relative py-24 lg:py-32 bg-card/30">
      <div className="container">
        <div className="grid lg:grid-cols-5 gap-16">
          {/* Left: Info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-2"
          >
            <span className="text-primary text-sm font-semibold tracking-widest uppercase mb-4 block">
              Get In Touch
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight mb-6">
              Let's Build Something{' '}
              <span className="gradient-text">Profitable</span>
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-10">
              Tell us about your business and the challenges you're facing. We'll respond within
              24 hours with a custom automation strategy — completely free, no obligation.
            </p>

            <div className="space-y-6">
              {contactInfo.map((item, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <item.icon size={18} className="text-primary" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">{item.label}</div>
                    {item.href ? (
                      <a href={item.href} className="text-foreground hover:text-primary transition-colors font-medium">
                        {item.value}
                      </a>
                    ) : (
                      <div className="text-foreground font-medium">{item.value}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 glass-card p-5 rounded-xl">
              <div className="flex items-center gap-3 mb-2">
                <MessageSquare size={18} className="text-primary" />
                <span className="font-heading font-semibold text-sm text-foreground">Quick Response Guarantee</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Every inquiry gets a personalized response from our team — not a chatbot.
              </p>
            </div>
          </motion.div>

          {/* Right: Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-3"
          >
            <form onSubmit={handleSubmit} className="glass-card p-8 lg:p-10 space-y-6 rounded-2xl">
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">Full Name *</label>
                  <input
                    id="name" type="text" required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg bg-input border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">Work Email *</label>
                  <input
                    id="email" type="email" required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg bg-input border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    placeholder="john@company.com"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="company" className="block text-sm font-medium text-foreground mb-2">Company Name</label>
                <input
                  id="company" type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-input border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  placeholder="Your Company"
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">Tell Us About Your Automation Needs *</label>
                <textarea
                  id="message" required rows={5}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-input border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none"
                  placeholder="What repetitive tasks are eating up your team's time?"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold py-4 rounded-lg text-base glow-teal transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {submitting ? 'Sending...' : (
                  <>Send Message <Send size={16} /></>
                )}
              </button>
              <p className="text-xs text-muted-foreground text-center">
                By submitting, you agree to receive a response from our team. We respect your privacy.
              </p>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
