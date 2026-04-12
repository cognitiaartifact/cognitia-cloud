import { motion } from 'framer-motion'
import { XCircle, ArrowLeft, MessageSquare, RefreshCw } from 'lucide-react'

export default function PaymentCancel() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-red-500/5 blur-[120px]" />
      </div>
      <div className="container max-w-xl py-16 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-8"
        >
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring' }} className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-red-500/15 blur-xl scale-150" />
              <XCircle className="h-20 w-20 text-red-400 relative z-10" />
            </div>
          </motion.div>
          <div className="space-y-3">
            <h1 className="font-heading text-4xl sm:text-5xl font-bold text-foreground">Payment Cancelled</h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              No worries — you haven't been charged. You can try again whenever you're ready.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/#pricing" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition">
              <RefreshCw size={16} /> Try Again
            </a>
            <a href="/#contact" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-secondary text-secondary-foreground font-semibold hover:bg-secondary/80 transition">
              <MessageSquare size={16} /> Contact Us
            </a>
            <a href="/" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-muted-foreground hover:text-foreground transition">
              <ArrowLeft size={16} /> Back to Home
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
