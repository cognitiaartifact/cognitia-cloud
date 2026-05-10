// =============================================================
// Blog JSON-LD Schema Components
// Generates structured data for blog listing and individual posts
// =============================================================

import type { BlogPost } from '@/content/blog-posts'
import { getAllPosts } from '@/content/blog-posts'

const SITE_URL = 'https://cognitia.cloud'
const SITE_NAME = 'Cognitia AI'
const LOGO_URL = `${SITE_URL}/logo.png`

/** JSON-LD for the /blog listing page */
export function BlogListingJsonLd() {
  const posts = getAllPosts()

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    '@id': `${SITE_URL}/blog#blog`,
    name: `${SITE_NAME} Blog`,
    description:
      'Technical deep-dives, business insights, and the thinking behind Cognitia AI\'s multi-model orchestration platform.',
    url: `${SITE_URL}/blog`,
    publisher: {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: SITE_URL,
      logo: {
        '@type': 'ImageObject',
        url: LOGO_URL,
      },
    },
    blogPost: posts.map((p) => ({
      '@type': 'BlogPosting',
      headline: p.title,
      description: p.description,
      url: `${SITE_URL}/blog/${p.slug}`,
      datePublished: p.date,
      author: {
        '@type': 'Organization',
        name: p.author,
      },
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

/** JSON-LD for individual blog post pages */
export function BlogArticleJsonLd({ post }: { post: BlogPost }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': `${SITE_URL}/blog/${post.slug}#article`,
    headline: post.title,
    description: post.description,
    url: `${SITE_URL}/blog/${post.slug}`,
    datePublished: post.date,
    dateModified: post.date,
    author: {
      '@type': 'Organization',
      name: post.author,
      url: SITE_URL,
    },
    publisher: {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: SITE_URL,
      logo: {
        '@type': 'ImageObject',
        url: LOGO_URL,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/blog/${post.slug}`,
    },
    keywords: post.tags.join(', '),
    articleSection: post.category,
    wordCount: post.content.replace(/<[^>]*>/g, '').split(/\s+/).length,
    inLanguage: 'en',
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
