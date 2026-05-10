import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight, Calendar, Clock, Tag } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { getAllPosts } from '@/content/blog-posts'
import { BlogListingJsonLd } from '@/components/BlogSEO'

export default function BlogIndex() {
  const posts = getAllPosts()

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <BlogListingJsonLd />

      <main className="pt-32 pb-24">
        <div className="container max-w-4xl mx-auto px-4 sm:px-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <span className="text-primary text-sm font-semibold tracking-widest uppercase mb-4 block">
              Insights & Deep Dives
            </span>
            <h1 className="font-heading text-4xl sm:text-5xl font-bold tracking-tight mb-6">
              The Cognitia AI{' '}
              <span className="gradient-text">Blog</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Technical deep-dives, business insights, and the thinking behind
              Cognitia AI's multi-model orchestration platform.
            </p>
          </motion.div>

          {/* Post list */}
          <div className="space-y-8">
            {posts.map((post, i) => (
              <motion.article
                key={post.slug}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass-card rounded-2xl p-8 hover:border-primary/30 transition-all duration-300 group"
              >
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                    <Tag size={12} />
                    {post.category}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar size={14} />
                    {new Date(post.date).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock size={14} />
                    {post.readTime}
                  </span>
                </div>

                <Link to={`/blog/${post.slug}`} className="block">
                  <h2 className="font-heading text-2xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                    {post.title}
                  </h2>
                </Link>

                <p className="text-muted-foreground leading-relaxed mb-6">
                  {post.description}
                </p>

                <Link
                  to={`/blog/${post.slug}`}
                  className="inline-flex items-center gap-2 text-primary font-semibold text-sm group-hover:gap-3 transition-all"
                >
                  Read more
                  <ArrowRight size={16} />
                </Link>
              </motion.article>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
