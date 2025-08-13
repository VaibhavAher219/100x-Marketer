import { Metadata } from 'next'
import Header from '@/components/shared/Header'
import Link from 'next/link'
import Footer from '@/components/shared/Footer'
import BlogListing from '@/components/blog/BlogListing'
import { getAllPosts, getFeaturedPosts, getAllCategories } from '@/lib/sanity'

export const metadata: Metadata = {
  title: 'Marketing Insights Blog - 100x Marketers',
  description: 'Discover the latest marketing strategies, company spotlights, and industry insights from top marketing professionals.',
  keywords: 'marketing blog, growth marketing, performance marketing, company insights, marketing strategies',
  robots: { index: true, follow: true },
}

export default async function BlogPage() {
  // Check if Sanity is configured
  if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || process.env.NEXT_PUBLIC_SANITY_PROJECT_ID === 'dummy-project-id') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="pt-20">
          <div className="max-w-4xl mx-auto px-4 py-16 text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-6">Blog Coming Soon</h1>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
              <h2 className="text-lg font-semibold text-blue-900 mb-3">CMS Setup Required</h2>
              <p className="text-blue-800 mb-4">
                To enable the blog, please configure your Sanity CMS project:
              </p>
              <ol className="text-left text-blue-800 space-y-2 mb-4">
                <li>1. Create a project at <a href="https://sanity.io" target="_blank" rel="noopener noreferrer" className="underline">sanity.io</a></li>
                <li>2. Add your project ID to <code className="bg-blue-100 px-2 py-1 rounded">.env.local</code></li>
                <li>3. Visit <Link href="/admin" className="underline">/admin</Link> to start creating content</li>
              </ol>
              <p className="text-sm text-blue-600">
                See <code className="bg-blue-100 px-2 py-1 rounded">CMS_SETUP.md</code> for detailed instructions.
              </p>
            </div>
            <div className="text-gray-600">
              <p>Our blog will feature:</p>
              <div className="grid md:grid-cols-3 gap-6 mt-6">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <h3 className="font-semibold text-gray-900 mb-2">Company Spotlights</h3>
                  <p className="text-sm">In-depth looks at successful marketing teams and strategies</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <h3 className="font-semibold text-gray-900 mb-2">Industry Insights</h3>
                  <p className="text-sm">Latest trends and analysis in growth marketing</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <h3 className="font-semibold text-gray-900 mb-2">Career Guides</h3>
                  <p className="text-sm">Tips and advice for marketing professionals</p>
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const [posts, featuredPosts, categories] = await Promise.all([
    getAllPosts(),
    getFeaturedPosts(),
    getAllCategories()
  ])

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="pt-20">
        <BlogListing 
          posts={posts}
          featuredPosts={featuredPosts}
          categories={categories}
        />
      </main>
      <Footer />
    </div>
  )
}