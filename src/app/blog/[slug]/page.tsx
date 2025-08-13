import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Header from '@/components/shared/Header'
import Footer from '@/components/shared/Footer'
import BlogPost from '@/components/blog/BlogPost'
import { getPostBySlug, getAllPosts } from '@/lib/sanity'

type ParamsPromise = Promise<{ slug: string }>

export async function generateMetadata({ params }: { params: ParamsPromise }): Promise<Metadata> {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  
  if (!post) {
    return {
      title: 'Post Not Found - 100x Marketers',
    }
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const url = `${siteUrl}/blog/${post.slug.current}`

  return {
    title: post.seo?.metaTitle || `${post.title} - 100x Marketers Blog`,
    description: post.seo?.metaDescription || post.excerpt || 'Marketing insights and strategies',
    alternates: { canonical: url },
    robots: { index: true, follow: true },
    openGraph: {
      title: post.title,
      description: post.excerpt || 'Marketing insights and strategies',
      type: 'article',
      url,
      publishedTime: post.publishedAt,
      authors: [post.author.name],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.seo?.metaTitle || post.title,
      description: post.seo?.metaDescription || post.excerpt || 'Marketing insights and strategies',
    },
  }
}

export async function generateStaticParams() {
  const posts = await getAllPosts()
  return posts.map((post: { slug: { current: string } }) => ({
    slug: post.slug.current,
  }))
}

export default async function BlogPostPage({ params }: { params: ParamsPromise }) {
  const { slug } = await params
  const post = await getPostBySlug(slug)

  if (!post) {
    notFound()
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const canonicalUrl = `${siteUrl}/blog/${post.slug.current}`

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt || undefined,
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    author: { '@type': 'Person', name: post.author.name },
    mainEntityOfPage: { '@type': 'WebPage', '@id': canonicalUrl },
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="pt-20">
        {/* JSON-LD for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <BlogPost post={post} />
      </main>
      <Footer />
    </div>
  )
}


