'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { CalendarDaysIcon, UserIcon, TagIcon } from '@heroicons/react/24/outline'
import { BlogPost, Category } from '@/lib/sanity'
import { urlFor } from '@/lib/sanity'

interface BlogListingProps {
  posts: BlogPost[]
  featuredPosts: BlogPost[]
  categories: Category[]
}

export default function BlogListing({ posts, featuredPosts, categories }: BlogListingProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const filteredPosts = selectedCategory
    ? posts.filter(post => 
        post.categories.some(cat => cat.slug.current === selectedCategory)
      )
    : posts

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Marketing Insights & Company Spotlights
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Discover the latest marketing strategies, learn from top companies, and stay ahead in the rapidly evolving world of growth marketing.
        </p>
      </div>

      {/* Featured Posts */}
      {featuredPosts.length > 0 && (
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Featured Stories</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {featuredPosts.map((post) => (
              <FeaturedPostCard key={post._id} post={post} />
            ))}
          </div>
        </section>
      )}

      {/* Category Filter */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              !selectedCategory
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            All Posts
          </button>
          {categories.map((category) => (
            <button
              key={category._id}
              onClick={() => setSelectedCategory(category.slug.current)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category.slug.current
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {category.title}
            </button>
          ))}
        </div>
      </div>

      {/* Posts Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredPosts.map((post) => (
          <PostCard key={post._id} post={post} />
        ))}
      </div>

      {filteredPosts.length === 0 && (
        <div className="text-center py-16">
          <p className="text-gray-600 text-lg">No posts found in this category.</p>
        </div>
      )}
    </div>
  )
}

function FeaturedPostCard({ post }: { post: BlogPost }) {
  return (
    <Link href={`/blog/${post.slug.current}`}>
      <article className="group cursor-pointer">
        <div className="relative aspect-video mb-4 rounded-xl overflow-hidden">
          {post.mainImage ? (
            <Image
              src={urlFor(post.mainImage).width(600).height(400).url()}
              alt={post.mainImage.alt || post.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <span className="text-white text-2xl font-bold">
                {post.title.charAt(0)}
              </span>
            </div>
          )}
          <div className="absolute top-4 left-4">
            <span className="bg-blue-600 text-white text-xs font-semibold px-2 py-1 rounded-full">
              Featured
            </span>
          </div>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
          {post.title}
        </h3>
        {post.excerpt && (
          <p className="text-gray-600 mb-3 line-clamp-2">{post.excerpt}</p>
        )}
        <div className="flex items-center text-sm text-gray-500 space-x-4">
          <div className="flex items-center space-x-1">
            <UserIcon className="w-4 h-4" />
            <span>{post.author.name}</span>
          </div>
          <div className="flex items-center space-x-1">
            <CalendarDaysIcon className="w-4 h-4" />
            <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
          </div>
        </div>
      </article>
    </Link>
  )
}

function PostCard({ post }: { post: BlogPost }) {
  return (
    <Link href={`/blog/${post.slug.current}`}>
      <article className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden group hover:shadow-lg transition-shadow">
        <div className="relative aspect-video">
          {post.mainImage ? (
            <Image
              src={urlFor(post.mainImage).width(400).height(250).url()}
              alt={post.mainImage.alt || post.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <span className="text-gray-400 text-xl font-bold">
                {post.title.charAt(0)}
              </span>
            </div>
          )}
        </div>
        
        <div className="p-6">
          {post.categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {post.categories.slice(0, 2).map((category) => (
                <span
                  key={category._id}
                  className={`text-xs font-medium px-2 py-1 rounded-full ${
                    category.color === 'blue' ? 'bg-blue-100 text-blue-800' :
                    category.color === 'green' ? 'bg-green-100 text-green-800' :
                    category.color === 'purple' ? 'bg-purple-100 text-purple-800' :
                    category.color === 'orange' ? 'bg-orange-100 text-orange-800' :
                    category.color === 'red' ? 'bg-red-100 text-red-800' :
                    category.color === 'pink' ? 'bg-pink-100 text-pink-800' :
                    'bg-gray-100 text-gray-800'
                  }`}
                >
                  {category.title}
                </span>
              ))}
            </div>
          )}
          
          <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
            {post.title}
          </h3>
          
          {post.excerpt && (
            <p className="text-gray-600 text-sm mb-4 line-clamp-3">{post.excerpt}</p>
          )}
          
          <div className="flex items-center text-xs text-gray-500 space-x-4">
            <div className="flex items-center space-x-1">
              <UserIcon className="w-3 h-3" />
              <span>{post.author.name}</span>
            </div>
            <div className="flex items-center space-x-1">
              <CalendarDaysIcon className="w-3 h-3" />
              <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  )
}



