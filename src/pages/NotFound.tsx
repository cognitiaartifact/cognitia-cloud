import { motion } from 'framer-motion'
import { ArrowLeft, Home } from 'lucide-react'
import { Link } from 'react-router-dom'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="pt-32 pb-24">
        <div className="container max-w-2xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="text-8xl font-bold gradient-text">404</span>
            <h1 className="font-heading text-3xl font-bold mt-6 mb-4">
              Page not found
            </h1>
            <p className="text-muted-foreground text-lg mb-10 max-w-md mx-auto">
              The page you're looking for doesn't exist or has been moved.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/"
                className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition"
              >
                <Home size={18} />
                Back to Home
              </Link>
              <Link
                to="/blog"
                className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-lg bg-secondary text-secondary-foreground font-semibold hover:bg-secondary/80 transition"
              >
                <ArrowLeft size={18} />
                Read the Blog
              </Link>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
