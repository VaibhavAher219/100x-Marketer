import { createClient } from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'dummy-project-id',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  useCdn: process.env.NODE_ENV === 'production',
  apiVersion: '2023-12-01',
  token: process.env.SANITY_API_TOKEN,
})

const builder = imageUrlBuilder(client)

export function urlFor(source: { asset?: { _ref?: string } } | string) {
  return builder.image(source as any)
}

// GROQ queries
export const queries = {
  // Get all published blog posts
  allPosts: `*[_type == "blogPost" && defined(publishedAt)] | order(publishedAt desc) {
    _id,
    title,
    slug,
    excerpt,
    mainImage,
    publishedAt,
    author->{
      name,
      slug,
      image
    },
    categories[]->{
      _id,
      title,
      slug,
      color
    },
    featured
  }`,

  // Get featured posts
  featuredPosts: `*[_type == "blogPost" && featured == true && defined(publishedAt)] | order(publishedAt desc)[0...3] {
    _id,
    title,
    slug,
    excerpt,
    mainImage,
    publishedAt,
    author->{
      name,
      slug,
      image
    },
    categories[]->{
      title,
      slug,
      color
    }
  }`,

  // Get single post by slug
  postBySlug: `*[_type == "blogPost" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    excerpt,
    mainImage,
    publishedAt,
    body,
    author->{
      name,
      slug,
      image,
      bio,
      role,
      social
    },
    categories[]->{
      _id,
      title,
      slug,
      color
    },
    featuredCompanies[]->{
      _id,
      name,
      slug,
      logo,
      website,
      industry
    },
    relatedJobs,
    seo
  }`,

  // Get posts by category
  postsByCategory: `*[_type == "blogPost" && $categorySlug in categories[]->slug.current && defined(publishedAt)] | order(publishedAt desc) {
    _id,
    title,
    slug,
    excerpt,
    mainImage,
    publishedAt,
    author->{
      name,
      slug,
      image
    },
    categories[]->{
      title,
      slug,
      color
    }
  }`,

  // Get all categories
  allCategories: `*[_type == "category"] | order(title asc) {
    _id,
    title,
    slug,
    description,
    color
  }`,

  // Get all authors
  allAuthors: `*[_type == "author"] | order(name asc) {
    _id,
    name,
    slug,
    image,
    bio,
    role
  }`,

  // Get company spotlights
  featuredCompanies: `*[_type == "companySpotlight" && featured == true] | order(_createdAt desc) {
    _id,
    name,
    slug,
    logo,
    website,
    industry,
    description,
    marketingHighlights
  }`
}

// Helper functions
export async function getAllPosts() {
  return await client.fetch(queries.allPosts)
}

export async function getFeaturedPosts() {
  return await client.fetch(queries.featuredPosts)
}

export async function getPostBySlug(slug: string) {
  return await client.fetch(queries.postBySlug, { slug })
}

export async function getPostsByCategory(categorySlug: string) {
  return await client.fetch(queries.postsByCategory, { categorySlug })
}

export async function getAllCategories() {
  return await client.fetch(queries.allCategories)
}

export async function getFeaturedCompanies() {
  return await client.fetch(queries.featuredCompanies)
}

// Types
export interface BlogPost {
  _id: string
  title: string
  slug: { current: string }
  excerpt?: string
  mainImage?: { _type: 'image'; asset?: { _ref?: string } ; alt?: string }
  publishedAt: string
  body?: any[]
  author: {
    name: string
    slug: { current: string }
    image?: { _type?: string; asset?: { _ref?: string } }
    bio?: unknown[]
    role?: string
    social?: {
      twitter?: string
      linkedin?: string
      website?: string
    }
  }
  categories: Array<{
    _id: string
    title: string
    slug: { current: string }
    color?: string
  }>
  featuredCompanies?: Array<{
    _id: string
    name: string
    slug: { current: string }
    logo?: { _type?: string; asset?: { _ref?: string } }
    website?: string
    industry?: string
  }>
  relatedJobs?: string[]
  seo?: {
    metaTitle?: string
    metaDescription?: string
  }
  featured?: boolean
}

export interface Category {
  _id: string
  title: string
  slug: { current: string }
  description?: string
  color?: string
}

export interface Author {
  _id: string
  name: string
  slug: { current: string }
  image?: any
  bio?: any[]
  role?: string
}

export interface CompanySpotlight {
  _id: string
  name: string
  slug: { current: string }
  logo?: any
  website?: string
  industry?: string
  description?: string
  marketingHighlights?: string[]
}

 