import { useParams, Link, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Calendar, Clock, Tag, Share2 } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { getPostBySlug, getAllPosts } from '@/content/blog-posts'
import { BlogArticleJsonLd } from '@/components/BlogSEO'

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>()
  const post = slug ? getPostBySlug(slug) : undefined

  if (!post) {
    return <Navigate to="/blog" replace />
  }

  // Update document title and meta
  document.title = `${post.title} | Cognitia AI Blog`
  const metaDescription = document.querySelector('meta[name="description"]')
  if (metaDescription) {
    metaDescription.setAttribute('content', post.description)
  }

  // Get related posts (same category, different slug)
  const related = getAllPosts()
    .filter((p) => p.category === post.category && p.slug !== post.slug)
    .slice(0, 2)

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <BlogArticleJsonLd post={post} />

      <main className="pt-32 pb-24">
        <div className="container max-w-3xl mx-auto px-4 sm:px-6">
          {/* Back link */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition mb-8 text-sm"
            >
              <ArrowLeft size={16} />
              Back to all posts
            </Link>
          </motion.div>

          {/* Article header */}
          <motion.header
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
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

            <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-[1.15] mb-6">
              {post.title}
            </h1>

            <p className="text-xl text-muted-foreground leading-relaxed">
              {post.description}
            </p>
          </motion.header>

          {/* Article content */}
          <motion.article
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="prose-cognitia"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Tags */}
          <div className="mt-12 pt-8 border-t border-border/30">
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-full bg-secondary text-xs text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="mt-12 glass-card rounded-2xl p-8 text-center">
            <h2 className="font-heading text-2xl font-bold mb-3">
              Ready to automate with AI?
            </h2>
            <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
              See how Cognitia AI's multi-model orchestration can transform your
              business workflows.
            </p>
            <a
              href="/#contact"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition"
            >
              Get Started
            </a>
          </div>

          {/* Related posts */}
          {related.length > 0 && (
            <div className="mt-16">
              <h3 className="font-heading text-xl font-bold mb-6">
                Related Articles
              </h3>
              <div className="grid sm:grid-cols-2 gap-6">
                {related.map((r) => (
                  <Link
                    key={r.slug}
                    to={`/blog/${r.slug}`}
                    className="glass-card rounded-xl p-6 hover:border-primary/30 transition-all group"
                  >
                    <span className="text-xs text-primary font-medium">
                      {r.category}
                    </span>
                    <h4 className="font-heading font-semibold mt-2 mb-2 group-hover:text-primary transition-colors">
                      {r.title}
                    </h4>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {r.description}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
