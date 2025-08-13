'use client'

import Image from 'next/image'
import Link from 'next/link'
import { PortableText } from '@portabletext/react'
import { CalendarDaysIcon, UserIcon, TagIcon, GlobeAltIcon } from '@heroicons/react/24/outline'
import { BlogPost as BlogPostType } from '@/lib/sanity'
import { urlFor } from '@/lib/sanity'

interface BlogPostProps {
  post: BlogPostType
}

export default function BlogPost({ post }: BlogPostProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const components = {
    types: {
      image: ({ value }: any) => {
        const isLogo = typeof value?.alt === 'string' && value.alt.toLowerCase().includes('logo')
        return (
          <div className={`my-8 ${isLogo ? 'bg-white border border-gray-200 rounded-lg p-6 flex items-center justify-center' : ''}`}>
            <Image
              src={urlFor(value).width(800).height(600).url()}
              alt={value.alt || 'Blog image'}
              width={800}
              height={600}
              className={`${isLogo ? 'object-contain' : 'object-cover'} rounded-lg shadow-lg`}
            />
            {value.alt && (
              <p className="text-sm text-gray-500 text-center mt-2">{value.alt}</p>
            )}
          </div>
        )
      },
      callout: ({ value }: any) => (
        <div className={`my-6 p-4 rounded-lg border-l-4 ${
          value.type === 'info' ? 'bg-blue-50 border-blue-400 text-blue-800' :
          value.type === 'warning' ? 'bg-yellow-50 border-yellow-400 text-yellow-800' :
          value.type === 'success' ? 'bg-green-50 border-green-400 text-green-800' :
          value.type === 'error' ? 'bg-red-50 border-red-400 text-red-800' :
          'bg-gray-50 border-gray-400 text-gray-800'
        }`}>
          <p className="font-medium">{value.content}</p>
        </div>
      ),
      jobsWidget: ({ value }: any) => (
        <div className="my-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {value.title || 'Related Opportunities'}
          </h3>
          <div className="text-center py-4">
            <p className="text-gray-600 mb-4">
              Explore {value.category === 'all' ? 'marketing' : value.category} opportunities
            </p>
            <Link
              href={`/jobs/explore${value.category !== 'all' ? `?category=${value.category}` : ''}`}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              View Jobs
              <GlobeAltIcon className="w-4 h-4 ml-2" />
            </Link>
          </div>
        </div>
      )
    },
    marks: {
      link: ({ children, value }: any) => (
        <a
          href={value.href}
          target={value.blank ? '_blank' : undefined}
          rel={value.blank ? 'noopener noreferrer' : undefined}
          className="text-blue-600 hover:text-blue-800 underline"
        >
          {children}
        </a>
      ),
      companyLink: ({ children, value }: any) => (
        <Link
          href={`/company/${value.company.slug.current}`}
          className="text-blue-600 hover:text-blue-800 underline font-medium"
        >
          {children}
        </Link>
      )
    },
    block: {
      h1: ({ children }: any) => (
        <h1 className="text-3xl font-bold text-gray-900 mt-8 mb-4">{children}</h1>
      ),
      h2: ({ children }: any) => (
        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">{children}</h2>
      ),
      h3: ({ children }: any) => (
        <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">{children}</h3>
      ),
      h4: ({ children }: any) => (
        <h4 className="text-lg font-semibold text-gray-900 mt-6 mb-3">{children}</h4>
      ),
      blockquote: ({ children }: any) => (
        <blockquote className="border-l-4 border-blue-500 pl-6 my-6 text-lg italic text-gray-700">
          {children}
        </blockquote>
      ),
      normal: ({ children }: any) => (
        <p className="text-gray-700 leading-relaxed mb-4">{children}</p>
      )
    },
    list: {
      bullet: ({ children }: any) => (
        <ul className="list-disc list-inside my-4 space-y-2 text-gray-700">{children}</ul>
      ),
      number: ({ children }: any) => (
        <ol className="list-decimal list-inside my-4 space-y-2 text-gray-700">{children}</ol>
      )
    }
  }

  return (
    <article className="max-w-4xl mx-auto px-4 py-12">
      {/* Header */}
      <header className="mb-8">
        {/* Categories */}
        {post.categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {post.categories.map((category) => (
              <span
                key={category._id}
                className={`text-sm font-medium px-3 py-1 rounded-full ${
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

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
          {post.title}
        </h1>

        {/* Excerpt */}
        {post.excerpt && (
          <p className="text-xl text-gray-600 mb-6 leading-relaxed">
            {post.excerpt}
          </p>
        )}

        {/* Meta */}
        <div className="flex items-center space-x-6 text-sm text-gray-500 mb-8">
          <div className="flex items-center space-x-2">
            {post.author.image && (
              <Image
                src={urlFor(post.author.image).width(40).height(40).url()}
                alt={post.author.name}
                width={40}
                height={40}
                className="rounded-full"
              />
            )}
            <div>
              <p className="font-medium text-gray-900">{post.author.name}</p>
              {post.author.role && (
                <p className="text-xs text-gray-500">{post.author.role}</p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <CalendarDaysIcon className="w-4 h-4" />
            <span>{formatDate(post.publishedAt)}</span>
          </div>
        </div>

        {/* Featured Image */}
        {post.mainImage && (
          (() => {
            const isLogo = typeof (post as any)?.mainImage?.alt === 'string' && (post as any).mainImage.alt.toLowerCase().includes('logo')
            return (
              <div className={`${isLogo ? 'h-56' : 'aspect-video'} relative rounded-xl overflow-hidden mb-8 ${isLogo ? 'bg-white border border-gray-200' : ''} flex items-center justify-center`}>
                <Image
                  src={urlFor(post.mainImage).width(1200).height(675).url()}
                  alt={(post as any).mainImage.alt || post.title}
                  fill
                  className={`${isLogo ? 'object-contain p-6' : 'object-cover'}`}
                  priority
                />
              </div>
            )
          })()
        )}
      </header>

      {/* Content */}
      <div className="prose prose-lg max-w-none">
        {post.body && <PortableText value={post.body} components={components} />}
      </div>

      {/* Featured Companies */}
      {post.featuredCompanies && post.featuredCompanies.length > 0 && (
        <section className="mt-12 pt-8 border-t border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">
            Companies Featured in This Post
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {post.featuredCompanies.map((company) => (
              <Link
                key={company._id}
                href={`/company/${company.slug.current}`}
                className="flex items-center space-x-3 p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
              >
                {company.logo && (
                  <Image
                    src={urlFor(company.logo).width(48).height(48).url()}
                    alt={company.name}
                    width={48}
                    height={48}
                    className="rounded-lg"
                  />
                )}
                <div>
                  <p className="font-medium text-gray-900">{company.name}</p>
                  {company.industry && (
                    <p className="text-sm text-gray-500">{company.industry}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Author Bio */}
      {post.author.bio && (
        <section className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex items-start space-x-4">
            {post.author.image && (
              <Image
                src={urlFor(post.author.image).width(80).height(80).url()}
                alt={post.author.name}
                width={80}
                height={80}
                className="rounded-full"
              />
            )}
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                About {post.author.name}
              </h3>
              <div className="prose prose-sm text-gray-600">
                <PortableText value={post.author.bio} />
              </div>
              {post.author.social && (
                <div className="flex space-x-4 mt-4">
                  {post.author.social.twitter && (
                    <a
                      href={post.author.social.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Twitter
                    </a>
                  )}
                  {post.author.social.linkedin && (
                    <a
                      href={post.author.social.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      LinkedIn
                    </a>
                  )}
                  {post.author.social.website && (
                    <a
                      href={post.author.social.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Website
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>
      )}
    </article>
  )
}


